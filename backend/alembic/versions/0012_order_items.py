"""order line items, so one order can hold several products

Revision ID: 0012
Revises: 0011
Create Date: 2026-09-07

Every existing order is backfilled with a single line from its own summary
columns, so the admin never has to render two shapes of order: one that has
items and one that does not.
"""
from alembic import op
import sqlalchemy as sa

revision = "0012"
down_revision = "0011"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "order_items",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column(
            "order_id",
            sa.BigInteger(),
            sa.ForeignKey("orders.id", ondelete="CASCADE"),
            nullable=False,
        ),
        # Nullable, and SET NULL rather than CASCADE: deleting a product must
        # never delete the history of what was sold.
        sa.Column(
            "product_id",
            sa.BigInteger(),
            sa.ForeignKey("products.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("product_name", sa.String(255), nullable=False),
        sa.Column("unit_price", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"),
    )
    op.create_index("ix_order_items_order_id", "order_items", ["order_id"])

    # One line per existing order, taken from the summary it already carries.
    op.execute(
        """
        INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity)
        SELECT id, NULL, product_name, unit_price, quantity FROM orders
        """
    )


def downgrade() -> None:
    op.drop_index("ix_order_items_order_id", table_name="order_items")
    op.drop_table("order_items")
