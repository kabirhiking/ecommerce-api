from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app import models, database
from app.routes import auth, users, products, orders, cart, uploads, admin, reviews, addresses
from pathlib import Path

# models.Base.metadata.create_all(bind=database.engine)  # Commented out - using existing DB

app = FastAPI(title="E-Commerce API", version="1.0.0")

# Add the CORS middleware to your app
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:5174",  # Vite dev server (alternate port)
        "http://127.0.0.1:5173",  # Alternative localhost
        "http://127.0.0.1:5174",  # Alternative localhost
        "http://localhost:3000",  # Common React dev server
        "*"  # Allow all origins for development
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)

# Mount static files for serving uploaded images
app.mount("/static", StaticFiles(directory="uploads"), name="static")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(cart.router)
app.include_router(uploads.router)
app.include_router(admin.router)
app.include_router(reviews.router)
app.include_router(addresses.router, prefix="/api/addresses", tags=["addresses"])




@app.get("/")
def read_root():
    return {"message": "Welcome to the E--Commerce API"}



