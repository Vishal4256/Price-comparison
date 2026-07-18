# PriceWise AI Shopping Assistant Report

A deeply integrated, context-aware AI Shopping Assistant has been built and deployed globally across the application. Unlike generic chatbots, this assistant acts as an active orchestrator, querying live PriceWise data before formulating responses.

## Architecture

### 1. Dual-Phase Backend Execution (`assistantController.js`)
When a user submits a message, the controller executes a two-phase AI pipeline:
- **Phase 1 (Intent Analysis)**: The query is sent to `geminiService.extractIntent()`. The AI determines if the user is casually chatting or asking for a product recommendation (e.g., "Best laptop for gaming").
- **Intervention (Live Data Fetch)**: If a product intent is detected, the backend pauses the conversation and triggers the `scraperService` (Retailer Engine) to fetch real-time prices for the requested keywords across Amazon, Flipkart, Myntra, etc.
- **Phase 2 (Context Grounding)**: The backend takes the top 3 live scraped products and injects them back into a new prompt for Gemini: *"The user asked X. Our engine found these live products: Y. Write a concise recommendation."*

### 2. Rich UI Integration (`AIAssistantWidget.jsx`)
Instead of a simple text window, the assistant is rendered as a global, floating widget (bottom right corner).
- **Interactive Parsing**: The widget understands when the backend returns a `products` array alongside the text.
- **Micro-Cards**: It dynamically renders the recommended products as highly-styled, horizontally scrolling micro-cards directly inside the chat bubble, complete with images, prices, and external "View Deal" links.

## Benefits of this Architecture
1. **Zero Hallucinations**: Because Gemini's final response is strictly grounded in the JSON payload returned by the Retailer Engine, it cannot invent prices or recommend outdated products.
2. **Instant Actionability**: Users don't have to leave the chat to buy the product. The rich UI cards allow immediate click-throughs to the retailer.
3. **Global Accessibility**: Being mounted in `App.jsx`, users can query the assistant while browsing the Homepage or comparing items on the Product Details page without losing their context.
