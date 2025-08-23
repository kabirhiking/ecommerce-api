# app/routes/reviews.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from typing import List, Optional
from app import schemas, database, auth, models
from app.models import Review, Product, User

router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)

@router.post("/", response_model=schemas.ReviewOut)
def create_review(
    review_data: schemas.ReviewCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Create a new product review"""
    
    # Check if product exists
    product = db.query(models.Product).filter(models.Product.id == review_data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if user already reviewed this product
    existing_review = db.query(models.Review).filter(
        models.Review.user_id == current_user.id,
        models.Review.product_id == review_data.product_id
    ).first()
    
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this product")
    
    # Create new review
    review = models.Review(
        user_id=current_user.id,
        product_id=review_data.product_id,
        rating=review_data.rating,
        title=review_data.title,
        comment=review_data.comment
    )
    
    db.add(review)
    db.commit()
    db.refresh(review)
    
    # Return proper response format
    return {
        "id": review.id,
        "user_id": review.user_id,
        "product_id": review.product_id,
        "rating": review.rating,
        "title": review.title,
        "comment": review.comment,
        "is_approved": review.is_approved,
        "created_at": review.created_at,
        "updated_at": review.updated_at,
        "user": {
            "id": current_user.id,
            "username": current_user.username
        }
    }

@router.get("/product/{product_id}", response_model=List[schemas.ReviewOut])
def get_product_reviews(
    product_id: int,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(database.get_db)
):
    """Get all reviews for a specific product"""
    
    try:
        # Check if product exists
        product = db.query(models.Product).filter(models.Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Get reviews with user information
        reviews = db.query(models.Review).filter(
            models.Review.product_id == product_id,
            models.Review.is_approved == True
        ).order_by(desc(models.Review.created_at)).offset(skip).limit(limit).all()
        
        # Convert to response format with user info
        reviews_response = []
        for review in reviews:
            user = db.query(models.User).filter(models.User.id == review.user_id).first()
            
            # Create response dict manually to avoid SQLAlchemy conflicts
            review_dict = {
                "id": review.id,
                "user_id": review.user_id,
                "product_id": review.product_id,
                "rating": review.rating,
                "title": review.title,
                "comment": review.comment,
                "is_approved": review.is_approved,
                "created_at": review.created_at,
                "updated_at": review.updated_at,
                "user": {
                    "id": user.id,
                    "username": user.username
                } if user else None
            }
            reviews_response.append(review_dict)
        
        return reviews_response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/product/{product_id}/summary", response_model=schemas.ProductReviewSummary)
def get_product_review_summary(
    product_id: int,
    db: Session = Depends(database.get_db)
):
    """Get review summary for a product (average rating, total reviews, etc.)"""
    
    try:
        # Check if product exists
        product = db.query(models.Product).filter(models.Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Get total reviews and average rating
        stats = db.query(
            func.count(models.Review.id).label('total_reviews'),
            func.avg(models.Review.rating).label('average_rating')
        ).filter(
            models.Review.product_id == product_id,
            models.Review.is_approved == True
        ).first()
        
        total_reviews = stats.total_reviews or 0
        average_rating = float(stats.average_rating or 0)
        
        # Get rating distribution
        rating_distribution = {}
        for rating in range(1, 6):
            count = db.query(models.Review).filter(
                models.Review.product_id == product_id,
                models.Review.rating == rating,
                models.Review.is_approved == True
            ).count()
            rating_distribution[str(rating)] = count
        
        summary = schemas.ProductReviewSummary(
            product_id=product_id,
            total_reviews=total_reviews,
            average_rating=average_rating,
            rating_distribution=rating_distribution
        )
        
        return summary
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.put("/{review_id}", response_model=schemas.ReviewOut)
def update_review(
    review_id: int,
    review_data: schemas.ReviewUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Update a review (only by the review author)"""
    
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    # Check if user owns this review
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this review")
    
    # Update fields
    for field, value in review_data.dict(exclude_unset=True).items():
        setattr(review, field, value)
    
    db.commit()
    db.refresh(review)
    
    # Add user info to response
    review.user = {
        "id": current_user.id,
        "username": current_user.username
    }
    
    return review

@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Delete a review (only by the review author)"""
    
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    # Check if user owns this review
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this review")
    
    db.delete(review)
    db.commit()
    
    return {"message": "Review deleted successfully"}

@router.get("/user/my-reviews", response_model=List[schemas.ReviewOut])
def get_user_reviews(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get all reviews by the current user"""
    
    reviews = db.query(models.Review).filter(
        models.Review.user_id == current_user.id
    ).order_by(desc(models.Review.created_at)).offset(skip).limit(limit).all()
    
    # Add user and product info
    for review in reviews:
        review.user = {
            "id": current_user.id,
            "username": current_user.username
        }
        product = db.query(models.Product).filter(models.Product.id == review.product_id).first()
        if product:
            review.product = {
                "id": product.id,
                "name": product.name
            }
    
    return reviews
