"""product variants: a product is a group, its versions are what sell

Revision ID: 0013
Revises: 0012
Create Date: 2026-09-08

The price, sku, image and quantity move off products and onto a new
product_variants table, so one product can be sold in several sizes. Every
existing product becomes a product with exactly one variant, carrying the
columns it had, so the storefront sells the same thing at the same price the
moment this lands. Each order line is pointed at the variant its product
became. The products.subtitle column, never shown anywhere, becomes the
description that the landing page renders under the fold.
"""
from alembic import op
import sqlalchemy as sa

revision = "0013"
down_revision = "0012"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "product_variants",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column(
            "product_id",
            sa.BigInteger(),
            sa.ForeignKey("products.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("label", sa.String(120), nullable=False, server_default=""),
        sa.Column("image_path", sa.String(255), nullable=True),
        sa.Column("unit_price", sa.Integer(), nullable=False),
        sa.Column("sku", sa.String(64), nullable=False),
        sa.Column(
            "default_quantity", sa.Integer(), nullable=False, server_default="1"
        ),
        sa.Column(
            "is_default", sa.Boolean(), nullable=False, server_default=sa.false()
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index(
        "ix_product_variants_product_id", "product_variants", ["product_id"]
    )
    # One default per product: a partial unique index over the true rows.
    op.create_index(
        "uq_product_variants_single_default",
        "product_variants",
        ["product_id"],
        unique=True,
        postgresql_where=sa.text("is_default"),
    )

    # Every product becomes itself plus one variant holding the columns that
    # are moving. The label stays empty: the product title already says
    # everything, and an empty label renders as just that title.
    op.execute(
        """
        INSERT INTO product_variants
            (product_id, label, image_path, unit_price, sku, default_quantity, is_default)
        SELECT id, '', image_path, unit_price, sku, default_quantity, true
        FROM products
        """
    )

    op.add_column(
        "order_items",
        sa.Column(
            "variant_id",
            sa.BigInteger(),
            sa.ForeignKey("product_variants.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )
    op.execute(
        """
        UPDATE order_items AS oi
        SET variant_id = pv.id
        FROM product_variants AS pv
        WHERE pv.product_id = oi.product_id
        """
    )

    op.alter_column("products", "subtitle", new_column_name="description")
    op.drop_column("products", "image_path")
    op.drop_column("products", "unit_price")
    op.drop_column("products", "sku")
    op.drop_column("products", "default_quantity")


def downgrade() -> None:
    # The columns come back filled from each product's default variant; the
    # server defaults only exist so NOT NULL can be added before the copy.
    op.add_column(
        "products", sa.Column("image_path", sa.String(255), nullable=True)
    )
    op.add_column(
        "products",
        sa.Column("unit_price", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column(
        "products", sa.Column("sku", sa.String(64), nullable=False, server_default="")
    )
    op.add_column(
        "products",
        sa.Column(
            "default_quantity", sa.Integer(), nullable=False, server_default="1"
        ),
    )
    op.execute(
        """
        UPDATE products AS p
        SET image_path = pv.image_path,
            unit_price = pv.unit_price,
            sku = pv.sku,
            default_quantity = pv.default_quantity
        FROM product_variants AS pv
        WHERE pv.product_id = p.id AND pv.is_default
        """
    )
    op.alter_column("products", "description", new_column_name="subtitle")
    op.drop_column("order_items", "variant_id")
    op.drop_index(
        "uq_product_variants_single_default", table_name="product_variants"
    )
    op.drop_index("ix_product_variants_product_id", table_name="product_variants")
    op.drop_table("product_variants")
