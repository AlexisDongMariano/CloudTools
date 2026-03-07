from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator


class TrackedItemBase(BaseModel):
    item_type: str = Field(min_length=2, max_length=50)
    name: str = Field(min_length=2, max_length=120)
    identifier: str | None = Field(default=None, max_length=120)
    source: str = Field(min_length=2, max_length=120)
    owner: str = Field(min_length=2, max_length=120)
    owner_email: str | None = Field(default=None, max_length=200)
    ticket: str | None = Field(default=None, max_length=120)
    environment: str | None = Field(default=None, max_length=30)
    date_created: date
    date_expiration: date
    notes: str | None = None
    is_active: bool = True

    @field_validator("date_expiration")
    @classmethod
    def validate_expiration_date(cls, value: date, info):
        date_created = info.data.get("date_created")
        if date_created and value < date_created:
            raise ValueError("Expiration date cannot be before created date.")
        return value


class TrackedItemCreate(TrackedItemBase):
    pass


class TrackedItemUpdate(BaseModel):
    item_type: str | None = Field(default=None, min_length=2, max_length=50)
    name: str | None = Field(default=None, min_length=2, max_length=120)
    identifier: str | None = Field(default=None, max_length=120)
    source: str | None = Field(default=None, min_length=2, max_length=120)
    owner: str | None = Field(default=None, min_length=2, max_length=120)
    owner_email: str | None = Field(default=None, max_length=200)
    ticket: str | None = Field(default=None, max_length=120)
    environment: str | None = Field(default=None, max_length=30)
    date_created: date | None = None
    date_expiration: date | None = None
    notes: str | None = None
    is_active: bool | None = None

    @field_validator("date_expiration")
    @classmethod
    def validate_expiration_date(cls, value: date | None, info):
        date_created = info.data.get("date_created")
        if value and date_created and value < date_created:
            raise ValueError("Expiration date cannot be before created date.")
        return value


class TrackedItemRead(TrackedItemBase):
    id: int
    deleted_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ItemSummary(BaseModel):
    total_items: int
    expired_items: int
    expiring_in_14_days: int
    expiring_in_30_days: int
    expiring_in_7_days: int


class TrackedItemHistoryRead(BaseModel):
    id: int
    item_id: int
    action: str
    snapshot: str
    changed_at: datetime

    model_config = {"from_attributes": True}
