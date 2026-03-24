import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

load_dotenv()

# psycopg v3 async driver — note the +psycopg prefix
DATABASE_URL = os.getenv("DATABASE_URL", "").replace(
    "postgresql://", "postgresql+psycopg://"
)

engine = create_async_engine(
    DATABASE_URL,
    echo=False,       # Set True to log SQL queries during development
    pool_size=5,
    max_overflow=10,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


# Dependency for FastAPI routes
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise