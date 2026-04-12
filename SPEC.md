# 3D Print Marketplace - Technical Specification

## Overview
A modern web platform for buying and selling 3D printed objects, combining Etsy's marketplace model with Thingiverse's 3D focus.

## Tech Stack

### Frontend
- Angular 17+ (TypeScript, standalone components)
- Angular Material (UI components)
- Angular Router (routing)
- RxJS (reactive programming)
- Three.js (@types/three for 3D model preview)
- JWT interceptor for auth

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcrypt for password hashing
- multer for file uploads
- Stripe SDK for payments

## Project Structure

```
filatrix/
├── backend/                 # Express.js API
│   ├── config/             # Database, JWT config
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Auth, error handling, upload
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API route definitions
│   ├── uploads/           # Uploaded files (gitignored)
│   └── server.js          # Entry point
│
└── frontend/               # Angular application
    └── src/
        ├── app/
        │   ├── core/           # Guards, interceptors, services
        │   ├── shared/         # Shared components, pipes, directives
        │   ├── features/       # Feature modules
        │   │   ├── auth/       # Login, register
        │   │   ├── marketplace/ # Browse, product details
        │   │   ├── cart/        # Shopping cart
        │   │   ├── orders/      # Order history
        │   │   ├── seller/      # Seller dashboard
        │   │   ├── admin/       # Admin panel
        │   │   └── wishlist/    # Wishlist feature
        │   └── app.config.ts    # App configuration
        ├── assets/
        └── styles.scss
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/profile - Get current user profile
- PUT /api/auth/profile - Update profile

### Products
- GET /api/products - List all products (with pagination, filters)
- GET /api/products/:id - Get single product
- POST /api/products - Create product (seller only)
- PUT /api/products/:id - Update product (owner only)
- DELETE /api/products/:id - Delete product (owner only)
- GET /api/products/user/:userId - Get user's products

### Orders
- POST /api/orders - Create order
- GET /api/orders - Get user's orders
- GET /api/orders/:id - Get order details
- PUT /api/orders/:id/status - Update order status (admin/seller)

### Cart
- GET /api/cart - Get user's cart
- POST /api/cart - Add item to cart
- PUT /api/cart/:itemId - Update cart item
- DELETE /api/cart/:itemId - Remove from cart

### Reviews
- POST /api/products/:id/reviews - Add review
- GET /api/products/:id/reviews - Get product reviews

### Wishlist
- GET /api/wishlist - Get user's wishlist
- POST /api/wishlist - Add to wishlist
- DELETE /api/wishlist/:productId - Remove from wishlist

## Data Models

### User
- email, password (hashed)
- name, avatar
- role (buyer/seller/admin)
- createdAt, updatedAt

### Product
- title, description
- price, tags
- modelFile (STL/OBJ path)
- previewImages[]
- seller (ref to User)
- status (pending/approved/rejected)
- createdAt, updatedAt

### Order
- buyer (ref to User)
- items [{product, quantity, price}]
- totalAmount
- status (pending/paid/shipped/delivered)
- shippingAddress
- createdAt

### Cart
- user (ref to User)
- items [{product, quantity}]
- updatedAt

### Review
- product (ref to Product)
- user (ref to User)
- rating (1-5)
- comment
- createdAt

## Security
- JWT tokens with 7-day expiry
- Password hashing with bcrypt (10 rounds)
- File download protection (signed URLs post-purchase)
- Input validation on all endpoints
- CORS configuration

## Deployment Strategy
- Frontend: Vercel/Netlify (Angular build)
- Backend: Render/Railway (Node.js)
- Database: MongoDB Atlas (free tier)
- Files: Cloud storage (AWS S3 / Cloudinary)