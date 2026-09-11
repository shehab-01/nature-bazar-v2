"""fraud_checks: BDCourier courier-history lookups, cached per phone number

Revision ID: 0018
Revises: 0017
Create Date: 2026-09-11

One row per lookup against BDCourier's courier-check API, keyed by the
normalised phone number (phone_key) so a check can be reused for
bdcourier.REUSE_FOR instead of re-spending the API's rate limit. orders gets
fraud_check_id pointing at the most recent lookup pinned to that order.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0018"
down_revision = "0017"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "fraud_checks",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("phone_key", sa.String(20), nullable=False),
        sa.Column("phone", sa.String(32), nullable=False),
        sa.Column(
            "checked_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("total", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("success", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("cancel", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("success_rate", sa.Numeric(5, 2), nullable=True),
        sa.Column("rating", sa.Integer(), nullable=True),
        sa.Column(
            "couriers", postgresql.JSONB(), nullable=False, server_default="[]"
        ),
        sa.Column(
            "reports", postgresql.JSONB(), nullable=False, server_default="[]"
        ),
        sa.Column("error", sa.Text(), nullable=True),
    )
    op.create_index(
        "ix_fraud_checks_phone_checked", "fraud_checks", ["phone_key", "checked_at"]
    )
    op.add_column("orders", sa.Column("fraud_check_id", sa.BigInteger(), nullable=True))
    op.create_foreign_key(
        "fk_orders_fraud_check_id",
        "orders",
        "fraud_checks",
        ["fraud_check_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index("ix_orders_fraud_check_id", "orders", ["fraud_check_id"])


def downgrade() -> None:
    op.drop_index("ix_orders_fraud_check_id", table_name="orders")
    op.drop_constraint("fk_orders_fraud_check_id", "orders", type_="foreignkey")
    op.drop_column("orders", "fraud_check_id")
    op.drop_index("ix_fraud_checks_phone_checked", table_name="fraud_checks")
    op.drop_table("fraud_checks")
