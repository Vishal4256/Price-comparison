# PriceWise AI Product Comparison Report

An advanced, head-to-head AI Product Comparison feature has been built and deployed. It utilizes Gemini to analyze two products across 9 strict categories and mathematically declare a definitive winner.

## Architecture

### 1. Strict LLM Prompting (`geminiService.js`)
To prevent the AI from generating unstructured, conversational fluff, I engineered a highly specific system prompt:
- **Temperature Control**: Set to `0.2` to enforce factual, analytical output rather than creative generation.
- **MIME Type Enforcement**: Configured to `application/json` to guarantee the Google API returns valid JSON.
- **Rigid Schema**: The prompt explicitly maps out a required JSON structure, forcing the AI to return exactly 9 categories (Camera, Battery, Performance, Gaming, Display, Charging, Build Quality, Software, Value), assigning a specific `winner` tag to each row, and formulating a final overall `reasoning` summary.

### 2. Frontend Scorecard (`Compare.jsx`)
The frontend takes this massive JSON object and maps it into a beautiful, glanceable UI.
- **The Verdict Banner**: Displays the definitive winner in a massive, glowing Emerald banner alongside the AI's core reasoning.
- **Dynamic Highlighting**: As the UI maps over the 9 categories in the grid, it programmatically checks the `winner` tag for each row. If Product A wins "Battery", that specific cell is highlighted with a green `Winner` badge and a subtle background tint, making it incredibly easy for users to scan the strengths of each device.

## Performance
Because this feature relies on historical specs and tech benchmarks rather than live pricing, it completely bypasses the web scrapers. This allows the heavy Gemini analysis to execute rapidly, usually returning the complete comparison payload in under 3-4 seconds.
