import math
import re
from datetime import date, datetime, time, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request
from sqlalchemy import delete, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from api.auth import get_current_user
from api.config import settings
from api.db import get_session
from api.models import (
    Order,
    OrderEvent,
    OrderItem,
    OrderSource,
    OrderStatus,
    OrderTag,
    Product,
    User,
    UserRole,
)
from api.phone import phone_digits, phone_key
from api.ratelimit import client_ip, drafts_limiter, orders_limiter
from api import catalogue
from api.services import meta_capi, pathao
from api.schemas import (
    BulkOrderResult,
    BulkOrderUpdate,
    BulkSkipped,
    ClaimOut,
    ClaimsOut,
    OrderCountsOut,
    OrderCreate,
    OrderDraft,
    OrderDraftOut,
    OrderListOut,
    OrderOut,
    OrderStatsOut,
    OrderUpdate,
    ManualOrderCreate,
    PhoneLookupOut,
    PathaoFailure,
    PathaoSendIn,
    PathaoSendOut,
    TagCreate,
)

router = APIRouter(prefix="/orders", tags=["Orders"])


def _active_line(product: catalogue.ActiveProduct, quantity: int) -> OrderItem:
    """The single line a storefront order carries. The storefront sells one
    product at a time, but it is written as an item like any other so the admin
    never has to render two shapes of order."""
    return OrderItem(
        product_id=product.id,
        product_name=product.title,
        unit_price=product.unit_price,
        quantity=quantity,
    )

ORDER_NO_RE = re.compile(r"^NB-?(\d+)$", re.IGNORECASE)

SORTABLE = {
    "id": Order.id,
    "total": Order.total_amount,
    "created_at": Order.created_at,
}

# A storefront form is only worth keeping once it carries a number we can call
# back on; below this it is someone tapping a field, not a lead.
DRAFT_MIN_PHONE_DIGITS = 6


def _claim_stale_before() -> datetime:
    return datetime.now(timezone.utc) - timedelta(minutes=settings.claim_ttl_minutes)


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


async def _load_orders(session: AsyncSession, ids: list[int]) -> list[Order]:
    """Reload several orders after a write, in the order the ids were given."""
    if not ids:
        return []
    rows = (
        await session.scalars(
            select(Order)
            .where(Order.id.in_(ids))
            .execution_options(populate_existing=True)
        )
    ).all()
    by_id = {row.id: row for row in rows}
    return [by_id[i] for i in ids if i in by_id]


def _held_by_someone_else(order: Order, user: User) -> bool:
    """A live claim by another worker locks the row — super admins too —
    unless it is old enough to be a dead tab rather than a person."""
    return (
        order.assigned_to is not None
        and order.assigned_to != user.id
        and (order.assigned_at is None or order.assigned_at >= _claim_stale_before())
    )


def _move_status(
    session: AsyncSession, order: Order, user: User, new_status: OrderStatus
) -> bool:
    """Put the order on another list, crediting the mover and dropping any
    claim. Returns False when it was already there."""
    if new_status.value == order.status:
        return False
    session.add(
        OrderEvent(
            order_id=order.id,
            actor_id=user.id,
            event_type="status_changed",
            old_status=order.status,
            new_status=new_status.value,
        )
    )
    order.status = new_status.value
    # Credit whoever moved it: on Confirmed Order this is who confirmed it.
    order.handled_by = user.id
    # The order now belongs to another list; nobody is "on it" any more.
    # Done here so the row is free even if the browser never says goodbye.
    if order.assigned_to is not None:
        order.assigned_to = None
        order.assigned_at = None
        session.add(
            OrderEvent(
                order_id=order.id,
                actor_id=user.id,
                event_type="released",
                note="status changed",
            )
        )
    return True


def _set_flag(
    session: AsyncSession, order: Order, user: User, flag: str, value: bool
) -> bool:
    if value == getattr(order, flag):
        return False
    setattr(order, flag, value)
    session.add(
        OrderEvent(
            order_id=order.id,
            actor_id=user.id,
            event_type=f"{flag}_{'set' if value else 'cleared'}",
        )
    )
    return True


def _client_context(request: Request) -> meta_capi.ClientContext:
    ip = client_ip(request)
    if not ip:
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


async def _find_by_draft_key(session: AsyncSession, key: str) -> Order | None:
    return await session.scalar(select(Order).where(Order.draft_key == key))


async def _find_open_draft(session: AsyncSession, key: str) -> Order | None:
    """The newest Incomplete row auto-captured for this phone, if any."""
    return await session.scalar(
        select(Order)
        .where(
            Order.phone_key == key,
            Order.status == OrderStatus.incomplete.value,
            Order.draft_key.is_not(None),
        )
        .order_by(Order.id.desc())
        .limit(1)
    )


async def _has_real_order(session: AsyncSession, key: str) -> bool:
    """
    Whether this phone already reached the live order lists. Such a customer is
    never captured again as an abandoned form: one person, one table.
    """
    found = await session.scalar(
        select(Order.id)
        .where(
            Order.phone_key == key,
            Order.status != OrderStatus.incomplete.value,
        )
        .limit(1)
    )
    return found is not None


@router.post(
    "/draft",
    response_model=OrderDraftOut,
    dependencies=[Depends(drafts_limiter)],
)
async def save_order_draft(
    payload: OrderDraft,
    session: AsyncSession = Depends(get_session),
) -> OrderDraftOut:
    """
    Autosave a storefront form that has not been submitted, so a visitor who
    fills it (or autofills it) and leaves still reaches the Incomplete list.

    The same visit keeps updating one row, and submitting the form promotes
    that row instead of creating a second one, so a customer is never in both
    Incomplete and the live order lists.
    """
    phone = payload.phone.strip()
    key = phone_key(phone)
    if len(phone_digits(phone)) < DRAFT_MIN_PHONE_DIGITS:
        return OrderDraftOut(saved=False)

    order = await _find_by_draft_key(session, payload.draft_key)
    if order is not None and order.status != OrderStatus.incomplete.value:
        # Already submitted or worked by staff — never drag it back to a draft.
        return OrderDraftOut(saved=False)

    if order is None:
        # A reload starts a new draft key; keep writing to the row this phone
        # already has rather than stacking up duplicates.
        order = await _find_open_draft(session, key)
        if order is None and await _has_real_order(session, key):
            return OrderDraftOut(saved=False)

    name = payload.customer_name.strip()
    address = payload.address.strip()
    product = await catalogue.active(session)

    if order is None:
        order = Order(
            customer_name=name,
            phone=phone,
            phone_key=key,
            address=address,
            draft_key=payload.draft_key,
            status=OrderStatus.incomplete.value,
            source=OrderSource.incomplete.value,
            product_name=product.title,
            quantity=1,
            unit_price=product.unit_price,
            total_amount=product.unit_price,
            items=[_active_line(product, 1)],
        )
        session.add(order)
        await session.flush()
        session.add(
            OrderEvent(
                order_id=order.id,
                event_type="draft_captured",
                new_status=OrderStatus.incomplete.value,
            )
        )
    else:
        # Only ever fill fields in. A revisit that retypes just the phone must
        # not blank out the name and address an earlier autosave captured.
        order.draft_key = payload.draft_key
        order.phone = phone
        order.phone_key = key
        if name:
            order.customer_name = name
        if address:
            order.address = address

    await session.commit()
    return OrderDraftOut(saved=True)


@router.post(
    "",
    response_model=OrderOut,
    status_code=201,
    dependencies=[Depends(orders_limiter)],
)
async def create_order(
    payload: OrderCreate,
    request: Request,
    background: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
) -> Order:
    name = payload.customer_name.strip()
    phone = payload.phone.strip()
    address = payload.address.strip()
    key = phone_key(phone)

    # One order per number per cooldown window. This is an index lookup on
    # phone_key, so it stays fast however large the table grows; only the
    # handful of rows for this one number are ever touched. Incomplete rows
    # don't count — an abandoned form isn't an order.
    cooldown_start = datetime.now(timezone.utc) - timedelta(
        hours=settings.order_cooldown_hours
    )
    recent = await session.scalar(
        select(Order.id)
        .where(
            Order.phone_key == key,
            Order.status != OrderStatus.incomplete.value,
            Order.created_at >= cooldown_start,
        )
        .limit(1)
    )
    if recent is not None:
        # Deliberately says nothing beyond "not now": no order number, no
        # name, nothing a stranger could learn by trying numbers.
        raise HTTPException(
            status_code=409,
            detail="An order was already placed from this number recently",
        )

    # This form may already have been autosaved as an Incomplete row, either
    # during this visit (draft_key) or an earlier one (same phone). Promote
    # that row so the customer moves to Web Order Lists instead of appearing
    # in both tables.
    draft = None
    if payload.draft_key:
        draft = await _find_by_draft_key(session, payload.draft_key)
        if draft is not None and draft.status != OrderStatus.incomplete.value:
            draft = None
    if draft is None:
        draft = await _find_open_draft(session, key)

    product = await catalogue.active(session)

    if draft is not None:
        order = draft
        order.customer_name = name
        order.phone = phone
        order.phone_key = key
        order.address = address
        order.quantity = payload.quantity
        # Re-priced against the product selling now, not whatever it cost when
        # the form was abandoned.
        order.product_name = product.title
        order.unit_price = product.unit_price
        order.total_amount = product.unit_price * payload.quantity
        order.items = [_active_line(product, payload.quantity)]
        order.status = OrderStatus.processing.value
        # The row was created when the form was abandoned, maybe hours ago.
        # The order is placed now — that is what "Created At", the cooldown
        # window and the Purchase event should all use. The draft's own
        # timestamp survives in its draft_captured event.
        order.created_at = func.now()
        event_type = "draft_submitted"
    else:
        order = Order(
            customer_name=name,
            phone=phone,
            phone_key=key,
            address=address,
            product_name=product.title,
            quantity=payload.quantity,
            unit_price=product.unit_price,
            total_amount=product.unit_price * payload.quantity,
            items=[_active_line(product, payload.quantity)],
        )
        session.add(order)
        await session.flush()
        event_type = "created"

    session.add(
        OrderEvent(
            order_id=order.id,
            event_type=event_type,
            old_status=OrderStatus.incomplete.value if draft else None,
            new_status=OrderStatus.processing.value,
        )
    )

    # Any other draft still open for this phone is the same person; drop it so
    # they cannot linger in Incomplete after ordering.
    await session.execute(
        delete(Order).where(
            Order.phone_key == key,
            Order.status == OrderStatus.incomplete.value,
            Order.draft_key.is_not(None),
            Order.id != order.id,
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
            # The same catalogue id the browser's Pixel event used, so the two
            # sides of the Purchase deduplicate against one product.
            sku=product.sku,
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


@router.get("/counts", response_model=OrderCountsOut)
async def order_counts(
    session: AsyncSession = Depends(get_session),
    _user: User = Depends(get_current_user),
) -> OrderCountsOut:
    """How many rows sit under each status, for the sidebar counters."""
    counts = {status.value: 0 for status in OrderStatus}
    rows = await session.execute(
        select(Order.status, func.count()).group_by(Order.status)
    )
    for status, count in rows:
        # A status retired from the vocabulary but still in old rows is ignored
        # rather than shown under a menu entry that no longer exists.
        if status in counts:
            counts[status] = count
    return OrderCountsOut(counts=counts)


@router.get("/claims", response_model=ClaimsOut)
async def list_claims(
    session: AsyncSession = Depends(get_session),
    _user: User = Depends(get_current_user),
) -> ClaimsOut:
    """
    Who has which order open, right now. Tiny and indexed, so the order
    tables can poll it every couple of seconds and show a lock almost as
    soon as a colleague opens something — without refetching whole pages.
    """
    rows = await session.scalars(
        select(Order).where(
            Order.assigned_to.is_not(None),
            Order.assigned_at >= _claim_stale_before(),
        )
    )
    return ClaimsOut(
        ttl_seconds=settings.claim_ttl_minutes * 60,
        claims=[
            ClaimOut(
                id=order.id,
                assigned_to=order.assigned_to,
                assigned_to_name=order.assigned_to_name,
                assigned_to_nickname=order.assigned_to_nickname,
                assigned_at=order.assigned_at,
            )
            for order in rows
        ],
    )


@router.get("/stats", response_model=OrderStatsOut)
async def order_stats(
    session: AsyncSession = Depends(get_session),
    _user: User = Depends(get_current_user),
) -> OrderStatsOut:
    incomplete = OrderStatus.incomplete.value
    # Incomplete rows are mostly abandoned forms — nobody ordered them, so they
    # count on their own rather than inflating order totals and revenue.
    done = (
        OrderStatus.confirmed.value,
        OrderStatus.shipped.value,
        OrderStatus.cancelled.value,
        # Archived: finished and off the Shipping list, so it is not work in
        # progress either.
        OrderStatus.history.value,
        incomplete,
    )
    row = (
        await session.execute(
            select(
                func.count().filter(Order.status != incomplete),
                func.count().filter(Order.status.not_in(done)),
                func.count().filter(Order.status == OrderStatus.confirmed.value),
                func.count().filter(Order.status == OrderStatus.cancelled.value),
                func.coalesce(
                    func.sum(Order.total_amount).filter(
                        Order.status.not_in(
                            (OrderStatus.cancelled.value, incomplete)
                        )
                    ),
                    0,
                ),
                func.count().filter(Order.status == incomplete),
            )
        )
    ).one()
    total, in_progress, confirmed, cancelled, revenue, incomplete_count = row
    return OrderStatsOut(
        total=total,
        in_progress=in_progress,
        confirmed=confirmed,
        cancelled=cancelled,
        revenue=revenue,
        incomplete=incomplete_count,
    )


# Which lists count as "this customer already has an order with us". Incomplete
# is an abandoned form nobody placed, and a cancelled order is not in progress —
# neither is worth reading out on a call.
LOOKUP_STATUSES = (
    OrderStatus.processing.value,
    OrderStatus.advance_payment.value,
    OrderStatus.good_but_no_response.value,
    OrderStatus.no_response.value,
    OrderStatus.on_hold.value,
    OrderStatus.confirmed.value,
    OrderStatus.shipped.value,
    OrderStatus.history.value,
)


@router.get("/lookup", response_model=PhoneLookupOut)
async def lookup_by_phone(
    phone: str = Query(min_length=6, max_length=32),
    session: AsyncSession = Depends(get_session),
    _user: User = Depends(get_current_user),
) -> PhoneLookupOut:
    """
    What this number has ordered before, for the staff taking a new order.

    Purely informational: it never blocks anything. The point is that someone
    on the phone can say "you ordered on the 6th and it is already shipping"
    instead of taking a duplicate.

    Matched on phone_key, the same normalised form the storefront dedupes on,
    so 8801711…, 01711… and +8801711… all find the same customer.
    """
    key = phone_key(phone)
    if not key:
        return PhoneLookupOut(phone="")
    rows = await session.execute(
        select(Order)
        .where(
            Order.phone_key == key,
            Order.status.in_((*LOOKUP_STATUSES, OrderStatus.incomplete.value)),
        )
        .order_by(Order.created_at.desc())
        .limit(30)
    )
    placed: list[OrderOut] = []
    abandoned: list[OrderOut] = []
    for order in rows.scalars():
        # One query, split here: an abandoned form is not an order, and telling
        # a customer "you already ordered this" when they never did would be
        # wrong.
        target = (
            abandoned if order.status == OrderStatus.incomplete.value else placed
        )
        target.append(OrderOut.model_validate(order))
    return PhoneLookupOut(phone=key, orders=placed, incomplete=abandoned)


@router.post("/manual", response_model=OrderOut, status_code=201)
async def create_manual_order(
    payload: ManualOrderCreate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> Order:
    """
    An order typed in by staff rather than placed on the site.

    Two things differ from the storefront's create. There is no per-number
    cooldown — staff are on the phone with the customer, so a second order is a
    decision someone has just made, not a double submit. And the batch lands
    either in Confirmed (approved) or on the Web Order List (manual), which is
    what the toggle at the top of the page picks.

    Prices come from the catalogue, never from the request: the browser sends
    product ids and quantities only.
    """
    rows = await session.execute(
        select(Product).where(Product.id.in_([i.product_id for i in payload.items]))
    )
    catalogue_rows = {product.id: product for product in rows.scalars()}
    missing = [i.product_id for i in payload.items if i.product_id not in catalogue_rows]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown product id(s): {', '.join(str(m) for m in missing)}",
        )

    items = [
        OrderItem(
            product_id=line.product_id,
            product_name=catalogue_rows[line.product_id].title,
            unit_price=catalogue_rows[line.product_id].unit_price,
            quantity=line.quantity,
        )
        for line in payload.items
    ]
    total = sum(item.unit_price * item.quantity for item in items)
    units = sum(item.quantity for item in items)

    status = (
        OrderStatus.confirmed.value if payload.approved else OrderStatus.processing.value
    )
    order = Order(
        customer_name=payload.customer_name.strip(),
        phone=payload.phone,
        phone_key=phone_key(payload.phone),
        address=payload.address.strip(),
        comment=payload.comment.strip(),
        status=status,
        source=OrderSource.website.value,
        # The summary columns every existing screen reads. total_amount is
        # authoritative — it is what the customer pays, what Pathao collects
        # and what revenue sums. quantity is the unit count, which is what
        # Pathao prices weight by.
        #
        # unit_price is exact for a single line. Across several it is only an
        # average and integer division loses the remainder, so
        # unit_price * quantity may come out a taka or two under total_amount:
        # read total_amount, or the order's items, never the product of these.
        product_name=_summarise(items),
        quantity=units,
        unit_price=total // units if units else total,
        total_amount=total,
        items=items,
        handled_by=user.id,
    )
    session.add(order)
    await session.flush()
    session.add(
        OrderEvent(
            order_id=order.id,
            actor_id=user.id,
            event_type="manual_created",
            new_status=status,
        )
    )
    await session.commit()
    return await _get_fresh_order(session, order.id)


def _summarise(items: list[OrderItem]) -> str:
    """The order's product_name column: one line reads as itself, several read
    as a comma-separated list with quantities."""
    if len(items) == 1:
        return items[0].product_name[:255]
    return ", ".join(f"{i.product_name} x{i.quantity}" for i in items)[:255]


@router.post("/{order_id}/claim", response_model=OrderOut)
async def claim_order(
    order_id: int,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> Order:
    """
    Take the order: opening the modal calls this, and while it succeeds nobody
    else — super admins included — can open the same order. Re-claiming your
    own order refreshes the timestamp; the modal does this as a heartbeat. A
    claim older than CLAIM_TTL_MINUTES belongs to a tab that died and can be
    taken by anyone.
    """
    # Atomic compare-and-set: only one concurrent claimer can win this UPDATE.
    won = await session.scalar(
        update(Order)
        .where(
            Order.id == order_id,
            or_(
                Order.assigned_to.is_(None),
                Order.assigned_to == user.id,
                Order.assigned_at < _claim_stale_before(),
            ),
        )
        .values(assigned_to=user.id, assigned_at=func.now())
        .returning(Order.id)
    )
    if won is None:
        holder = await session.scalar(
            select(func.coalesce(User.nickname, User.name))
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


@router.post("/bulk", response_model=BulkOrderResult)
async def bulk_update(
    payload: BulkOrderUpdate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> BulkOrderResult:
    """
    Apply one change to many orders — the "Send to Shipping" button on the
    Confirm list, or marking a batch printed. Orders someone else is working
    on are skipped and reported, never silently moved out from under them.
    """
    if payload.status is None and payload.printed is None and payload.courier is None:
        raise HTTPException(status_code=400, detail="Nothing to update")

    updated_ids: list[int] = []
    skipped: list[BulkSkipped] = []
    for order_id in dict.fromkeys(payload.order_ids):
        order = await session.get(Order, order_id, with_for_update={"of": Order})
        if order is None:
            skipped.append(
                BulkSkipped(order_id=order_id, order_no=f"NB-{order_id}", reason="Not found")
            )
            continue
        if _held_by_someone_else(order, user):
            skipped.append(
                BulkSkipped(
                    order_id=order.id,
                    order_no=f"NB-{order.id}",
                    reason=f"{order.assigned_to_display or 'Another worker'} is handling it",
                )
            )
            continue
        changed = False
        if payload.status is not None:
            changed |= _move_status(session, order, user, payload.status)
        for flag in ("printed", "courier"):
            value = getattr(payload, flag)
            if value is not None:
                changed |= _set_flag(session, order, user, flag, value)
        if changed:
            updated_ids.append(order.id)
        else:
            skipped.append(
                BulkSkipped(
                    order_id=order.id, order_no=f"NB-{order.id}", reason="Already there"
                )
            )
    await session.commit()
    return BulkOrderResult(
        updated=await _load_orders(session, updated_ids), skipped=skipped
    )


# Only orders that have been confirmed by phone, or already handed to
# shipping, may be booked with the courier.
PATHAO_SENDABLE = {OrderStatus.confirmed.value, OrderStatus.shipped.value}


@router.post("/pathao/send", response_model=PathaoSendOut)
async def send_to_pathao(
    payload: PathaoSendIn,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> PathaoSendOut:
    """
    Book each order with Pathao and store the consignment id. Each success is
    committed on its own, so a failure half-way never loses a booking Pathao
    has already made. Failures come back per order with Pathao's reason.
    """
    if not pathao.enabled():
        raise HTTPException(status_code=503, detail="Pathao is not configured on the server")
    try:
        await pathao.get_access_token()
    except pathao.PathaoError as exc:
        raise HTTPException(status_code=502, detail=pathao.error_text(exc)) from exc

    sent_ids: list[int] = []
    failed: list[PathaoFailure] = []

    def fail(order_id: int, reason: str) -> None:
        failed.append(
            PathaoFailure(order_id=order_id, order_no=f"NB-{order_id}", error=reason)
        )

    for order_id in dict.fromkeys(payload.order_ids):
        order = await session.get(Order, order_id, with_for_update={"of": Order})
        if order is None:
            fail(order_id, "Not found")
            continue
        if order.pathao_consignment_id:
            fail(order_id, f"Already sent to Pathao ({order.pathao_consignment_id})")
            await session.rollback()
            continue
        if order.status not in PATHAO_SENDABLE:
            fail(order_id, "Only confirmed or shipping orders can be sent")
            await session.rollback()
            continue
        if _held_by_someone_else(order, user):
            fail(order_id, f"{order.assigned_to_display or 'Another worker'} is handling it")
            await session.rollback()
            continue
        try:
            consignment = await pathao.create_order(order)
        except pathao.PathaoError as exc:
            fail(order_id, pathao.error_text(exc))
            await session.rollback()
            continue
        order.pathao_consignment_id = consignment.consignment_id
        order.pathao_status = consignment.order_status or None
        order.pathao_delivery_fee = consignment.delivery_fee
        order.pathao_sent_at = datetime.now(timezone.utc)
        _set_flag(session, order, user, "courier", True)
        session.add(
            OrderEvent(
                order_id=order.id,
                actor_id=user.id,
                event_type="pathao_sent",
                note=consignment.consignment_id,
            )
        )
        await session.commit()
        sent_ids.append(order.id)

    return PathaoSendOut(orders=await _load_orders(session, sent_ids), failed=failed)


@router.post("/pathao/refresh", response_model=PathaoSendOut)
async def refresh_pathao(
    payload: PathaoSendIn,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> PathaoSendOut:
    """Pull the current delivery status from Pathao for each booked order."""
    if not pathao.enabled():
        raise HTTPException(status_code=503, detail="Pathao is not configured on the server")

    refreshed_ids: list[int] = []
    failed: list[PathaoFailure] = []
    for order_id in dict.fromkeys(payload.order_ids):
        order = await session.get(Order, order_id)
        if order is None or not order.pathao_consignment_id:
            failed.append(
                PathaoFailure(
                    order_id=order_id,
                    order_no=f"NB-{order_id}",
                    error="Not sent to Pathao yet",
                )
            )
            continue
        try:
            info = await pathao.order_info(order.pathao_consignment_id)
        except pathao.PathaoError as exc:
            failed.append(
                PathaoFailure(
                    order_id=order.id,
                    order_no=f"NB-{order.id}",
                    error=pathao.error_text(exc),
                )
            )
            continue
        status = info.raw.get("order_status_slug") or info.order_status or None
        if status != order.pathao_status:
            order.pathao_status = status
            session.add(
                OrderEvent(
                    order_id=order.id,
                    actor_id=user.id,
                    event_type="pathao_status",
                    note=status,
                )
            )
        refreshed_ids.append(order.id)
    await session.commit()
    return PathaoSendOut(orders=await _load_orders(session, refreshed_ids), failed=failed)


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
            payload.printed,
            payload.courier,
        )
    ):
        raise HTTPException(status_code=400, detail="Nothing to update")

    # Lock only the orders row — FOR UPDATE can't cover the outer-joined
    # assignee relationship.
    order = await session.get(Order, order_id, with_for_update={"of": Order})
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    if _held_by_someone_else(order, user):
        raise HTTPException(
            status_code=409,
            detail=f"{order.assigned_to_display or 'Another worker'} is handling this order",
        )

    if payload.status is not None:
        _move_status(session, order, user, payload.status)

    for flag in ("printed", "courier"):
        value = getattr(payload, flag)
        if value is not None:
            _set_flag(session, order, user, flag, value)

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
            order.phone_key = phone_key(value)
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
