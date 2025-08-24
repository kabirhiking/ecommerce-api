from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import crud, schemas, database
from ..auth import get_current_user

router = APIRouter()


@router.get("", response_model=List[schemas.AddressOut])
def get_addresses(
    current_user: schemas.UserOut = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Get all addresses for the current user"""
    addresses = crud.get_user_addresses(db=db, user_id=current_user.id)
    return addresses


@router.post("", response_model=schemas.AddressOut)
def create_address(
    address: schemas.AddressCreate,
    current_user: schemas.UserOut = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Create a new address for the current user"""
    return crud.create_address(db=db, user_id=current_user.id, address=address)


@router.get("/{address_id}", response_model=schemas.AddressOut)
def get_address(
    address_id: int,
    current_user: schemas.UserOut = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Get a specific address by ID"""
    address = crud.get_address_by_id(db=db, address_id=address_id, user_id=current_user.id)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    return address


@router.put("/{address_id}", response_model=schemas.AddressOut)
def update_address(
    address_id: int,
    address: schemas.AddressUpdate,
    current_user: schemas.UserOut = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Update a specific address"""
    db_address = crud.update_address(
        db=db, address_id=address_id, user_id=current_user.id, address=address
    )
    if not db_address:
        raise HTTPException(status_code=404, detail="Address not found")
    return db_address


@router.delete("/{address_id}")
def delete_address(
    address_id: int,
    current_user: schemas.UserOut = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    """Delete a specific address"""
    success = crud.delete_address(db=db, address_id=address_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Address not found")
    return {"message": "Address deleted successfully"}
