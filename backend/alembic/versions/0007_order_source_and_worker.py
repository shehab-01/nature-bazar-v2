"""order source, handling worker, print and courier flags

Revision ID: 0007
Revises: 0006
Create Date: 2026-09-06

"""
from alembic import op
import sqlalchemy as sa

revision = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "orders",
        sa.Column(
            "source",
            sa.String(20),
            nullable=False,
            server_default="website",
        ),
    )
    op.add_column(
        "orders",
        sa.Column(
            "printed", sa.Boolean(), nullable=False, server_default=sa.false()
        ),
    )
    op.add_column(
        "orders",
        sa.Column(
            "courier", sa.Boolean(), nullable=False, server_default=sa.false()
        ),
    )
    op.add_column(
        "orders",
        sa.Column(
            "handled_by",
            sa.BigInteger(),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )
    op.create_index("ix_orders_source", "orders", ["source"])

    # Rows carrying a draft key were captured from an abandoned form, so they
    # entered through the Incomplete list rather than a submitted order.
    op.execute("UPDATE orders SET source = 'incomplete' WHERE draft_key IS NOT NULL")

    # The audit trail already knows who last moved each order's status.
    op.execute(
        """
        UPDATE orders o
        SET handled_by = (
            SELECT e.actor_id
            FROM order_events e
            WHERE e.order_id = o.id
              AND e.event_type = 'status_changed'
              AND e.actor_id IS NOT NULL
            ORDER BY e.id DESC
            LIMIT 1
        )
        """
    )


def downgrade() -> None:
    op.drop_index("ix_orders_source", table_name="orders")
    op.drop_column("orders", "handled_by")
    op.drop_column("orders", "courier")
    op.drop_column("orders", "printed")
    op.drop_column("orders", "source")
