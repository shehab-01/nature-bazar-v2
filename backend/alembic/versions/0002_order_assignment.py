"""order claiming: assigned_to / assigned_at

Revision ID: 0002
Revises: 0001
Create Date: 2026-09-05

"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "orders",
        sa.Column(
            "assigned_to",
            sa.BigInteger(),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )
    op.add_column(
        "orders",
        sa.Column("assigned_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_orders_assigned_to", "orders", ["assigned_to"])


def downgrade() -> None:
    op.drop_index("ix_orders_assigned_to", table_name="orders")
    op.drop_column("orders", "assigned_at")
    op.drop_column("orders", "assigned_to")
