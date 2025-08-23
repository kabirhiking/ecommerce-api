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
    include_inactive: bool = False,
    db: Session = Depends(database.get_db)
):
    """Get all products with advanced filtering"""
    query = db.query(models.Product)
    
    # By default, only show active products unless explicitly requested
    if not include_inactive:
        query = query.filter(models.Product.is_active == True)
    
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
    
    # New customers (users created in the date range)
    # Note: User model doesn't have created_at field, so we'll return 0 for now
    new_customers = 0  # db.query(models.User).filter(models.User.created_at >= start_date).count()
    
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
    recent_activities = []
    recent_orders = db.query(models.Order).order_by(models.Order.created_at.desc()).limit(5).all()
    
    for order in recent_orders:
        # Manually load user for each order
        user = db.query(models.User).filter(models.User.id == order.user_id).first()
        description = f"New order #{order.id} placed by {user.username}" if user else f"New order #{order.id}"
        recent_activities.append({
            "type": "order",
            "description": description,
            "timestamp": order.created_at.isoformat()
        })
    
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

# Additional Analytics Endpoints

@router.get("/analytics/sales-trend")
def get_sales_trend(
    days: int = 30,
    db: Session = Depends(database.get_db)
):
    """Get daily sales trend for the specified number of days"""
    from datetime import datetime, timedelta
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Daily sales data
    daily_sales = db.query(
        func.date(models.Order.created_at).label('date'),
        func.count(models.Order.id).label('orders'),
        func.sum(models.Order.total_price).label('revenue')
    ).filter(
        models.Order.created_at >= start_date,
        models.Order.status != OrderStatus.CANCELLED
    ).group_by(
        func.date(models.Order.created_at)
    ).order_by(
        func.date(models.Order.created_at)
    ).all()
    
    return [
        {
            "date": str(sale.date),
            "orders": sale.orders,
            "revenue": float(sale.revenue or 0)
        }
        for sale in daily_sales
    ]

@router.get("/analytics/customer-stats")
def get_customer_stats(
    days: int = 30,
    db: Session = Depends(database.get_db)
):
    """Get customer statistics"""
    from datetime import datetime, timedelta
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Total customers
    total_customers = db.query(models.User).filter(
        models.User.role == models.UserRole.USER
    ).count()
    
    # New customers in period (User model doesn't have created_at)
    new_customers = 0  # db.query(models.User).filter(models.User.created_at >= start_date, models.User.role == models.UserRole.USER).count()
    
    # Active customers (customers who placed orders in period)
    active_customers = db.query(models.User).join(
        models.Order, models.User.id == models.Order.user_id
    ).filter(
        models.Order.created_at >= start_date
    ).distinct().count()
    
    # Top customers by orders
    top_customers = db.query(
        models.User.id,
        models.User.username,
        models.User.email,
        func.count(models.Order.id).label('total_orders'),
        func.sum(models.Order.total_price).label('total_spent')
    ).join(
        models.Order, models.User.id == models.Order.user_id
    ).filter(
        models.Order.created_at >= start_date,
        models.Order.status != OrderStatus.CANCELLED
    ).group_by(
        models.User.id, models.User.username, models.User.email
    ).order_by(
        func.sum(models.Order.total_price).desc()
    ).limit(10).all()
    
    return {
        "total_customers": total_customers,
        "new_customers": new_customers,
        "active_customers": active_customers,
        "customer_retention_rate": (active_customers / total_customers * 100) if total_customers > 0 else 0,
        "top_customers": [
            {
                "id": customer.id,
                "username": customer.username,
                "email": customer.email,
                "total_orders": customer.total_orders,
                "total_spent": float(customer.total_spent or 0)
            }
            for customer in top_customers
        ]
    }

@router.get("/analytics/inventory-stats")
def get_inventory_stats(
    db: Session = Depends(database.get_db)
):
    """Get inventory and product statistics"""
    
    # Total products
    total_products = db.query(models.Product).count()
    
    # Low stock products (quantity < 10)
    low_stock_products = db.query(models.Product).filter(
        models.Product.quantity < 10
    ).count()
    
    # Out of stock products
    out_of_stock_products = db.query(models.Product).filter(
        models.Product.quantity == 0
    ).count()
    
    # Average product price
    avg_product_price = db.query(func.avg(models.Product.price)).scalar() or 0
    
    # Total inventory value
    total_inventory_value = db.query(
        func.sum(models.Product.price * models.Product.quantity)
    ).scalar() or 0
    
    # Products by category (if category field exists)
    products_by_category = {}
    try:
        category_stats = db.query(
            models.Product.category,
            func.count(models.Product.id).label('count')
        ).group_by(models.Product.category).all()
        
        products_by_category = {
            stat.category or 'Uncategorized': stat.count 
            for stat in category_stats
        }
    except:
        # Category field might not exist
        products_by_category = {"All Products": total_products}
    
    return {
        "total_products": total_products,
        "low_stock_products": low_stock_products,
        "out_of_stock_products": out_of_stock_products,
        "average_product_price": float(avg_product_price),
        "total_inventory_value": float(total_inventory_value),
        "products_by_category": products_by_category
    }

# Review Management
@router.get("/reviews")
def list_all_reviews(
    skip: int = 0,
    limit: int = 100,
    is_approved: Optional[bool] = None,
    product_id: Optional[int] = None,
    db: Session = Depends(database.get_db)
):
    """Get all reviews with filtering for admin moderation"""
    
    query = db.query(models.Review)
    
    if is_approved is not None:
        query = query.filter(models.Review.is_approved == is_approved)
    
    if product_id:
        query = query.filter(models.Review.product_id == product_id)
    
    reviews = query.order_by(models.Review.created_at.desc()).offset(skip).limit(limit).all()
    
    # Add user and product info
    for review in reviews:
        user = db.query(models.User).filter(models.User.id == review.user_id).first()
        product = db.query(models.Product).filter(models.Product.id == review.product_id).first()
        
        if user:
            review.user = {"id": user.id, "username": user.username, "email": user.email}
        if product:
            review.product = {"id": product.id, "name": product.name}
    
    return reviews

@router.put("/reviews/{review_id}/approve")
def approve_review(
    review_id: int,
    db: Session = Depends(database.get_db)
):
    """Approve or disapprove a review"""
    
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    review.is_approved = not review.is_approved
    db.commit()
    
    status = "approved" if review.is_approved else "disapproved"
    return {"message": f"Review {status} successfully"}

@router.delete("/reviews/{review_id}")
def delete_review_admin(
    review_id: int,
    db: Session = Depends(database.get_db)
):
    """Delete a review (admin only)"""
    
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    db.delete(review)
    db.commit()
    
    return {"message": "Review deleted successfully"}

@router.get("/reviews/stats")
def get_review_stats(
    db: Session = Depends(database.get_db)
):
    """Get review statistics for admin dashboard"""
    
    total_reviews = db.query(models.Review).count()
    pending_reviews = db.query(models.Review).filter(models.Review.is_approved == False).count()
    approved_reviews = db.query(models.Review).filter(models.Review.is_approved == True).count()
    
    # Average rating across all products
    avg_rating = db.query(func.avg(models.Review.rating)).filter(models.Review.is_approved == True).scalar() or 0
    
    # Most reviewed products
    top_reviewed_products = db.query(
        models.Product.id,
        models.Product.name,
        func.count(models.Review.id).label('review_count'),
        func.avg(models.Review.rating).label('avg_rating')
    ).join(
        models.Review, models.Product.id == models.Review.product_id
    ).filter(
        models.Review.is_approved == True
    ).group_by(
        models.Product.id, models.Product.name
    ).order_by(
        func.count(models.Review.id).desc()
    ).limit(5).all()
    
    return {
        "total_reviews": total_reviews,
        "pending_reviews": pending_reviews,
        "approved_reviews": approved_reviews,
        "average_rating": float(avg_rating),
        "top_reviewed_products": [
            {
                "product_id": p.id,
                "product_name": p.name,
                "review_count": p.review_count,
                "average_rating": float(p.avg_rating)
            }
            for p in top_reviewed_products
        ]
    }
