from fastapi import HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, auth

# User
def create_user(db: Session, user: schemas.UserCreate):
    hashed_pw = auth.hash_password(user.password)
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_pw)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

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
    db_item = models.CartItem(user_id=user_id, product_id=item.product_id, quantity=item.quantity)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def get_cart_items(db: Session, user_id: int):
    return db.query(models.CartItem).filter(models.CartItem.user_id == user_id).all()

def remove_cart_item(db: Session, cart_item_id: int):
    db_item = db.query(models.CartItem).filter(models.CartItem.id == cart_item_id).first()
    if not db_item:
        return False
    db.delete(db_item)
    db.commit()
    return True


# Order
def create_order(db: Session, user_id: int, total_price: float):
    db_order = models.Order(user_id=user_id, total_price=total_price)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order
def get_all_orders(db: Session):
    return db.query(models.Order).all()



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
