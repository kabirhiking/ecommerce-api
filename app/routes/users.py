from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, crud, database
from typing import List

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/", response_model=List[schemas.UserOut])
def list_users(db: Session = Depends(database.get_db)):
    return crud.get_all_users(db)

@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user(user_id: int, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(database.get_db)):
    deleted = crud.delete_user(db, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User deleted successfully"}
