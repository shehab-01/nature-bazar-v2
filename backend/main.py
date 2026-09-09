import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from api import monitoring
from api.config import settings
from api.db import engine
from api.routers.auth import router as auth_router
from api.routers.orders import router as orders_router
from api.routers.products import public_router as storefront_router
from api.routers.products import router as products_router
from api.services import meta_capi, pathao_sync
from api.routers.settings import router as settings_router
from api.routers.system import router as system_router
from api.routers.track import router as track_router
from api.routers.users import router as users_router

# Uvicorn configures only its own loggers; the root logger would otherwise sit
# at WARNING and swallow the app's INFO lines — including "CAPI Purchase …
# sent", the one line that says a Meta event actually went out.
logging.basicConfig(
    level=logging.INFO, format="%(levelname)s:     %(name)s: %(message)s"
)
# httpx logs every request URL at INFO, and the Conversions API token travels
# in the query string, so that logger stays at WARNING.
logging.getLogger("httpx").setLevel(logging.WARNING)


@asynccontextmanager
async def lifespan(app: FastAPI):
    monitoring.start()
    pathao_sync.start()
    yield
    await pathao_sync.stop()
    # Let in-flight Conversions API deliveries (retries included) finish
    # before the worker goes away, so a redeploy never loses a Purchase.
    await meta_capi.drain()
    await monitoring.stop()
    await engine.dispose()


app = FastAPI(title="Nature Bazar API", version="0.2.0", lifespan=lifespan)

app.add_middleware(monitoring.TrafficMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(orders_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(system_router, prefix="/api")
app.include_router(settings_router, prefix="/api")
app.include_router(products_router, prefix="/api")
app.include_router(storefront_router, prefix="/api")
app.include_router(track_router, prefix="/api")

# Uploaded product images. settings.media_root is a mounted volume, so the
# directory may not exist on a first boot; StaticFiles refuses to mount a
# missing directory, hence the mkdir.
os.makedirs(settings.media_root, exist_ok=True)
app.mount("/media", StaticFiles(directory=settings.media_root), name="media")


@app.get("/")
async def read_root():
    return {"name": "Nature Bazar API", "status": "ready"}


@app.get("/health", tags=["Health"])
async def health_check():
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", "9090")),
        reload=os.getenv("RELOAD", "true").lower() == "true",
    )
