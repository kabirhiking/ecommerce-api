from fastapi import FastAPI
from app import models, database
from app.routes import auth, users, products, orders, cart

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="E-Commerce API", version="1.0.0")


app.include_router(auth.router)

app.include_router(products.router)
app.include_router(orders.router)
app.include_router(cart.router)
app.include_router(products.router)

