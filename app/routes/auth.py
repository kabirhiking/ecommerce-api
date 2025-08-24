# app/routes/auth.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import schemas, crud, database, auth, models
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

#  Register new user
@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_username(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed_password = auth.hash_password(user.password)
    return crud.create_user(db, user, hashed_password)

#  Login user
@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = crud.get_user_by_username(db, form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

#  Get current user
@router.get("/me")
def get_current_user_info(current_user: models.User = Depends(auth.get_current_user)):
    user_data = {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "phone": current_user.phone,
        "address": current_user.address,
        # Computed fields
        "full_name": f"{current_user.first_name or ''} {current_user.last_name or ''}".strip(),
        "mobile": current_user.phone
    }
    return user_data

#  Get current user profile (alias for /me)
@router.get("/profile")
def get_current_user_profile(current_user: models.User = Depends(auth.get_current_user)):
    user_data = {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "phone": current_user.phone,
        "address": current_user.address,
        # Computed fields
        "full_name": f"{current_user.first_name or ''} {current_user.last_name or ''}".strip(),
        "mobile": current_user.phone
    }
    return user_data

#  Update current user profile
@router.put("/profile")
def update_current_user_profile(
    profile_update: schemas.ProfileUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    try:
        print(f"Profile update received: {profile_update}")
        
        # Convert ProfileUpdate to UserUpdate
        user_update_data = {}
        
        if profile_update.email is not None:
            user_update_data['email'] = profile_update.email
        
        if profile_update.full_name is not None:
            # Split full_name into first_name and last_name
            name_parts = profile_update.full_name.strip().split(' ', 1)
            if len(name_parts) >= 1:
                user_update_data['first_name'] = name_parts[0]
            if len(name_parts) >= 2:
                user_update_data['last_name'] = name_parts[1]
            else:
                user_update_data['last_name'] = None
                
        if profile_update.mobile is not None:
            user_update_data['phone'] = profile_update.mobile
        
        print(f"User update data: {user_update_data}")
        
        user_update = schemas.UserUpdate(**user_update_data)
        updated_user = crud.update_user(db, current_user.id, user_update)
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Return user data with computed fields
        user_data = {
            "id": updated_user.id,
            "username": updated_user.username,
            "email": updated_user.email,
            "role": updated_user.role,
            "is_active": updated_user.is_active,
            "first_name": updated_user.first_name,
            "last_name": updated_user.last_name,
            "phone": updated_user.phone,
            "address": updated_user.address,
            # Computed fields
            "full_name": f"{updated_user.first_name or ''} {updated_user.last_name or ''}".strip(),
            "mobile": updated_user.phone
        }
        return user_data
    except Exception as e:
        print(f"Error updating profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

#  Get user profile statistics
@router.get("/profile/stats")
def get_user_profile_stats(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # Get total orders count
    total_orders = db.query(models.Order).filter(models.Order.user_id == current_user.id).count()
    
    # Get total spent
    total_spent = db.query(func.sum(models.Order.total_price)).filter(
        models.Order.user_id == current_user.id,
        models.Order.status.in_(['delivered', 'processing', 'shipped'])
    ).scalar() or 0.0
    
    # Get reviews count
    reviews_given = db.query(models.Review).filter(models.Review.user_id == current_user.id).count()
    
    return {
        "total_orders": total_orders,
        "total_spent": round(total_spent, 2),
        "reviews_given": reviews_given
    }
