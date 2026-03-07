import json
from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import TrackedItem, TrackedItemHistory
from app.schemas import (
    ItemSummary,
    TrackedItemCreate,
    TrackedItemHistoryRead,
    TrackedItemRead,
    TrackedItemUpdate,
)

router = APIRouter(prefix="/api/items", tags=["Tracked Items"])
REMINDER_DAYS = 14
ALLOWED_ITEM_TYPES = [
    "tls_certificate",
    "api_key",
    "oauth_client_secret",
    "service_principal_secret",
    "iam_access_key",
    "domain_registration",
    "license_renewal",
    "ssh_key",
    "saml_signing_certificate",
]


def validate_item_type(item_type: str):
    if item_type not in ALLOWED_ITEM_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid item type. Allowed values: {', '.join(ALLOWED_ITEM_TYPES)}",
        )


def build_snapshot(item: TrackedItem) -> str:
    snapshot_dict = {
        "id": item.id,
        "item_type": item.item_type,
        "name": item.name,
        "identifier": item.identifier,
        "source": item.source,
        "owner": item.owner,
        "owner_email": item.owner_email,
        "ticket": item.ticket,
        "environment": item.environment,
        "date_created": item.date_created.isoformat(),
        "date_expiration": item.date_expiration.isoformat(),
        "notes": item.notes,
        "is_active": item.is_active,
        "deleted_at": item.deleted_at.isoformat() if item.deleted_at else None,
    }
    return json.dumps(snapshot_dict)


def create_history_entry(db: Session, item: TrackedItem, action: str):
    db.add(TrackedItemHistory(item_id=item.id, action=action, snapshot=build_snapshot(item)))


@router.get("", response_model=list[TrackedItemRead])
def list_items(
    item_type: str | None = Query(default=None),
    owner: str | None = Query(default=None),
    expiring_in_days: int | None = Query(default=None, ge=0, le=3650),
    include_deleted: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    query = db.query(TrackedItem)

    if not include_deleted:
        query = query.filter(TrackedItem.deleted_at.is_(None))
    if item_type:
        validate_item_type(item_type)
        query = query.filter(TrackedItem.item_type == item_type)
    if owner:
        query = query.filter(TrackedItem.owner == owner)
    if expiring_in_days is not None:
        end_date = date.today() + timedelta(days=expiring_in_days)
        query = query.filter(TrackedItem.date_expiration <= end_date)

    return query.order_by(TrackedItem.date_expiration.asc()).all()


@router.get("/summary", response_model=ItemSummary)
def get_summary(db: Session = Depends(get_db)):
    today = date.today()
    in_7_days = today + timedelta(days=7)
    in_14_days = today + timedelta(days=REMINDER_DAYS)
    in_30_days = today + timedelta(days=30)
    base_query = db.query(TrackedItem).filter(
        TrackedItem.deleted_at.is_(None), TrackedItem.is_active.is_(True)
    )

    total_items = base_query.with_entities(func.count(TrackedItem.id)).scalar() or 0
    expired_items = (
        base_query.with_entities(func.count(TrackedItem.id))
        .filter(TrackedItem.date_expiration < today)
        .scalar()
        or 0
    )
    expiring_in_7_days = (
        base_query.with_entities(func.count(TrackedItem.id))
        .filter(TrackedItem.date_expiration >= today, TrackedItem.date_expiration <= in_7_days)
        .scalar()
        or 0
    )
    expiring_in_14_days = (
        base_query.with_entities(func.count(TrackedItem.id))
        .filter(TrackedItem.date_expiration >= today, TrackedItem.date_expiration <= in_14_days)
        .scalar()
        or 0
    )
    expiring_in_30_days = (
        base_query.with_entities(func.count(TrackedItem.id))
        .filter(TrackedItem.date_expiration >= today, TrackedItem.date_expiration <= in_30_days)
        .scalar()
        or 0
    )

    return ItemSummary(
        total_items=total_items,
        expired_items=expired_items,
        expiring_in_14_days=expiring_in_14_days,
        expiring_in_30_days=expiring_in_30_days,
        expiring_in_7_days=expiring_in_7_days,
    )


@router.get("/metadata/item-types", response_model=list[str])
def get_item_types():
    return ALLOWED_ITEM_TYPES


@router.get("/metadata/reminder-days", response_model=int)
def get_reminder_days():
    return REMINDER_DAYS


@router.get("/{item_id}", response_model=TrackedItemRead)
def get_item(item_id: int, include_deleted: bool = Query(default=False), db: Session = Depends(get_db)):
    query = db.query(TrackedItem).filter(TrackedItem.id == item_id)
    if not include_deleted:
        query = query.filter(TrackedItem.deleted_at.is_(None))
    item = query.first()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found.")
    return item


@router.post("", response_model=TrackedItemRead, status_code=status.HTTP_201_CREATED)
def create_item(item: TrackedItemCreate, db: Session = Depends(get_db)):
    validate_item_type(item.item_type)
    db_item = TrackedItem(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    create_history_entry(db, db_item, action="created")
    db.commit()
    return db_item


@router.put("/{item_id}", response_model=TrackedItemRead)
def update_item(item_id: int, item_update: TrackedItemUpdate, db: Session = Depends(get_db)):
    db_item = (
        db.query(TrackedItem)
        .filter(TrackedItem.id == item_id, TrackedItem.deleted_at.is_(None))
        .first()
    )
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found.")

    update_data = item_update.model_dump(exclude_unset=True)
    if "item_type" in update_data:
        validate_item_type(update_data["item_type"])
    next_date_created = update_data.get("date_created", db_item.date_created)
    next_date_expiration = update_data.get("date_expiration", db_item.date_expiration)
    if next_date_expiration < next_date_created:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expiration date cannot be before created date.",
        )

    for key, value in update_data.items():
        setattr(db_item, key, value)

    create_history_entry(db, db_item, action="updated")
    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    db_item = (
        db.query(TrackedItem)
        .filter(TrackedItem.id == item_id, TrackedItem.deleted_at.is_(None))
        .first()
    )
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found.")

    db_item.deleted_at = datetime.now(timezone.utc)
    db_item.is_active = False
    create_history_entry(db, db_item, action="deleted")
    db.commit()


@router.post("/{item_id}/restore", response_model=TrackedItemRead)
def restore_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(TrackedItem).filter(TrackedItem.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found.")
    if db_item.deleted_at is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Item is not deleted.")

    db_item.deleted_at = None
    db_item.is_active = True
    create_history_entry(db, db_item, action="restored")
    db.commit()
    db.refresh(db_item)
    return db_item


@router.get("/{item_id}/history", response_model=list[TrackedItemHistoryRead])
def get_item_history(item_id: int, db: Session = Depends(get_db)):
    item = db.query(TrackedItem).filter(TrackedItem.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found.")

    return (
        db.query(TrackedItemHistory)
        .filter(TrackedItemHistory.item_id == item_id)
        .order_by(TrackedItemHistory.changed_at.desc())
        .all()
    )
