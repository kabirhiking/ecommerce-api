import sqlite3
import os

# Path to the database
db_path = "ecommerce.db"

# Connect to the database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if image column already exists
    cursor.execute("PRAGMA table_info(products)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'image' not in columns:
        # Add the image column
        cursor.execute("ALTER TABLE products ADD COLUMN image TEXT")
        print("Added image column to products table")
    else:
        print("Image column already exists")
    
    # Commit the changes
    conn.commit()
    
    # Now add sample images to existing products
    cursor.execute("SELECT id, name FROM products")
    products = cursor.fetchall()
    
    sample_images = [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1558618844-fcd25c85cd64?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1609592806416-b1ff7a6856d8?w=400&h=400&fit=crop"
    ]
    
    if products:
        print(f"Found {len(products)} existing products")
        for i, (product_id, name) in enumerate(products):
            image_url = sample_images[i % len(sample_images)]
            cursor.execute("UPDATE products SET image = ? WHERE id = ?", (image_url, product_id))
            print(f"Updated {name} with image")
        conn.commit()
        print("Updated all products with images")
    else:
        # If no products exist, create sample products
        sample_products = [
            ("Wireless Bluetooth Headphones", "High-quality wireless headphones with noise cancellation", 99.99, 50, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"),
            ("Smart Watch", "Feature-rich smartwatch with fitness tracking", 199.99, 30, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop"),
            ("Laptop Backpack", "Durable laptop backpack with multiple compartments", 49.99, 100, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop"),
            ("Wireless Mouse", "Ergonomic wireless mouse with precision tracking", 29.99, 75, "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop"),
            ("USB-C Cable", "High-speed USB-C cable for charging and data transfer", 14.99, 200, "https://images.unsplash.com/photo-1558618844-fcd25c85cd64?w=400&h=400&fit=crop"),
            ("Portable Charger", "10000mAh portable power bank with fast charging", 39.99, 60, "https://images.unsplash.com/photo-1609592806416-b1ff7a6856d8?w=400&h=400&fit=crop")
        ]
        
        for name, desc, price, qty, image in sample_products:
            cursor.execute(
                "INSERT INTO products (name, description, price, quantity, image) VALUES (?, ?, ?, ?, ?)",
                (name, desc, price, qty, image)
            )
        
        conn.commit()
        print(f"Created {len(sample_products)} sample products with images")
    
    # Show all products
    cursor.execute("SELECT id, name, image FROM products")
    all_products = cursor.fetchall()
    print("\nCurrent products:")
    for product_id, name, image in all_products:
        print(f"- {name}: {image[:50]}...")

except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
