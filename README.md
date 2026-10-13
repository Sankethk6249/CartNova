# CartNova


# E-commerce Store

Full-stack e-commerce platform: product browsing, cart, checkout (Cash on Delivery), order management, user authentication and an admin dashboard.

Developed by **Sanketh Kumar**.

## Tech Stack
- Front-End: HTML/CSS, JavaScript (React + Vite)
- Back-End: Node.js, Express
- Database: MongoDB (Mongoose) for products, users and orders
- Auth: JWT + bcrypt, role-based access (user / admin)

## Features
- Public register / login
- Browse, search and filter products
- Cart (persisted), checkout, order history
- Admin: add / edit / delete products, view all orders, update order status
- Server-side price calculation and stock validation

## Setup
### Server
cd server
npm install
cp .env.example .env   (fill values)
npm run seed           (creates admin + sample products)
npm run dev

### Client
cd client
npm install
npm run dev

Open http://localhost:5173
