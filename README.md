# PriceWise v1.0 🏷️

> An AI-powered, full-stack price comparison and shopping intelligence platform.

PriceWise is not just a search engine; it's an intelligent shopping assistant that unifies the web's best deals, monitors historical price drops, and uses AI to provide deterministic, actionable insights.

## Features

- **Universal Search**: Search across multiple simulated retailers (Amazon, BestBuy, Walmart) in parallel with robust fault tolerance.
- **Multimodal Inputs**: Search by text, upload an image, or scan a barcode straight from your browser.
- **Pricing Intelligence**: Normalizes prices, calculates shipping, and tracks historical price fluctuations.
- **AI Decision Engine**: Generates human-readable Deal Scores (0-100) and actionable shopping tips.
- **Personalized Feed**: A dynamic home dashboard prioritizing Wishlist price drops, Trending Deals, and recommendations based on your search history.
- **User Engagement**: Wishlists, Real-time Notifications, and Cashback tracking.

## Architecture

PriceWise uses a modern MERN stack architecture with a strong emphasis on service decoupling and caching.

- **Frontend**: React, React Router, Vite, TailwindCSS, `@zxing/browser` (Barcode Scanning).
- **Backend**: Node.js, Express, MongoDB (Mongoose), Redis (ioredis).
- **AI Integration**: Gemini 1.5 Pro (Generative AI & Vision).
- **Infrastructure**: Docker, Docker Compose.

For detailed architecture diagrams, refer to `docs/architecture.md`.

## Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB
- Redis (optional, but recommended for caching)
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pricewise.git
   cd pricewise
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Add your GEMINI_API_KEY and DB credentials to .env
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Deployment Recommendation
PriceWise is a standard MERN stack application. We recommend the following platforms for production deployment:
- **Frontend**: Vercel or Netlify
- **Backend**: Render, Heroku, or DigitalOcean App Platform
- **Database**: MongoDB Atlas
- **Cache**: Upstash Redis (Optional, application degrades gracefully if missing)

### Docker (Optional)
Docker support (`docker-compose.yml` and `Dockerfile`) is included in the repository for those who prefer containerization, but it is not required for local development or production deployment.

## Documentation Directory

Extensive documentation is available in the `/docs` folder:
- **Architecture**: `docs/architecture.md` (System design and diagrams)
- **API Reference**: `docs/api.md` (Endpoints and payloads)
- **Deployment**: `docs/deployment.md` (Docker and production configs)
- **Phase Reports**: Detailed reports generated during each phase of development (e.g., `docs/security_report.md`, `docs/price_intelligence_report.md`).

## Performance Guarantees
- **<500ms** response times on cached Search and Feed endpoints.
- **Graceful Degradation**: The application remains fully functional (with slower response times) even if Redis goes offline.
- **Resilient Web Scraping**: Retailer adapters timeout gracefully after 8 seconds without crashing the main search pipeline.

---
*Built as a showcase of advanced full-stack engineering and practical AI integration.*
