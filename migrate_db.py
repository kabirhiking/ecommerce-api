#!/usr/bin/env python3
"""
Database Migration Script for Admin Panel
This script adds new columns to existing tables to support the admin panel features.
Run this after updating the models to add new fields.
"""

import sqlite3
import sys
from pathlib import Path

# Database path
DB_PATH = Path(__file__).parent / "ecommerce.db"

def run_migration():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        print("🔄 Running database migration...")
        
        # Add new columns to users table
        print("📝 Adding new columns to users table...")
        
        user_columns = [
            ("role", "VARCHAR DEFAULT 'user'"),
            ("is_active", "BOOLEAN DEFAULT 1"),
            ("created_at", "DATETIME DEFAULT CURRENT_TIMESTAMP"),
            ("updated_at", "DATETIME"),
            ("first_name", "VARCHAR"),
            ("last_name", "VARCHAR"),
            ("phone", "VARCHAR"),
            ("address", "VARCHAR")
        ]
        
        for column_name, column_def in user_columns:
            try:
                cursor.execute(f"ALTER TABLE users ADD COLUMN {column_name} {column_def}")
                print(f"  ✅ Added {column_name} to users table")
            except sqlite3.OperationalError as e:
                if "duplicate column name" in str(e):
                    print(f"  ⚠️  Column {column_name} already exists in users table")
                else:
                    print(f"  ❌ Error adding {column_name}: {e}")
        
        # Add new columns to products table
        print("📝 Adding new columns to products table...")
        
        product_columns = [
            ("category", "VARCHAR"),
            ("sku", "VARCHAR"),
            ("is_active", "BOOLEAN DEFAULT 1"),
            ("created_at", "DATETIME DEFAULT CURRENT_TIMESTAMP"),
            ("updated_at", "DATETIME")
        ]
        
        for column_name, column_def in product_columns:
            try:
                cursor.execute(f"ALTER TABLE products ADD COLUMN {column_name} {column_def}")
                print(f"  ✅ Added {column_name} to products table")
            except sqlite3.OperationalError as e:
                if "duplicate column name" in str(e):
                    print(f"  ⚠️  Column {column_name} already exists in products table")
                else:
                    print(f"  ❌ Error adding {column_name}: {e}")
        
        # Add new columns to orders table
        print("📝 Adding new columns to orders table...")
        
        order_columns = [
            ("status", "VARCHAR DEFAULT 'pending'"),
            ("shipping_address", "VARCHAR"),
            ("created_at", "DATETIME DEFAULT CURRENT_TIMESTAMP"),
            ("updated_at", "DATETIME")
        ]
        
        for column_name, column_def in order_columns:
            try:
                cursor.execute(f"ALTER TABLE orders ADD COLUMN {column_name} {column_def}")
                print(f"  ✅ Added {column_name} to orders table")
            except sqlite3.OperationalError as e:
                if "duplicate column name" in str(e):
                    print(f"  ⚠️  Column {column_name} already exists in orders table")
                else:
                    print(f"  ❌ Error adding {column_name}: {e}")
        
        # Create admin user if it doesn't exist
        print("👤 Creating default admin user...")
        
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        admin_exists = cursor.fetchone()
        
        if not admin_exists:
            # Hash password for admin (password: admin123)
            from passlib.context import CryptContext
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            hashed_password = pwd_context.hash("admin123")
            
            cursor.execute("""
                INSERT INTO users (username, email, hashed_password, role, is_active, first_name, last_name)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, ("admin", "admin@example.com", hashed_password, "super_admin", True, "Admin", "User"))
            
            print("  ✅ Created default admin user")
            print("     Username: admin")
            print("     Password: admin123")
            print("     Email: admin@example.com")
            print("     ⚠️  Please change the default password after first login!")
        else:
            print("  ⚠️  Admin user already exists")
        
        conn.commit()
        print("\n✅ Migration completed successfully!")
        print("\n📋 Summary:")
        print("   - Added role-based authentication fields to users table")
        print("   - Added category and tracking fields to products table")
        print("   - Added status and shipping fields to orders table")
        print("   - Created default admin user (if not exists)")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    print("🚀 E-Commerce Admin Panel Migration")
    print("=" * 40)
    
    if not DB_PATH.exists():
        print(f"❌ Database file not found: {DB_PATH}")
        print("Please run your FastAPI application first to create the database.")
        sys.exit(1)
    
    run_migration()
    
    print("\n🎉 Migration complete! You can now:")
    print("   1. Restart your FastAPI server")
    print("   2. Login with admin credentials")
    print("   3. Access the admin panel at /admin")
