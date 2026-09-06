from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from api.auth import require_super_admin
from api.db import get_session
from api.models import OrderEvent, User, UserStatus
from api.schemas import UserUpdate, UserWithActivityOut

router = APIRouter(
    prefix="/users",
    tags=["Users"],
    dependencies=[Depends(require_super_admin)],
)


@router.get("", response_model=list[UserWithActivityOut])
async def list_users(
    session: AsyncSession = Depends(get_session),
) -> list[UserWithActivityOut]:
    confirmed = func.count().filter(
        OrderEvent.event_type == "status_changed",
        OrderEvent.new_status == "confirmed",
    )
    shipped = func.count().filter(
        OrderEvent.event_type == "status_changed",
        OrderEvent.new_status == "shipped",
    )
    rows = await session.execute(
        select(User, confirmed, shipped)
        .outerjoin(OrderEvent, OrderEvent.actor_id == User.id)
        .group_by(User.id)
        .order_by(User.created_at)
    )
    return [
        UserWithActivityOut(
            **UserWithActivityOut.model_validate(user).model_dump(
                exclude={"orders_confirmed", "orders_shipped"}
            ),
            orders_confirmed=conf,
            orders_shipped=comp,
        )
        for user, conf, comp in rows
    ]


@router.patch("/{user_id}", response_model=UserWithActivityOut)
async def update_user(
    user_id: int,
    payload: UserUpdate,
    admin: User = Depends(require_super_admin),
    session: AsyncSession = Depends(get_session),
) -> User:
    if payload.status is None and payload.role is None:
        raise HTTPException(status_code=400, detail="Nothing to update")
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot change your own account")

    user = await session.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.status is not None:
        user.status = payload.status
    if payload.role is not None:
        user.role = payload.role
    await session.commit()
    return user


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: int,
    admin: User = Depends(require_super_admin),
    session: AsyncSession = Depends(get_session),
) -> None:
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    user = await session.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if user.status != UserStatus.pending:
        raise HTTPException(
            status_code=400,
            detail="Only pending requests can be deleted; suspend active users instead",
        )
    await session.delete(user)
    await session.commit()
