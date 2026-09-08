"""worker nicknames

Revision ID: 0008
Revises: 0007
Create Date: 2026-09-06

"""
from alembic import op
import sqlalchemy as sa

revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("nickname", sa.String(40), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "nickname")
