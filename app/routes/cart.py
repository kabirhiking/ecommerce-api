
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, crud, database
from typing import List

router = APIRouter(
    prefix="/cart",
    tags=["Cart"]
)

@router.post("/add", response_model=schemas.CartItemOut)
def add_item_to_cart(item: schemas.CartItemCreate, db: Session = Depends(database.get_db)):
    return crud.add_to_cart(db, user_id=1, item=item)  # user_id=1 for now

@router.get("/", response_model=List[schemas.CartItemOut])
def view_cart(db: Session = Depends(database.get_db)):
    return crud.get_cart_items(db, user_id=1)  # user_id=1 for now

@router.delete("/remove/{cart_item_id}")
def remove_item(cart_item_id: int, db: Session = Depends(database.get_db)):
    deleted = crud.remove_cart_item(db, cart_item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return {"detail": "Item removed from cart"}
