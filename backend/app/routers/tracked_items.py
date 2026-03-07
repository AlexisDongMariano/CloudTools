from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import TrackedItem
from app.schemas import ItemSummary, TrackedItemCreate, TrackedItemRead, TrackedItemUpdate

router = APIRouter(prefix="/api/items", tags=["Tracked Items"])


@router.get("", response_model=list[TrackedItemRead])
def list_items(
    item_type: str | None = Query(default=None),
    owner: str | None = Query(default=None),
    expiring_in_days: int | None = Query(default=None, ge=0, le=3650),
    db: Session = Depends(get_db),
):
    query = db.query(TrackedItem)

    if item_type:
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
    in_30_days = today + timedelta(days=30)

    total_items = db.query(func.count(TrackedItem.id)).scalar() or 0
    expired_items = (
        db.query(func.count(TrackedItem.id))
        .filter(TrackedItem.date_expiration < today)
        .scalar()
        or 0
    )
    expiring_in_7_days = (
        db.query(func.count(TrackedItem.id))
        .filter(TrackedItem.date_expiration >= today, TrackedItem.date_expiration <= in_7_days)
        .scalar()
        or 0
    )
    expiring_in_30_days = (
        db.query(func.count(TrackedItem.id))
        .filter(TrackedItem.date_expiration >= today, TrackedItem.date_expiration <= in_30_days)
        .scalar()
        or 0
    )

    return ItemSummary(
        total_items=total_items,
        expired_items=expired_items,
        expiring_in_30_days=expiring_in_30_days,
        expiring_in_7_days=expiring_in_7_days,
    )


@router.get("/{item_id}", response_model=TrackedItemRead)
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(TrackedItem).filter(TrackedItem.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found.")
    return item


@router.post("", response_model=TrackedItemRead, status_code=status.HTTP_201_CREATED)
def create_item(item: TrackedItemCreate, db: Session = Depends(get_db)):
    db_item = TrackedItem(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.put("/{item_id}", response_model=TrackedItemRead)
def update_item(item_id: int, item_update: TrackedItemUpdate, db: Session = Depends(get_db)):
    db_item = db.query(TrackedItem).filter(TrackedItem.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found.")

    update_data = item_update.model_dump(exclude_unset=True)
    next_date_created = update_data.get("date_created", db_item.date_created)
    next_date_expiration = update_data.get("date_expiration", db_item.date_expiration)
    if next_date_expiration < next_date_created:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expiration date cannot be before created date.",
        )

    for key, value in update_data.items():
        setattr(db_item, key, value)

    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(TrackedItem).filter(TrackedItem.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found.")

    db.delete(db_item)
    db.commit()
