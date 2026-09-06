import math
import re
from datetime import date, datetime, time, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request
from sqlalchemy import func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from api.auth import get_current_user
from api.config import settings
from api.db import get_session
from api.models import Order, OrderEvent, OrderStatus, OrderTag, User, UserRole
from api.services import meta_capi
from api.schemas import (
    OrderCreate,
    OrderListOut,
    OrderOut,
    OrderStatsOut,
    OrderUpdate,
    TagCreate,
)

router = APIRouter(prefix="/orders", tags=["Orders"])

ORDER_NO_RE = re.compile(r"^NB-?(\d+)$", re.IGNORECASE)

SORTABLE = {
    "id": Order.id,
    "total": Order.total_amount,
    "created_at": Order.created_at,
}


def _day_start(d: date) -> datetime:
    return datetime.combine(d, time.min, tzinfo=timezone.utc)


async def _get_fresh_order(session: AsyncSession, order_id: int) -> Order:
    """Reload an order (with its assignee) after a write, for the response."""
    order = await session.scalar(
        select(Order)
        .where(Order.id == order_id)
        .execution_options(populate_existing=True)
    )
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("", response_model=OrderOut, status_code=201)
def _client_context(request: Request) -> meta_capi.ClientContext:
    forwarded = request.headers.get("x-forwarded-for", "")
    ip = forwarded.split(",")[0].strip() if forwarded else None
    if not ip and request.client:
        ip = request.client.host
    return meta_capi.ClientContext(
        ip=ip,
        user_agent=request.headers.get("user-agent"),
        fbp=request.cookies.get("_fbp"),
        fbc=request.cookies.get("_fbc"),
        source_url=request.headers.get("referer"),
    )


@router.post("", response_model=OrderOut, status_code=201)
async def create_order(
    payload: OrderCreate,
    request: Request,
    background: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
) -> Order:
    order = Order(
        customer_name=payload.customer_name.strip(),
        phone=payload.phone.strip(),
        address=payload.address.strip(),
        product_name=settings.product_name,
        quantity=payload.quantity,
        unit_price=settings.unit_price,
        total_amount=settings.unit_price * payload.quantity,
    )
    session.add(order)
    await session.flush()
    session.add(
        OrderEvent(
            order_id=order.id,
            event_type="created",
            new_status=OrderStatus.processing.value,
        )
    )
    await session.commit()
    order = await _get_fresh_order(session, order.id)
    if meta_capi.enabled():
        background.add_task(
            meta_capi.send_purchase,
            order_no=f"NB-{order.id}",
            customer_name=order.customer_name,
            phone=order.phone,
            quantity=order.quantity,
            unit_price=order.unit_price,
            created_at=order.created_at.timestamp() if order.created_at else None,
            ctx=_client_context(request),
        )
    return order


@router.get("", response_model=OrderListOut)
async def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    status: list[OrderStatus] | None = Query(None),
    date_from: date | None = None,
    date_to: date | None = None,
    q: str | None = Query(None, max_length=100),
    sort: str = Query("-created_at", pattern=r"^-?(id|total|created_at)$"),
    session: AsyncSession = Depends(get_session),
    _user: User = Depends(get_current_user),
) -> OrderListOut:
    filters = []
    if status:
        filters.append(Order.status.in_(status))
    if date_from:
        filters.append(Order.created_at >= _day_start(date_from))
    if date_to:
        filters.append(Order.created_at < _day_start(date_to) + timedelta(days=1))
    if q:
        q = q.strip()
        order_no = ORDER_NO_RE.match(q)
        if order_no:
            filters.append(Order.id == int(order_no.group(1)))
        elif q.isdigit():
            filters.append(
                or_(Order.id == int(q), Order.phone.ilike(f"%{q}%"))
            )
        else:
            filters.append(
                or_(
                    Order.customer_name.ilike(f"%{q}%"),
                    Order.phone.ilike(f"%{q}%"),
                )
            )

    sort_col = SORTABLE[sort.lstrip("-")]
    order_by = sort_col.desc() if sort.startswith("-") else sort_col.asc()

    total = await session.scalar(
        select(func.count()).select_from(Order).where(*filters)
    )
    rows = await session.scalars(
        select(Order)
        .where(*filters)
        .order_by(order_by, Order.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return OrderListOut(
        items=[OrderOut.model_validate(row) for row in rows],
        total=total or 0,
        page=page,
        page_size=page_size,
        pages=max(math.ceil((total or 0) / page_size), 1),
    )


@router.get("/stats", response_model=OrderStatsOut)
async def order_stats(
    session: AsyncSession = Depends(get_session),
    _user: User = Depends(get_current_user),
) -> OrderStatsOut:
    done = (
        OrderStatus.confirmed.value,
        OrderStatus.shipped.value,
        OrderStatus.cancelled.value,
    )
    row = (
        await session.execute(
            select(
                func.count(),
                func.count().filter(Order.status.not_in(done)),
                func.count().filter(Order.status == OrderStatus.confirmed.value),
                func.count().filter(Order.status == OrderStatus.cancelled.value),
                func.coalesce(
                    func.sum(Order.total_amount).filter(
                        Order.status != OrderStatus.cancelled.value
                    ),
                    0,
                ),
            )
        )
    ).one()
    total, in_progress, confirmed, cancelled, revenue = row
    return OrderStatsOut(
        total=total,
        in_progress=in_progress,
        confirmed=confirmed,
        cancelled=cancelled,
        revenue=revenue,
    )


@router.post("/{order_id}/claim", response_model=OrderOut)
async def claim_order(
    order_id: int,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> Order:
    # Atomic compare-and-set: only one concurrent claimer can win this UPDATE.
    won = await session.scalar(
        update(Order)
        .where(
            Order.id == order_id,
            or_(Order.assigned_to.is_(None), Order.assigned_to == user.id),
        )
        .values(assigned_to=user.id, assigned_at=func.now())
        .returning(Order.id)
    )
    if won is None:
        holder = await session.scalar(
            select(User.name)
            .join(Order, Order.assigned_to == User.id)
            .where(Order.id == order_id)
        )
        if holder is None:
            raise HTTPException(status_code=404, detail="Order not found")
        raise HTTPException(
            status_code=409, detail=f"{holder} is already handling this order"
        )

    session.add(
        OrderEvent(order_id=order_id, actor_id=user.id, event_type="claimed")
    )
    await session.commit()
    return await _get_fresh_order(session, order_id)


@router.post("/{order_id}/release", response_model=OrderOut)
async def release_order(
    order_id: int,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> Order:
    conditions = [Order.id == order_id]
    if user.role != UserRole.super_admin:
        conditions.append(Order.assigned_to == user.id)

    released = await session.scalar(
        update(Order)
        .where(*conditions, Order.assigned_to.is_not(None))
        .values(assigned_to=None, assigned_at=None)
        .returning(Order.id)
    )
    if released is None:
        exists = await session.scalar(select(Order.id).where(Order.id == order_id))
        if exists is None:
            raise HTTPException(status_code=404, detail="Order not found")
        raise HTTPException(
            status_code=403, detail="You can only release your own claim"
        )

    session.add(
        OrderEvent(order_id=order_id, actor_id=user.id, event_type="released")
    )
    await session.commit()
    return await _get_fresh_order(session, order_id)


@router.post("/{order_id}/tags", response_model=OrderOut, status_code=201)
async def add_tag(
    order_id: int,
    payload: TagCreate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> Order:
    exists = await session.scalar(select(Order.id).where(Order.id == order_id))
    if exists is None:
        raise HTTPException(status_code=404, detail="Order not found")

    label = payload.label.strip()
    session.add(OrderTag(order_id=order_id, created_by=user.id, label=label))
    session.add(
        OrderEvent(
            order_id=order_id, actor_id=user.id, event_type="tag_added", note=label
        )
    )
    await session.commit()
    return await _get_fresh_order(session, order_id)


@router.patch("/{order_id}", response_model=OrderOut)
async def update_order(
    order_id: int,
    payload: OrderUpdate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> Order:
    if all(
        value is None
        for value in (
            payload.status,
            payload.comment,
            payload.customer_name,
            payload.phone,
            payload.address,
        )
    ):
        raise HTTPException(status_code=400, detail="Nothing to update")

    # Lock only the orders row — FOR UPDATE can't cover the outer-joined
    # assignee relationship.
    order = await session.get(Order, order_id, with_for_update={"of": Order})
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    # A claimed order is locked to its claimer (super admins excepted).
    if (
        order.assigned_to is not None
        and order.assigned_to != user.id
        and user.role != UserRole.super_admin
    ):
        raise HTTPException(
            status_code=409,
            detail=f"{order.assigned_to_name or 'Another worker'} is handling this order",
        )

    if payload.status is not None and payload.status.value != order.status:
        session.add(
            OrderEvent(
                order_id=order.id,
                actor_id=user.id,
                event_type="status_changed",
                old_status=order.status,
                new_status=payload.status.value,
            )
        )
        order.status = payload.status.value

    if payload.comment is not None and payload.comment != order.comment:
        session.add(
            OrderEvent(
                order_id=order.id,
                actor_id=user.id,
                event_type="comment_updated",
                note=payload.comment[:500],
            )
        )
        order.comment = payload.comment

    details_changed = []
    if payload.customer_name is not None:
        value = payload.customer_name.strip()
        if value and value != order.customer_name:
            order.customer_name = value
            details_changed.append("name")
    if payload.phone is not None:
        value = payload.phone.strip()
        if value and value != order.phone:
            order.phone = value
            details_changed.append("phone")
    if payload.address is not None:
        value = payload.address.strip()
        if value and value != order.address:
            order.address = value
            details_changed.append("address")
    if details_changed:
        session.add(
            OrderEvent(
                order_id=order.id,
                actor_id=user.id,
                event_type="details_updated",
                note=", ".join(details_changed),
            )
        )

    await session.commit()
    # updated_at is server-generated on UPDATE, so it's expired after commit;
    # reload (with assignee) rather than during response serialization.
    return await _get_fresh_order(session, order_id)
