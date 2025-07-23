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

class ProductOut(ProductCreate):
    id: int
    
    class Config:
     from_attributes = True

        
# Order schemas
class OrderCreate(BaseModel):
    user_id: int
    total_price: float

class OrderOut(BaseModel):
    id: int
    total_price: float
    
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
