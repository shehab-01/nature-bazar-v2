from fastapi import FastAPI
from pydantic import BaseModel
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from api.routers import test_router
from api.routers import meal_plan_router
from api.routers import workout_router
from api.routers import profile_router


class HealthCheck(BaseModel):
    status: str = "ok"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup (safe to run repeatedly)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Neon Database connected")
    yield
    await engine.dispose()
    print("Neon Database disconnected")


app = FastAPI(
    title="Health Log",
    description="A complete example with Pydantic, Router, and CORS",
    version="1.0.0",
    lifespan=lifespan,
)

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:3010",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

app.include_router(test_router.router, tags=["Test Router"])
app.include_router(meal_plan_router.router, tags=["Meal Plan Router"])
app.include_router(workout_router.router, tags=["Workout Router"])
app.include_router(profile_router.router, tags=["Profile Router"])


@app.get("/", tags=["Root"])
async def read_root():
    """Root endpoint to confirm the API is running."""
    return {"message": "Welcome to the API!"}


@app.get("/health", response_model=HealthCheck, tags=["Health"])
async def health_check():
    """Returns ok if the app is healthy."""
    return HealthCheck(status="ok")