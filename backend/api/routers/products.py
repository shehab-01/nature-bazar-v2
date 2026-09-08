"""Product catalogue: super-admin CRUD, plus the one public read the
storefront needs.

Two routers live here on purpose. Everything on `router` is gated on
require_super_admin; `public_router` carries the single unauthenticated
endpoint the landing page calls, so the gate is never accidentally widened by
adding a route to the wrong prefix.
"""

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api import catalogue, media
from api.auth import require_super_admin
from api.db import get_session
from api.models import Product
from api.schemas import (
    ProductCreate,
    ProductOut,
    ProductUpdate,
    StorefrontProductOut,
)

router = APIRouter(
    prefix="/products",
    tags=["Products"],
    dependencies=[Depends(require_super_admin)],
)

public_router = APIRouter(prefix="/storefront", tags=["Storefront"])


async def _get_or_404(session: AsyncSession, product_id: int) -> Product:
    product = await session.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("", response_model=list[ProductOut])
async def list_products(
    session: AsyncSession = Depends(get_session),
) -> list[Product]:
    rows = await session.execute(
        # Active first, then newest, so the row that is actually selling is
        # always the one at the top of the table.
        select(Product).order_by(Product.is_active.desc(), Product.created_at.desc())
    )
    return list(rows.scalars())


@router.post("", response_model=ProductOut, status_code=201)
async def create_product(
    payload: ProductCreate,
    session: AsyncSession = Depends(get_session),
) -> Product:
    product = Product(**payload.model_dump(), is_active=False)
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return product


@router.patch("/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: int,
    payload: ProductUpdate,
    session: AsyncSession = Depends(get_session),
) -> Product:
    product = await _get_or_404(session, product_id)
    for name, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, name, value)
    await session.commit()
    await session.refresh(product)
    return product


@router.post("/{product_id}/activate", response_model=list[ProductOut])
async def activate_product(
    product_id: int,
    session: AsyncSession = Depends(get_session),
) -> list[Product]:
    """Make this the product the storefront sells.

    The previous active row is cleared in the same transaction, and flushed
    before the new one is set: the partial unique index means two active rows
    can never both commit, so doing it in one order avoids tripping it.
    """
    product = await _get_or_404(session, product_id)
    if not product.is_active:
        current = await catalogue.active_row(session)
        if current is not None:
            current.is_active = False
            await session.flush()
        product.is_active = True
        await session.commit()
    rows = await session.execute(
        select(Product).order_by(Product.is_active.desc(), Product.created_at.desc())
    )
    return list(rows.scalars())


@router.post("/{product_id}/image", response_model=ProductOut)
async def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
) -> Product:
    product = await _get_or_404(session, product_id)
    data = await file.read()
    try:
        path = media.save_product_image(data)
    except media.UploadError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    previous = product.image_path
    product.image_path = path
    await session.commit()
    await session.refresh(product)
    # Only after the new path is safely committed, so a failed commit never
    # leaves the row pointing at a file that is already gone.
    media.delete_media(previous)
    return product


@router.delete("/{product_id}", status_code=204)
async def delete_product(
    product_id: int,
    session: AsyncSession = Depends(get_session),
) -> None:
    product = await _get_or_404(session, product_id)
    if product.is_active:
        raise HTTPException(
            status_code=400,
            detail="Activate another product before deleting this one",
        )
    image_path = product.image_path
    await session.delete(product)
    await session.commit()
    media.delete_media(image_path)


@public_router.get("/product", response_model=StorefrontProductOut)
async def storefront_product(
    session: AsyncSession = Depends(get_session),
) -> StorefrontProductOut:
    """The product the landing page should show. Never 404s: with no active
    row it falls back to the configured one, so the storefront always has
    something to sell."""
    row = await catalogue.active_row(session)
    if row is not None:
        return StorefrontProductOut.model_validate(row)
    fallback = await catalogue.active(session)
    return StorefrontProductOut(
        title=fallback.title,
        subtitle="",
        default_quantity=1,
        unit_price=fallback.unit_price,
        sku=fallback.sku,
        image_path=None,
    )
