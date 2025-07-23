

````markdown
## 🛒 E-Commerce API with FastAPI

A simple e-commerce backend built using **FastAPI**, **SQLAlchemy**, and **JWT authentication**. Includes core features like user registration, product management, cart handling, and order placement.

---

## 📦 Features

- 🔐 User authentication (JWT-based)
- 👤 User registration and login
- 📦 Product CRUD operations
- 🛒 Add to Cart, Remove from Cart
- 🧾 Place Orders from Cart
- 📄 Order history and details

---

## 🚀 Getting Started

### ✅ Requirements

- Python 3.9+
- pip
- (Optional) Virtual Environment

---

### ⚙️ Setup

1. **Clone the repo**
    ```bash
    git clone https://github.com/kabirhiking/ecommerce-api.git
    cd ecommerce-api
    ```

2. **Create virtual env & activate**
    ```bash
    python -m venv venv
    source venv/bin/activate      # On Linux/Mac
    venv\Scripts\activate         # On Windows
    ```

3. **Install dependencies**
    ```bash
    pip install -r requirements.txt
    ```

4. **Run the server**
    ```bash
    uvicorn app.main:app --reload
    ```

---

## 📁 Project Structure

````

app/
├── main.py
├── models.py
├── schemas.py
├── crud.py
├── oauth2.py
├── database.py
├── routes/
│   ├── auth.py
│   ├── users.py
│   ├── products.py
│   ├── cart.py
│   └── orders.py

````

---

## 🔑 Authentication

- Uses JWT token-based auth.
- After login, you’ll get `access_token` for all secure requests.

---

## 📬 API Endpoints

### 🔐 Auth
| Method | Endpoint        | Description          |
|--------|------------------|----------------------|
| POST   | `/auth/register` | Register new user    |
| POST   | `/auth/login`    | Login, get token     |

---

### 👤 Users
| Method | Endpoint     | Description      |
|--------|--------------|------------------|
| GET    | `/users/me`  | Get current user |

---

### 📦 Products
| Method | Endpoint        | Description         |
|--------|------------------|---------------------|
| POST   | `/products/`     | Create product      |
| GET    | `/products/`     | List all products   |
| GET    | `/products/{id}` | Get single product  |
| PUT    | `/products/{id}` | Update product      |
| DELETE | `/products/{id}` | Delete product      |

---

### 🛒 Cart
| Method | Endpoint         | Description          |
|--------|------------------|----------------------|
| GET    | `/cart/`         | View cart items      |
| POST   | `/cart/`         | Add item to cart     |
| DELETE | `/cart/{item_id}`| Remove item from cart|

---

### 🧾 Orders
| Method | Endpoint           | Description         |
|--------|--------------------|---------------------|
| POST   | `/orders/`         | Place an order      |
| GET    | `/orders/`         | List user's orders  |
| GET    | `/orders/{id}`     | Get order details   |

---

## ⚠️ .ENV Example (Optional)

If you want to use custom DB or JWT secret:

```env
DATABASE_URL=sqlite:///./ecommerce.db
SECRET_KEY=your_jwt_secret
````

---

## Screenshots

![alt text](image/shot.png)


---

---

## 🛠 Tech Stack

* FastAPI
* SQLAlchemy
* SQLite (default, can switch)
* JWT Auth (via `python-jose`)
* Pydantic

---

## 📫 Contact

Made with ❤️ by \[Raihan Kabir]
Email: kabirraihan249@gmail.com
GitHub: [@kabirhiking](https://github.com/kabirhiking)

---
