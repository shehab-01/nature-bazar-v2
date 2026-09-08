"""traffic counters for the monitoring page

Revision ID: 0009
Revises: 0008
Create Date: 2026-09-06

"""
from alembic import op
import sqlalchemy as sa

revision = "0009"
down_revision = "0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "traffic_minutes",
        sa.Column("minute", sa.DateTime(timezone=True), primary_key=True),
        sa.Column("worker", sa.String(64), primary_key=True),
        sa.Column("requests", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("throttled", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("cooldown", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("client_errors", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("server_errors", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("latency_ms", sa.BigInteger(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_table("traffic_minutes")
