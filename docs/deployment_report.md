# PriceWise Production Deployment Guide & Report

## Overview
This report outlines the deployment architecture for the PriceWise application, detailing how the frontend, backend, and database connect in a production environment. The application is now fully configured for monitoring, logging, and automated deployment.

## 1. Infrastructure Architecture

### Frontend (Vercel)
- **Framework:** React + Vite
- **Hosting:** Vercel (Edge CDN)
- **Configuration:** A `vercel.json` file is present in the `frontend/` directory. It contains rewrite rules (`/(.*) -> /index.html`) required to prevent `404 Not Found` errors when users refresh React Router paths.
- **Action Required:** 
  1. Connect your GitHub repository to Vercel.
  2. Set the root directory to `frontend`.
  3. Set the Environment Variable: `VITE_API_URL` to your Render backend URL (e.g., `https://pricewise-api.onrender.com`).

### Backend (Render)
- **Runtime:** Node.js / Express
- **Hosting:** Render.com (Web Service)
- **Configuration:** We created a Blueprint file (`render.yaml`) in the project root. This Infrastructure-as-Code file tells Render exactly how to build and start your application without manual dashboard configuration.
- **Action Required:**
  1. Connect your GitHub repository to Render.
  2. Render will automatically detect `render.yaml` and prompt you to create the "pricewise-api" service.
  3. You will need to manually supply the secure Environment Variables defined as `sync: false` (like `MONGODB_URI` and `SENTRY_DSN`).

### Database (MongoDB Atlas)
- **Hosting:** MongoDB Atlas (Cloud)
- **Security:** Ensure you update the "Network Access" tab in Atlas to allow connections from anywhere (`0.0.0.0/0`) since Render's IP addresses are dynamic. Ensure your Database User has read/write privileges.
- **Connection:** Provide the resulting connection string to Render via the `MONGODB_URI` environment variable.

## 2. Monitoring & Logging

### Error Tracking (Sentry)
- **Implementation:** Integrated `@sentry/node` at the highest level of `backend/index.js`.
- **Impact:** Any unhandled exceptions, server crashes, or API timeouts will instantly trigger an alert in your Sentry dashboard, complete with a full stack trace and request context.

### Structured Logging (Winston)
- **Implementation:** Replaced standard `console.log` with a configured Winston logger instance.
- **Impact:** In production, Winston outputs logs in structured JSON format including exact timestamps. This makes it incredibly easy to parse, search, and aggregate logs using external services (like Datadog, AWS CloudWatch, or Logtail).

## 3. Environment Variables Quick Reference

**Frontend (`frontend/.env.example`):**
- `VITE_API_URL` - Points to your Render backend URL.

**Backend (`backend/.env.example`):**
- `MONGODB_URI` - Your Atlas cluster string.
- `JWT_SECRET` - Secure random string for session tokens.
- `SENTRY_DSN` - Your public key from Sentry.io.
- `FRONTEND_URL` - Your Vercel domain (used for CORS security).
- `NODE_ENV` - Set to `production`.

## Conclusion
The PriceWise application is now production-ready. The codebase is armed with automated deployment scripts, robust security measures, structured logging, and real-time error tracking.
