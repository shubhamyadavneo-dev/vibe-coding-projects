# Sample REST Endpoints for Testing

## Base URL
- Development: `http://localhost:3001` (or the PORT specified in .env)
- Swagger UI: `http://localhost:3001/api-docs`

## Authentication Endpoints

### 1. Login (Get JWT Token)
**POST** `/login`
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

## User Endpoints

### 2. Get All Users
**GET** `/api/users`
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "email": "test@example.com",
    "name": "Test User",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### 3. Create User
**POST** `/api/users`
```json
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "name": "New User",
  "role": "user"
}
```

### 4. Get User by ID
**GET** `/api/users/:id`
**Example:** `GET /api/users/507f1f77bcf86cd799439011`

### 5. Update User
**PUT** `/api/users/:id`
**Headers:** `Authorization: Bearer <token>`
```json
{
  "name": "Updated Name",
  "role": "admin"
}
```

### 6. Delete User
**DELETE** `/api/users/:id`
**Example:** `DELETE /api/users/507f1f77bcf86cd799439011`

## Order Endpoints

### 7. Get All Orders
**GET** `/api/orders`
**Headers:** `Authorization: Bearer <token>`

### 8. Create Order
**POST** `/api/orders`
**Headers:** `Authorization: Bearer <token>`
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "products": [
    {
      "productId": "60d5f9b5f8b8a12b2c8b4567",
      "quantity": 2
    }
  ],
  "totalAmount": 199.99,
  "status": "pending",
  "shippingAddress": "123 Main St, City, Country"
}
```

### 9. Get Revenue Stats
**GET** `/api/orders/stats/revenue`

**Response:**
```json
{
  "totalRevenue": 1500.50
}
```

### 10. Get Order Summary Stats
**GET** `/api/orders/stats/summary`

**Response:**
```json
{
  "totalOrders": 50,
  "pendingOrders": 10,
  "deliveredOrders": 35,
  "completionRate": 70
}
```

## Cart Endpoints

### 11. Get User Cart
**GET** `/api/carts/:userId`
**Example:** `GET /api/carts/507f1f77bcf86cd799439011`

### 12. Add to Cart
**POST** `/api/carts`
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "items": [
    {
      "productId": "60d5f9b5f8b8a12b2c8b4567",
      "quantity": 1
    }
  ]
}
```

### 13. Update Cart Item
**PUT** `/api/carts/:userId/items/:productId`
**Example:** `PUT /api/carts/507f1f77bcf86cd799439011/items/60d5f9b5f8b8a12b2c8b4567`
```json
{
  "quantity": 3
}
```

### 14. Remove from Cart
**DELETE** `/api/carts/:userId/items/:productId`
**Example:** `DELETE /api/carts/507f1f77bcf86cd799439011/items/60d5f9b5f8b8a12b2c8b4567`

### 15. Checkout Cart
**POST** `/api/carts/:userId/checkout`
**Example:** `POST /api/carts/507f1f77bcf86cd799439011/checkout`

### 16. Get Abandoned Carts
**GET** `/api/carts/stats/abandoned`

## Search Endpoints

### 17. Search Users
**GET** `/api/search?q=searchterm`
**Example:** `GET /api/search?q=john`

## Testing Commands

### Using curl:
```bash
# Login
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get all users (with token)
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create a user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"new@example.com","password":"pass123","name":"New User"}'
```

### Using Postman:
1. Import the collection from `postman_collection.json` (if available)
2. Set base URL to `http://localhost:3001`
3. For authenticated endpoints, add `Authorization` header with `Bearer <token>`

## Notes
- The server uses MongoDB for data storage (migrated from MySQL)
- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Swagger documentation is available at `/api-docs`
- Environment variables are loaded from `.env` file