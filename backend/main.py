from fastapi import FastAPI, APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from api.routers import test_router

class HealthCheck(BaseModel):
    status: str = "ok"

app = FastAPI(
    title="Health Log",
    description="A complete example with Pydantic, Router, and CORS",
    version="1.0.0",
    # lifespan=lifespan,
)

# Origins 
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:3010",

]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    # allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"], 
    allow_headers=["*"], 
)

# routers

app.include_router(test_router.router, tags=["Test Router"])

@app.get("/", tags=["Root"])
async def read_root():
    """
    A simple root endpoint to know the API is running.
    """
    return {"message": "Welcome to the API!"}


@app.get("/health", response_model=HealthCheck, tags=["Health"])
async def health_check():
    """
    A simple health check endpoint.
    Responds with {"status": "ok"} if the app is healthy.
    """
    return HealthCheck(status="ok")