"""
Service-level signals for the super-admin System page.

Two things live here:

* Traffic counting. A pure-ASGI middleware tallies every request by minute in
  this worker's memory; a background task flushes the deltas to
  traffic_minutes every FLUSH_EVERY seconds. Counters are added on conflict,
  so several workers writing the same minute simply sum.

* Recent warnings and errors. A logging handler keeps the last few hundred
  WARNING+ records from the app and from uvicorn (which does not propagate to
  the root logger, so it is attached explicitly) — the rate-limit blocks, CAPI
  failures and tracebacks you'd otherwise need SSH and `docker logs` to see.
"""
import asyncio
import logging
import os
import time
from collections import deque
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete
from sqlalchemy.dialects.postgresql import insert

from api.db import async_session
from api.models import TrafficMinute

log = logging.getLogger("monitoring")

# hostname:pid is unique per worker process and readable in the table.
WORKER_ID = f"{os.uname().nodename}:{os.getpid()}"
STARTED_AT = datetime.now(timezone.utc)
FLUSH_EVERY_SECONDS = 15
RETAIN_DAYS = 7
# Roughly hourly at the flush cadence.
PRUNE_EVERY_FLUSHES = 240

# The monitoring page polling itself, and the health probe, are not traffic.
SKIP_PREFIXES = ("/health", "/api/system/")


class _Bucket:
    __slots__ = (
        "requests",
        "throttled",
        "cooldown",
        "client_errors",
        "server_errors",
        "latency_ms",
    )

    def __init__(self) -> None:
        self.requests = 0
        self.throttled = 0
        self.cooldown = 0
        self.client_errors = 0
        self.server_errors = 0
        self.latency_ms = 0

    def add(self, other: "_Bucket") -> None:
        for name in self.__slots__:
            setattr(self, name, getattr(self, name) + getattr(other, name))


_buckets: dict[datetime, _Bucket] = {}


def record(path: str, status: int, latency_ms: float) -> None:
    if path.startswith(SKIP_PREFIXES):
        return
    minute = datetime.now(timezone.utc).replace(second=0, microsecond=0)
    bucket = _buckets.get(minute)
    if bucket is None:
        bucket = _buckets[minute] = _Bucket()
    bucket.requests += 1
    bucket.latency_ms += int(latency_ms)
    if status == 429:
        bucket.throttled += 1
    elif status == 409:
        bucket.cooldown += 1
    elif 400 <= status < 500:
        bucket.client_errors += 1
    elif status >= 500:
        bucket.server_errors += 1


class TrafficMiddleware:
    """Counts every HTTP request with its final status and wall time."""

    def __init__(self, app) -> None:
        self.app = app

    async def __call__(self, scope, receive, send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        started = time.perf_counter()
        # If the app dies before sending headers, the outer error middleware
        # answers 500 — that is what the counter should say too.
        status = 500

        async def send_wrapper(message) -> None:
            nonlocal status
            if message["type"] == "http.response.start":
                status = message["status"]
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        finally:
            record(
                scope.get("path", ""),
                status,
                (time.perf_counter() - started) * 1000,
            )


async def flush() -> None:
    if not _buckets:
        return
    pending = dict(_buckets)
    _buckets.clear()

    stmt = insert(TrafficMinute).values(
        [
            {
                "minute": minute,
                "worker": WORKER_ID,
                "requests": b.requests,
                "throttled": b.throttled,
                "cooldown": b.cooldown,
                "client_errors": b.client_errors,
                "server_errors": b.server_errors,
                "latency_ms": b.latency_ms,
            }
            for minute, b in pending.items()
        ]
    )
    stmt = stmt.on_conflict_do_update(
        index_elements=[TrafficMinute.minute, TrafficMinute.worker],
        set_={
            col: getattr(TrafficMinute, col) + getattr(stmt.excluded, col)
            for col in (
                "requests",
                "throttled",
                "cooldown",
                "client_errors",
                "server_errors",
                "latency_ms",
            )
        },
    )
    try:
        async with async_session() as session:
            await session.execute(stmt)
            await session.commit()
    except Exception as exc:  # noqa: BLE001 — must never take the app down
        # Put the counts back so a short database outage loses nothing.
        for minute, bucket in pending.items():
            existing = _buckets.get(minute)
            if existing is None:
                _buckets[minute] = bucket
            else:
                existing.add(bucket)
        log.warning("traffic flush failed, will retry: %s", exc)


async def prune() -> None:
    cutoff = datetime.now(timezone.utc) - timedelta(days=RETAIN_DAYS)
    try:
        async with async_session() as session:
            await session.execute(
                delete(TrafficMinute).where(TrafficMinute.minute < cutoff)
            )
            await session.commit()
    except Exception as exc:  # noqa: BLE001
        log.warning("traffic prune failed: %s", exc)


async def _flush_loop() -> None:
    flushes = 0
    while True:
        await asyncio.sleep(FLUSH_EVERY_SECONDS)
        await flush()
        flushes += 1
        if flushes % PRUNE_EVERY_FLUSHES == 0:
            await prune()


_task: asyncio.Task | None = None


def start() -> None:
    global _task
    install_log_capture()
    _task = asyncio.create_task(_flush_loop())


async def stop() -> None:
    if _task is not None:
        _task.cancel()
    await flush()


# ---------------------------------------------------------------- recent logs


class RingHandler(logging.Handler):
    """Keeps the newest WARNING+ records in memory for the System page."""

    def __init__(self, maxlen: int = 200) -> None:
        super().__init__(level=logging.WARNING)
        self.records: deque[dict] = deque(maxlen=maxlen)

    def emit(self, record: logging.LogRecord) -> None:
        message = record.getMessage()
        if record.exc_info and record.exc_info[1] is not None:
            exc = record.exc_info[1]
            message = f"{message} — {type(exc).__name__}: {exc}"
        self.records.append(
            {
                "time": datetime.fromtimestamp(record.created, timezone.utc).isoformat(),
                "level": record.levelname,
                "logger": record.name,
                "worker": WORKER_ID,
                "message": message[:600],
            }
        )


recent_logs = RingHandler()


def install_log_capture() -> None:
    root = logging.getLogger()
    if recent_logs in root.handlers:
        return
    root.addHandler(recent_logs)
    # uvicorn's loggers don't propagate to root; "Exception in ASGI
    # application" tracebacks live there.
    logging.getLogger("uvicorn.error").addHandler(recent_logs)
