from app.database import get_db, engine
from app.models import Product, Base
from sqlalchemy.orm import sessionmaker

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# Check existing products
existing_products = db.query(Product).all()
print(f"Found {len(existing_products)} existing products")

# If no products exist, add some sample products with images
if len(existing_products) == 0:
    sample_products = [
        {
            "name": "Wireless Bluetooth Headphones",
            "description": "High-quality wireless headphones with noise cancellation",
            "price": 99.99,
            "quantity": 50,
            "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"
        },
        {
            "name": "Smart Watch",
            "description": "Feature-rich smartwatch with fitness tracking",
            "price": 199.99,
            "quantity": 30,
            "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop"
        },
        {
            "name": "Laptop Backpack",
            "description": "Durable laptop backpack with multiple compartments",
            "price": 49.99,
            "quantity": 100,
            "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop"
        },
        {
            "name": "Wireless Mouse",
            "description": "Ergonomic wireless mouse with precision tracking",
            "price": 29.99,
            "quantity": 75,
            "image": "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop"
        },
        {
            "name": "USB-C Cable",
            "description": "High-speed USB-C cable for charging and data transfer",
            "price": 14.99,
            "quantity": 200,
            "image": "https://images.unsplash.com/photo-1558618844-fcd25c85cd64?w=400&h=400&fit=crop"
        },
        {
            "name": "Portable Charger",
            "description": "10000mAh portable power bank with fast charging",
            "price": 39.99,
            "quantity": 60,
            "image": "https://images.unsplash.com/photo-1609592806416-b1ff7a6856d8?w=400&h=400&fit=crop"
        }
    ]
    
    for product_data in sample_products:
        product = Product(**product_data)
        db.add(product)
    
    db.commit()
    print(f"Added {len(sample_products)} sample products with images")
else:
    # Update existing products with images if they don't have them
    updated_count = 0
    sample_images = [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1558618844-fcd25c85cd64?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1609592806416-b1ff7a6856d8?w=400&h=400&fit=crop"
    ]
    
    for i, product in enumerate(existing_products):
        if not product.image:
            product.image = sample_images[i % len(sample_images)]
            updated_count += 1
    
    if updated_count > 0:
        db.commit()
        print(f"Updated {updated_count} existing products with images")
    else:
        print("All existing products already have images")

# List all products
products = db.query(Product).all()
print("\nCurrent products:")
for product in products:
    print(f"- {product.name}: ${product.price} (Image: {product.image[:50]}...)")

db.close()
