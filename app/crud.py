from sqlalchemy.orm import Session
from app import models, schemas, auth

#user
def create_user(db: Session, user: schemas.UserCreate):
    hashed_pw = auth.hash_password(user.password)
    db_user = models.User()
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

# Order
def create_order(db: Session, user_id: int, total_price: float):
    db_order = models.Order(user_id=user_id, total_price= total_price)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order
