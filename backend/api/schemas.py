from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, computed_field

from api.models import OrderStatus, UserRole, UserStatus


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=1, max_length=120)
    phone: str = Field(min_length=6, max_length=32)
    address: str = Field(min_length=4, max_length=1000)
    quantity: int = Field(default=1, ge=1, le=50)


class TagCreate(BaseModel):
    label: str = Field(min_length=1, max_length=50)


class OrderUpdate(BaseModel):
    status: OrderStatus | None = None
    comment: str | None = Field(default=None, max_length=2000)
    customer_name: str | None = Field(default=None, min_length=1, max_length=120)
    phone: str | None = Field(default=None, min_length=6, max_length=32)
    address: str | None = Field(default=None, min_length=4, max_length=1000)


class OrderTagOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    label: str
    created_by_name: str | None
    created_at: datetime


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
    assigned_to: int | None = None
    assigned_to_name: str | None = None
    assigned_at: datetime | None = None
    tags: list[OrderTagOut] = []

    @computed_field
    @property
    def order_no(self) -> str:
        return f"NB-{self.id}"


class OrderListOut(BaseModel):
    items: list[OrderOut]
    total: int
    page: int
    page_size: int
    pages: int


class OrderStatsOut(BaseModel):
    total: int
    in_progress: int
    confirmed: int
    cancelled: int
    revenue: int


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str
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
