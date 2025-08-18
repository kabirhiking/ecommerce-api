# app/routes/admin.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_
from typing import List, Optional
from app import schemas, crud, database, auth, models
from app.models import UserRole, OrderStatus

router = APIRouter(
    prefix="/admin",
    tags=["Admin Panel"],
    dependencies=[Depends(auth.require_admin)]
)

# Dashboard Stats
@router.get("/dashboard", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(database.get_db)):
    """Get comprehensive dashboard statistics"""
    
    # Total users
    total_users = db.query(models.User).count()
    
    # Total products
    total_products = db.query(models.Product).count()
    
    # Total orders
    total_orders = db.query(models.Order).count()
    
    # Total revenue
    total_revenue = db.query(func.sum(models.Order.total_price)).scalar() or 0.0
    
    # Pending orders
    pending_orders = db.query(models.Order).filter(
        models.Order.status == OrderStatus.PENDING
    ).count()
    
    # Low stock products (quantity < 10)
    low_stock_products = db.query(models.Product).filter(
        models.Product.quantity < 10,
        models.Product.is_active == True
    ).count()
    
    return schemas.DashboardStats(
        total_users=total_users,
        total_products=total_products,
        total_orders=total_orders,
        total_revenue=total_revenue,
        pending_orders=pending_orders,
        low_stock_products=low_stock_products
    )

# User Management
@router.get("/users", response_model=List[schemas.UserOut])
def list_all_users(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    role: Optional[UserRole] = None,
    db: Session = Depends(database.get_db)
):
    """Get all users with pagination and filtering"""
    query = db.query(models.User)
    
    if search:
        query = query.filter(
            models.User.username.ilike(f"%{search}%") |
            models.User.email.ilike(f"%{search}%")
        )
    
    if role:
        query = query.filter(models.User.role == role)
    
    users = query.offset(skip).limit(limit).all()
    return users

@router.post("/users", response_model=schemas.UserOut)
def create_admin_user(
    user_data: schemas.AdminUserCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_super_admin)
):
    """Create a new admin user (Super Admin only)"""
    # Check if user exists
    existing_user = db.query(models.User).filter(
        (models.User.username == user_data.username) |
        (models.User.email == user_data.email)
    ).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create user
    hashed_password = auth.hash_password(user_data.password)
    db_user = models.User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        role=user_data.role,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone=user_data.phone
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.put("/users/{user_id}", response_model=schemas.UserOut)
def update_user(
    user_id: int,
    user_data: schemas.UserUpdate,
    db: Session = Depends(database.get_db)
):
    """Update user information"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields
    for field, value in user_data.dict(exclude_unset=True).items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    """Deactivate user account"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent self-deletion
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete own account")
    
    # Deactivate instead of delete
    user.is_active = False
    db.commit()
    
    return {"message": "User deactivated successfully"}

# Product Management
@router.get("/products", response_model=List[schemas.ProductOut])
def list_all_products(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    category: Optional[str] = None,
    low_stock: bool = False,
    db: Session = Depends(database.get_db)
):
    """Get all products with advanced filtering"""
    query = db.query(models.Product)
    
    if search:
        query = query.filter(
            models.Product.name.ilike(f"%{search}%") |
            models.Product.description.ilike(f"%{search}%")
        )
    
    if category:
        query = query.filter(models.Product.category == category)
    
    if low_stock:
        query = query.filter(models.Product.quantity < 10)
    
    products = query.offset(skip).limit(limit).all()
    return products

@router.post("/products", response_model=schemas.ProductOut)
def create_product(
    product_data: schemas.ProductCreate,
    db: Session = Depends(database.get_db)
):
    """Create a new product"""
    db_product = models.Product(**product_data.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.put("/products/{product_id}", response_model=schemas.ProductOut)
def update_product(
    product_id: int,
    product_data: schemas.ProductUpdate,
    db: Session = Depends(database.get_db)
):
    """Update product information"""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update fields
    for field, value in product_data.dict(exclude_unset=True).items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    return product

@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(database.get_db)
):
    """Deactivate product"""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product.is_active = False
    db.commit()
    
    return {"message": "Product deactivated successfully"}

# Order Management
@router.get("/orders", response_model=List[schemas.OrderOut])
def list_all_orders(
    skip: int = 0,
    limit: int = 100,
    status: Optional[OrderStatus] = None,
    user_id: Optional[int] = None,
    db: Session = Depends(database.get_db)
):
    """Get all orders with filtering"""
    # Simplified query without complex joins to debug
    query = db.query(models.Order)
    
    if status:
        query = query.filter(models.Order.status == status)
    
    if user_id:
        query = query.filter(models.Order.user_id == user_id)
    
    orders = query.offset(skip).limit(limit).all()
    
    # Manually load relationships
    for order in orders:
        # Load user
        order.user = db.query(models.User).filter(models.User.id == order.user_id).first()
        # Load order items
        order.order_items = db.query(models.OrderItem).filter(models.OrderItem.order_id == order.id).all()
        # Load products for each order item
        for item in order.order_items:
            item.product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
    
    return orders

@router.put("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status_data: schemas.OrderStatusUpdate,
    db: Session = Depends(database.get_db)
):
    """Update order status"""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = status_data.status
    db.commit()
    db.refresh(order)
    return {"message": "Order status updated successfully"}

@router.get("/analytics", response_model=schemas.AnalyticsData)
def get_analytics(
    days: int = 30,
    db: Session = Depends(database.get_db)
):
    """Get comprehensive analytics data"""
    from datetime import datetime, timedelta
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Total revenue
    total_revenue = db.query(func.sum(models.Order.total_price)).filter(
        models.Order.created_at >= start_date,
        models.Order.status != OrderStatus.CANCELLED
    ).scalar() or 0.0
    
    # Total orders
    total_orders = db.query(models.Order).filter(
        models.Order.created_at >= start_date
    ).count()
    
    # New customers
    new_customers = db.query(models.User).filter(
        models.User.created_at >= start_date
    ).count() if hasattr(models.User, 'created_at') else 0
    
    # Average order value
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0.0
    
    # Top products
    top_products_query = db.query(
        models.Product.id,
        models.Product.name,
        func.sum(models.OrderItem.quantity).label('total_sold'),
        func.sum(models.OrderItem.quantity * models.OrderItem.price).label('revenue')
    ).join(
        models.OrderItem, models.Product.id == models.OrderItem.product_id
    ).join(
        models.Order, models.OrderItem.order_id == models.Order.id
    ).filter(
        models.Order.created_at >= start_date,
        models.Order.status != OrderStatus.CANCELLED
    ).group_by(
        models.Product.id, models.Product.name
    ).order_by(
        func.sum(models.OrderItem.quantity).desc()
    ).limit(5).all()
    
    top_products = [
        {
            "id": p.id,
            "name": p.name,
            "total_sold": p.total_sold,
            "revenue": float(p.revenue)
        }
        for p in top_products_query
    ]
    
    # Order status distribution
    status_distribution = {}
    status_counts = db.query(
        models.Order.status,
        func.count(models.Order.id)
    ).filter(
        models.Order.created_at >= start_date
    ).group_by(models.Order.status).all()
    
    for status, count in status_counts:
        status_distribution[status.value] = count
    
    # Recent activities (mock data for now)
    recent_activities = [
        {
            "type": "order",
            "description": f"New order #{order.id} placed by {order.user.username}" if order.user else f"New order #{order.id}",
            "timestamp": order.created_at.isoformat()
        }
        for order in db.query(models.Order).options(db.joinedload(models.Order.user)).order_by(models.Order.created_at.desc()).limit(5).all()
    ]
    
    return schemas.AnalyticsData(
        total_revenue=total_revenue,
        total_orders=total_orders,
        new_customers=new_customers,
        average_order_value=avg_order_value,
        top_products=top_products,
        recent_activities=recent_activities,
        order_status_distribution=status_distribution
    )

# Analytics
@router.get("/analytics/revenue")
def get_revenue_analytics(
    days: int = 30,
    db: Session = Depends(database.get_db)
):
    """Get revenue analytics for the specified number of days"""
    from datetime import datetime, timedelta
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    orders = db.query(models.Order).filter(
        models.Order.created_at >= start_date,
        models.Order.status != OrderStatus.CANCELLED
    ).all()
    
    # Group by date
    revenue_by_date = {}
    for order in orders:
        date_key = order.created_at.date().isoformat()
        revenue_by_date[date_key] = revenue_by_date.get(date_key, 0) + order.total_price
    
    return {
        "period_days": days,
        "total_revenue": sum(revenue_by_date.values()),
        "daily_revenue": revenue_by_date
    }

@router.get("/analytics/top-products")
def get_top_products(
    limit: int = 10,
    db: Session = Depends(database.get_db)
):
    """Get top-selling products"""
    results = db.query(
        models.Product.id,
        models.Product.name,
        func.sum(models.OrderItem.quantity).label('total_sold'),
        func.sum(models.OrderItem.quantity * models.OrderItem.price).label('total_revenue')
    ).join(
        models.OrderItem, models.Product.id == models.OrderItem.product_id
    ).join(
        models.Order, models.OrderItem.order_id == models.Order.id
    ).filter(
        models.Order.status != OrderStatus.CANCELLED
    ).group_by(
        models.Product.id, models.Product.name
    ).order_by(
        func.sum(models.OrderItem.quantity).desc()
    ).limit(limit).all()
    
    return [
        {
            "product_id": result.id,
            "product_name": result.name,
            "total_sold": result.total_sold,
            "total_revenue": float(result.total_revenue)
        }
        for result in results
    ]
