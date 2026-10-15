# 🛍️ ShopKart — Full-Stack MERN E-Commerce Platform

A production-grade, end-to-end MERN e-commerce application built strictly adhering to MVC architecture for the backend and component-driven React architecture for the frontend.

---

## 🚀 Tech Stack

- **Backend:** Node.js, Express.js (ES Modules `"type": "module"`), MongoDB & Mongoose
- **Authentication:** `bcryptjs`, `jsonwebtoken` (stored exclusively in `HttpOnly`, `SameSite=Lax` cookies), `cookie-parser`
- **Payments:** Razorpay Node SDK (`razorpay`) with HMAC SHA-256 signature verification pipeline
- **Frontend:** React (Vite), React Router DOM v6, Axios, React Context API (`AuthContext`, `CartContext`), Tailwind CSS, Lucide React

---

## 📁 Monorepo Layout

```text
shopkart/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── razorpay.js
│   ├── controllers/
│   │   ├── customer.controller.js
│   │   ├── product.controller.js
│   │   ├── wishlist.controller.js
│   │   ├── cart.controller.js
│   │   └── order.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── customer.model.js
│   │   ├── product.model.js
│   │   └── order.model.js
│   ├── routes/
│   │   ├── customer.routes.js
│   │   ├── product.routes.js
│   │   ├── wishlist.routes.js
│   │   ├── cart.routes.js
│   │   └── order.routes.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── index.js
│   ├── seed.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProductCard.jsx
    │   │   ├── CartItem.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── UIState.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── CartContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Home.jsx
    │   │   ├── Products.jsx
    │   │   ├── ProductDetails.jsx
    │   │   ├── Wishlist.jsx
    │   │   ├── Cart.jsx
    │   │   ├── Checkout.jsx
    │   │   ├── OrderSuccess.jsx
    │   │   └── Orders.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## ⚡ Quick Start Guide

### 1. Backend Setup

```bash
cd backend
npm install

# Seed the database with catalog products and a demo user
npm run seed

# Start development server on http://localhost:5000
npm run dev
```

### 2. Frontend Setup

In a new terminal:

```bash
cd frontend
npm install

# Start Vite development server on http://localhost:5173
npm run dev
```

---

## 🔑 Default Credentials & Quick Login

- **Email:** `johndoe@example.com`
- **Password:** `password123`
- *(Or click the **"⚡ Use Demo Account"** button on the Login page)*

---

## 💳 Razorpay Test Checkout

1. Shop products and add them to your cart.
2. Proceed to `/checkout`.
3. You can either use the **Razorpay Modal** or the **"⚡ Instant Test Mode Verification"** simulation to confirm orders and verify signatures.
4. On verification, stock is deducted in real-time, cart is cleared, and immutable order snapshots are saved.
