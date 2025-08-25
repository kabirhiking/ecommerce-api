from app import models, database

# Create all tables
models.Base.metadata.create_all(bind=database.engine)

print("Database migration completed successfully!")
print("Address table has been created.")
