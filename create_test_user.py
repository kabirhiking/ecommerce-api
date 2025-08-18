#!/usr/bin/env python3

from app.database import SessionLocal
from app import models, auth

def create_test_user():
    db = SessionLocal()
    try:
        # Check if test user already exists
        existing_user = db.query(models.User).filter(models.User.username == "testuser").first()
        if existing_user:
            print("Test user already exists")
            return
            
        # Create a new test user
        hashed_password = auth.hash_password("testpass123")
        
        new_user = models.User(
            username="testuser",
            email="test@example.com",
            hashed_password=hashed_password,
            role=models.UserRole.USER,
            is_active=True
        )
        
        db.add(new_user)
        db.commit()
        
        print("✅ Test user created successfully!")
        print("Username: testuser")
        print("Password: testpass123")
        
    except Exception as e:
        print(f"Error creating user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()
