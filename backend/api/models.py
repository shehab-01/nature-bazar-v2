import enum
from datetime import datetime

from sqlalchemy import (
    BigInteger,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy import inspect as sa_inspect
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class OrderStatus(str, enum.Enum):
    processing = "processing"
    incomplete = "incomplete"
    good_but_no_response = "good_but_no_response"
    no_response = "no_response"
    advance_payment = "advance_payment"
    on_hold = "on_hold"
    confirmed = "confirmed"
    shipped = "shipped"
    cancelled = "cancelled"


class UserRole(str, enum.Enum):
    super_admin = "super_admin"
    staff = "staff"


class UserStatus(str, enum.Enum):
    pending = "pending"
    active = "active"
    suspended = "suspended"


def _enum(enum_cls: type[enum.Enum], name: str) -> Enum:
    return Enum(
        enum_cls,
        name=name,
        values_callable=lambda e: [member.value for member in e],
    )


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    customer_name: Mapped[str] = mapped_column(String(120))
    phone: Mapped[str] = mapped_column(String(32))
    address: Mapped[str] = mapped_column(Text)
    product_name: Mapped[str] = mapped_column(String(255))
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    unit_price: Mapped[int] = mapped_column(Integer)
    total_amount: Mapped[int] = mapped_column(Integer)
    # Plain string in the DB (validated by the API layer) so the status
    # vocabulary can evolve without enum migrations.
    status: Mapped[str] = mapped_column(
        String(30), default=OrderStatus.processing.value, index=True
    )
    comment: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    # Which worker has claimed this order (is calling the customer).
    assigned_to: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), index=True
    )
    assigned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    assignee: Mapped["User | None"] = relationship(lazy="joined")
    tags: Mapped[list["OrderTag"]] = relationship(
        lazy="selectin", order_by="OrderTag.id", cascade="all, delete-orphan"
    )

    @property
    def assigned_to_name(self) -> str | None:
        # Guard: a freshly-inserted instance hasn't loaded the relationship,
        # and touching it lazily outside the async context would blow up.
        if "assignee" in sa_inspect(self).unloaded:
            return None
        return self.assignee.name if self.assignee else None

    __table_args__ = (
        # The admin list query: WHERE status IN (...) ORDER BY created_at DESC
        Index("ix_orders_status_created_at", "status", "created_at"),
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    picture_url: Mapped[str | None] = mapped_column(String(500))
    role: Mapped[UserRole] = mapped_column(
        _enum(UserRole, "user_role"), default=UserRole.staff
    )
    status: Mapped[UserStatus] = mapped_column(
        _enum(UserStatus, "user_status"), default=UserStatus.pending, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    last_active_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class OrderTag(Base):
    __tablename__ = "order_tags"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"), index=True
    )
    created_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL")
    )
    label: Mapped[str] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    creator: Mapped["User | None"] = relationship(lazy="joined")

    @property
    def created_by_name(self) -> str | None:
        if "creator" in sa_inspect(self).unloaded:
            return None
        return self.creator.name if self.creator else None


class OrderEvent(Base):
    """Append-only audit trail; per-worker activity counts aggregate from here."""

    __tablename__ = "order_events"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"), index=True
    )
    actor_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL")
    )
    event_type: Mapped[str] = mapped_column(String(40))
    old_status: Mapped[str | None] = mapped_column(String(30))
    new_status: Mapped[str | None] = mapped_column(String(30))
    note: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )

    __table_args__ = (
        Index("ix_order_events_actor_type", "actor_id", "event_type"),
    )
