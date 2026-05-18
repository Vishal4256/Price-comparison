# PriceSense Setup Instructions

PriceSense is a full-stack MERN (MongoDB, Express, React, Node.js) price tracking application.

## Prerequisites
- Node.js (v20+)
- MongoDB
- Docker (optional)

## Local Setup

### 1. Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder (see `.env.example`).
Start the backend:
```bash
npm run dev
```

### 2. Frontend (React SPA)
```bash
cd frontend
npm install
```
Start the frontend:
```bash
npm run dev
```

## Docker Setup
From the root directory:
```bash
docker-compose up --build
```

## Key Features
- **Scraping**: Uses Puppeteer with Stealth plugin to fetch prices from Amazon, Flipkart, and eBay.
- **Fake Discount Detection**: Analyzes historical price changes to flag artificial price hikes before sales.
- **Price History**: Visualizes price trends using Recharts.
- **Price Alerts**: Set target prices and receive email notifications via Nodemailer.
- **Comparison Table**: Compare prices across multiple stores in a single view.
- **User System**: Secure JWT-based authentication for wishlists and alerts.

