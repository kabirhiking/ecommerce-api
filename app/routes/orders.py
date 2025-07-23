from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, crud, database
from typing import List

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

@router.post("/", response_model=schemas.OrderOut)
def place_order(order: schemas.OrderCreate, db: Session = Depends(database.get_db)):
    return crud.create_order(db, order.user_id, order.total_price)

@router.get("/", response_model=List[schemas.OrderOut])
def list_orders(db: Session = Depends(database.get_db)):
    return crud.get_all_orders(db)
