
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, crud, database, auth
from typing import List

router = APIRouter(
    prefix="/cart",
    tags=["Cart"]
)

@router.post("/add", response_model=schemas.CartItemOut)
def add_item_to_cart(item: schemas.CartItemCreate, current_username: str = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    # Get user by username
    user = crud.get_user_by_username(db, current_username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.add_to_cart(db, user_id=user.id, item=item)

@router.get("/", response_model=List[schemas.CartItemOut])
def view_cart(current_username: str = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    # Get user by username
    user = crud.get_user_by_username(db, current_username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_cart_items(db, user_id=user.id)

@router.delete("/remove/{cart_item_id}")
def remove_item(cart_item_id: int, current_username: str = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    deleted = crud.remove_cart_item(db, cart_item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return {"detail": "Item removed from cart"}

@router.put("/update/{cart_item_id}", response_model=schemas.CartItemOut)
def update_cart_item(cart_item_id: int, quantity: int, current_username: str = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    updated_item = crud.update_cart_item_quantity(db, cart_item_id, quantity)
    if not updated_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return updated_item

@router.post("/checkout", response_model=schemas.OrderOut)
def checkout(current_username: str = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    # Get user by username
    user = crud.get_user_by_username(db, current_username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get cart items
    cart_items = crud.get_cart_items(db, user_id=user.id)
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate total and create order items
    total_price = 0
    order_items = []
    for cart_item in cart_items:
        item_total = cart_item.product.price * cart_item.quantity
        total_price += item_total
        order_items.append(schemas.OrderItem(
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            price=cart_item.product.price
        ))
    
    # Create order
    order_data = schemas.OrderCreate(total_price=total_price, items=order_items)
    order = crud.create_order(db, user.id, order_data)
    
    # Clear cart
    crud.clear_cart(db, user.id)
    
    return order

@router.post("/cleanup-duplicates")
def cleanup_duplicate_cart_items(current_username: str = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    """Clean up duplicate cart items for the current user"""
    user = crud.get_user_by_username(db, current_username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    removed_count = crud.cleanup_duplicate_cart_items(db, user.id)
    return {"message": f"Cleaned up {removed_count} duplicate cart items"}
    for cart_item in cart_items:
        item_total = cart_item.product.price * cart_item.quantity
        total_price += item_total
        order_items.append(schemas.OrderItem(
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            price=cart_item.product.price
        ))
    
    # Create order
    order_data = schemas.OrderCreate(total_price=total_price, items=order_items)
    order = crud.create_order(db, user.id, order_data)
    
    # Clear cart
    crud.clear_cart(db, user.id)
    
    return order
