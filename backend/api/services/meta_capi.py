"""Meta Conversions API: server-side copies of the browser Pixel events.

Every browser event carries an eventID; this module sends the same event from
the server with the same event_id, so Meta deduplicates the pair and still
counts it when the browser copy never arrived (ad blocker, tab closed early).
Purchase uses the order number as the shared id and is sent by the order
endpoint; the other events come in through POST /api/track with a UUID.

Docs: https://developers.facebook.com/docs/marketing-api/conversions-api
"""

from __future__ import annotations

import hashlib
import logging
import re
import time
from dataclasses import dataclass
from urllib.parse import parse_qs, urlparse

import requests
from fastapi import Request

from api.config import settings
from api.ratelimit import client_ip

log = logging.getLogger("meta_capi")

CURRENCY = "BDT"
TIMEOUT_SECONDS = 5


@dataclass(frozen=True)
class ClientContext:
    """Browser details captured from the request, for event matching."""

    ip: str | None
    user_agent: str | None
    fbp: str | None  # _fbp cookie set by the pixel (or our bootstrap)
    fbc: str | None  # _fbc cookie (click id) set by the pixel, or synthesised
    source_url: str | None


def enabled() -> bool:
    return bool(settings.meta_pixel_id and settings.meta_capi_access_token)


def _sha256(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def normalise_phone(raw: str) -> str:
    """Bangladeshi number -> digits with country code, as Meta expects."""
    digits = re.sub(r"\D", "", raw)
    if digits.startswith("880"):
        return digits
    if digits.startswith("0"):
        return "880" + digits[1:]
    return "880" + digits if digits else ""


def fbclid_from(url: str | None) -> str | None:
    """The fbclid query parameter of a URL, if any."""
    if not url:
        return None
    try:
        values = parse_qs(urlparse(url).query).get("fbclid")
    except ValueError:
        return None
    return values[0] if values and values[0] else None


def synthesise_fbc(fbclid: str, now_ms: int | None = None) -> str:
    """The _fbc value the Pixel would have set for this click id."""
    return f"fb.1.{now_ms if now_ms is not None else int(time.time() * 1000)}.{fbclid}"


def client_context(request: Request, *, source_url: str | None = None) -> ClientContext:
    """
    Match keys from a storefront request: the real client address (via the
    configured proxy header), the user agent, and the Pixel cookies. When the
    page was reached from an ad click but the SDK has not set _fbc yet, the
    fbclid in the page URL stands in for it.
    """
    url = source_url or request.headers.get("referer")
    fbc = request.cookies.get("_fbc")
    if not fbc:
        fbclid = fbclid_from(url)
        if fbclid:
            fbc = synthesise_fbc(fbclid)
    return ClientContext(
        ip=client_ip(request),
        user_agent=request.headers.get("user-agent"),
        fbp=request.cookies.get("_fbp"),
        fbc=fbc,
        source_url=url,
    )


def _match_keys(ctx: ClientContext) -> dict:
    user_data: dict = {}
    if ctx.ip:
        user_data["client_ip_address"] = ctx.ip
    if ctx.user_agent:
        user_data["client_user_agent"] = ctx.user_agent
    if ctx.fbp:
        user_data["fbp"] = ctx.fbp
    if ctx.fbc:
        user_data["fbc"] = ctx.fbc
    return user_data


def build_event(
    *,
    event_name: str,
    event_id: str,
    ctx: ClientContext,
    custom_data: dict | None = None,
    event_time: float | None = None,
) -> dict:
    """A non-purchase event: match keys from the request, no PII."""
    event: dict = {
        "event_name": event_name,
        "event_time": int(event_time or time.time()),
        "event_id": event_id,
        "action_source": "website",
        "user_data": _match_keys(ctx),
    }
    if custom_data:
        event["custom_data"] = custom_data
    if ctx.source_url:
        event["event_source_url"] = ctx.source_url
    return event


def build_purchase_event(
    *,
    order_no: str,
    customer_name: str,
    phone: str,
    quantity: int,
    unit_price: int,
    created_at: float | None,
    ctx: ClientContext,
    # The sold variant's catalogue id — the same one the browser's Pixel
    # event carried, so the two sides of the Purchase deduplicate.
    sku: str,
) -> dict:
    content_id = sku
    first_name = customer_name.strip().split()[0].lower() if customer_name.strip() else ""
    user_data: dict = {"country": [_sha256("bd")]}
    if first_name:
        user_data["fn"] = [_sha256(first_name)]
    phone_digits = normalise_phone(phone)
    if phone_digits:
        user_data["ph"] = [_sha256(phone_digits)]
    user_data.update(_match_keys(ctx))

    value = unit_price * quantity
    event: dict = {
        "event_name": "Purchase",
        "event_time": int(created_at or time.time()),
        "event_id": order_no,
        "action_source": "website",
        "user_data": user_data,
        "custom_data": {
            "currency": CURRENCY,
            "value": value,
            "content_type": "product",
            "content_ids": [content_id],
            "contents": [
                {
                    "id": content_id,
                    "quantity": quantity,
                    "item_price": unit_price,
                }
            ],
            "num_items": quantity,
            "order_id": order_no,
        },
    }
    if ctx.source_url:
        event["event_source_url"] = ctx.source_url
    return event


def _events_url() -> str:
    return (
        f"https://graph.facebook.com/{settings.meta_api_version}/"
        f"{settings.meta_pixel_id}/events"
    )


def send_event(event: dict) -> None:
    """Post one event. Safe to run as a FastAPI background task.

    Never raises: a Meta outage must not affect the request that produced it.
    """
    if not enabled():
        return
    payload: dict = {"data": [event]}
    if settings.meta_test_event_code:
        payload["test_event_code"] = settings.meta_test_event_code
    label = f"{event.get('event_name')} {event.get('event_id')}"
    try:
        res = requests.post(
            _events_url(),
            json=payload,
            params={"access_token": settings.meta_capi_access_token},
            timeout=TIMEOUT_SECONDS,
        )
        if res.ok:
            log.info("CAPI %s sent: %s", label, res.text)
        else:
            log.warning("CAPI %s rejected (%s): %s", label, res.status_code, res.text[:500])
    except requests.RequestException as exc:
        log.warning("CAPI %s failed: %s", label, exc)


def send_purchase(**kwargs) -> None:
    """Post a Purchase event. Safe to run as a FastAPI background task."""
    if not enabled():
        return
    send_event(build_purchase_event(**kwargs))
