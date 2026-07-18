const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:5000/api';
let token = '';
let userId = '';

async function runSmokeTest() {
    console.log("🔥 Starting PriceWise v1.0 Production Smoke Test...");

    try {
        // 1. Health Check
        console.log("Checking /health/ready...");
        const health = await axios.get('http://localhost:5000/health/ready');
        if (health.data.status !== 'healthy') throw new Error("Health check failed");

        // 2. Register & Login
        const testUser = {
            name: 'Smoke Tester',
            email: `smoketest_${Date.now()}@example.com`,
            password: 'Password123!'
        };

        console.log("Registering test user...");
        const regRes = await axios.post(`${API_URL}/auth/register`, testUser);
        token = regRes.data.data.token;
        userId = regRes.data.data._id;

        // 3. Search
        console.log("Performing search for 'laptop'...");
        const searchRes = await axios.get(`${API_URL}/search/universal?q=laptop`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("Search Response:", searchRes.data);
        if (!searchRes.data.success || !searchRes.data.products || searchRes.data.products.length === 0) throw new Error("Search failed or empty");

        const testProductId = searchRes.data.products[0].productId;

        // 4. Product Details
        console.log("Fetching product details...");
        const prodRes = await axios.get(`${API_URL}/products/${testProductId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!prodRes.data.success) throw new Error("Product details failed");

        // 5. Wishlist
        console.log("Adding to wishlist...");
        const wishRes = await axios.post(`${API_URL}/wishlist`, { productId: testProductId }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!wishRes.data.success) throw new Error("Wishlist add failed");

        // 6. Feed Generation (Cache Invalidated)
        console.log("Fetching personalized feed...");
        const feedRes = await axios.get(`${API_URL}/feed`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!feedRes.data.success) throw new Error("Feed generation failed");

        // 7. Logout
        console.log("Logging out...");
        await axios.post(`${API_URL}/auth/logout`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("✅ Smoke Test Passed Successfully!");

    } catch (error) {
        console.error("❌ Smoke Test Failed:", error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

// Ensure server is running before executing
runSmokeTest();
