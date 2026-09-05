import os

from fastapi import FastAPI

app = FastAPI(title="Nature Bazar API", version="0.1.0")


@app.get("/")
async def read_root():
    return {"name": "Nature Bazar API", "status": "ready"}


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", "9090")),
        reload=os.getenv("RELOAD", "true").lower() == "true",
    )
