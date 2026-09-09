"""
POST /api/track: the server-side twin of a browser Pixel event.

Run from backend/:  python -m pytest tests -q
"""
import uuid

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.config import settings
from api.routers import track
from api.services import meta_capi

UID = str(uuid.uuid4())
PUBLIC_IP = "8.8.8.8"


@pytest.fixture
def client(monkeypatch):
    """A tiny app with only the track router, CAPI 'enabled', and dispatch
    captured instead of hitting Meta."""
    monkeypatch.setattr(settings, "meta_pixel_id", "123")
    monkeypatch.setattr(settings, "meta_capi_access_token", "tok")
    monkeypatch.setattr(settings, "client_ip_header", "cf-connecting-ip")
    sent: list[dict] = []
    monkeypatch.setattr(meta_capi, "dispatch", lambda event: sent.append(event))
    app = FastAPI()
    app.include_router(track.router, prefix="/api")
    test_client = TestClient(app)
    test_client.sent = sent  # type: ignore[attr-defined]
    return test_client


def post(client, body, ip=PUBLIC_IP, **kwargs):
    headers = {"cf-connecting-ip": ip, "user-agent": "UA/1.0", **kwargs.pop("headers", {})}
    return client.post("/api/track", json=body, headers=headers, **kwargs)


# --- whitelist / validation --------------------------------------------------


@pytest.mark.parametrize("name", ["PageView", "ViewContent", "AddToCart", "InitiateCheckout"])
def test_whitelisted_events_are_accepted(client, name):
    res = post(client, {"event_name": name, "event_id": UID})
    assert res.status_code == 204
    assert client.sent[-1]["event_name"] == name
    assert client.sent[-1]["event_id"] == UID
    assert client.sent[-1]["action_source"] == "website"


@pytest.mark.parametrize("name", ["Purchase", "Lead", "pageview", "", None])
def test_other_event_names_are_422(client, name):
    res = post(client, {"event_name": name, "event_id": UID})
    assert res.status_code == 422
    assert client.sent == []


@pytest.mark.parametrize("event_id", ["NB-12", "not-a-uuid", "", 12, None])
def test_event_id_must_be_a_uuid(client, event_id):
    res = post(client, {"event_name": "PageView", "event_id": event_id})
    assert res.status_code == 422


def test_event_id_is_required(client):
    assert post(client, {"event_name": "PageView"}).status_code == 422


def test_unknown_top_level_keys_are_422(client):
    body = {"event_name": "PageView", "event_id": UID, "email": "a@b.c"}
    assert post(client, body).status_code == 422


def test_custom_data_allows_only_pixel_keys(client):
    ok = {
        "content_ids": ["SKU-1"],
        "content_type": "product",
        "value": 1490,
        "currency": "BDT",
        "num_items": 1,
    }
    res = post(client, {"event_name": "ViewContent", "event_id": UID, "custom_data": ok})
    assert res.status_code == 204
    assert client.sent[-1]["custom_data"] == ok


@pytest.mark.parametrize(
    "custom_data",
    [
        {"em": "hashed"},  # PII key
        {"content_name": "x"},  # a pixel key we deliberately do not accept
        {"value": -1},
        {"currency": "BDTT"},
        {"content_ids": ["x" * 65]},
    ],
)
def test_custom_data_rejects_anything_else(client, custom_data):
    body = {"event_name": "ViewContent", "event_id": UID, "custom_data": custom_data}
    assert post(client, body).status_code == 422


# --- match keys ---------------------------------------------------------------


def test_user_data_comes_from_the_request(client):
    res = post(
        client,
        {"event_name": "PageView", "event_id": UID, "event_source_url": "https://shop.example/"},
        cookies={"_fbp": "fb.1.1.111", "_fbc": "fb.1.1.CLICK"},
    )
    assert res.status_code == 204
    event = client.sent[-1]
    assert event["user_data"] == {
        "client_ip_address": PUBLIC_IP,
        "client_user_agent": "UA/1.0",
        "fbp": "fb.1.1.111",
        "fbc": "fb.1.1.CLICK",
    }
    assert event["event_source_url"] == "https://shop.example/"


def test_fbc_is_synthesised_from_fbclid_when_cookie_missing(client):
    url = "https://shop.example/?utm=x&fbclid=IwAR0abc-DEF_123"
    post(client, {"event_name": "PageView", "event_id": UID, "event_source_url": url})
    fbc = client.sent[-1]["user_data"]["fbc"]
    prefix, version, created, fbclid = fbc.split(".", 3)
    assert (prefix, version) == ("fb", "1")
    assert created.isdigit() and len(created) == 13  # milliseconds
    assert fbclid == "IwAR0abc-DEF_123"


def test_existing_fbc_cookie_beats_fbclid(client):
    url = "https://shop.example/?fbclid=NEW"
    post(
        client,
        {"event_name": "PageView", "event_id": UID, "event_source_url": url},
        cookies={"_fbc": "fb.1.1.OLD"},
    )
    assert client.sent[-1]["user_data"]["fbc"] == "fb.1.1.OLD"


def test_body_cookies_are_a_fallback_only(client):
    body = {
        "event_name": "PageView",
        "event_id": UID,
        "fbp": "fb.1.1700000000000.1234567890",
        "fbc": "fb.1.1700000000000.CLICK",
    }
    post(client, body)
    assert client.sent[-1]["user_data"]["fbp"] == "fb.1.1700000000000.1234567890"
    assert client.sent[-1]["user_data"]["fbc"] == "fb.1.1700000000000.CLICK"

    post(client, body, cookies={"_fbp": "fb.1.9.9"})
    assert client.sent[-1]["user_data"]["fbp"] == "fb.1.9.9"  # header wins


def test_malformed_body_cookies_are_422(client):
    body = {"event_name": "PageView", "event_id": UID, "fbp": "<script>"}
    assert post(client, body).status_code == 422


def test_no_pii_is_ever_forwarded(client):
    post(client, {"event_name": "AddToCart", "event_id": UID})
    assert set(client.sent[-1]["user_data"]) <= {
        "client_ip_address",
        "client_user_agent",
        "fbp",
        "fbc",
    }


# --- admin traffic / disabled -----------------------------------------------


def test_admin_source_url_is_ignored(client):
    url = "https://shop.example/admin/orders"
    res = post(client, {"event_name": "PageView", "event_id": UID, "event_source_url": url})
    assert res.status_code == 204
    assert client.sent == []


def test_admin_referer_is_ignored(client):
    res = post(
        client,
        {"event_name": "PageView", "event_id": UID},
        headers={"referer": "https://shop.example/admin"},
    )
    assert res.status_code == 204
    assert client.sent == []


def test_nothing_is_sent_when_capi_is_not_configured(client, monkeypatch):
    monkeypatch.setattr(settings, "meta_capi_access_token", "")
    res = post(client, {"event_name": "PageView", "event_id": UID})
    assert res.status_code == 204
    assert client.sent == []


# --- rate limit ---------------------------------------------------------------


def test_rate_limited_per_ip(client, monkeypatch):
    monkeypatch.setattr(track.track_limiter, "limit", 3)
    ip = "9.9.9.9"  # its own bucket, untouched by the other tests
    body = {"event_name": "PageView", "event_id": UID}
    for _ in range(3):
        assert post(client, body, ip=ip).status_code == 204
    res = post(client, body, ip=ip)
    assert res.status_code == 429
    assert "Retry-After" in res.headers
    # Another address is not affected.
    assert post(client, body, ip="7.7.7.7").status_code == 204
