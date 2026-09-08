"""
Per-IP rate limiting for the public, unauthenticated endpoints.

In-memory and per-process: with UVICORN_WORKERS=2 a client can get up to twice
the configured limit before both workers have seen it. That's fine for what
this is — a brake on floods and probing that keeps the database out of the
blast radius — not an exact quota.

This is the *inner* layer. A volumetric attack is absorbed by Cloudflare in
front of the tunnel; nothing inside the container can help once the pipe is
full. See COMMANDS.md → "Attack protection" for the edge rules.
"""
import ipaddress
import logging
import math
import time
from collections import deque

from fastapi import HTTPException, Request

from api.config import settings

log = logging.getLogger("ratelimit")

# Sweep expired entries this often (in checks), and never track more addresses
# than this — an attacker cycling IPs must not be able to grow memory forever.
SWEEP_EVERY = 1000
MAX_TRACKED_IPS = 50_000


def _is_internal(ip: str) -> bool:
    """
    Anything that can't be a customer on the public internet: RFC 1918,
    loopback, link-local, CGNAT shared space, documentation ranges and so on.
    Such an address means we're looking at a proxy hop, not a client.
    """
    try:
        return not ipaddress.ip_address(ip).is_global
    except ValueError:
        return True


def client_ip(request: Request) -> str | None:
    """
    The real client address, or None when it can't be known.

    Traffic reaches this container from the web container, so the socket
    address is always the same internal IP. Cloudflare puts the true address
    in CF-Connecting-IP and overwrites anything the client sent, and the only
    way to reach this origin is through Cloudflare's tunnel, so that header can
    be trusted. X-Forwarded-For is deliberately *not* used to identify anyone:
    Cloudflare appends to it, so a client can plant any address at the front.

    None means only an internal address was visible — the header is missing,
    e.g. Cloudflare was removed. Callers must then skip limiting: putting the
    whole internet in one bucket would lock every real customer out.
    """
    header = settings.client_ip_header
    value = request.headers.get(header, "").strip() if header else ""
    if value and not _is_internal(value):
        return value
    host = request.client.host if request.client else ""
    if host and not _is_internal(host):
        return host
    return None


class RateLimiter:
    """
    At most `limit` accepted requests per `window` seconds per client IP.
    Sliding window. Use as a dependency: `dependencies=[Depends(limiter)]`.
    """

    def __init__(self, name: str, limit: int, window: float) -> None:
        self.name = name
        self.limit = limit
        self.window = window
        # ip -> timestamps of accepted requests still inside the window
        self._hits: dict[str, deque[float]] = {}
        self._checks = 0
        # ip -> when we last logged a rejection, so a flood logs once per
        # window instead of once per request
        self._logged: dict[str, float] = {}
        self._warned_blind = False

    def _sweep(self, now: float) -> None:
        cutoff = now - self.window
        for ip in list(self._hits):
            hits = self._hits[ip]
            while hits and hits[0] <= cutoff:
                hits.popleft()
            if not hits:
                del self._hits[ip]
                self._logged.pop(ip, None)
        # Still over the cap after expiring: drop the longest-tracked addresses.
        while len(self._hits) > MAX_TRACKED_IPS:
            oldest = next(iter(self._hits))
            del self._hits[oldest]
            self._logged.pop(oldest, None)

    async def __call__(self, request: Request) -> None:
        if self.limit <= 0:
            return
        ip = client_ip(request)
        if ip is None:
            if not self._warned_blind:
                self._warned_blind = True
                log.warning(
                    "%s: no client address visible (is %s being forwarded?); "
                    "per-IP limiting is off until it is",
                    self.name,
                    settings.client_ip_header or "the socket address",
                )
            return

        now = time.monotonic()
        self._checks += 1
        if self._checks % SWEEP_EVERY == 0:
            self._sweep(now)

        hits = self._hits.get(ip)
        if hits is None:
            hits = self._hits[ip] = deque()
        else:
            cutoff = now - self.window
            while hits and hits[0] <= cutoff:
                hits.popleft()

        if len(hits) >= self.limit:
            retry_after = max(1, math.ceil(hits[0] + self.window - now))
            if now - self._logged.get(ip, -self.window) >= self.window:
                self._logged[ip] = now
                log.warning(
                    "%s: %s exceeded %d per %ds; rejecting for %ds",
                    self.name,
                    ip,
                    self.limit,
                    int(self.window),
                    retry_after,
                )
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please try again in a few minutes.",
                headers={"Retry-After": str(retry_after)},
            )
        hits.append(now)


    def snapshot(self) -> dict:
        """This worker's view: how many addresses it is tracking and which are
        currently over the limit."""
        now = time.monotonic()
        self._sweep(now)
        blocked = sorted(
            ((ip, len(hits)) for ip, hits in self._hits.items() if len(hits) >= self.limit),
            key=lambda item: -item[1],
        )
        return {
            "name": self.name,
            "limit": self.limit,
            "window_seconds": int(self.window),
            "tracked_ips": len(self._hits),
            "blocked_now": len(blocked),
            "blocked_ips": [ip for ip, _ in blocked[:10]],
            # True if any request since startup arrived without a usable
            # client address — the limiter let it through unlimited.
            "seen_blind_requests": self._warned_blind,
        }


_window = settings.rate_limit_window_seconds
orders_limiter = RateLimiter("orders", settings.rate_limit_orders, _window)
drafts_limiter = RateLimiter("drafts", settings.rate_limit_drafts, _window)
logins_limiter = RateLimiter("logins", settings.rate_limit_logins, _window)
