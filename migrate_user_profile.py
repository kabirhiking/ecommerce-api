#!/usr/bin/env python3
"""
Migration script to add user profile fields and Address table
"""

import sqlite3
from pathlib import Path

def migrate_database():
    """Add new columns to users table and create addresses table"""
    
    # Database file path
    db_path = Path("ecommerce.db")
    
    if not db_path.exists():
        print(f"Database file {db_path} does not exist!")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("Starting migration...")
        
        # Check if columns already exist in users table
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Add new columns to users table if they don't exist
        new_columns = [
            ("full_name", "VARCHAR"),
            ("mobile_no", "VARCHAR")
        ]
        
        for column_name, column_type in new_columns:
            if column_name not in columns:
                print(f"Adding column {column_name} to users table...")
                cursor.execute(f"ALTER TABLE users ADD COLUMN {column_name} {column_type}")
            else:
                print(f"Column {column_name} already exists in users table")
        
        # Check if addresses table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='addresses'")
        addresses_table_exists = cursor.fetchone() is not None
        
        if not addresses_table_exists:
            print("Creating addresses table...")
            cursor.execute("""
                CREATE TABLE addresses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    full_name VARCHAR NOT NULL,
                    address VARCHAR NOT NULL,
                    postcode VARCHAR NOT NULL,
                    phone_number VARCHAR NOT NULL,
                    is_default BOOLEAN DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
        else:
            print("Addresses table already exists")
        
        # Commit changes
        conn.commit()
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
    
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()
