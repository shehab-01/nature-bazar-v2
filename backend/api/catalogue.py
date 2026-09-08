"""What the shop is currently selling.

One place decides which product an order is priced against, so the storefront,
the order endpoints and the Meta CAPI events can never disagree about the name,
the price or the catalogue id.

The settings fallback matters on a database that predates the products table,
or one where every product has been deactivated: an order still gets a sane
name and price rather than failing, and the storefront keeps working.
"""

from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.config import settings
from api.models import Product


@dataclass(frozen=True)
class ActiveProduct:
    """The fields order creation needs, whatever the source."""

    title: str
    unit_price: int
    sku: str
    # None when this came from the settings fallback rather than a real row,
    # so an order line simply records no catalogue link.
    id: int | None = None


async def active_row(session: AsyncSession) -> Product | None:
    """The active product row, or None when nothing is active."""
    result = await session.execute(
        select(Product).where(Product.is_active.is_(True)).limit(1)
    )
    return result.scalar_one_or_none()


async def active(session: AsyncSession) -> ActiveProduct:
    """What to sell right now, falling back to the configured product."""
    row = await active_row(session)
    if row is not None:
        return ActiveProduct(
            title=row.title, unit_price=row.unit_price, sku=row.sku, id=row.id
        )
    return ActiveProduct(
        title=settings.product_name,
        unit_price=settings.unit_price,
        sku=settings.product_sku,
    )
