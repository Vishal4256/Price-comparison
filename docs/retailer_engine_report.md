# PriceWise Retailer Engine Architecture Report

The monolithic scraper approach has been entirely refactored into a highly scalable, plugin-based **Retailer Engine**. This architecture makes it effortless to add new retailers in the future without modifying core application logic.

## Core Architectural Components

### 1. Retailer Registry (`registry.js`)
Instead of hardcoding imports for every scraper, the Registry automatically parses the `adapters` directory at runtime. It registers every valid JavaScript file as a standalone retailer plugin. Adding "Ebay" in the future is as simple as creating `ebay.js` inside the adapters folder.

### 2. Capability Matrix (`capabilities.js`)
Different retailers support different levels of interaction (e.g., scraping search pages vs scraping direct product pages). The Capability Registry acts as a gateway, allowing the orchestrator to check `canSearch`, `canFetchHistory`, or `canExtractReviews` before attempting to spin up an adapter.

### 3. Base Utilities (`baseAdapter.js`)
To enforce strict uniformity, the Base Adapter provides:
- **`normalizeProduct()`**: A transformer that guarantees every retailer returns the exact same data schema (handling missing images, standardizing price formats, injecting fallback brands).
- **`withTimeout()`**: A `Promise.race` wrapper that prevents rogue or hanging connections from freezing the API.
- **`simulateLatency()`**: A realistic delay generator for dynamic mocking during development to avoid CAPTCHA triggers on raw Axios requests.

### 4. Dedicated Adapters (Plugins)
6 dedicated retailer plugins were successfully created:
1. `amazon.js`
2. `flipkart.js`
3. `myntra.js` (Includes logic to only execute on fashion/apparel intents)
4. `ajio.js` (Includes logic to only execute on fashion/apparel intents)
5. `nykaa.js` (Includes logic to only execute on beauty/cosmetic intents)
6. `croma.js` (Includes logic to only execute on electronic intents)

### 5. Orchestrator Engine (`scraperService.js`)
The `searchAllRetailers` function was rewritten into an Orchestrator. 
- It queries the `registry` for all available retailers.
- It checks `capabilities` to filter out unsupported retailers.
- It spins up all valid adapters in a massive `Promise.allSettled()` pool, allowing them to fetch data in parallel.
- If one adapter crashes (e.g., Amazon blocks the IP), the `allSettled` block ignores the exception, collects data from the remaining 5 retailers, aggregates, and returns a unified JSON payload to the frontend.

## API Readiness
The entire engine currently utilizes dynamic mocking combined with artificial latency to mimic true cross-retailer HTTP requests. The architecture is perfectly shaped so that when you decide to implement a premium proxy rotation network (like BrightData or ScraperAPI), you only need to modify the individual adapter files; the orchestration and normalization pipelines will remain entirely untouched.
