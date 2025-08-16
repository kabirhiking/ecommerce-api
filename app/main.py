from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app import models, database
from app.routes import auth, users, products, orders, cart, uploads, admin
from pathlib import Path

# models.Base.metadata.create_all(bind=database.engine)  # Commented out - using existing DB

app = FastAPI(title="E-Commerce API", version="1.0.0")

# Add the CORS middleware to your app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Allow requests from any origin (dangerous for prod!)
    allow_credentials=True,    # Allow sending cookies/auth headers
    allow_methods=["*"],        # Allow all HTTP methods: GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],        # Allow all custom headers from the client
)

# Create uploads directory if it doesn't exist
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)

# Include all routers first
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(cart.router)
app.include_router(uploads.router)
app.include_router(admin.router)

# Mount static files for serving uploaded images (after routers)
app.mount("/static", StaticFiles(directory="uploads"), name="static")




@app.get("/")
def read_root():
    return {"message": "Welcome to the E--Commerce API"}



