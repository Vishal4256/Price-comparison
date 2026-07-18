# PriceWise Price Intelligence Report

A dedicated **Price Intelligence** module has been integrated directly into the Product Details dashboard. This feature bridges the gap between raw data (current price) and actionable buying advice.

## UI Components & Metrics

### 1. The Stats Grid
A top-level, 4-column grid that gives the user immediate historical context on the product's pricing volatility:
- **Current Price**: The live price fetched from the Retailer Engine.
- **Lowest Ever**: The historical floor price, visually highlighted in green with a downward trending arrow.
- **Highest Ever**: The historical ceiling price, highlighted in red with an upward trending arrow.
- **Average Price**: The calculated mean price over the tracking period, serving as the baseline for the Deal Score.

### 2. The Deal Score Widget
A highly visual, color-coded metric (0-100) calculated by analyzing the current price's variance from the historical average.
- **≥ 80 (Emerald)**: Exceptional deal. Price is significantly below the average.
- **60-79 (Amber)**: Good deal. Price is slightly below average.
- **< 60 (Rose)**: Poor deal. Price is at or above average.

### 3. AI Price Prediction & Timing
An AI-driven insight box that answers the user's most critical question: *"Should I buy this now or wait?"*
- Calculates a percentage chance of a price increase/decrease within a specific timeframe (e.g., 14 days).
- Provides contextual reasoning (e.g., upcoming festival demand, end-of-lifecycle inventory clearing).

## Architectural Placement
Rather than cluttering the AI Recommendation header, the `PriceIntelligence.jsx` component was mounted directly above the `PriceHistoryChart` in the right-hand data column. This creates a powerful, logical flow: users read the high-level intelligence metrics, then immediately see the visual proof of those metrics in the interactive chart directly below it.
