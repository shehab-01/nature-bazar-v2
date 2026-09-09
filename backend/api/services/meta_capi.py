"""Meta Conversions API: server-side Purchase events.

The browser pixel fires Purchase with eventID = order number; this module sends
the same event from the server with the same event_id so Meta deduplicates the
pair and still counts the sale when the browser event was blocked.

Docs: https://developers.facebook.com/docs/marketing-api/conversions-api
"""

from __future__ import annotations

import hashlib
import logging
import re
import time
from dataclasses import dataclass

import requests

from api.config import settings

log = logging.getLogger("meta_capi")

CURRENCY = "BDT"
TIMEOUT_SECONDS = 5


@dataclass(frozen=True)
class ClientContext:
    """Browser details captured from the order request, for event matching."""

    ip: str | None
    user_agent: str | None
    fbp: str | None  # _fbp cookie set by the pixel
    fbc: str | None  # _fbc cookie (click id) set by the pixel
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
    if ctx.ip:
        user_data["client_ip_address"] = ctx.ip
    if ctx.user_agent:
        user_data["client_user_agent"] = ctx.user_agent
    if ctx.fbp:
        user_data["fbp"] = ctx.fbp
    if ctx.fbc:
        user_data["fbc"] = ctx.fbc

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


def send_purchase(**kwargs) -> None:
    """Post a Purchase event. Safe to run as a FastAPI background task.

    Never raises: a Meta outage must not affect order creation.
    """
    if not enabled():
        return
    payload: dict = {"data": [build_purchase_event(**kwargs)]}
    if settings.meta_test_event_code:
        payload["test_event_code"] = settings.meta_test_event_code
    url = (
        f"https://graph.facebook.com/{settings.meta_api_version}/"
        f"{settings.meta_pixel_id}/events"
    )
    try:
        res = requests.post(
            url,
            json=payload,
            params={"access_token": settings.meta_capi_access_token},
            timeout=TIMEOUT_SECONDS,
        )
        if res.ok:
            log.info("CAPI Purchase sent for %s: %s", kwargs.get("order_no"), res.text)
        else:
            log.warning(
                "CAPI Purchase rejected for %s (%s): %s",
                kwargs.get("order_no"),
                res.status_code,
                res.text[:500],
            )
    except requests.RequestException as exc:
        log.warning("CAPI Purchase failed for %s: %s", kwargs.get("order_no"), exc)
