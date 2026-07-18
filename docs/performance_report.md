# System Optimization & Performance Report

## Overview
This report details the comprehensive full-stack optimizations applied to the PriceWise platform to improve load times, reduce server costs, and ensure database query efficiency at scale. The optimizations span the React frontend, Express API layer, and MongoDB database.

## 1. Frontend Optimizations (React & UI)

### Code Splitting and Lazy Loading
- **Implementation:** Refactored `App.jsx` to dynamically import route components using `React.lazy()` and `<Suspense>`.
- **Impact:** The application no longer forces users to download the entire application bundle on initial load. Users now only download the code necessary for the current page they are visiting (e.g., `Home.jsx`), dramatically improving First Contentful Paint (FCP) and Time to Interactive (TTI).

### Image Lazy Loading
- **Implementation:** Added native HTML5 `loading="lazy"` and `decoding="async"` attributes to `<img>` tags across key UI components including `ProductCard`, `ImageGallery`, `WishlistTab`, `AlertsTab`, and `AIAssistantWidget`.
- **Impact:** Images below the fold are now deferred until the user scrolls them into the viewport. This saves significant bandwidth on image-heavy pages (like search results or the dashboard) and prevents the browser's main thread from being blocked during initial render.

## 2. Backend Optimizations (Express API)

### In-Memory Search Caching
- **Implementation:** Introduced a Map-based in-memory cache in `searchController.js` for the `universalSearch` endpoint with a TTL (Time-To-Live) of 5 minutes.
- **Impact:** When multiple users search for trending items (e.g., "iPhone 15"), the server now bypasses the expensive Gemini intent extraction and concurrent web scraping engines, returning the cached payload instantly. This significantly reduces API latency and lowers third-party API costs.

### Dashboard Pagination
- **Implementation:** Upgraded the `getDashboardItems` method in `wishlistController.js` to accept `page` and `limit` query parameters, implementing `.skip()` and `.limit()` on the underlying Mongoose query.
- **Impact:** Prevents memory bloat on the Node.js server. Instead of attempting to load and process thousands of wishlist/alert items for power users simultaneously, the API now streams them in manageable chunks (defaulting to 20 per page).

## 3. Database Optimizations (MongoDB)

### Explicit Secondary Indexing
- **Implementation:** Added explicit secondary indexes to the `Wishlist.js` schema for the `isFavorite` and `targetPrice` fields.
- **Impact:** Because the dashboard controller frequently filters the user's items array (`isFavorite: true` or `targetPrice !== null`), these indexes allow the MongoDB engine to perform rapid B-Tree lookups instead of slow, full-collection scans. This ensures the dashboard remains highly responsive even as the database grows to millions of rows.

## Conclusion
By implementing lazy loading (both code and media), API caching, query pagination, and database indexing, the PriceWise platform is now highly resilient, cost-effective, and capable of handling significant traffic spikes with minimal latency degradation.
