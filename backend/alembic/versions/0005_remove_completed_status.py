"""fold completed into confirmed

Revision ID: 0005
Revises: 0004
Create Date: 2026-09-06

"""
from alembic import op

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("UPDATE orders SET status='confirmed' WHERE status='completed'")
    op.execute(
        "UPDATE order_events SET old_status='confirmed' WHERE old_status='completed'"
    )
    op.execute(
        "UPDATE order_events SET new_status='confirmed' WHERE new_status='completed'"
    )


def downgrade() -> None:
    pass
