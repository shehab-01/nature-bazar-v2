"""abandoned form capture

Revision ID: 0006
Revises: 0005
Create Date: 2026-09-06

"""
from alembic import op
import sqlalchemy as sa

revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("draft_key", sa.String(64), nullable=True))
    op.add_column("orders", sa.Column("phone_key", sa.String(20), nullable=True))
    op.create_index(
        "ix_orders_draft_key", "orders", ["draft_key"], unique=True
    )
    op.create_index("ix_orders_phone_key", "orders", ["phone_key"])
    # Backfill: last 10 digits of the stored phone, matching api.phone.phone_key.
    op.execute(
        "UPDATE orders SET phone_key = right(regexp_replace(phone, '\\D', '', 'g'), 10)"
    )


def downgrade() -> None:
    op.drop_index("ix_orders_phone_key", table_name="orders")
    op.drop_index("ix_orders_draft_key", table_name="orders")
    op.drop_column("orders", "phone_key")
    op.drop_column("orders", "draft_key")
