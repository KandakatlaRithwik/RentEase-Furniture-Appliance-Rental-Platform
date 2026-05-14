# 🏠 RentEase — Furniture & Appliance Rental Platform

> A full-stack rental platform for students and working professionals.
> Rent premium furniture and appliances on monthly basis — zero ownership stress.

---

## 🚀 Live Demo

| Service  | URL |
|---|---|
| Frontend | https://rentease.vercel.app *(deploy yours)* |
| Backend  | https://rentease-api.onrender.com *(deploy yours)* |

**Demo credentials:**
- User → `user@rentease.com` / `user123`
- Admin → `admin@rentease.com` / `admin123`

---

## ✨ Features

### User
- 🔐 JWT Authentication (register / login)
- 🛍️ Browse products by category with live debounced search
- 📅 Real-time availability check (date overlap engine)
- 🛒 Place rental orders with delivery address
- 📊 Dashboard with spend chart (Recharts)
- 🔧 Raise & track maintenance requests
- 🔄 Rental extension support

### Admin
- 📈 KPI dashboard — MRR, active rentals, monthly revenue
- 📊 3 Recharts visualizations (Bar, Line, Pie)
- 🧾 Full order lifecycle management (Pending → Approved → Delivered → Active → Returned → Closed)
- 📦 Inventory toggle (activate/deactivate products)
- 👥 User management

### Technical
- ⚡ React Query — server-state caching, optimistic updates
- 🐻 Zustand — global client-state (auth, filters)
- 🎭 Framer Motion — page transitions, list animations
- 🔒 Rate limiting — brute-force protection on auth
- ✅ Input validation — express-validator on all endpoints
- 📧 Email notifications — order placed, status changed
- ♿ Accessibility — aria labels, keyboard navigation, semantic HTML
- 🧪 Jest + React Testing Library — 12 tests

---

## 🏗️ Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 |
| Routing | React Router v6 (lazy-loaded) |
| Server State | TanStack React Query v5 |
| Client State | Zustand v4 |
| Animations | Framer Motion v11 |
| Charts | Recharts v2 |
| HTTP | Axios |
| Styling | Custom CSS Design System (CSS Variables) |
| Fonts | Syne + Plus Jakarta Sans |
| Icons | React Icons (Remix Icons) |
| Testing | Jest + React Testing Library |

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Validation | express-validator |
| Rate Limiting | express-rate-limit |
| Security | Helmet |
| Email | Nodemailer |
| Logging | Morgan |

---

## 📁 Project Structure

```
rentease/
├── rentease-frontend/
│   ├── src/
│   │   ├── __tests__/          ← Jest test files
│   │   ├── components/
│   │   │   ├── common/         ← ProductCard, ProtectedRoute
│   │   │   └── layout/         ← Navbar, Footer
│   │   ├── hooks/
│   │   │   ├── useQueries.js   ← All React Query hooks
│   │   │   └── useDebounce.js  ← Debounce utility
│   │   ├── pages/              ← Route-level components
│   │   ├── services/api.js     ← Axios API layer
│   │   ├── store/
│   │   │   ├── authStore.js    ← Zustand auth state
│   │   │   └── filterStore.js  ← Zustand filter state
│   │   ├── App.jsx             ← Routes + providers
│   │   └── index.css           ← Design system tokens
│   └── package.json
│
└── rentease-backend/
    ├── config/db.js            ← MongoDB connection
    ├── controllers/            ← Business logic
    ├── middleware/
    │   ├── authMiddleware.js   ← JWT protect + adminOnly
    │   ├── validators.js       ← express-validator rules
    │   └── rateLimiter.js      ← Rate limit configs
    ├── models/                 ← Mongoose schemas
    ├── routes/                 ← Express routers
    ├── utils/
    │   ├── seeder.js           ← DB seed script
    │   └── emailService.js     ← Nodemailer templates
    └── server.js               ← App entry + middleware
```

---

## 🧠 Core Algorithm — Availability Engine

The heart of the platform. Prevents double-booking using date overlap logic:

```javascript
// A new booking overlaps an existing one when:
// newStart <= existingEnd  AND  newEnd >= existingStart

const overlapping = await Order.countDocuments({
  product: productId,
  status: { $in: ['pending', 'approved', 'delivered', 'active'] },
  startDate: { $lte: new Date(endDate) },   // existing starts before new booking ends
  endDate:   { $gte: new Date(startDate) }, // existing ends after new booking starts
});

return overlapping < product.availableQuantity;
```

This query is indexed on `{ product, status, startDate, endDate }` for fast lookups.

---

## ⚙️ Setup & Run Locally

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- Git

### 1. Clone & install

```bash
git clone https://github.com/yourusername/rentease.git
cd rentease
```

### 2. Backend setup

```bash
cd rentease-backend
npm install
cp .env.example .env
# Edit .env — add your MongoDB Atlas URI
npm run seed       # Seeds DB with 9 products + admin + user
npm run dev        # Starts on http://localhost:5000
```

### 3. Frontend setup

```bash
cd rentease-frontend
npm install
# .env already has REACT_APP_API_URL=http://localhost:5000/api
npm start          # Starts on http://localhost:3000
```

### 4. Run tests

```bash
cd rentease-frontend
npm test
```

---

## 🌐 API Reference

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login |
| GET  | `/api/auth/me` | Private | Get profile |

### Products
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET  | `/api/products` | Public | List (filter + paginate) |
| GET  | `/api/products/:id` | Public | Single product |
| POST | `/api/products` | Admin | Create |
| PUT  | `/api/products/:id` | Admin | Update |
| DELETE | `/api/products/:id` | Admin | Soft delete |

### Orders
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/orders/check-availability` | Private | Check dates |
| POST | `/api/orders` | Private | Place order |
| GET  | `/api/orders/my` | Private | My orders |
| PUT  | `/api/orders/:id/cancel` | Private | Cancel |
| PUT  | `/api/orders/:id/extend` | Private | Extend |
| PUT  | `/api/orders/:id/status` | Admin | Update status |

### Maintenance
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/maintenance` | Private | Raise request |
| GET  | `/api/maintenance/my` | Private | My requests |
| GET  | `/api/maintenance` | Admin | All requests |
| PUT  | `/api/maintenance/:id` | Admin | Update status |

### Admin
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET  | `/api/admin/analytics` | Admin | KPIs + MRR |
| GET  | `/api/admin/orders` | Admin | All orders |
| GET  | `/api/admin/users` | Admin | All users |

---

## 🚀 Deployment Guide

### Frontend → Vercel

```bash
cd rentease-frontend
npm run build

# In Vercel dashboard:
# - Set REACT_APP_API_URL = https://your-backend.onrender.com/api
```

Or via CLI:
```bash
npx vercel --prod
```

### Backend → Render

1. Create new Web Service on [render.com](https://render.com)
2. Connect your GitHub repo
3. Set environment variables:
   - `MONGO_URI` — your Atlas connection string
   - `JWT_SECRET` — long random string
   - `FRONTEND_URL` — your Vercel URL
   - `NODE_ENV` — `production`
4. Build command: `npm install`
5. Start command: `node server.js`

### Database → MongoDB Atlas

1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create database user
3. Whitelist IP `0.0.0.0/0` (or Render's IPs)
4. Copy connection string to `MONGO_URI`

---

## 🧪 Testing

```bash
npm test                    # Run all tests
npm test -- --coverage      # With coverage report
npm test ProductCard        # Single test file
```

Tests cover:
- `ProductCard` renders correctly (8 tests)
- Auth store login/logout/register flows (5 tests)
- `useDebounce` hook behavior (4 tests)

---

## 📈 KPIs Tracked

| KPI | Description |
|---|---|
| MRR | Sum of `monthlyRent` for all `active` orders |
| Active Rentals | Orders with `status: active` |
| Pending Orders | Orders with `status: pending` or `approved` |
| Monthly Revenue | Sum of `totalAmount` for orders created this month |
| Utilization Rate | `activeRentals / totalProducts` |
| Maintenance SLA | Time from raised → resolved |

---

## 👨‍💻 Author

Built as an internship project demonstrating full-stack product engineering.

**Stack maturity signals:**
- React Query for server state (not raw `useEffect + axios`)  
- Zustand for client state (not prop drilling)
- Optimistic UI updates on cancel/status change
- Framer Motion page transitions
- Debounced search (not firing on every keystroke)
- Rate limiting on auth endpoints
- Input validation on all POST/PUT routes
- Accessibility (aria labels, semantic HTML, keyboard nav)
- Jest test suite

---

*RentEase — Furniture & Appliance Rentals*
