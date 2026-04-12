# Filatrix - 3D Print Marketplace

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Angular CLI 17+

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Edit .env with your MongoDB URI
npm run dev
```

Backend runs on http://localhost:5000

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on http://localhost:4200

## Project Structure

```
filatrix/
├── backend/           # Express.js API
│   ├── config/       # Database & config
│   ├── controllers/  # Route handlers
│   ├── middleware/   # Auth, error handling, uploads
│   ├── models/       # Mongoose schemas
│   ├── routes/      # API routes
│   └── server.js    # Entry point
│
└── frontend/          # Angular 17 app
    └── src/
        ├── app/
        │   ├── core/        # Guards, interceptors, services
        │   ├── features/    # Feature modules
        │   └── shared/      # Models, shared components
        └── styles.scss
```

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/filatrix
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
FRONTEND_URL=http://localhost:4200
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register user
- POST /api/auth/login - Login user
- GET /api/auth/profile - Get profile

### Products
- GET /api/products - List products (with filters)
- GET /api/products/:id - Get product details
- POST /api/products - Create product (seller)
- PUT /api/products/:id - Update product
- DELETE /api/products/:id - Delete product

### Cart
- GET /api/cart - Get cart
- POST /api/cart - Add to cart
- PUT /api/cart/:itemId - Update quantity
- DELETE /api/cart/:itemId - Remove item

### Orders
- POST /api/orders - Create order
- GET /api/orders - Get user orders
- GET /api/orders/:id - Get order details

## Demo Accounts

Create your own account via /auth/register:
- Buyers browse and purchase
- Sellers can list products
- Admin role can be set manually in database

## Deployment

### Backend
- Render.com / Railway / Heroku
- Set environment variables

### Frontend
- Vercel / Netlify
- Build: npm run build
- Output: dist/filatrix

### Database
- MongoDB Atlas (free tier)

## Features

- JWT Authentication
- Role-based access (Buyer/Seller/Admin)
- Product management with image uploads
- Shopping cart
- Order processing
- Wishlist
- Reviews & ratings
- Seller dashboard
- Admin panel