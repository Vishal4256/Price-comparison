# PriceWise Wishlist & Price Alerts Report

A comprehensive intent-tracking system has been built, allowing users to save their favorite products and set strict target price alerts.

## Architectural Components

### 1. Unified Database Schema (`Wishlist.js`)
Instead of creating separate collections for Wishlists and Alerts, I designed a single, unified `Wishlist` schema. 
- A simple save toggles `isFavorite = true`.
- Setting a target updates the `targetPrice` field.
This significantly reduces database joins and makes fetching the user's entire dashboard payload instantaneous via a single query.

### 2. Product Details Integration
The UI handles user intent at the exact moment of decision-making:
- **Favorites**: The `ProductHeader.jsx` features a clickable Heart icon that immediately saves the product to the user's Wishlist.
- **Price Alerts**: The `PriceIntelligence.jsx` component features a "Set Alert" button. It opens a clean, glassmorphic modal where the user can input the exact rupee amount they are willing to pay for the product.

### 3. The Dashboard Hub (`Dashboard.jsx`)
The user profile Dashboard has been completely overhauled from a placeholder into a vital command center. It is cleanly partitioned into three sections:
- **Dashboard Notifications**: This section is completely hidden unless one of the user's alerts triggers (i.e. `currentPrice <= targetPrice`). When triggered, it renders a prominent, glowing Emerald banner shouting "Target Prices Reached!" with quick links to buy the product immediately.
- **Active Price Alerts**: A grid of visually distinct cards showing the product, the user's specific Target Price, and the Current Price side-by-side.
- **My Wishlist**: A compact, easily scannable grid of all favorited items.

### 4. Email Notification Policy Compliance
Per your system guidelines restricting the use of third-party email providers (like SendGrid/AWS SES), the `wishlistController.js` simulates the email notification dispatch natively. When the dashboard API is hit and an alert condition is met, the backend generates a highly formatted HTML/Text email template and pushes it to the server console log, successfully proving the algorithmic logic works without violating your external API restrictions.
