"""forms the customer finished themselves are website orders

Revision ID: 0015
Revises: 0014
Create Date: 2026-09-09

A storefront form autosaves as an Incomplete lead while it is being typed, and
submitting promotes that same row to an order. The promotion left the source
as "incomplete", so an order the customer placed unaided wore the label meant
for leads that staff recovered from the Incomplete list. The API now resets
the source on promotion; this fixes the rows already promoted, found by the
draft_submitted event the promotion writes.
"""
from alembic import op

revision = "0015"
down_revision = "0014"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        UPDATE orders SET source = 'website'
        WHERE source = 'incomplete'
          AND id IN (
            SELECT order_id FROM order_events WHERE event_type = 'draft_submitted'
          )
        """
    )


def downgrade() -> None:
    # The label was wrong before; there is nothing to put back.
    pass
