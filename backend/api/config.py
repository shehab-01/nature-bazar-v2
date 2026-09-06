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

    # Price is decided server-side; client-sent totals are never trusted.
    product_name: str = os.getenv(
        "PRODUCT_NAME",
        "স্পেশাল আচার কম্বো (ইলিশ, গরুর মাংস, চেপা শুটকি)",
    )
    unit_price: int = int(os.getenv("UNIT_PRICE", "1490"))
    # Must match PRODUCT.item_id in frontend/src/lib/tracking.ts so browser and
    # server events describe the same catalogue item.
    product_sku: str = os.getenv("PRODUCT_SKU", "combo-1490")

    # Meta Conversions API (server-side Purchase events). Disabled when either
    # value is empty. META_TEST_EVENT_CODE routes events to the Test Events tab.
    meta_pixel_id: str = os.getenv("META_PIXEL_ID", "")
    meta_capi_access_token: str = os.getenv("META_CAPI_ACCESS_TOKEN", "")
    meta_test_event_code: str = os.getenv("META_TEST_EVENT_CODE", "")
    meta_api_version: str = os.getenv("META_API_VERSION", "v21.0")

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
