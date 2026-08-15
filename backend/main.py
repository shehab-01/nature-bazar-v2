import os

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from api.routers import test_router


class HealthCheck(BaseModel):
    status: str = "ok"


app = FastAPI(
    title="voiceKit",
    description="A complete example with Pydantic, Router, and CORS",
    version="1.0.0",
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


@app.get("/", tags=["Root"])
async def read_root():
    """Root endpoint to confirm the API is running."""
    return {"message": "Welcome to the API!"}


@app.get("/health", response_model=HealthCheck, tags=["Health"])
async def health_check():
    """Returns ok if the app is healthy."""
    return HealthCheck(status="ok")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", "9090")),
        reload=os.getenv("RELOAD", "true").lower() == "true",
    )
