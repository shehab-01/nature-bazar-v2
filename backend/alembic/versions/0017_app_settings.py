"""app_settings: small key/value store for super-admin settings

Revision ID: 0017
Revises: 0016
Create Date: 2026-09-09

The first key is "day_end": the hour the shop's working day ends. Orders
placed after it count towards the next day on the dashboard and in the order
tables' date filters. A table rather than an env var, because the super admin
changes it from the dashboard without a redeploy.
"""
from alembic import op
import sqlalchemy as sa

revision = "0017"
down_revision = "0016"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "app_settings",
        sa.Column("key", sa.String(64), primary_key=True),
        sa.Column("value", sa.Text(), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_by_id",
            sa.BigInteger(),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_table("app_settings")
