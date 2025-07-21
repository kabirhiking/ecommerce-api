from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, crud, database
from typing import List


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)

@router.post("/", response_model=schemas.ProductOut)
def create_product(product: schemas.ProductCreate, db: Session= Depends(database.sessionlocal)):
    return crud.create_product(db, product)

@router.get("/", response_model=list[schemas.ProductOut])
def list_products(db: Session = Depends(database.sessionlocal)):
    return crud.get_all_products(db)

@router.put("/{product_id}", response_model=schemas.ProductOut)
def update_product(product_id: int, product: schemas.ProductCreate, db: Session=Depends(database.sessionlocal)):
    db_product = crud.update_product(db, product_id, product)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(database.sessionlocal)):
    delteted = crud.delete_product(db, product_id)
    if not delteted:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"detail": "Product deleted successfully"}
