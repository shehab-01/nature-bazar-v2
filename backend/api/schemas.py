from datetime import datetime, timedelta, timezone

from pydantic import BaseModel, ConfigDict, Field, computed_field, field_validator

from api.config import settings
from api.models import OrderSource, OrderStatus, UserRole, UserStatus
from api.phone import bd_mobile
from api.services.pathao import tracking_url

PHONE_RULE = "Phone must be an 11-digit Bangladeshi mobile number (01XXXXXXXXX)"


def _valid_bd_mobile(value: str) -> str:
    normalised = bd_mobile(value)
    if normalised is None:
        raise ValueError(PHONE_RULE)
    return normalised


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=1, max_length=120)
    # Stored in the courier's 01XXXXXXXXX form; anything else is a 422.
    phone: str = Field(min_length=6, max_length=32)
    address: str = Field(min_length=4, max_length=1000)
    quantity: int = Field(default=1, ge=1, le=50)
    # The browser's draft key, when this visit had already autosaved a partial
    # form. It promotes that Incomplete row instead of creating a second one.
    draft_key: str | None = Field(default=None, min_length=8, max_length=64)

    @field_validator("phone")
    @classmethod
    def _phone(cls, value: str) -> str:
        return _valid_bd_mobile(value)


class OrderDraft(BaseModel):
    """A partially filled storefront form, autosaved before it was submitted."""

    draft_key: str = Field(min_length=8, max_length=64)
    customer_name: str = Field(default="", max_length=120)
    phone: str = Field(default="", max_length=32)
    address: str = Field(default="", max_length=1000)


class OrderDraftOut(BaseModel):
    # Whether the draft was stored. Not stored when there is no usable phone
    # yet, or when this customer already has a real order.
    saved: bool


class TagCreate(BaseModel):
    label: str = Field(min_length=1, max_length=50)


class OrderUpdate(BaseModel):
    status: OrderStatus | None = None
    printed: bool | None = None
    courier: bool | None = None
    comment: str | None = Field(default=None, max_length=2000)
    customer_name: str | None = Field(default=None, min_length=1, max_length=120)
    phone: str | None = Field(default=None, min_length=6, max_length=32)
    address: str | None = Field(default=None, min_length=4, max_length=1000)

    @field_validator("phone")
    @classmethod
    def _phone(cls, value: str | None) -> str | None:
        return None if value is None else _valid_bd_mobile(value)


class OrderTagOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    label: str
    created_by_name: str | None
    created_by_nickname: str | None = None
    created_at: datetime


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int | None = None
    product_name: str
    unit_price: int
    quantity: int

    @computed_field
    @property
    def line_total(self) -> int:
        return self.unit_price * self.quantity


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_name: str
    phone: str
    address: str
    product_name: str
    quantity: int
    unit_price: int
    total_amount: int
    status: OrderStatus
    comment: str
    created_at: datetime
    updated_at: datetime
    source: OrderSource = OrderSource.website
    printed: bool = False
    courier: bool = False
    assigned_to: int | None = None
    assigned_to_name: str | None = None
    assigned_to_nickname: str | None = None
    assigned_at: datetime | None = None
    # Who last moved the status — the worker credited on each list.
    handled_by_name: str | None = None
    handled_by_nickname: str | None = None
    tags: list[OrderTagOut] = []
    items: list[OrderItemOut] = []
    pathao_consignment_id: str | None = None
    pathao_status: str | None = None
    pathao_delivery_fee: int | None = None
    pathao_sent_at: datetime | None = None
    # Read to derive auto_captured; never serialised — it is the browser's key.
    draft_key: str | None = Field(default=None, exclude=True)

    @computed_field
    @property
    def pathao_tracking_url(self) -> str | None:
        if not self.pathao_consignment_id:
            return None
        return tracking_url(self.pathao_consignment_id, self.phone)

    @computed_field
    @property
    def order_no(self) -> str:
        return f"NB-{self.id}"

    @computed_field
    @property
    def claim_active(self) -> bool:
        """Someone has this order open right now. Decided here, against the
        server clock, so a staff laptop with the wrong time can't misjudge it."""
        if self.assigned_to is None or self.assigned_at is None:
            return False
        cutoff = datetime.now(timezone.utc) - timedelta(minutes=settings.claim_ttl_minutes)
        return self.assigned_at >= cutoff

    @computed_field
    @property
    def auto_captured(self) -> bool:
        """An abandoned storefront form, captured without anyone submitting it."""
        return self.draft_key is not None and self.status == OrderStatus.incomplete


class ClaimOut(BaseModel):
    """One held order, for the fast claims poll."""

    id: int
    assigned_to: int
    assigned_to_name: str | None
    assigned_to_nickname: str | None
    assigned_at: datetime


class ClaimsOut(BaseModel):
    ttl_seconds: int
    claims: list[ClaimOut]


class OrderListOut(BaseModel):
    items: list[OrderOut]
    total: int
    page: int
    page_size: int
    pages: int


class OrderCountsOut(BaseModel):
    """Rows per status, zero-filled, for the sidebar counters."""

    counts: dict[str, int]


class BulkOrderUpdate(BaseModel):
    """One change applied to many orders: a status move or a fulfilment flag."""

    order_ids: list[int] = Field(min_length=1, max_length=200)
    status: OrderStatus | None = None
    printed: bool | None = None
    courier: bool | None = None


class BulkSkipped(BaseModel):
    order_id: int
    order_no: str
    reason: str


class BulkOrderResult(BaseModel):
    updated: list[OrderOut]
    skipped: list[BulkSkipped]


# Pathao is called one order at a time (only the per-order endpoint hands back
# a consignment id), so a batch's wall time grows with its length. Twenty keeps
# a request well inside Cloudflare's 100s proxy timeout; the admin splits a
# larger selection and sends the batches back to back.
PATHAO_BATCH_LIMIT = 20


class PathaoSendIn(BaseModel):
    order_ids: list[int] = Field(min_length=1, max_length=PATHAO_BATCH_LIMIT)


class PathaoFailure(BaseModel):
    order_id: int
    order_no: str
    error: str


class PathaoSendOut(BaseModel):
    orders: list[OrderOut]
    failed: list[PathaoFailure]


class PathaoStatusOut(BaseModel):
    enabled: bool
    sandbox: bool
    base_url: str
    store_id: int
    unit_weight_kg: float
    stores: list[dict] = []
    error: str | None = None


class OrderStatsOut(BaseModel):
    total: int
    in_progress: int
    confirmed: int
    cancelled: int
    revenue: int
    incomplete: int


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str
    nickname: str | None = None
    picture_url: str | None
    role: UserRole
    status: UserStatus
    created_at: datetime
    last_active_at: datetime | None


class UserWithActivityOut(UserOut):
    orders_confirmed: int = 0
    orders_shipped: int = 0


class UserUpdate(BaseModel):
    status: UserStatus | None = None
    role: UserRole | None = None
    # "" clears the nickname and falls back to the person's full name.
    nickname: str | None = Field(default=None, max_length=40)


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    subtitle: str
    default_quantity: int
    unit_price: int
    sku: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    # The stored path, e.g. "products/a1b2c3.jpg"; the URL below is what a
    # client actually fetches.
    image_path: str | None = None

    @computed_field
    @property
    def image_url(self) -> str | None:
        return f"/media/{self.image_path}" if self.image_path else None


class ProductCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    subtitle: str = Field(default="", max_length=2000)
    default_quantity: int = Field(default=1, ge=1, le=99)
    unit_price: int = Field(ge=1)
    sku: str = Field(min_length=1, max_length=64)


class ProductUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    subtitle: str | None = Field(default=None, max_length=2000)
    default_quantity: int | None = Field(default=None, ge=1, le=99)
    unit_price: int | None = Field(default=None, ge=1)
    sku: str | None = Field(default=None, min_length=1, max_length=64)


class StorefrontProductOut(BaseModel):
    """The active product as the public landing page sees it.

    Deliberately narrower than ProductOut: the storefront has no use for row
    ids, timestamps or the active flag, and this endpoint needs no auth.
    """

    model_config = ConfigDict(from_attributes=True)

    title: str
    subtitle: str
    default_quantity: int
    unit_price: int
    sku: str
    image_path: str | None = None

    @computed_field
    @property
    def image_url(self) -> str | None:
        return f"/media/{self.image_path}" if self.image_path else None


class ManualOrderItem(BaseModel):
    """One line of a manually taken order. Only the product and how many —
    the price is read from the catalogue server-side, never sent by the
    browser."""

    product_id: int
    quantity: int = Field(default=1, ge=1, le=99)


class ManualOrderCreate(BaseModel):
    """An order typed in by staff, over the phone or in person.

    Unlike the storefront's OrderCreate this carries a cart, skips the
    per-number cooldown (staff are talking to the customer, so a repeat is
    deliberate) and chooses which list the order lands in.
    """

    customer_name: str = Field(min_length=1, max_length=120)
    phone: str = Field(min_length=6, max_length=32)
    address: str = Field(min_length=4, max_length=1000)
    items: list[ManualOrderItem] = Field(min_length=1, max_length=50)
    comment: str = Field(default="", max_length=2000)
    # "approved" drops the order straight into Confirmed; "manual" leaves it on
    # the Web Order List for someone to call through.
    approved: bool = True

    @field_validator("phone")
    @classmethod
    def _phone(cls, value: str) -> str:
        return _valid_bd_mobile(value)



class PhoneLookupOut(BaseModel):
    # Normalised to 01XXXXXXXXX, so the caller can see what was actually matched.
    phone: str
    # Orders this customer actually placed. Full OrderOut rather than a
    # summary: staff open the whole order from these rows, and a second
    # round-trip per row to fetch the rest would be wasted.
    orders: list[OrderOut] = []
    # Abandoned storefront forms: this number typed a form and never submitted
    # it. Kept apart from real orders because it means something different on a
    # call — nothing was ordered, so it is a lead to close, not a delivery to
    # explain.
    incomplete: list[OrderOut] = []
