# 🛒 E-Commerce Backend API

A complete Node.js + Express + MongoDB REST API built to power the React e-commerce frontend (Zustand, Firebase Auth → JWT migration).

---

## 🏗️ Tech Stack

| Layer        | Technology                                      |
|-------------|--------------------------------------------------|
| Runtime     | Node.js v22 (ESM)                                |
| Framework   | Express 5                                        |
| Database    | MongoDB + Mongoose 8                             |
| Auth        | JWT (`jsonwebtoken`) + bcryptjs                  |
| Uploads     | Multer (memory) → Cloudinary                     |
| Validation  | express-validator                                |
| Security    | helmet, express-rate-limit, cors                 |
| Dev tools   | nodemon, morgan                                  |

---

## 📁 Project Structure

```
ecommerce-backend/
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── cloudinary.js      # Cloudinary config
│   ├── models/
│   │   ├── User.js            # User schema + password hashing
│   │   ├── Product.js         # Product + embedded reviews
│   │   ├── Order.js           # Order with items, shipping, payment
│   │   └── Wishlist.js        # User ↔ Product many-to-many
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── wishlistController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   └── wishlistRoutes.js
│   ├── middleware/
│   │   ├── auth.js            # protect + adminOnly
│   │   ├── upload.js          # multer + cloudinary helper
│   │   ├── validators.js      # express-validator rule sets
│   │   └── errorHandler.js    # global error handler
│   ├── utils/
│   │   ├── seed.js            # DB seeder
│   │   └── helpers.js
│   ├── app.js                 # Express app (no listen)
│   └── server.js              # Entry point
├── .env.example
└── package.json
```

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, Cloudinary credentials

# 3. Seed the database (optional)
node src/utils/seed.js

# 4. Start development server
npm run dev

# 5. Start production server
npm start
```

---

## 🔐 Environment Variables

| Variable                  | Description                           |
|--------------------------|---------------------------------------|
| `PORT`                   | Server port (default: 5000)           |
| `NODE_ENV`               | `development` / `production`          |
| `MONGO_URI`              | MongoDB connection string             |
| `JWT_SECRET`             | Secret key for JWT signing            |
| `JWT_EXPIRES_IN`         | JWT expiry (e.g. `7d`)                |
| `CLOUDINARY_CLOUD_NAME`  | Cloudinary cloud name                 |
| `CLOUDINARY_API_KEY`     | Cloudinary API key                    |
| `CLOUDINARY_API_SECRET`  | Cloudinary API secret                 |
| `CLIENT_URL`             | Frontend URL for CORS                 |

---

## 📡 API Reference

### Auth  `/api/auth`

| Method | Endpoint           | Auth     | Description          |
|--------|--------------------|----------|----------------------|
| POST   | `/register`        | Public   | Register new user    |
| POST   | `/login`           | Public   | Login → returns JWT  |
| GET    | `/me`              | 🔒 User  | Get current user     |
| PATCH  | `/me`              | 🔒 User  | Update profile       |
| PATCH  | `/change-password` | 🔒 User  | Change password      |
| GET    | `/users`           | 🔑 Admin | List all users       |

**Register body:**
```json
{
  "userName": "Ahmed Ali",
  "email": "ahmed@example.com",
  "password": "secure123",
  "phone": "01012345678",
  "gender": "male"
}
```

**Login body:**
```json
{ "email": "ahmed@example.com", "password": "secure123" }
```

**Response (login/register):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "_id": "...", "userName": "Ahmed Ali", "email": "..." }
}
```

---

### Products  `/api/products`

| Method | Endpoint              | Auth     | Description           |
|--------|-----------------------|----------|-----------------------|
| GET    | `/`                   | Public   | List products (filters) |
| GET    | `/categories`         | Public   | Get all categories    |
| GET    | `/:id`                | Public   | Get single product    |
| POST   | `/:id/reviews`        | 🔒 User  | Add / update review   |
| POST   | `/`                   | 🔑 Admin | Create product        |
| PUT    | `/:id`                | 🔑 Admin | Update product        |
| DELETE | `/:id`                | 🔑 Admin | Soft-delete product   |

**Query params for GET /products:**
```
?category=electronics
&search=headphones
&minPrice=100&maxPrice=2000
&sort=-price          (- prefix = descending)
&page=1&limit=12
```

---

### Orders  `/api/orders`

| Method | Endpoint                  | Auth     | Description              |
|--------|---------------------------|----------|--------------------------|
| POST   | `/`                       | 🔒 User  | Create order             |
| GET    | `/my-orders`              | 🔒 User  | My orders list           |
| GET    | `/:id`                    | 🔒 User  | Order details            |
| GET    | `/:id/track`              | 🔒 User  | Track order status       |
| PATCH  | `/:id/cancel`             | 🔒 User  | Cancel order             |
| PATCH  | `/:id/payment-proof`      | 🔒 User  | Upload payment screenshot|
| GET    | `/admin/all`              | 🔑 Admin | All orders               |
| PATCH  | `/admin/:id/status`       | 🔑 Admin | Update order status      |

**Create order body:**
```json
{
  "shippingAddress": {
    "name": "Ahmed Ali",
    "phone": "01012345678",
    "address": "123 Nile Street, Cairo"
  },
  "paymentMethod": "instapay",
  "items": [
    {
      "product": "<productId>",
      "title": "Classic T-Shirt",
      "price": 199,
      "discount": 10,
      "qty": 2
    }
  ]
}
```

**Upload payment proof:**  `multipart/form-data` with field `paymentProof` (image file)

**Order status flow:**
```
Pending → Confirmed → Preparing → Shipped → Delivered
                                           ↘ Cancelled (any stage before Shipped)
```

---

### Wishlist  `/api/wishlist`

| Method | Endpoint               | Auth    | Description            |
|--------|------------------------|---------|------------------------|
| GET    | `/`                    | 🔒 User | Get wishlist           |
| POST   | `/:productId/toggle`   | 🔒 User | Add / remove product   |
| GET    | `/:productId/check`    | 🔒 User | Check if in wishlist   |
| DELETE | `/clear`               | 🔒 User | Clear entire wishlist  |

---

## 🔄 Frontend Integration

Replace the current Zustand slices' direct Firebase/json-server calls with this API:

```js
// AuthSlice.js — login
const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
const { token, user } = res.data;
localStorage.setItem('token', token);

// Wishlist — toggle
await axios.post(`http://localhost:5000/api/wishlist/${productId}/toggle`, {}, {
  headers: { Authorization: `Bearer ${token}` }
});

// Orders — create
await axios.post('http://localhost:5000/api/orders', orderPayload, {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

## 🛡️ Security Features

- **Helmet** – sets secure HTTP headers
- **CORS** – restricts origins to `CLIENT_URL`
- **Rate limiting** – 200 req/15 min globally; 20 req/15 min on auth endpoints
- **JWT** – stateless auth, tokens expire after 7 days
- **bcrypt** – passwords hashed with salt rounds = 12
- **Mongoose** – validation & sanitisation at model level
- **express-validator** – request body validation before controllers
- **Soft deletes** – products are flagged `isActive: false` rather than hard-deleted

---

## 🌱 Seeded Data

After running `node src/utils/seed.js`:

| Role  | Email                | Password  |
|-------|----------------------|-----------|
| Admin | admin@example.com    | admin123  |
| User  | ahmed@example.com    | user1234  |

6 sample products across 4 categories: clothing, shoes, electronics, accessories.
