"""
client_ip(): which address the rate limiter keys on.

Run from backend/:  python -m pytest tests -q
(pytest is in requirements-dev.txt; it is not installed in the api image.)
"""
import pytest
from starlette.requests import Request

from api import ratelimit
from api.ratelimit import client_ip

# Real public addresses: RFC 5737 documentation ranges are non-global, so
# _is_internal() would (correctly) treat them as proxy hops.
REAL = "8.8.8.8"
SPOOFED = "1.1.1.1"
OTHER = "9.9.9.9"
INTERNAL_SOCKET = "172.18.0.5"  # the web container, as the api sees it


def make_request(headers: dict[str, str] | None = None, client: str = INTERNAL_SOCKET) -> Request:
    scope = {
        "type": "http",
        "method": "POST",
        "path": "/api/orders",
        "query_string": b"",
        "headers": [
            (name.lower().encode(), value.encode()) for name, value in (headers or {}).items()
        ],
        "client": (client, 12345),
    }
    return Request(scope)


@pytest.fixture
def header(monkeypatch):
    """Configure the header name the limiter reads, as CLIENT_IP_HEADER would."""

    def _set(name: str) -> str:
        monkeypatch.setattr(ratelimit.settings, "client_ip_header", name)
        return name

    return _set


# --- Cloudflare: single-value header, unchanged behaviour --------------------


def test_single_value_header_is_returned(header):
    name = header("cf-connecting-ip")
    assert client_ip(make_request({name: REAL})) == REAL


def test_single_value_header_is_stripped(header):
    name = header("cf-connecting-ip")
    assert client_ip(make_request({name: f"  {REAL} "})) == REAL


def test_missing_header_and_internal_socket_is_none(header):
    header("cf-connecting-ip")
    assert client_ip(make_request({})) is None


def test_missing_header_falls_back_to_public_socket(header):
    header("cf-connecting-ip")
    assert client_ip(make_request({}, client=REAL)) == REAL


def test_internal_only_header_falls_back_to_socket(header):
    name = header("cf-connecting-ip")
    assert client_ip(make_request({name: "10.0.0.1"}, client=REAL)) == REAL
    assert client_ip(make_request({name: "10.0.0.1"})) is None


# --- X-Forwarded-For: comma-separated list ----------------------------------


def test_spoofed_prefix_is_ignored(header):
    """A client sends its own X-Forwarded-For; the proxy appends the address
    it actually saw. Only the proxy's entry may be trusted."""
    name = header("x-forwarded-for")
    assert client_ip(make_request({name: f"{SPOOFED}, {REAL}"})) == REAL


def test_rightmost_public_wins_over_several(header):
    name = header("x-forwarded-for")
    assert client_ip(make_request({name: f"{SPOOFED},{OTHER} , {REAL}"})) == REAL


def test_trailing_internal_hops_are_skipped(header):
    """A local reverse proxy in front of the web container appends its own
    loopback/private address after the real one; skip back past it."""
    name = header("x-forwarded-for")
    assert client_ip(make_request({name: f"{SPOOFED}, {REAL}, 127.0.0.1"})) == REAL
    assert client_ip(make_request({name: f"{REAL}, 10.0.0.2, 192.168.1.1"})) == REAL


def test_all_internal_list_returns_none(header):
    name = header("x-forwarded-for")
    value = "10.0.0.1, 192.168.0.7, 127.0.0.1, 100.64.0.1"
    assert client_ip(make_request({name: value})) is None


def test_garbage_entries_are_treated_as_internal(header):
    name = header("x-forwarded-for")
    assert client_ip(make_request({name: f"{REAL}, unknown, ,"})) == REAL
    assert client_ip(make_request({name: "unknown, not-an-ip"})) is None


def test_empty_header_name_uses_socket_only(header):
    header("")
    assert client_ip(make_request({"x-forwarded-for": REAL})) is None
    assert client_ip(make_request({"x-forwarded-for": REAL}, client=OTHER)) == OTHER
