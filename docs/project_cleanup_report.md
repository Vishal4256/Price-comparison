# PriceWise v2.0 - Project Cleanup Report

This report outlines the files and structures that were removed to provide a clean foundation for PriceWise v2.0, while maintaining the essential React, Express, MongoDB, and Authentication structure.

## Removed Components
All non-essential and feature-specific React components were removed:
- `AIAssistant.jsx`
- `CategoryCard.jsx`
- `CompareBar.jsx`
- `ComparisonSummary.jsx`
- `PriceAlert.jsx`
- `PriceChart.jsx`
- `ProductCard.jsx`
- `SearchBar.jsx`
- `SmallProductCard.jsx`
- The entire `frontend/src/components/home/` directory (which contained 14 sections like `DealOfDay.jsx`, `BiggestPriceDrops.jsx`, etc.)
- `frontend/src/context/CompareContext.jsx`

## Removed APIs & Routes
All API endpoints related to core features outside of user authentication were removed:
- `/api/admin/*`
- `/api/ai/*`
- `/api/alerts/*`
- `/api/history/*`
- `/api/home/*`
- `/api/prediction/*`
- `/api/price/*`
- `/api/priceHistory/*`
- `/api/products/*`
- `/api/stats/*`
- `/api/wishlist/*`
- Only `/api/auth/*` and `/api/users/*` were retained.

## Removed Services
All backend services were deleted to clear outdated business logic:
- `AffiliateService.js`
- `PriceService.js`
- `ProductService.js`
- `geminiService.js`
- `historyService.js`
- `matchingService.js`
- `recommendationService.js`

## Removed Controllers
- `adminController.js`
- `aiController.js`
- `alertController.js`
- `alertsController.js`
- `homeController.js`
- `predictionController.js`
- `priceController.js`
- `productController.js`
- `wishlistController.js`

## Removed Models
All MongoDB models were dropped to allow a fresh schema design, except `User`:
- `Alert.js`
- `ComparisonAnalytic.js`
- `NewsletterSubscription.js`
- `Price.js`
- `PriceHistory.js`
- `Product.js`
- `ProductAlias.js`
- `Retailer.js`
- `RetailerPrice.js`
- `ScrapeLog.js`
- `SearchAnalytic.js`
- `ViewHistory.js`
- `Wishlist.js`

## Remaining Project Structure
The MERN architecture remains robust and intact:

### Frontend
- **React Router Setup:** Found in `App.jsx`, providing routing to empty page skeletons (`/`, `/search`, `/product/:id`, `/compare`, `/dashboard`).
- **Authentication Pages:** `Login.jsx`, `Register.jsx`, `GuestRoute.jsx`, `ProtectedRoute.jsx` remain fully functional.
- **Navbar:** Cleaned up to provide basic navigation and user session state.
- **Styling:** Standard `index.css` and TailwindCSS config remain intact.

### Backend
- **Express Entry Point:** `index.js` simplified to load security middlewares (cors, morgan, helmet if present, rateLimit) and basic routes.
- **Database Connection:** Uses `dotenv` and `mongoose` connecting successfully to MongoDB Atlas.
- **Authentication:** `authController.js`, `authRoutes.js`, `auth.js` middleware, and `User.js` model are fully intact providing JWT login/register workflows.
- **Users:** `userController.js` stripped of dependencies on deleted models, providing profile updates and password changes.

## Remaining Dependencies
- Backend: `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`, `morgan`, `express-rate-limit`.
- Frontend: `react`, `react-dom`, `react-router-dom`, `lucide-react`, `tailwindcss`, `vite`, `axios` (configured in `api.js`).

## Issues Found & Resolved
- During the deletion of routes, an import mismatch occurred in `userRoutes.js` where `auth` was imported instead of `protect` from `auth.js` middleware. This caused a runtime Express routing error which was caught and fixed immediately.
- `userController.js` had heavy dependencies on `Alert.js`, `Wishlist.js`, and `PriceHistory.js` to calculate dashboard metrics. It was cleanly rewritten to decouple these dependencies and return a skeleton dashboard object for future implementations.

## Conclusion
The project builds successfully (both `npm run dev` and `npm run build` checked). The frontend routes and backend APIs initialize without missing dependencies. The platform is empty and 100% ready for PriceWise v2.0 development.
