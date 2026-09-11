"""BDCourier courier-history lookup: what a phone number's past parcels with
Pathao/Steadfast/RedX/CarryBee looked like, so staff can judge a new order
before confirming it.

A lookup is cached per phone number for REUSE_FOR (see recent()), so opening
the same customer's order again the same day never re-spends the API's rate
limit. A failed lookup is still written to fraud_checks (with error set) so
the attempt isn't silently lost, but it is never reused as a cache hit — the
next check tries again.

check_order_later() is the fire-and-forget path a new order's creation calls:
scheduled as its own asyncio task so the courier API is never on the order's
request path, and any failure is swallowed (logged) rather than surfacing as
a 500 on order creation.
"""

from __future__ import annotations

import asyncio
import logging
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta, timezone

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.models import FraudCheck, Order
from api.phone import phone_key

log = logging.getLogger("bdcourier")

URL = "https://api.bdcourier.com/courier-check"
TIMEOUT_SECONDS = 12
REUSE_FOR = timedelta(hours=24)

# Strong references to in-flight lookups: a bare create_task() result can be
# garbage-collected mid-flight.
_tasks: set[asyncio.Task] = set()


class BdcourierError(Exception):
    pass


@dataclass(frozen=True)
class CourierSummary:
    key: str
    name: str
    total: int
    success: int
    cancel: int
    success_rate: float | None
    logo: str | None


@dataclass(frozen=True)
class FraudReport:
    id: str
    name: str | None
    details: str | None
    created_at: str | None
    courier_name: str | None
    courier_logo: str | None


@dataclass(frozen=True)
class FraudResult:
    total: int
    success: int
    cancel: int
    success_rate: float | None
    rating: int | None
    couriers: tuple[CourierSummary, ...]
    reports: tuple[FraudReport, ...]


def _int(value) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


def _float(value) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _rating(body: dict, data: dict, summary: dict) -> int | None:
    """BDCourier's summary carries a rating/score alongside the parcel
    counts on some accounts; the exact key isn't documented, so every
    plausible spot is tried and the first present value wins."""
    for src in (summary, data, body):
        for key in ("rating", "score", "trust_score", "risk_score"):
            if key in src:
                value = src.get(key)
                return int(value) if isinstance(value, (int, float)) else _int(value) or None
    return None


def parse(body: dict) -> FraudResult:
    if body.get("status") != "success":
        raise BdcourierError(body.get("message") or "BDCourier lookup failed")

    data = body.get("data")
    if not isinstance(data, dict):
        raise BdcourierError("BDCourier returned no data")

    summary = data.get("summary") or {}
    couriers = tuple(
        CourierSummary(
            key=key,
            name=info.get("name") or key,
            total=_int(info.get("total_parcel")),
            success=_int(info.get("success_parcel")),
            cancel=_int(info.get("cancelled_parcel")),
            success_rate=_float(info.get("success_ratio")),
            logo=info.get("logo"),
        )
        for key, info in data.items()
        if key != "summary" and isinstance(info, dict)
    )
    reports = tuple(
        FraudReport(
            id=str(report.get("id")),
            name=report.get("name"),
            details=report.get("details"),
            created_at=report.get("created_at"),
            courier_name=report.get("courierName"),
            courier_logo=report.get("courierLogo"),
        )
        for report in body.get("reports") or []
        if isinstance(report, dict)
    )
    return FraudResult(
        total=_int(summary.get("total_parcel")),
        success=_int(summary.get("success_parcel")),
        cancel=_int(summary.get("cancelled_parcel")),
        success_rate=_float(summary.get("success_ratio")),
        rating=_rating(body, data, summary),
        couriers=couriers,
        reports=reports,
    )


async def lookup(phone: str, api_key: str) -> FraudResult:
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
            res = await client.post(
                URL,
                json={"phone": phone},
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
            )
    except httpx.HTTPError as exc:
        raise BdcourierError(f"{type(exc).__name__}: {exc}") from exc

    if res.status_code == 429:
        raise BdcourierError("BDCourier rate limit reached — try again shortly")
    try:
        body = res.json()
    except ValueError as exc:
        raise BdcourierError("BDCourier returned a non-JSON response") from exc
    if not isinstance(body, dict):
        raise BdcourierError("BDCourier returned an unexpected response")
    return parse(body)


def _row(phone: str, result: FraudResult | None, error: str | None) -> FraudCheck:
    return FraudCheck(
        phone_key=phone_key(phone) or phone,
        phone=phone,
        total=result.total if result else 0,
        success=result.success if result else 0,
        cancel=result.cancel if result else 0,
        success_rate=result.success_rate if result else None,
        rating=result.rating if result else None,
        couriers=[asdict(c) for c in result.couriers] if result else [],
        reports=[asdict(r) for r in result.reports] if result else [],
        error=error,
    )


async def recent(session: AsyncSession, phone: str) -> FraudCheck | None:
    """The newest still-fresh, error-free check for this phone, if any."""
    key = phone_key(phone) or phone
    return await session.scalar(
        select(FraudCheck)
        .where(
            FraudCheck.phone_key == key,
            FraudCheck.error.is_(None),
            FraudCheck.checked_at >= datetime.now(timezone.utc) - REUSE_FOR,
        )
        .order_by(FraudCheck.checked_at.desc())
        .limit(1)
    )


async def check(
    session: AsyncSession, phone: str, api_key: str, *, force: bool = False
) -> FraudCheck:
    """A cached or fresh lookup for this phone. Never raises — a failed
    lookup is persisted with error set and returned, not reused next time.
    Does not commit; the caller decides when to."""
    if not force:
        cached = await recent(session, phone)
        if cached is not None:
            return cached
    try:
        result = await lookup(phone, api_key)
        row = _row(phone, result, None)
    except BdcourierError as exc:
        row = _row(phone, None, str(exc))
    session.add(row)
    await session.flush()
    return row


async def _check_order(order_id: int, phone: str, api_key: str) -> None:
    from api.db import async_session

    try:
        async with async_session() as session:
            row = await check(session, phone, api_key)
            order = await session.get(Order, order_id)
            if order is not None:
                order.fraud_check_id = row.id
            await session.commit()
    except Exception:  # noqa: BLE001 — a courier-API outage must never surface
        log.exception("bdcourier check for order %s failed", order_id)


def check_order_later(order_id: int, phone: str, api_key: str) -> None:
    """Schedule a courier-history lookup for a just-created order. No-ops
    without a key; never blocks or raises into the caller."""
    if not api_key:
        return
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        log.warning(
            "bdcourier check for order %s dropped: no running event loop", order_id
        )
        return
    task = loop.create_task(_check_order(order_id, phone, api_key))
    _tasks.add(task)
    task.add_done_callback(_tasks.discard)
