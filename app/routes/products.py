from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app import schemas, crud, database
from typing import List, Optional
import os
import uuid
from pathlib import Path

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)

@router.post("/", response_model=schemas.ProductOut)
def create_product(product: schemas.ProductCreate, db: Session = Depends(database.get_db)):
    return crud.create_product(db, product)

@router.post("/with-image/", response_model=schemas.ProductOut)
async def create_product_with_image(
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    quantity: int = Form(...),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(database.get_db)
):
    """Create a product with an optional image upload"""
    
    image_url = None
    
    if image:
        # Validate file type
        allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
        file_extension = Path(image.filename).suffix.lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        # Validate file size (max 5MB)
        file_content = await image.read()
        if len(file_content) > 5 * 1024 * 1024:  # 5MB
            raise HTTPException(status_code=400, detail="File too large. Max size is 5MB")
        
        # Create uploads directory if it doesn't exist
        upload_dir = Path("uploads/products")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = upload_dir / unique_filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
        
        # Set image URL
        image_url = f"/uploads/products/{unique_filename}"
    
    # Create product
    product_data = schemas.ProductCreate(
        name=name,
        description=description,
        price=price,
        quantity=quantity,
        image=image_url
    )
    
    return crud.create_product(db, product_data)

@router.get("/", response_model=List[schemas.ProductOut])
def list_products(db: Session = Depends(database.get_db)):
    return crud.get_all_products(db)

@router.get("/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(database.get_db)):
    db_product = crud.get_product_by_id(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.put("/{product_id}", response_model=schemas.ProductOut)
def update_product(product_id: int, product: schemas.ProductCreate, db: Session = Depends(database.get_db)):
    db_product = crud.update_product(db, product_id, product)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.put("/{product_id}/image", response_model=schemas.ProductOut)
async def update_product_image(
    product_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(database.get_db)
):
    """Update a product's image"""
    
    # Check if product exists
    db_product = crud.get_product_by_id(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Validate file type
    allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    file_extension = Path(image.filename).suffix.lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    # Validate file size (max 5MB)
    file_content = await image.read()
    if len(file_content) > 5 * 1024 * 1024:  # 5MB
        raise HTTPException(status_code=400, detail="File too large. Max size is 5MB")
    
    # Create uploads directory if it doesn't exist
    upload_dir = Path("uploads/products")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Delete old image if it exists
    if db_product.image:
        old_image_path = Path(db_product.image.lstrip('/'))
        if old_image_path.exists():
            try:
                os.remove(old_image_path)
            except:
                pass  # Continue even if deletion fails
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = upload_dir / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)
    
    # Update product image URL
    image_url = f"/uploads/products/{unique_filename}"
    
    # Update product in database
    product_data = schemas.ProductCreate(
        name=db_product.name,
        description=db_product.description,
        price=db_product.price,
        quantity=db_product.quantity,
        image=image_url
    )
    
    return crud.update_product(db, product_id, product_data)

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(database.get_db)):
    deleted = crud.delete_product(db, product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"detail": "Product deleted successfully"}
