from pydantic import BaseModel
from typing import List, Optional

# User schemas
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    username: Optional[str]
    email: Optional[str]

    class Config:
        from_attributes = True



# Product schemas
class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    quantity: int
    image: Optional[str] = None

class ProductOut(ProductCreate):
    id: int
    
    class Config:
     from_attributes = True

        
# Order schemas
class OrderItem(BaseModel):
    product_id: int
    quantity: int
    price: float

class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    product: ProductOut
    
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    total_price: float
    items: Optional[List[OrderItem]] = []

class OrderOut(BaseModel):
    id: int
    total_price: float
    user_id: int
    order_items: List[OrderItemOut] = []
    
    class Config:
        from_attributes = True

        
# Cart schemas
class CartItemCreate(BaseModel):
    product_id: int
    quantity: int

class CartItemOut(BaseModel):
    id: int
    product: ProductOut
    quantity: int
    
    class Config:
     from_attributes = True
           
           
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
