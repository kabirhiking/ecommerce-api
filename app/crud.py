from fastapi import HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, auth

# User
def create_user(db: Session, user: schemas.UserCreate, hashed_password: str):
    db_user = models.User(
    username=user.username, 
    email=user.email, 
    hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()



def get_all_users(db: Session):
    return db.query(models.User).all()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def delete_user(db: Session, user_id: int):
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return False
    db.delete(db_user)
    db.commit()
    return True



# Product
def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def get_all_products(db: Session):
    return db.query(models.Product).all()

# Cart
def add_to_cart(db: Session, user_id: int, item: schemas.CartItemCreate):
    # Check if product already exists in cart
    existing_item = db.query(models.CartItem).filter(
        models.CartItem.user_id == user_id,
        models.CartItem.product_id == item.product_id
    ).first()
    
    print(f"Adding to cart - User: {user_id}, Product: {item.product_id}, Quantity: {item.quantity}")
    print(f"Existing item: {existing_item.quantity if existing_item else 'None'}")
    
    if existing_item:
        # Product already in cart, don't change quantity
        print(f"Product already in cart, quantity remains: {existing_item.quantity}")
        return existing_item
    else:
        # Double-check no item was created by another request
        existing_check = db.query(models.CartItem).filter(
            models.CartItem.user_id == user_id,
            models.CartItem.product_id == item.product_id
        ).first()
        
        if existing_check:
            print(f"Found item created by another request, returning existing")
            return existing_check
            
        # Create new cart item with quantity 1
        db_item = models.CartItem(user_id=user_id, product_id=item.product_id, quantity=1)
        db.add(db_item)
        try:
            db.commit()
            db.refresh(db_item)
            print(f"Created new item with quantity: {db_item.quantity}")
            return db_item
        except Exception as e:
            db.rollback()
            # If insert failed due to duplicate, try to find the existing item
            existing_item = db.query(models.CartItem).filter(
                models.CartItem.user_id == user_id,
                models.CartItem.product_id == item.product_id
            ).first()
            if existing_item:
                print(f"Insert failed, returning existing item: {existing_item.quantity}")
                return existing_item
            else:
                raise e

def get_cart_items(db: Session, user_id: int):
    return db.query(models.CartItem).filter(models.CartItem.user_id == user_id).all()

def remove_cart_item(db: Session, cart_item_id: int):
    db_item = db.query(models.CartItem).filter(models.CartItem.id == cart_item_id).first()
    if not db_item:
        return False
    db.delete(db_item)
    db.commit()
    return True

def update_cart_item_quantity(db: Session, cart_item_id: int, quantity: int):
    db_item = db.query(models.CartItem).filter(models.CartItem.id == cart_item_id).first()
    if not db_item:
        return None
    if quantity <= 0:
        # Remove item if quantity is 0 or negative
        db.delete(db_item)
        db.commit()
        return None
    else:
        # Update quantity as requested
        db_item.quantity = quantity
        db.commit()
        db.refresh(db_item)
        return db_item

def clear_cart(db: Session, user_id: int):
    db.query(models.CartItem).filter(models.CartItem.user_id == user_id).delete()
    db.commit()
    return True

def cleanup_duplicate_cart_items(db: Session, user_id: int):
    """Remove duplicate cart items, keeping only the one with highest quantity"""
    # Get all cart items for the user
    cart_items = db.query(models.CartItem).filter(models.CartItem.user_id == user_id).all()
    
    # Group by product_id
    product_groups = {}
    for item in cart_items:
        if item.product_id not in product_groups:
            product_groups[item.product_id] = []
        product_groups[item.product_id].append(item)
    
    removed_count = 0
    
    # For each product, keep only one item (merge quantities)
    for product_id, items in product_groups.items():
        if len(items) > 1:
            # Calculate total quantity
            total_quantity = sum(item.quantity for item in items)
            
            # Keep the first item, update its quantity
            keep_item = items[0]
            keep_item.quantity = total_quantity
            
            # Delete the rest
            for item in items[1:]:
                db.delete(item)
                removed_count += 1
    
    db.commit()
    return removed_count


# Order
def create_order(db: Session, user_id: int, order_data: schemas.OrderCreate):
    # Create the order
    db_order = models.Order(user_id=user_id, total_price=order_data.total_price)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # Create order items
    for item in order_data.items:
        db_order_item = models.OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.price
        )
        db.add(db_order_item)
    
    db.commit()
    db.refresh(db_order)
    return db_order

def get_all_orders(db: Session):
    return db.query(models.Order).all()

def get_user_orders(db: Session, user_id: int):
    return db.query(models.Order).filter(models.Order.user_id == user_id).all()



def get_product_by_id(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def update_product(db: Session, product_id: int, product: schemas.ProductCreate):
    db_product = get_product_by_id(db, product_id)
    if not db_product:
        return None
    for key, value in product.dict().items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product_by_id(db, product_id)
    if not db_product:
        return False
    db.delete(db_product)
    db.commit()
    return True

def update_user(db: Session, user_id: int, user: schemas.UserUpdate):
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.username:
        db_user.username = user.username
    if user.email:
        db_user.email = user.email
    if user.password:
        db_user.hashed_password = auth.hash_password(user.password)

    db.commit()
    db.refresh(db_user)
    return db_user
