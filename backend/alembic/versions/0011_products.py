"""products, with exactly one active at a time

Revision ID: 0011
Revises: 0010
Create Date: 2026-09-07

Seeds one row from the PRODUCT_NAME / UNIT_PRICE / PRODUCT_SKU environment
variables that priced orders until now, so the storefront keeps selling the
same thing at the same price the moment this lands.
"""
import os

from alembic import op
import sqlalchemy as sa

revision = "0011"
down_revision = "0010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    products = op.create_table(
        "products",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("subtitle", sa.Text(), nullable=False, server_default=""),
        sa.Column("image_path", sa.String(255), nullable=True),
        sa.Column(
            "default_quantity", sa.Integer(), nullable=False, server_default="1"
        ),
        sa.Column("unit_price", sa.Integer(), nullable=False),
        sa.Column("sku", sa.String(64), nullable=False),
        sa.Column(
            "is_active", sa.Boolean(), nullable=False, server_default=sa.false()
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
    op.create_index("ix_products_is_active", "products", ["is_active"])
    # Only one row may be active. A partial unique index constrains just the
    # true rows, so any number may be inactive but a second activate fails at
    # the database rather than racing in application code.
    op.create_index(
        "uq_products_single_active",
        "products",
        ["is_active"],
        unique=True,
        postgresql_where=sa.text("is_active"),
    )

    op.bulk_insert(
        products,
        [
            {
                "title": os.getenv(
                    "PRODUCT_NAME",
                    "ইলিশের আচার ২০০ গ্রাম, গরুর মাংস আচার ২০০ গ্রাম, "
                    "এবং চেপা শুটকির আচার ২০০ গ্রাম, কম্বো",
                ),
                "subtitle": "",
                "image_path": None,
                "default_quantity": 1,
                "unit_price": int(os.getenv("UNIT_PRICE", "1490")),
                "sku": os.getenv("PRODUCT_SKU", "combo-1490"),
                "is_active": True,
            }
        ],
    )


def downgrade() -> None:
    op.drop_index("uq_products_single_active", table_name="products")
    op.drop_index("ix_products_is_active", table_name="products")
    op.drop_table("products")
