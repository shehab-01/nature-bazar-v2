"""status becomes varchar with the call-center vocabulary

Revision ID: 0003
Revises: 0002
Create Date: 2026-09-06

"""
from alembic import op
import sqlalchemy as sa

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Free the column from the enum type so future vocabulary changes are
    # data-only. App-level validation guards the values.
    op.alter_column(
        "orders",
        "status",
        type_=sa.String(30),
        server_default="processing",
        postgresql_using="status::text",
    )
    sa.Enum(name="order_status").drop(op.get_bind(), checkfirst=True)

    op.execute("UPDATE orders SET status='processing' WHERE status IN ('new','pending')")
    op.execute(
        "UPDATE order_events SET old_status='processing' WHERE old_status IN ('new','pending')"
    )
    op.execute(
        "UPDATE order_events SET new_status='processing' WHERE new_status IN ('new','pending')"
    )
    op.alter_column("order_events", "old_status", type_=sa.String(30))
    op.alter_column("order_events", "new_status", type_=sa.String(30))


def downgrade() -> None:
    order_status = sa.Enum(
        "new", "pending", "processing", "completed", "cancelled", name="order_status"
    )
    order_status.create(op.get_bind())
    op.execute(
        "UPDATE orders SET status='processing' WHERE status NOT IN "
        "('new','pending','processing','completed','cancelled')"
    )
    op.alter_column(
        "orders",
        "status",
        type_=order_status,
        server_default="new",
        postgresql_using="status::order_status",
    )
    op.alter_column("order_events", "old_status", type_=sa.String(20))
    op.alter_column("order_events", "new_status", type_=sa.String(20))
