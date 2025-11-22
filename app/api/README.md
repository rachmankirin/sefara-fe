# Glow Mall API Documentation

This document outlines all available API endpoints for the Glow Mall skincare e-commerce application.

## Authentication
Admin endpoints require authentication via password stored in localStorage as `admin_session`.

## Endpoints

### Brands API
- **GET /api/brands** - Get all brands
- **POST /api/brands** - Create new brand
- **DELETE /api/brands/[id]** - Delete brand

### Categories API
- **GET /api/categories** - Get all categories
- **POST /api/categories** - Create new category

### Products API
- **GET /api/products** - Get all products with filtering and sorting
  - Query params: `q` (search), `category`, `brand`, `sort`, `page`, `perPage`
- **POST /api/products** - Create new product
- **GET /api/products/[slug]** - Get product by slug
- **PUT /api/products/[slug]** - Update product
- **DELETE /api/products/[slug]** - Delete product

### Ingredients API
- **GET /api/ingredients** - Get all ingredients
- **POST /api/ingredients** - Create new ingredient

### Product Ingredients API
- **GET /api/product-ingredients** - Get all product-ingredient relationships
  - Query param: `productId` (filter by product)
- **POST /api/product-ingredients** - Create product-ingredient relationship

### Users API
- **GET /api/users** - Get all users
- **POST /api/users** - Create new user
- **GET /api/users/[id]** - Get user by ID
- **PUT /api/users/[id]** - Update user
- **DELETE /api/users/[id]** - Delete user

### Skin Score API
- **GET /api/skinscore** - Get skin scores
  - Query params: `userId`, `productId`
- **POST /api/skinscore** - Create skin score

### Cart API
- **GET /api/carts** - Get all cart items
  - Query param: `userId` (filter by user)
- **POST /api/carts** - Add item to cart
- **GET /api/carts/[id]** - Get cart item by ID
- **PUT /api/carts/[id]** - Update cart item
- **DELETE /api/carts/[id]** - Delete cart item

### Orders API
- **GET /api/orders** - Get all orders
  - Query params: `userId`, `status`
- **POST /api/orders** - Create new order
- **GET /api/orders/[id]** - Get order by ID
- **PUT /api/orders/[id]** - Update order status
- **DELETE /api/orders/[id]** - Delete order

### Admin API
- **GET /api/admin/brands** - Get all brands (admin)
- **POST /api/admin/brands** - Create brand (admin)
- **DELETE /api/admin/brands/[id]** - Delete brand (admin)
- **GET /api/admin/products** - Get all products (admin)
- **POST /api/admin/products** - Create product (admin)
- **DELETE /api/admin/products/[id]** - Delete product (admin)
- **GET /api/admin/users** - Get all users (admin)
- **DELETE /api/admin/users/[id]** - Delete user (admin)
- **GET /api/admin/carts** - Get all carts (admin)
- **DELETE /api/admin/carts/[id]** - Delete cart item (admin)
- **GET /api/admin/orders** - Get all orders (admin)
- **DELETE /api/admin/orders/[id]** - Delete order (admin)

## Example Usage

### Get Products
\`\`\`javascript
const response = await fetch('/api/products?category=serum&sort=price-asc&page=1&perPage=12');
const data = await response.json();
\`\`\`

### Create Product
\`\`\`javascript
const response = await fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'New Serum',
    slug: 'new-serum',
    price: 99000,
    category: 'serum',
    brand: 'Glow'
  })
});
\`\`\`

### Get User Cart
\`\`\`javascript
const response = await fetch('/api/carts?userId=1');
const carts = await response.json();
\`\`\`

### Create Order
\`\`\`javascript
const response = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: '1',
    total: 188000,
    items: 2,
    shippingAddress: 'Jl. Contoh No. 123'
  })
});
\`\`\`

## Admin Panel Access
- Navigate to `/admin`
- Enter password: `admin123` (change this in production)
- Access dashboard at `/admin/dashboard`
- Manage brands, products, users, carts, and orders

## Notes
- All APIs use mock databases (in-memory storage)
- For production, replace mock databases with real database connections
- Implement proper authentication and authorization
- Add input validation and error handling
- Use environment variables for sensitive data
