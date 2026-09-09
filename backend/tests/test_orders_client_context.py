"""
orders._client_context: the match keys sent with a Purchase's server copy.

The address must follow the rate limiter's rule (configured header via
client_ip(), else the socket peer) — never the first X-Forwarded-For entry,
which a client can set to anything.
"""
import pytest
from starlette.requests import Request

from api import ratelimit
from api.routers import orders

REAL = "8.8.8.8"
SPOOFED = "1.1.1.1"
WEB_CONTAINER = "172.18.0.5"


def make_request(headers: dict[str, str], client: str = WEB_CONTAINER) -> Request:
    return Request(
        {
            "type": "http",
            "method": "POST",
            "path": "/api/orders",
            "query_string": b"",
            "headers": [(k.lower().encode(), v.encode()) for k, v in headers.items()],
            "client": (client, 12345),
        }
    )


@pytest.fixture
def header(monkeypatch):
    def _set(name: str) -> str:
        monkeypatch.setattr(ratelimit.settings, "client_ip_header", name)
        return name

    return _set


def test_address_comes_from_the_configured_header(header):
    name = header("x-forwarded-for")
    ctx = orders._client_context(make_request({name: f"{SPOOFED}, {REAL}"}))
    assert ctx.ip == REAL  # rightmost public entry, same as the limiter


def test_first_xff_entry_is_never_used_as_a_fallback(header):
    # Header configured for Cloudflare but only XFF arrives: the old code fell
    # back to the leftmost XFF entry here. Now it is the socket peer, internal
    # as it is, rather than a value the client controls.
    header("cf-connecting-ip")
    ctx = orders._client_context(make_request({"x-forwarded-for": f"{SPOOFED}, {REAL}"}))
    assert ctx.ip == WEB_CONTAINER


def test_socket_peer_when_no_header(header):
    header("cf-connecting-ip")
    assert orders._client_context(make_request({}, client=REAL)).ip == REAL
    assert orders._client_context(make_request({})).ip == WEB_CONTAINER


def test_other_match_keys(header):
    header("cf-connecting-ip")
    ctx = orders._client_context(
        make_request(
            {
                "cf-connecting-ip": REAL,
                "user-agent": "UA/1.0",
                "referer": "https://shop.example/",
                "cookie": "_fbp=fb.1.1.111; _fbc=fb.1.1.CLICK",
            }
        )
    )
    assert ctx == orders.meta_capi.ClientContext(
        ip=REAL,
        user_agent="UA/1.0",
        fbp="fb.1.1.111",
        fbc="fb.1.1.CLICK",
        source_url="https://shop.example/",
    )
