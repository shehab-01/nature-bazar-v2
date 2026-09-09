"""visits: one row per storefront page view, for the System page's visitor
and conversion figures

Revision ID: 0017
Revises: 0016
Create Date: 2026-09-09

Fed by the PageView report every storefront page load already posts to
/api/track. Stores a hashed visitor key (the browser's _fbp cookie, or the
address and user agent when there is none) and the path — no PII.
"""
from alembic import op
import sqlalchemy as sa

revision = "0017"
down_revision = "0016"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "visits",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column(
            "at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("visitor", sa.String(32), nullable=False),
        sa.Column("path", sa.String(255), nullable=True),
    )
    op.create_index("ix_visits_at", "visits", ["at"])


def downgrade() -> None:
    op.drop_index("ix_visits_at", table_name="visits")
    op.drop_table("visits")
