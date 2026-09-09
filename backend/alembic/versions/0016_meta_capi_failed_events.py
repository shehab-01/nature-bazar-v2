"""meta_capi_failed_events: Conversions API events that could not be delivered

Revision ID: 0016
Revises: 0015
Create Date: 2026-09-09

A Purchase (or any other server-side event) that Meta refused or that timed
out through every retry is parked here with the full payload, so it can be
resent from Admin → System once the token, the network or Meta itself is
fixed, instead of silently vanishing from attribution.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0016"
down_revision = "0015"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "meta_capi_failed_events",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("payload", postgresql.JSONB(), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_error", sa.Text(), nullable=False, server_default=""),
    )


def downgrade() -> None:
    op.drop_table("meta_capi_failed_events")
