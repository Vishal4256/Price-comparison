/**
 * PriceWise — Full End-to-End API Verification
 * Tests every backend feature against the live Render deployment.
 */
const https = require('https');
const RENDER_API = 'https://price-comparison-9w89.onrender.com/api';

let passed = 0, failed = 0;

function request(method, url, body, headers = {}) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const bodyStr = body ? JSON.stringify(body) : null;
        const options = {
            hostname: parsedUrl.hostname, port: 443,
            path: parsedUrl.pathname + parsedUrl.search, method,
            headers: { 'Content-Type': 'application/json', 'Content-Length': bodyStr ? Buffer.byteLength(bodyStr) : 0, ...headers }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
                catch { resolve({ status: res.statusCode, body: data }); }
            });
        });
        req.on('error', reject);
        if (bodyStr) req.write(bodyStr);
        req.end();
    });
}

function check(label, condition, got) {
    if (condition) {
        console.log(`  ✅ ${label}`);
        passed++;
    } else {
        console.log(`  ❌ ${label} — got: ${JSON.stringify(got)}`);
        failed++;
    }
}

async function run() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('       PriceWise Full Feature Verification');
    console.log(`       ${new Date().toISOString()}`);
    console.log('═══════════════════════════════════════════════════════\n');

    // ── REGISTER ────────────────────────────────────────────────────────
    console.log('【1】 AUTH — Register');
    const email = `e2e${Date.now()}@pw.test`;
    const reg = await request('POST', `${RENDER_API}/auth/register`, {
        name: 'E2E Test', email, password: 'Test@1234', confirmPassword: 'Test@1234'
    });
    check('HTTP 201', reg.status === 201, reg.status);
    check('success: true', reg.body?.success === true, reg.body?.success);
    const TOKEN = reg.body?.data?.token;
    check('JWT token returned', !!TOKEN, null);
    const USER_ID = reg.body?.data?._id;
    check('user _id returned', !!USER_ID, null);
    const AUTH = { Authorization: `Bearer ${TOKEN}` };

    // ── LOGIN ─────────────────────────────────────────────────────────────
    console.log('\n【2】 AUTH — Login');
    const login = await request('POST', `${RENDER_API}/auth/login`, { email, password: 'Test@1234' });
    check('HTTP 200', login.status === 200, login.status);
    check('token in data.data', !!login.body?.data?.token, login.body?.data?.token);
    check('JWT duration 7d', (() => {
        try {
            const p = JSON.parse(Buffer.from(login.body?.data?.token?.split('.')[1], 'base64').toString());
            return (p.exp - p.iat) > 60 * 60 * 24;
        } catch { return false; }
    })(), null);

    // ── FEED ──────────────────────────────────────────────────────────────
    console.log('\n【3】 DASHBOARD — GET /api/feed');
    const feed = await request('GET', `${RENDER_API}/feed`, null, AUTH);
    check('HTTP 200', feed.status === 200, feed.status);
    check('success: true', feed.body?.success === true, feed.body?.success);
    check('data.sections is array', Array.isArray(feed.body?.data?.sections), typeof feed.body?.data?.sections);
    check('data.shoppingTip is string', typeof feed.body?.data?.shoppingTip === 'string', typeof feed.body?.data?.shoppingTip);
    check('Response is JSON (not HTML)', typeof feed.body === 'object', typeof feed.body);

    // ── SEARCH ────────────────────────────────────────────────────────────
    console.log('\n【4】 SEARCH — GET /api/search/universal?q=laptop');
    const search = await request('GET', `${RENDER_API}/search/universal?q=laptop`, null, AUTH);
    check('HTTP 200', search.status === 200, search.status);
    check('success: true', search.body?.success === true, search.body?.success);
    check('products is array', Array.isArray(search.body?.products), typeof search.body?.products);
    check('intent extracted', !!search.body?.intent, search.body?.intent);
    const PRODUCT = search.body?.products?.[0];
    if (PRODUCT) {
        console.log(`  ℹ  First product: "${PRODUCT.title?.slice(0,50)}" — ₹${PRODUCT.currentPrice} @ ${PRODUCT.retailer}`);
        check('product has title', !!PRODUCT.title, PRODUCT.title);
        check('product has currentPrice', typeof PRODUCT.currentPrice === 'number', PRODUCT.currentPrice);
        check('product has retailer', !!PRODUCT.retailer, PRODUCT.retailer);
        check('product has url', !!PRODUCT.url || !!PRODUCT.productUrl, null);
    } else {
        console.log('  ⚠️  No products returned for "laptop" — search pipeline may need attention');
    }

    // ── PRODUCT DETAILS ───────────────────────────────────────────────────
    if (PRODUCT?._id) {
        console.log(`\n【5】 PRODUCT DETAILS — GET /api/products/${PRODUCT._id}`);
        const prod = await request('GET', `${RENDER_API}/products/${PRODUCT._id}`, null, AUTH);
        check('HTTP 200', prod.status === 200, prod.status);
        check('success: true', prod.body?.success === true, prod.body?.success);
    } else {
        console.log('\n【5】 PRODUCT DETAILS — Skipped (no product ID from search)');
    }

    // ── WISHLIST — GET ────────────────────────────────────────────────────
    console.log('\n【6】 WISHLIST — GET /api/wishlist');
    const wlGet = await request('GET', `${RENDER_API}/wishlist`, null, AUTH);
    check('HTTP 200', wlGet.status === 200, wlGet.status);
    check('success: true', wlGet.body?.success === true, wlGet.body?.success);
    check('data.items is array', Array.isArray(wlGet.body?.data?.items), typeof wlGet.body?.data?.items);

    // ── WISHLIST — ADD ────────────────────────────────────────────────────
    console.log('\n【7】 WISHLIST — POST /api/wishlist (add item)');
    const wlAdd = await request('POST', `${RENDER_API}/wishlist`, {
        productId: 'verify-test-001',
        title: 'Test Laptop for Verification',
        retailer: 'amazon',
        currentPrice: 45000,
        targetPrice: 40000,
        notifyOnDrop: true
    }, AUTH);
    check('HTTP 201', wlAdd.status === 201, wlAdd.status);
    check('item added', wlAdd.body?.success === true, wlAdd.body);
    const addedItemId = wlAdd.body?.data?.items?.find(i => i.productId === 'verify-test-001')?._id;
    check('item ID returned', !!addedItemId, addedItemId);

    // ── WISHLIST — UPDATE NOTIFICATION ────────────────────────────────────
    if (addedItemId) {
        console.log('\n【8】 WISHLIST — PUT /api/wishlist/:id (toggle notification)');
        const wlUpdate = await request('PUT', `${RENDER_API}/wishlist/${addedItemId}`, { notifyOnDrop: false }, AUTH);
        check('HTTP 200', wlUpdate.status === 200, wlUpdate.status);
        check('notifyOnDrop updated', wlUpdate.body?.data?.items?.find(i => i._id.toString() === addedItemId.toString())?.notifyOnDrop === false, null);

        // ── WISHLIST — REMOVE ─────────────────────────────────────────────
        console.log('\n【9】 WISHLIST — DELETE /api/wishlist/:id (remove item)');
        const wlDel = await request('DELETE', `${RENDER_API}/wishlist/${addedItemId}`, null, AUTH);
        check('HTTP 200', wlDel.status === 200, wlDel.status);
        check('item removed', !wlDel.body?.data?.items?.find(i => i._id.toString() === addedItemId.toString()), null);
    }

    // ── PROFILE — GET ─────────────────────────────────────────────────────
    console.log('\n【10】 PROFILE — GET /api/users/profile');
    const profile = await request('GET', `${RENDER_API}/users/profile`, null, AUTH);
    check('HTTP 200', profile.status === 200, profile.status);
    check('user object returned', !!profile.body?.user, profile.body?.user);
    check('name field present', !!profile.body?.user?.name, profile.body?.user?.name);
    check('email field present', !!profile.body?.user?.email, profile.body?.user?.email);

    // ── PROFILE — UPDATE ──────────────────────────────────────────────────
    console.log('\n【11】 PROFILE — PUT /api/users/profile (update name)');
    const profileUpdate = await request('PUT', `${RENDER_API}/users/profile`, { name: 'E2E Updated Name' }, AUTH);
    check('HTTP 200', profileUpdate.status === 200, profileUpdate.status);
    check('name updated', profileUpdate.body?.user?.name === 'E2E Updated Name', profileUpdate.body?.user?.name);

    // ── AI ASSISTANT ──────────────────────────────────────────────────────
    console.log('\n【12】 AI ASSISTANT — POST /api/assistant/chat');
    const ai = await request('POST', `${RENDER_API}/assistant/chat`, { message: 'What laptop should I buy under ₹50000?' }, AUTH);
    const aiOk = ai.status === 200 || ai.status === 429 || (ai.status === 200 && ai.body?.reply);
    check('HTTP 200 or graceful quota (429)', ai.status === 200 || ai.status === 429, ai.status);
    if (ai.status === 200) {
        check('reply field present', !!ai.body?.data?.reply || !!ai.body?.reply, null);
    } else {
        console.log(`  ℹ  Gemini quota exhausted (429) — graceful handling expected in UI`);
    }

    // ── VISION — endpoint exists ──────────────────────────────────────────
    console.log('\n【13】 VISION SEARCH — POST /api/vision/search (endpoint reachable)');
    // Can't send a real image over raw https — just verify the endpoint exists (not 404)
    const vision = await request('POST', `${RENDER_API}/vision/search`, {}, AUTH);
    check('Endpoint exists (not 404)', vision.status !== 404, vision.status);
    console.log(`  ℹ  Status ${vision.status} — requires multipart/form-data with real image`);

    // ── HEALTH ────────────────────────────────────────────────────────────
    console.log('\n【14】 HEALTH — GET /api/health');
    const health = await request('GET', `${RENDER_API}/health`, null);
    check('HTTP 200', health.status === 200, health.status);
    check('database: connected', health.body?.database === 'connected', health.body?.database);

    // ── LOGOUT ────────────────────────────────────────────────────────────
    console.log('\n【15】 AUTH — POST /api/auth/logout');
    const logout = await request('POST', `${RENDER_API}/auth/logout`, {}, AUTH);
    check('HTTP 200', logout.status === 200, logout.status);

    // ── PROTECTED ROUTE AFTER LOGOUT ─────────────────────────────────────
    console.log('\n【16】 SECURITY — GET /api/feed after logout (should 401)');
    const afterLogout = await request('GET', `${RENDER_API}/feed`, null, AUTH);
    check('401 after logout', afterLogout.status === 401, afterLogout.status);

    // ── SUMMARY ───────────────────────────────────────────────────────────
    const total = passed + failed;
    console.log('\n═══════════════════════════════════════════════════════');
    console.log(`  RESULTS: ${passed}/${total} checks passed`);
    console.log(`  ${failed === 0 ? '🟢 ALL PASS' : `🔴 ${failed} FAILED`}`);
    console.log('═══════════════════════════════════════════════════════');
}

run().catch(console.error);
