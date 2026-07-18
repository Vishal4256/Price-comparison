const registry = require('./services/retailers/registry');
const pricingEngine = require('./services/pricingEngine');
const cacheService = require('./services/cache');
const BaseRetailer = require('./services/retailers/BaseRetailer');

// Create mock retailers
class MockFastRetailer extends BaseRetailer {
    constructor() { super(); this.name = "FastRetailer"; }
    async search() {
        return [
            { title: 'Test Laptop', price: 500, shipping: 50, url: 'fast.com' },
            { title: 'Test Phone', price: 200, shipping: 0, url: 'fast2.com' }
        ];
    }
}

class MockSlowRetailer extends BaseRetailer {
    constructor() { super(); this.name = "SlowRetailer"; }
    async search() {
        return new Promise(resolve => setTimeout(resolve, 8000)); // Will trigger timeout
    }
}

async function verify() {
    console.log("--- PHASE 2 E2E VERIFICATION ---");
    
    registry.register(new MockFastRetailer());
    registry.register(new MockSlowRetailer());
    
    console.log("\n1. Testing Registry Parallel Search & Timeout Fault Tolerance");
    const startTime = Date.now();
    const rawResults = await registry.searchAll({ keywords: 'test' });
    const elapsed = Date.now() - startTime;
    
    // The registry wrapper times out at 7000ms. It should take around 7000ms.
    console.log(`Elapsed time: ${elapsed}ms`);
    
    const fastRes = rawResults.find(r => r.retailer === 'FastRetailer');
    const slowRes = rawResults.find(r => r.retailer === 'SlowRetailer');
    
    if (fastRes.status === 'success' && slowRes.status === 'timeout') {
        console.log("✅ Fault Tolerance & Parallel execution passed!");
    } else {
        console.log("❌ Fault Tolerance failed", rawResults);
    }

    console.log("\n2. Testing Pricing Engine Math");
    const normalized = pricingEngine.normalizeOffers([
        { retailer: 'A', status: 'success', data: [{ title: 'iPhone 15', price: 799, shipping: 20 }] },
        { retailer: 'B', status: 'success', data: [{ title: 'iPhone 15', price: 750, shipping: 0 }] },
        { retailer: 'C', status: 'success', data: [{ title: 'iPhone 15', price: 820, shipping: 10 }] },
        { retailer: 'Slow', status: 'timeout' }
    ]);
    
    const product = normalized.find(p => p.title === 'iPhone 15');
    if (product) {
        console.log(`Lowest: ${product.lowestPrice} (Expected 750)`);
        console.log(`Highest: ${product.highestPrice} (Expected 830 - 820+10 shipping)`);
        console.log(`Average: ${product.averagePrice} (Expected 800)`);
        
        if (product.lowestPrice === 750 && product.highestPrice === 830 && product.averagePrice === 800) {
            console.log("✅ Pricing Engine Math passed!");
        } else {
            console.log("❌ Pricing Engine Math failed!");
        }
    }

    console.log("\n3. Testing Cache Abstraction");
    await cacheService.set('test-key', { hit: true });
    const cached = await cacheService.get('test-key');
    if (cached && cached.hit) {
        console.log("✅ Cache Service passed!");
    } else {
        console.log("❌ Cache Service failed!");
    }
}

verify().then(() => console.log("\nVERIFICATION COMPLETE.")).catch(console.error);
