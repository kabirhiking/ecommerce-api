# app/routes/auth.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, crud, database, auth
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
@router.get("/me", response_model=schemas.UserOut)
def get_current_user(current_username: str = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    user = crud.get_user_by_username(db, current_username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
