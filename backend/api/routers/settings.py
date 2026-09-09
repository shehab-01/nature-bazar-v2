from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from api import workday
from api.auth import get_current_user, require_super_admin
from api.db import get_session
from api.models import User
from api.schemas import WorkdayIn, WorkdayOut

router = APIRouter(prefix="/settings", tags=["Settings"])


async def _workday(session: AsyncSession) -> WorkdayOut:
    day_end = await workday.day_end(session)
    return WorkdayOut(
        day_end=workday.format_day_end(day_end), today=workday.today(day_end)
    )


@router.get("/workday", response_model=WorkdayOut)
async def get_workday(
    session: AsyncSession = Depends(get_session),
    _user: User = Depends(get_current_user),
) -> WorkdayOut:
    """When the working day ends, and which working day it is right now —
    the date the dashboard and the tables mean by "today"."""
    return await _workday(session)


@router.put("/workday", response_model=WorkdayOut)
async def put_workday(
    payload: WorkdayIn,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_super_admin),
) -> WorkdayOut:
    await workday.set_day_end(session, payload.day_end, user.id)
    await session.commit()
    return await _workday(session)
