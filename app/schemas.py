from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from enum import Enum

# Enums
class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

# User schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: UserRole
    is_active: bool
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Admin user creation
class AdminUserCreate(UserCreate):
    role: UserRole = UserRole.ADMIN



# Product schemas
class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    quantity: int
    category: Optional[str] = None
    sku: Optional[str] = None
    image: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    category: Optional[str] = None
    sku: Optional[str] = None
    image: Optional[str] = None
    is_active: Optional[bool] = None

class ProductOut(BaseModel):
    id: int
    name: str
    description: str
    price: float
    quantity: int
    category: Optional[str] = None
    sku: Optional[str] = None
    image: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

        
# Order schemas
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    price: float

class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    product: Optional[ProductOut] = None

    class Config:
        from_attributes = True

class OrderOut(BaseModel):
    id: int
    user_id: int
    total_price: float
    status: OrderStatus
    shipping_address: Optional[str] = None
    created_at: datetime
    user: Optional[UserOut] = None
    items: Optional[List[OrderItemOut]] = None

    class Config:
        from_attributes = True

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    shipping_address: Optional[str] = None

class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    product_id: int
    quantity: int
    price: float
    product: Optional[ProductOut] = None
    
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    total_price: float
    shipping_address: Optional[str] = None
    items: Optional[List[OrderItemCreate]] = []

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    shipping_address: Optional[str] = None

class OrderOut(BaseModel):
    id: int
    user_id: int
    total_price: float
    status: Optional[OrderStatus] = None
    shipping_address: Optional[str] = None
    created_at: Optional[datetime] = None
    user: Optional[UserOut] = None
    order_items: List[OrderItemOut] = []
    
    class Config:
        from_attributes = True

        
# Cart schemas
class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductOut

    class Config:
        from_attributes = True

# Dashboard schemas
class DashboardStats(BaseModel):
    total_users: int
    total_products: int
    total_orders: int
    total_revenue: float
    pending_orders: int
    low_stock_products: int

# Analytics schemas
class AnalyticsData(BaseModel):
    total_revenue: float
    total_orders: int
    new_customers: int
    average_order_value: float
    top_products: Optional[List[dict]] = None
    recent_activities: Optional[List[dict]] = None
    order_status_distribution: Optional[dict] = None

# API Response schemas
class MessageResponse(BaseModel):
    message: str
    
class ErrorResponse(BaseModel):
    detail: str
    
    class Config:
     from_attributes = True
           
           
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
