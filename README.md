# PriceSmart — AI Price Intelligence & Comparison Platform

PriceSmart is a full-stack price comparison and shopping intelligence web application that aggregates product prices across retailers (Amazon & Flipkart), tracks historical price trends, predicts whether to buy now or wait, sends real-time price-drop alerts, and provides an AI-powered shopping assistant backed by Google Gemini.

---

## Key Features

### Consumer Features
- **Cross-Retailer Search & Comparison**: Search products across Amazon and Flipkart, filter/sort results, and compare products side by side (pricing, specs, and lowest-price highlights).
- **Historical Price Tracking & Predictions**: Interactive price history charts, deal score analysis, market trend detection, and AI-assisted buy/wait recommendations.
- **AI Shopping Assistant**: Conversational shopping assistant (both dedicated `/assistant` page and floating widget) powered by Google Gemini (`@google/genai`), capable of searching products, creating price alerts, summarizing products, and explaining deals.
- **Price Drop & Restock Alerts**: Set target-price alerts with Web Push notifications (`web-push` + VAPID).
- **User Dashboard**: Manage tracked products, saved comparisons, wishlists, price alerts, and personalized recommendations with JWT access + refresh token authentication.
- **Progressive Web App (PWA)**: Installable PWA with offline indicator, client-side caching (`localforage`), internationalization (`i18next`), and light/dark theming.

### Platform, Partner & Admin Capabilities
- **Live Scrapers & Anti-Bot Pipeline**: Modular retailer registry for Amazon and Flipkart using Playwright and Cheerio with user-agent rotation, retry policies, and product normalization.
- **Automated Background Jobs (`node-cron`)**:
  - `PriceRefreshJob` — refreshes due tracked items every 15 minutes.
  - `CacheRefreshJob` — refreshes caches every hour.
  - `AnalyticsAggregationJob` — aggregates daily analytics at 1:00 AM.
- **Admin Portal (`/admin`)**: Monitor system overview, market trends, scrapers, and scheduled job executions.
- **Partner & Public API (`/api/public/v1`)**: API-key authenticated endpoints for product search and lookups, merchant feed import/validation, and affiliate outbound click tracking (`/api/v1/out`).
- **Interactive API Docs**: OpenAPI / Swagger UI served at `/api/docs`.

---

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend (`client/`)** | React 19, Vite 8, React Router 7, Tailwind CSS, Recharts, Framer Motion, Axios, React Hook Form, Zod, i18next, `vite-plugin-pwa`, Playwright (E2E) |
| **Backend (`server/`)** | Node.js, Express 5, MongoDB & Mongoose 9, Google GenAI (`@google/genai`), Playwright, Cheerio, `node-cron`, `web-push`, JWT & bcrypt, Swagger (`swagger-jsdoc` / `swagger-ui-express`), Helmet, `express-rate-limit`, Winston & Pino, Jest & Supertest |

---

## Project Structure

```text
.
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── api/             # Axios API clients & JWT refresh interceptor
│   │   ├── components/      # UI, search, compare, product, dashboard, assistant widgets
│   │   ├── features/auth/   # Login, register, forgot password, auth context & guards
│   │   ├── layouts/         # Main, Admin, and Partner layouts
│   │   └── pages/           # Landing, Search, ProductDetails, Compare, Alerts, Assistant, Dashboard, Admin, Partner
│   └── package.json
└── server/                  # Express + MongoDB backend
    ├── cache/               # Mongo-backed caching
    ├── config/              # DB connection, env validation, Swagger setup
    ├── jobs/                # Scheduled cron jobs (price refresh, cache, analytics)
    ├── middlewares/         # Auth, public API auth, security, request logging, error handling
    ├── models/              # Mongoose schemas (Product, PriceHistory, Alert, User, Prediction, etc.)
    ├── routes/              # REST API routes (/api/v1/*, /api/public/v1/*, /api/admin)
    ├── scrapers/            # Amazon & Flipkart scrapers, parsers, normalizers, browser pool
    ├── scripts/             # Utility scripts (seed.js, generate-vapid.js)
    ├── services/            # AI, assistant, embeddings, intelligence, prediction, pricing, notifications, affiliate
    ├── workers/             # PriceWorker background processor
    ├── .env.example         # Environment variable template
    └── server.js            # Application entry point
```

---

## Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** (local instance or MongoDB Atlas)
- **Google Gemini API Key** (for AI summaries, embeddings, and shopping assistant)

### 1. Clone the repository
```bash
git clone https://github.com/Vishal4256/Price-comparison.git
cd Price-comparison
```

### 2. Backend Setup (`server/`)
```bash
cd server
npm install
```

Create a `.env` file in `server/` based on `server/.env.example`:
```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGO_URI=mongodb://localhost:27017/pricesmart

# JWT
JWT_SECRET=YOUR_NEW_RANDOM_JWT_SECRET
JWT_REFRESH_SECRET=YOUR_NEW_RANDOM_REFRESH_SECRET
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Frontend
CLIENT_URL=http://localhost:5173

# Scraper & Browser
PLAYWRIGHT_BROWSER=chromium
SCRAPER_MAX_RETRIES=3
SCRAPER_REQUEST_DELAY_MS=1500
SCRAPER_NAVIGATION_TIMEOUT_MS=30000
SCRAPER_CONCURRENCY=2

# Gemini AI
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Web Push (generate via `node scripts/generate-vapid.js`)
VAPID_PUBLIC_KEY=YOUR_NEW_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY=YOUR_NEW_VAPID_PRIVATE_KEY
VAPID_SUBJECT=mailto:your-email@example.com
```

> **Note:** On startup, `server/config/env.js` requires `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`, `PORT`, and `NODE_ENV`.

Optional helper scripts:
```bash
# Generate VAPID keys for Web Push notifications
node scripts/generate-vapid.js

# Seed initial data
node scripts/seed.js
```

Run the backend server:
```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

The API runs on `http://localhost:5000` and Swagger docs are available at `http://localhost:5000/api/docs`.

### 3. Frontend Setup (`client/`)
Open a new terminal:
```bash
cd client
npm install
```

Optionally create `client/.env` if your backend runs on a non-default URL:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

Start the frontend dev server:
```bash
npm run dev
```

The app runs on `http://localhost:5173`.

---

## API Overview

| Base Path | Description |
| --- | --- |
| `/api/v1/health` | Service health check |
| `/api/v1/auth` | Registration, login, JWT refresh, password management |
| `/api/v1/home` | Landing page feed and featured deals |
| `/api/v1/search` | Product search and filtering |
| `/api/v1/product` | Product details, price history, AI summaries, predictions |
| `/api/v1/compare` | Side-by-side product comparisons |
| `/api/v1/dashboard` | Authenticated user stats, saved comparisons, wishlists |
| `/api/v1/alerts` | Create and manage price-drop / restock alerts |
| `/api/v1/notifications` | Web Push subscriptions and notification logs |
| `/api/v1/assistant` | Gemini-powered shopping assistant chat & tool workflows |
| `/api/v1/out` | Affiliate outbound click tracking |
| `/api/v1/partner` | Merchant feed imports and partner API key management |
| `/api/public/v1` | API-key protected public search & product lookup endpoints |
| `/api/admin` | Admin analytics, scraper controls, and job monitoring |
| `/api/docs` | Swagger / OpenAPI interactive documentation |

---

## Testing & Linting

```bash
# Backend unit/API tests (Jest + Supertest)
cd server
npm test

# Frontend lint & production build
cd client
npm run lint
npm run build
```

---

## Deployment

### Backend (Render)
- **Root Directory:** `server`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment Variables:** Configure `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`, `PORT`, `NODE_ENV=production`, `GEMINI_API_KEY`, and VAPID keys in your hosting provider's environment settings.

### Frontend (Vercel / Netlify / Render Static Site)
- **Root Directory:** `client`
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Environment Variable:** Set `VITE_API_URL` to your deployed backend URL (e.g., `https://your-backend.onrender.com/api/v1`).

