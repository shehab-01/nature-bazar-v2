from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, Request, Response
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from sqlalchemy.ext.asyncio import AsyncSession

from api.config import settings
from api.db import get_session
from api.models import User, UserRole, UserStatus

SESSION_COOKIE = "nb_session"

_serializer = URLSafeTimedSerializer(settings.session_secret, salt="nb-admin-session")


def set_session_cookie(response: Response, user_id: int) -> None:
    token = _serializer.dumps({"uid": user_id})
    response.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=settings.session_max_age,
        httponly=True,
        samesite="lax",
        secure=settings.cookie_secure,
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(SESSION_COOKIE, path="/")


async def get_session_user(
    request: Request, session: AsyncSession = Depends(get_session)
) -> User:
    """The user for the current session cookie, regardless of status."""
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise HTTPException(status_code=401, detail="Not signed in")
    try:
        data = _serializer.loads(token, max_age=settings.session_max_age)
    except (BadSignature, SignatureExpired):
        raise HTTPException(status_code=401, detail="Session expired")

    user = await session.get(User, data.get("uid"))
    if user is None:
        raise HTTPException(status_code=401, detail="Unknown user")

    dirty = False
    # Apply SUPER_ADMIN_EMAILS promotions without requiring a re-login.
    if user.email in settings.super_admin_emails and (
        user.role != UserRole.super_admin or user.status != UserStatus.active
    ):
        user.role = UserRole.super_admin
        user.status = UserStatus.active
        dirty = True

    # Touch last_active_at at most every 5 minutes to avoid a write per request.
    now = datetime.now(timezone.utc)
    if user.last_active_at is None or now - user.last_active_at > timedelta(minutes=5):
        user.last_active_at = now
        dirty = True

    if dirty:
        await session.commit()
    return user


async def get_current_user(user: User = Depends(get_session_user)) -> User:
    """An *approved* user — the guard for all admin endpoints."""
    if user.status != UserStatus.active:
        raise HTTPException(status_code=403, detail=f"Account {user.status.value}")
    return user


async def require_super_admin(user: User = Depends(get_current_user)) -> User:
    if user.role.value != "super_admin":
        raise HTTPException(status_code=403, detail="Super admin only")
    return user
