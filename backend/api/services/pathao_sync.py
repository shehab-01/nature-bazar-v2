"""Keeps Pathao delivery statuses current without anyone pressing Refresh.

Pathao offers no list of a merchant's parcels — only one status read per
consignment — so this polls: every few minutes, each booked parcel that has
not reached a final state is asked about, and the answer goes onto the order
exactly as the manual Refresh button would put it there. Staff move orders to
History before delivery is done, so the poll goes by the parcel's own state,
never by which list the order sits on.

Runs inside the API process, like the traffic-minutes flusher. With several
worker processes only one polls at a time: the batch takes a transaction-level
advisory lock, and a worker that finds it taken simply skips its turn.
"""

from __future__ import annotations

import asyncio
import logging

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from api.db import async_session
from api.models import Order, OrderEvent
from api.services import pathao

log = logging.getLogger("pathao_sync")

POLL_EVERY_SECONDS = 15 * 60
# Let the service settle before the first round of outbound calls.
FIRST_POLL_DELAY_SECONDS = 60
BATCH_LIMIT = 200
# A breath between calls so a big batch never reads as a burst to Pathao.
BETWEEN_CALLS_SECONDS = 0.3
# Any arbitrary constant; it only has to be the same in every worker.
ADVISORY_LOCK_KEY = 7_420_010

# Where a parcel's story ends, as Pathao spells its statuses (compared in
# lower case). Anything else is still in flight and worth asking about.
SETTLED = ("delivered", "partial_delivery", "return", "paid_return", "cancelled")


def is_settled(status: str | None) -> bool:
    return (status or "").lower() in SETTLED


async def refresh_order(
    session: AsyncSession, order: Order, actor_id: int | None = None
) -> str | None:
    """Ask Pathao where this parcel is and record the answer on the order,
    with an audit event when it changed. Returns the status. Raises
    PathaoError when Pathao could not be asked."""
    info = await pathao.order_info(order.pathao_consignment_id)
    status = info.raw.get("order_status_slug") or info.order_status or None
    if status != order.pathao_status:
        order.pathao_status = status
        session.add(
            OrderEvent(
                order_id=order.id,
                actor_id=actor_id,
                event_type="pathao_status",
                note=status,
            )
        )
    return status


async def poll_once() -> int:
    """One round over every unsettled parcel. Returns how many were asked."""
    if not pathao.enabled():
        return 0
    async with async_session() as session, session.begin():
        locked = await session.scalar(
            select(func.pg_try_advisory_xact_lock(ADVISORY_LOCK_KEY))
        )
        if not locked:
            return 0
        rows = (
            await session.scalars(
                select(Order)
                .where(
                    Order.pathao_consignment_id.is_not(None),
                    or_(
                        Order.pathao_status.is_(None),
                        func.lower(Order.pathao_status).not_in(SETTLED),
                    ),
                )
                .order_by(Order.pathao_sent_at.desc().nulls_last())
                .limit(BATCH_LIMIT)
            )
        ).all()
        asked = 0
        for order in rows:
            try:
                await refresh_order(session, order)
                asked += 1
            except pathao.PathaoError as exc:
                # One parcel Pathao will not answer for must not stop the
                # rest; it is asked again next round.
                log.warning(
                    "Pathao sync: %s (NB-%s): %s",
                    order.pathao_consignment_id,
                    order.id,
                    pathao.error_text(exc),
                )
            await asyncio.sleep(BETWEEN_CALLS_SECONDS)
        return asked


async def _loop() -> None:
    await asyncio.sleep(FIRST_POLL_DELAY_SECONDS)
    while True:
        try:
            asked = await poll_once()
            if asked:
                log.info("Pathao sync: refreshed %d parcels", asked)
        except Exception:  # noqa: BLE001 - the loop must survive anything
            log.exception("Pathao sync round failed")
        await asyncio.sleep(POLL_EVERY_SECONDS)


_task: asyncio.Task | None = None


def start() -> None:
    global _task
    _task = asyncio.create_task(_loop())


async def stop() -> None:
    if _task is not None:
        _task.cancel()
