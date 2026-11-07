# ShopEase — Online Shopping Cart System (MERN Stack)

A complete, production-grade, full-stack e-commerce web application rebuilt from scratch using the **MERN stack** (MongoDB, Express.js, React.js, Node.js). 

This project re-engineers an enterprise Java/JSP/Oracle XE Online Shopping Cart application into a modern JavaScript/TypeScript-ready stack while preserving **100% feature parity**, visual identity, design aesthetics, business workflows, customer features, and administrator capabilities.

---

## 1. Project Overview & Architecture

### Technology Stack
- **Frontend**: React 19, Vite, React Router DOM v7, Axios, Bootstrap 5.3.3, Bootstrap Icons, Context API.
- **Backend**: Node.js (v24 LTS), Express.js (v4.21), Mongoose (v8.14), JWT authentication, bcryptjs, Multer, Helmet, CORS, Express Rate Limit.
- **Database**: MongoDB Community Server (v9.0/v7.0/v6.0) with collections for Users, Categories, Products, Carts, and Orders.
- **Testing**: Node.js Native Test Runner with Supertest for end-to-end REST API testing.

### Key Architectural Enhancements
1. **JWT in Secure HTTP-Only Cookies**: Prevents XSS token exfiltration with strict `SameSite=Lax` cookie configuration.
2. **Persistent Cart State**: Cart stored in MongoDB per authenticated user, synchronized across devices and sessions.
3. **Atomic Concurrency-Safe Checkout**: Conditional inventory decrement (`$gte`) preventing race conditions, with automatic rollback if any cart item fails.
4. **Finite State Machine Order Transitions**: Order lifecycle enforcement (`PLACED` &rarr; `PACKED` &rarr; `SHIPPED` &rarr; `DELIVERED` or `CANCELLED`) with automatic inventory restoration upon cancellation.
5. **Referential Integrity Guards**: Deletion of categories with associated products is blocked with human-friendly diagnostics.
6. **Password Security**: Bcrypt with 10 salt rounds; password hashes excluded by default from queries (`select: false`).

---

## 2. Directory Structure

```text
ShopEase-MERN/
├── package.json                    # Workspace scripts & dev runner orchestration
├── README.md                       # Complete setup, usage, and architectural guide
├── .gitignore                      # Git exclusion rules
│
├── client/                         # Frontend React application (Vite)
│   ├── package.json
│   ├── vite.config.js              # Dev proxy configuration (/api & /uploads)
│   ├── index.html                  # HTML entry point with Bootstrap 5.3.3 CDN
│   ├── public/
│   │   └── assets/                 # 85+ genuine product photos, SVGs, category banners
│   └── src/
│       ├── main.jsx                # React root mount
│       ├── App.jsx                 # Provider hierarchy (AuthContext, CartContext)
│       ├── routes/
│       │   └── AppRoutes.jsx       # Public, protected customer, and admin routes
│       ├── components/
│       │   ├── common/             # LoadingSpinner, AlertMessage, ProtectedRoute, AdminRoute
│       │   ├── layout/             # Navbar, Footer, Layout, AdminLayout
│       │   └── products/           # ProductCard, CategorySidebar
│       ├── pages/
│       │   ├── auth/               # LoginPage, RegisterPage
│       │   ├── products/           # CatalogPage (hero, filters, search), ProductDetailPage
│       │   ├── cart/               # CartPage (live quantity, subtotals, order recap)
│       │   ├── checkout/           # CheckoutPage (3-step review, address, COD/MOCK)
│       │   ├── orders/             # OrderConfirmationPage, OrderHistoryPage, OrderDetailPage
│       │   ├── profile/            # ProfilePage (customer details & password update)
│       │   └── admin/              # DashboardPage, ProductListPage, ProductFormPage,
│       │                           # CategoryListPage, OrderListPage, OrderDetailAdminPage, UserListPage
│       ├── context/                # AuthContext.jsx, CartContext.jsx
│       ├── services/               # api.js (Axios client with credentials & interceptors)
│       ├── utils/                  # helpers.js (currency, dates, badges, image resolvers)
│       └── styles/                 # style.css (reproduced ShopEase theme & components)
│
├── server/                         # Backend Express REST API application
│   ├── package.json
│   ├── .env.example                # Environment variables template
│   ├── .env                        # Local environment configuration
│   └── src/
│       ├── server.js               # Entry point; establishes MongoDB connection & starts HTTP server
│       ├── app.js                  # Express application setup, security middlewares, routes
│       ├── config/
│       │   └── db.js               # Mongoose MongoDB connection manager
│       ├── models/
│       │   ├── User.js             # User schema with roles ('ADMIN', 'CUSTOMER') & password hashing
│       │   ├── Category.js         # Category schema with unique name & description
│       │   ├── Product.js          # Product schema with text indexes & category reference
│       │   ├── Cart.js             # Cart schema with embedded product items
│       │   └── Order.js            # Order schema with orderNumber, status enum & item snapshots
│       ├── middleware/
│       │   ├── auth.js             # JWT verification & authorizeAdmin RBAC guard
│       │   ├── upload.js           # Multer file upload (2MB limit, JPEG/PNG/WebP validation)
│       │   └── errorHandler.js     # Centralized error handler (CastError, DuplicateKey, etc.)
│       ├── validators/
│       │   └── inputValidators.js  # Server-side input validation
│       ├── utils/
│       │   ├── token.js            # JWT signing and cookie configuration helper
│       │   └── adminSetup.js       # CLI tool to initialize or promote admin accounts
│       ├── controllers/            # Controller handlers for all customer & admin domains
│       ├── routes/                 # Express router declarations under /api/v1
│       └── tests/
│           └── api.test.js         # 17 Automated end-to-end integration tests
│
├── database/
│   ├── seedData.json               # Extracted reference catalog data (10 categories, 85 products)
│   ├── parseSeed.js                # Parser converting reference SQL into JSON
│   └── seed.js                     # MongoDB seeder script (populates categories, products, users, orders)
│
└── docs/
    └── project-architecture.md     # In-depth system design & transition documentation
```

---

## 3. Installation & Setup (Windows / macOS / Linux)

### Prerequisites
- **Node.js**: v18.x, v20.x, or v22+ (v24 LTS verified)
- **MongoDB**: MongoDB Community Server running locally on `mongodb://127.0.0.1:27017` (or MongoDB Atlas connection URI)
- **Git**

### Step 1: Clone or Navigate to the Workspace
```powershell
cd c:\Users\USER\eclipse-workspace-web\ShopEase-MERN
```

### Step 2: Install All Dependencies
Run the unified installer script from the root directory:
```powershell
npm run install:all
```
*Or install manually per directory:*
```powershell
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### Step 3: Configure Environment Variables
Verify or edit `server/.env` (a pre-configured copy is created automatically from `server/.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/shopease
JWT_SECRET=shopease_super_secret_jwt_key_2026_modern_mern
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
COOKIE_SECURE=false
```

### Step 4: Seed the Database
Populate MongoDB with the reference catalog (10 categories, 85 authentic products, 3 users, and sample orders):
```powershell
npm run seed
```

Output:
```text
Connecting to MongoDB: mongodb://127.0.0.1:27017/shopease ...
[1/4] Seeding Users...
  -> Created 3 users (1 Admin, 2 Customers)
[2/4] Seeding Categories...
  -> Created 10 categories
[3/4] Seeding Products...
  -> Created 85 products
[4/4] Seeding Demo Orders...
  -> Created 3 demo orders
Database seeded successfully!
```

### Step 5: (Optional) Initialize a Custom Administrator Account
To create a new administrator or promote an existing user via CLI without hardcoding credentials:
```powershell
npm run setup:admin -- "Super Admin" "admin2@shoppingcart.com" "SecureAdmin@2026" "9876543210"
```

---

## 4. Running the Application

### Option A: Run Both Server & Client Concurrently (Recommended)
```powershell
npm run dev
```

### Option B: Run Services in Separate Terminals
**Terminal 1 (Backend API Server):**
```powershell
npm run server:dev
```
Server runs on: **`http://localhost:5000`**

**Terminal 2 (Frontend React App):**
```powershell
npm run client
```
Client runs on: **`http://localhost:5173`**

---

## 5. Default Demonstration Credentials

| Role | Email Address | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@shoppingcart.com` | `Admin@123` | Full Admin Dashboard, Product CRUD, Category CRUD, Order Fulfillment, User Audit |
| **Customer 1** | `john@example.com` | `Customer@123` | Browsing, Cart, Checkout, Order History, Customer Profile |
| **Customer 2** | `jane@example.com` | `Customer@123` | Browsing, Cart, Checkout, Order History, Customer Profile |

---

## 6. Testing & Quality Verification

### Run Automated Backend Tests
A comprehensive test suite of 17 end-to-end integration tests covers authentication, RBAC authorization, product search, cart operations, concurrency-safe checkout, order history ownership, and admin status updates:
```powershell
npm test
```
Result:
```text
✔ Health Check -> GET /api/v1/health (13.7ms)
✔ Auth -> POST /api/v1/auth/register creates a new customer (117.9ms)
✔ Auth -> POST /api/v1/auth/register rejects duplicate email with 409 (104.9ms)
✔ Auth -> POST /api/v1/auth/login authenticates registered customer and sets cookie (95.9ms)
✔ Auth -> POST /api/v1/auth/login rejects invalid credentials (89.5ms)
✔ Auth -> GET /api/v1/auth/me returns current user info (13.4ms)
✔ Products -> GET /api/v1/products returns catalog with pagination (25.1ms)
✔ Products -> GET /api/v1/products?search=wireless filters products by keyword (14.5ms)
✔ Cart -> POST /api/v1/cart/items adds an item to user cart (25.4ms)
✔ Cart -> PUT /api/v1/cart/items/:productId updates quantity (17.3ms)
✔ Checkout -> POST /api/v1/checkout creates order and clears cart (38.8ms)
✔ Orders -> GET /api/v1/orders returns order history for authenticated customer (18.1ms)
✔ Admin RBAC -> GET /api/v1/admin/dashboard blocks regular customer with 403 (10.9ms)
✔ Admin Dashboard -> GET /api/v1/admin/dashboard succeeds for administrator (19.4ms)
✔ Admin Products -> POST /api/v1/admin/products creates a new product (19.2ms)
✔ Admin Orders -> PUT /api/v1/admin/orders/:id/status updates fulfillment status (21.7ms)
✔ Admin Orders -> PUT /api/v1/admin/orders/:id/status rejects invalid transition with 400 (15.1ms)
ℹ tests 17 | pass 17 | fail 0 | cancelled 0 | skipped 0 | todo 0
```

### Production Build Verification
To verify frontend production bundle compilation:
```powershell
npm run build:client
```
Result: 125 modules transformed cleanly with **0 errors and 0 warnings**.

---

## 7. Feature Parity Checklist: Java Reference vs MERN Stack

| Feature Area | Java Reference Application | MERN Stack Implementation | Parity Status |
|---|---|---|:---:|
| **Brand Identity & Theme** | ShopEase navy navbar (`#0f172a`), orange accent, 230px card images | Exact CSS variables, Google Fonts, Bootstrap 5.3.3 classes, hero banner | 100% |
| **Catalog & Products** | 10 Categories, 85 Products with authentic photography in `assets/` | All 10 categories, all 85 products with original assets in `client/public/assets/` | 100% |
| **Search & Filtering** | Search keyword input, category sidebar, price discount calculations | Full-text Mongoose query, reactive category filter, sort by price/name | 100% |
| **Pagination** | 12 items per page with page indicator | Dynamic server-side pagination with active page button controls | 100% |
| **Product Detail** | Image gallery, stock pill, description, add to cart with quantity | Dynamic route `/products/:id`, live stock indicator, quantity selector | 100% |
| **User Registration** | Full name, email, password, phone, duplicate checking | Regex email validation, duplicate email 409 conflict, BCrypt hash | 100% |
| **Authentication** | Session-based with `JSESSIONID` cookie | JWT in HTTP-only secure cookie, reactive AuthContext, persistent login | 100% |
| **Shopping Cart** | Session cart with unit prices, subtotals, grand total | MongoDB persistent cart, server-side price computation, stock limits | 100% |
| **Checkout Workflow** | Shipping address, payment method (COD vs Mock Online), confirmation | 3-step checkout wizard, atomic inventory decrement with rollback | 100% |
| **Order History** | View orders, order number, line items, historical purchase price | Customer-scoped `/orders`, individual detail page, snapshot prices | 100% |
| **Customer Profile** | Edit name and phone, change password with old password verification | Secure profile update API, BCrypt password re-hashing verification | 100% |
| **Admin Dashboard** | Total orders, net revenue, low stock alerts, recent orders table | Real-time MongoDB aggregations for revenue, counts, low-stock table | 100% |
| **Admin Product CRUD** | Create product, edit pricing/stock, upload image, toggle active | Full CRUD forms, Multer image upload preview, soft-delete toggle | 100% |
| **Admin Category CRUD** | Add/edit category, referential integrity check | Protected CRUD, blocks deletion if products are linked to category | 100% |
| **Admin Order Fulfillment**| State transitions (`PLACED` &rarr; `PACKED` &rarr; `SHIPPED` &rarr; `DELIVERED`) | Validated state machine, automatic inventory restoration on cancel | 100% |
| **Admin User Directory** | Audit registered customers, registration dates, contact details | Admin-only audit view, passwords/hashes strictly excluded from payload | 100% |

---

## 8. RESTful API Documentation (`/api/v1`)

### Authentication & Profile (`/api/v1/auth`, `/api/v1/profile`)
- `POST /api/v1/auth/register` — Register customer (JSON body: `name, email, password, phone`)
- `POST /api/v1/auth/login` — Authenticate and set HTTP-only cookie (`email, password`)
- `POST /api/v1/auth/logout` — Clear authentication cookie
- `GET /api/v1/auth/me` — Return currently authenticated user profile
- `GET /api/v1/profile` — Return user profile details
- `PUT /api/v1/profile` — Update customer name or phone number
- `PUT /api/v1/profile/password` — Change password (`currentPassword, newPassword`)

### Catalog & Categories (`/api/v1/categories`, `/api/v1/products`)
- `GET /api/v1/categories` — List all active product categories
- `GET /api/v1/products` — Query products (`search, category, sort, page, limit`)
- `GET /api/v1/products/:id` — Retrieve product details by ID

### Cart & Checkout (`/api/v1/cart`, `/api/v1/checkout`)
- `GET /api/v1/cart` — Get authenticated user's current persistent cart
- `POST /api/v1/cart/items` — Add product to cart (`productId, quantity`)
- `PUT /api/v1/cart/items/:productId` — Update item quantity (`quantity`)
- `DELETE /api/v1/cart/items/:productId` — Remove specific product from cart
- `DELETE /api/v1/cart` — Clear entire cart
- `POST /api/v1/checkout` — Atomic order creation (`shippingAddress, paymentMethod`)

### Customer Orders (`/api/v1/orders`)
- `GET /api/v1/orders` — List authenticated customer's order history
- `GET /api/v1/orders/:id` — Retrieve specific order details with item snapshot

### Administrator Management (`/api/v1/admin/*`)
- `GET /api/v1/admin/dashboard` — Live dashboard statistics & low-stock alerts
- `GET /api/v1/admin/products` — Admin product directory
- `POST /api/v1/admin/products` — Create product (Multipart form or JSON)
- `PUT /api/v1/admin/products/:id` — Update product details or stock
- `DELETE /api/v1/admin/products/:id` — Delete product
- `GET /api/v1/admin/categories` — Admin category directory
- `POST /api/v1/admin/categories` — Create category
- `PUT /api/v1/admin/categories/:id` — Update category
- `DELETE /api/v1/admin/categories/:id` — Delete category (referential integrity enforced)
- `GET /api/v1/admin/orders` — Admin order directory with status filtering
- `GET /api/v1/admin/orders/:id` — Admin order details
- `PUT /api/v1/admin/orders/:id/status` — Advance order status with state machine validation
- `GET /api/v1/admin/users` — List registered users (passwords omitted)

---

## 9. Security & Hardening Measures

- **HTTP-Only Cookies**: Prevents client-side scripts from reading authentication tokens.
- **Helmet**: Adds security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`).
- **CORS Configuration**: Restricts origin to frontend URL with explicit credential sharing enabled.
- **Express Rate Limiting**: Throttles authentication routes (`/api/v1/auth/login`) to 10 requests per 15 minutes to block brute-force attempts.
- **Multer Upload Whitelist**: Only accepts `image/jpeg`, `image/png`, `image/webp` with a strict 2MB per-file size boundary.
- **NoSQL Injection Defense**: Strict Mongoose schema casting and validated payload objects.

---

## 10. License
This project is developed for educational and demonstration purposes, preserving the legacy of the Java ShopEase reference implementation in a modern full-stack JavaScript environment.
