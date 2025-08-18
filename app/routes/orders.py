from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, crud, database, auth, models
from typing import List

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

@router.post("/", response_model=schemas.OrderOut)
def place_order(order: schemas.OrderCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    return crud.create_order(db, current_user.id, order)

@router.get("/", response_model=List[schemas.OrderOut])
def list_orders(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    return crud.get_user_orders(db, current_user.id)
