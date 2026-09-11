import os


def _database_url() -> str:
    url = os.getenv(
        "DATABASE_URL",
        "postgresql://nature_bazar:change-me@localhost:5432/nature_bazar",
    )
    # SQLAlchemy needs an explicit driver; psycopg3 serves both sync (alembic)
    # and async (app) connections from the same URL.
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


class Settings:
    database_url: str = _database_url()

    # Per-process pool. Total connections = workers * (pool_size + max_overflow);
    # keep that under Postgres max_connections (default 100).
    db_pool_size: int = int(os.getenv("DB_POOL_SIZE", "10"))
    db_max_overflow: int = int(os.getenv("DB_MAX_OVERFLOW", "10"))

    cors_origins: list[str] = [
        origin.strip()
        for origin in os.getenv("FRONTEND_ORIGIN", "http://localhost:3000").split(",")
        if origin.strip()
    ]

    # The fallback product, used only if the products table is empty — every
    # order normally prices against the active row (see api.routers.products).
    # Price is decided server-side either way; client-sent totals are never
    # trusted.

    # Where uploaded product images are written. This must be a mounted volume:
    # anything written elsewhere in the container is lost on the next rebuild.
    media_root: str = os.getenv("MEDIA_ROOT", "/app/media")
    # Refused above this, before anything touches disk.
    max_upload_bytes: int = int(os.getenv("MAX_UPLOAD_BYTES", str(5 * 1024 * 1024)))

    # A claim (staff has the order open) older than this is a crashed tab, not
    # a person: anyone may take the row over. The modal heartbeats well inside
    # this window while it is open.
    claim_ttl_minutes: int = int(os.getenv("CLAIM_TTL_MINUTES", "10"))

    # One order per phone number per this many hours. Stops double-taps and
    # repeat spam without any state beyond the orders table itself.
    order_cooldown_hours: int = int(os.getenv("ORDER_COOLDOWN_HOURS", "24"))

    # Per-IP limits on the public endpoints, per window; 0 disables one.
    # Generous on purpose: mobile carriers here put thousands of customers
    # behind one CGNAT address, and a campaign spike must not become 429s.
    rate_limit_window_seconds: int = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "600"))
    rate_limit_orders: int = int(os.getenv("RATE_LIMIT_ORDERS", "30"))
    rate_limit_drafts: int = int(os.getenv("RATE_LIMIT_DRAFTS", "300"))
    rate_limit_logins: int = int(os.getenv("RATE_LIMIT_LOGINS", "20"))
    # POST /api/track (server copies of browser Pixel events), per IP per
    # minute — not per the window above; a page fires a handful at most.
    rate_limit_track: int = int(os.getenv("RATE_LIMIT_TRACK", "60"))
    # Header carrying the real client address. Cloudflare sets this one and
    # overwrites whatever the client sent. Empty = trust the socket address.
    client_ip_header: str = os.getenv("CLIENT_IP_HEADER", "cf-connecting-ip")

    # Meta Conversions API (server-side Purchase events). Disabled when either
    # value is empty. META_TEST_EVENT_CODE routes events to the Test Events tab.
    meta_pixel_id: str = os.getenv("META_PIXEL_ID", "")
    meta_capi_access_token: str = os.getenv("META_CAPI_ACCESS_TOKEN", "")
    meta_test_event_code: str = os.getenv("META_TEST_EVENT_CODE", "")
    meta_api_version: str = os.getenv("META_API_VERSION", "v21.0")

    # Pathao Courier merchant API. Disabled until client id, secret, username,
    # password and store id are all set. Defaults point at the sandbox so a
    # half-configured server can never create real consignments.
    pathao_base_url: str = os.getenv(
        "PATHAO_BASE_URL", "https://courier-api-sandbox.pathao.com"
    ).rstrip("/")
    pathao_client_id: str = os.getenv("PATHAO_CLIENT_ID", "")
    pathao_client_secret: str = os.getenv("PATHAO_CLIENT_SECRET", "")
    pathao_username: str = os.getenv("PATHAO_USERNAME", "")
    pathao_password: str = os.getenv("PATHAO_PASSWORD", "")
    pathao_store_id: int = int(os.getenv("PATHAO_STORE_ID", "0") or 0)
    # Weight of one unit in kg; multiplied by quantity and clamped to Pathao's
    # 0.5 to 10 kg range. Pathao prices by weight, so keep this honest.
    pathao_unit_weight_kg: float = float(os.getenv("PATHAO_UNIT_WEIGHT_KG", "1"))
    # Public tracking page Pathao gives customers; the consignment id and
    # phone are appended as query parameters.
    pathao_tracking_url: str = os.getenv(
        "PATHAO_TRACKING_URL", "https://merchant.pathao.com/tracking"
    )

    # BDCourier courier-history lookup (courier-check API). Disabled — every
    # check is skipped — until a key is set.
    bdcourier_api_key: str = os.getenv("BDCOURIER_API_KEY", "")

    # Auth
    google_client_id: str = os.getenv("GOOGLE_CLIENT_ID", "")
    session_secret: str = os.getenv("SESSION_SECRET", "")
    session_max_age: int = int(os.getenv("SESSION_MAX_AGE", str(7 * 24 * 3600)))
    cookie_secure: bool = os.getenv("COOKIE_SECURE", "false").lower() == "true"
    super_admin_emails: frozenset[str] = frozenset(
        email.strip().lower()
        for email in os.getenv("SUPER_ADMIN_EMAILS", "").split(",")
        if email.strip()
    )


settings = Settings()

