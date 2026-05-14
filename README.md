# RentEase — Complete Integration Guide
# RentEase
RentEase is a full-stack furniture and appliance rental platform built using the MERN stack. It includes user rentals, admin inventory management, analytics dashboards, maintenance workflows, return handling, and role-based authentication.
## Project Structure
```
RentEase/
├── backend/          → Node.js + Express + MongoDB
└── frontend/         → React 18 + Tailwind CSS v3
```
## Tech Stack

Frontend:
- React 18
- Tailwind CSS
- React Router
- Recharts

Backend:
- Node.js
- Express.js
- MongoDB
- JWT Authentication

Deployment:
- Vercel
- Render
- MongoDB Atlas
---

## Step 1 — Start MongoDB
```bash
# Option A: Local MongoDB
mongod

# Option B: MongoDB Atlas
# Set MONGO_URI in backend/.env to your Atlas connection string
```

---

## Step 2 — Setup & Start Backend

```bash
cd backend
npm install
node utils/seeder.js      # ONE TIME — seeds DB with products + users
npm run dev               # starts on http://localhost:5000
```

**Test it works:**
```
GET http://localhost:5000/
→ { "message": "RentEase API", "status": "OK", "version": "2.0.0" }
```

---

## Step 3 — Setup & Start Frontend

```bash
cd frontend
npm install               # also installs Tailwind, react-hook-form, recharts
npm start                 # starts on http://localhost:3000
```

---

# Step 4 — Login and Test (Demo Credentials)

| Role  | Email                  | Password  |
|-------|------------------------|-----------|
| User  | user@rentease.com      | user123   |
| Admin | admin@rentease.com     | admin123  |

> Note: The platform is designed for a single primary administrator.  
> Admin credentials can be updated later through account settings/profile management.
---

## Full Integration Checklist

### Auth
- [x] Register new account
- [x] Login as user / admin
- [x] Token auto-attached to all API calls
- [x] Token verified on page refresh (no flash to login)
- [x] Expired token → auto logout + redirect to /login

### Products
- [x] Browse all products (with demo fallback if API down)
- [x] Filter by category / subcategory
- [x] Sort by price / name
- [x] Search by name
- [x] View product detail
- [x] Check availability for selected dates (public — no login needed)

### Orders
- [x] Place order (login required)
- [x] View my orders with status tabs
- [x] Cancel pending order (prevents double-click)
- [x] Raise maintenance for active order
- [x] Admin: advance order status (pending→approved→delivered→active→returned→closed)

### Dashboard
- [x] Stats cards (active rentals, pending, total, spend)
- [x] Order list with tabs
- [x] Error state with retry button
- [x] Skeleton loaders

### Admin Dashboard
- [x] KPI cards (8 metrics)
- [x] Monthly revenue bar chart
- [x] Orders by status donut chart
- [x] Stock utilisation chart
- [x] Orders table with status filter + advance action
- [x] Inventory table with activate/deactivate

### Dark Mode
- [x] Toggle in Navbar (desktop + mobile)
- [x] Toggle on Login/Register pages
- [x] Preference saved in localStorage
- [x] Respects OS preference on first visit
- [x] Smooth transition on all pages

---

## Environment Variables

### backend/.env
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/rentease
JWT_SECRET=rentease_dev_secret_change_before_production
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
EMAIL_USER=           ← optional
EMAIL_PASS=           ← optional
```

### frontend/.env
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Production Deployment

### Backend → Render / Railway
1. Set all environment variables in dashboard
2. Set `NODE_ENV=production`
3. Set `MONGO_URI` to Atlas connection string
4. Set `FRONTEND_URL` to your Vercel/Netlify URL
5. Deploy command: `npm start`

### Frontend → Vercel / Netlify
1. Set `REACT_APP_API_URL` to your Render backend URL
2. Build command: `npm run build`
3. Output directory: `build`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| CORS error | Check `FRONTEND_URL` in backend `.env` matches exact frontend URL |
| 401 on all requests | Token expired — logout and login again |
| Products not loading | Run `node utils/seeder.js` to seed the database |
| Charts empty | Normal until you have real orders — seeder doesn't create orders |
| Email not sending | Leave `EMAIL_USER` empty — app works fine, logs to console instead |
| Dark mode not persisting | Check `localStorage` key `rentease_theme` in browser DevTools |
