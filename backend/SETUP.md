# RentEase Backend — Setup Guide

## Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
The `.env` file is already created with local MongoDB defaults.
Edit `MONGO_URI` if you are using MongoDB Atlas:
```
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/rentease
```

### 3. Seed the database (first time only)
```bash
node utils/seeder.js
```
This creates:
- **Admin:** admin@rentease.com / admin123
- **User:**  user@rentease.com  / user123
- 9 products across furniture and appliances

### 4. Start the server
```bash
npm run dev        # development (nodemon)
npm start          # production
```
Server runs on **http://localhost:5000**

---

## API Base URL
```
http://localhost:5000/api
```

## All Endpoints

### Auth
| Method | Route               | Access  |
|--------|---------------------|---------|
| POST   | /auth/register      | Public  |
| POST   | /auth/login         | Public  |
| GET    | /auth/me            | Private |
| PUT    | /auth/me            | Private |

### Products
| Method | Route               | Access  |
|--------|---------------------|---------|
| GET    | /products           | Public  |
| GET    | /products/:id       | Public  |
| POST   | /products           | Admin   |
| PUT    | /products/:id       | Admin   |
| DELETE | /products/:id       | Admin   |

### Orders
| Method | Route                         | Access  |
|--------|-------------------------------|---------|
| POST   | /orders/check-availability    | Public  |
| POST   | /orders                       | Private |
| GET    | /orders/my                    | Private |
| GET    | /orders/:id                   | Private |
| PATCH  | /orders/:id/cancel            | Private |
| PATCH  | /orders/:id/extend            | Private |
| PATCH  | /orders/:id/status            | Admin   |

### Maintenance
| Method | Route               | Access  |
|--------|---------------------|---------|
| POST   | /maintenance        | Private |
| GET    | /maintenance/my     | Private |
| GET    | /maintenance        | Admin   |
| PUT    | /maintenance/:id    | Admin   |

### Admin
| Method | Route               | Access  |
|--------|---------------------|---------|
| GET    | /admin/analytics    | Admin   |
| GET    | /admin/orders       | Admin   |
| GET    | /admin/users        | Admin   |

---

## Email (Optional)
Add Gmail credentials to `.env` to enable order confirmation emails.
Without them, emails are logged to console — app works fine either way.

```
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password  # Google App Password, not account password
```
