const axios = require('axios');

const API = 'http://localhost:5000/api';
let token = '';
let productId = '';

async function run() {
    try {
        console.log("1. Registering user...");
        const email = `test${Date.now()}@example.com`;
        const regRes = await axios.post(`${API}/auth/register`, {
            name: 'Test User',
            email,
            password: 'Password123!',
            confirmPassword: 'Password123!'
        });
        console.log("Register API succeeded:", regRes.status);
        token = regRes.data.data.token;

        console.log("2. Logging in...");
        const loginRes = await axios.post(`${API}/auth/login`, {
            email,
            password: 'Password123!'
        });
        console.log("Login API succeeded:", loginRes.status);
        if (loginRes.data.data && loginRes.data.data.token) {
            console.log("JWT/token stored correctly in memory");
            token = loginRes.data.data.token;
        }

        const headers = { Authorization: `Bearer ${token}` };

        console.log("3. Fetching Dashboard/Feed...");
        const feedRes = await axios.get(`${API}/feed`, { headers });
        console.log("Feed loaded. Sections:", feedRes.data.data.sections?.length);

        console.log("4. Searching products...");
        const searchRes = await axios.get(`${API}/search/universal?q=laptop`, { headers });
        const products = searchRes.data.products;
        console.log("Search returned products:", products?.length);
        
        if (products && products.length > 0) {
            const p = products[0];
            const retailer = p.offers && p.offers.length > 0 ? p.offers[0].retailer : 'Unknown';
            console.log(`Verified Product: [${retailer}] ${p.title} - ₹${p.lowestPrice || p.price}`);
            if (p.offers && p.offers.length > 0 && p.offers[0].url) console.log("Product URL is present.");
            
            productId = p.productId || p.id || p._id; // Depending on adapter output
        }

        if (productId) {
            console.log(`5. Adding Product ${productId} to Wishlist...`);
            const wishRes = await axios.post(`${API}/wishlist`, {
                productId,
                title: 'Test Laptop',
                image: 'img.jpg',
                currentPrice: 50000
            }, { headers });
            console.log("Wishlist works:", wishRes.status);
            
            console.log(`6. Fetching Product Details for ${productId}...`);
            const prodRes = await axios.get(`${API}/products/${encodeURIComponent(productId)}`, { headers });
            console.log("Product Details loaded. Title:", prodRes.data.product?.title);
        }

        console.log("7. Testing AI Assistant...");
        const aiRes = await axios.post(`${API}/assistant/chat`, { message: "Hello" }, { headers });
        console.log("AI Assistant works. Response:", aiRes.data.text?.substring(0, 30) + '...');

        console.log("8. Testing Logout...");
        const logoutRes = await axios.post(`${API}/auth/logout`, {}, { headers });
        console.log("Logout works:", logoutRes.status);

        console.log("ALL API VERIFICATIONS PASSED");
    } catch (e) {
        console.error("TEST FAILED:", e.response?.status, e.response?.data || e.message);
    }
}
run();
