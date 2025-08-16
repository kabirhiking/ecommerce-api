from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, crud, database, auth
from typing import List

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

@router.post("/", response_model=schemas.OrderOut)
def place_order(order: schemas.OrderCreate, db: Session = Depends(database.get_db), current_user: str = Depends(auth.get_current_user)):
    # Get user by username to get user_id
    user_obj = crud.get_user_by_username(db, current_user)
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.create_order(db, user_obj.id, order)

@router.get("/", response_model=List[schemas.OrderOut])
def list_orders(db: Session = Depends(database.get_db), current_user: str = Depends(auth.get_current_user)):
    # Get user by username to get user_id
    user_obj = crud.get_user_by_username(db, current_user)
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_user_orders(db, user_obj.id)
