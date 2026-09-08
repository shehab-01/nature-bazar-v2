from fastapi import APIRouter, Depends, HTTPException, Response
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool

from api.auth import (
    clear_session_cookie,
    get_session_user,
    set_session_cookie,
)
from api.config import settings
from api.db import get_session
from api.models import User, UserRole, UserStatus
from api.ratelimit import logins_limiter
from api.schemas import UserOut

router = APIRouter(prefix="/auth", tags=["Auth"])

_google_request = google_requests.Request()


class GoogleLogin(BaseModel):
    credential: str


def _verify_google_token(credential: str) -> dict:
    # google-auth uses blocking HTTP for Google's certs (cached after the
    # first call) — keep it off the event loop.
    return id_token.verify_oauth2_token(
        credential, _google_request, settings.google_client_id
    )


@router.post(
    "/google", response_model=UserOut, dependencies=[Depends(logins_limiter)]
)
async def login_with_google(
    payload: GoogleLogin,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> User:
    if not settings.google_client_id:
        raise HTTPException(status_code=500, detail="Google auth not configured")
    try:
        claims = await run_in_threadpool(_verify_google_token, payload.credential)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    email = claims.get("email", "").lower()
    if not email or not claims.get("email_verified"):
        raise HTTPException(status_code=401, detail="Email not verified")

    user = await session.scalar(select(User).where(User.email == email))
    if user is None:
        is_super = email in settings.super_admin_emails
        user = User(
            email=email,
            name=claims.get("name") or email.split("@")[0],
            picture_url=claims.get("picture"),
            role=UserRole.super_admin if is_super else UserRole.staff,
            status=UserStatus.active if is_super else UserStatus.pending,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
    else:
        # Keep profile fresh; also promote if added to SUPER_ADMIN_EMAILS later.
        user.name = claims.get("name") or user.name
        user.picture_url = claims.get("picture") or user.picture_url
        if email in settings.super_admin_emails:
            user.role = UserRole.super_admin
            user.status = UserStatus.active
        await session.commit()

    set_session_cookie(response, user.id)
    return user


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_session_user)) -> User:
    return user


@router.post("/logout", status_code=204)
async def logout(response: Response) -> None:
    clear_session_cookie(response)
