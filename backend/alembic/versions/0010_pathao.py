"""pathao consignments and shared integration tokens

Revision ID: 0010
Revises: 0009
Create Date: 2026-09-06

"""
from alembic import op
import sqlalchemy as sa

revision = "0010"
down_revision = "0009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "orders", sa.Column("pathao_consignment_id", sa.String(40), nullable=True)
    )
    op.add_column("orders", sa.Column("pathao_status", sa.String(60), nullable=True))
    op.add_column(
        "orders", sa.Column("pathao_delivery_fee", sa.Integer(), nullable=True)
    )
    op.add_column(
        "orders",
        sa.Column("pathao_sent_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(
        "ix_orders_pathao_consignment_id", "orders", ["pathao_consignment_id"]
    )
    op.create_table(
        "integration_tokens",
        sa.Column("provider", sa.String(40), primary_key=True),
        sa.Column("access_token", sa.Text(), nullable=False),
        sa.Column("refresh_token", sa.Text(), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_table("integration_tokens")
    op.drop_index("ix_orders_pathao_consignment_id", table_name="orders")
    op.drop_column("orders", "pathao_sent_at")
    op.drop_column("orders", "pathao_delivery_fee")
    op.drop_column("orders", "pathao_status")
    op.drop_column("orders", "pathao_consignment_id")
