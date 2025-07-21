from pydantic import BaseModel
from typing import List, Optional


#users schemas
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    
class UserOut(BaseModel):
    id: int
    username: str
    email: str
    
    class Config:
        orm_mode = True

# Product schemas
class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    quantity: int
    
class ProductOut(BaseModel):
    id: int
    
    class Config:
        orm_mode = True
        
# Order schemas
class OrderCreate(BaseModel):
    user_id: int
    total_price: float
    
class OrderOut(BaseModel):
    id: int
    total_price: float
    
    class Config:
        orm_mode = True
        
# Cart schemas
class CartItemCreate(BaseModel):
    product_id: int
    quantity: int
    
class CartItemOut(BaseModel):
    id: int
    product: ProductOut
    quantity: int
    
    class Config:
        orm_mode = True
           