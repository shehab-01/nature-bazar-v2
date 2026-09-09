"""orders taken by staff get their own source

Revision ID: 0014
Revises: 0013
Create Date: 2026-09-08

Manual orders were written with source "website" and could only be told apart
by their manual_created audit event. The dashboard counts them on their own
(they are the calls, WhatsApp and Messenger sales), so they get a source of
their own, and the existing ones are found through that event.
"""
from alembic import op

revision = "0014"
down_revision = "0013"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        UPDATE orders SET source = 'manual'
        WHERE id IN (
            SELECT order_id FROM order_events WHERE event_type = 'manual_created'
        )
        """
    )


def downgrade() -> None:
    op.execute("UPDATE orders SET source = 'website' WHERE source = 'manual'")
