const https = require('https');
const RENDER_API = 'https://price-comparison-9w89.onrender.com/api';

function request(method, url, body, headers = {}) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const bodyStr = body ? JSON.stringify(body) : null;
        const options = {
            hostname: parsedUrl.hostname,
            port: 443,
            path: parsedUrl.pathname + parsedUrl.search,
            method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': bodyStr ? Buffer.byteLength(bodyStr) : 0,
                ...headers
            }
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

async function run() {
    console.log('=== AUTH FLOW VERIFICATION ===');
    console.log('Backend:', RENDER_API);

    // 1. Register
    const email = `authtest${Date.now()}@example.com`;
    const regRes = await request('POST', `${RENDER_API}/auth/register`, {
        name: 'Auth Test', email, password: 'Test@1234', confirmPassword: 'Test@1234'
    });
    console.log('\n[1] Register Status:', regRes.status);
    const regToken = regRes.body?.data?.token;
    console.log('    Token from register response (data.data.token):', regToken ? regToken.substring(0, 40) + '...' : 'MISSING ❌');

    // 2. Login
    const loginRes = await request('POST', `${RENDER_API}/auth/login`, { email, password: 'Test@1234' });
    console.log('\n[2] Login Status:', loginRes.status);
    const loginToken = loginRes.body?.data?.token;
    console.log('    Token from login response (data.data.token):', loginToken ? loginToken.substring(0, 40) + '...' : 'MISSING ❌');

    // 3. Decode the token expiry
    if (loginToken) {
        const parts = loginToken.split('.');
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        const expiresAt = new Date(payload.exp * 1000);
        const issuedAt = new Date(payload.iat * 1000);
        const durationMs = (payload.exp - payload.iat) * 1000;
        const durationH = (durationMs / 1000 / 60 / 60).toFixed(1);
        console.log('\n[3] Token Expiry Analysis:');
        console.log('    Issued at:', issuedAt.toISOString());
        console.log('    Expires at:', expiresAt.toISOString());
        console.log('    Duration:', durationH, 'hours');
        if (durationMs < 60000) {
            console.log('    ❌ Token expires in LESS THAN 1 minute — this causes the redirect loop!');
        } else {
            console.log('    ✅ Token duration is adequate for a session.');
        }
    }

    // 4. Use token to call /api/feed
    const authHeaders = { Authorization: `Bearer ${loginToken}` };
    const feedRes = await request('GET', `${RENDER_API}/feed`, null, authHeaders);
    console.log('\n[4] GET /api/feed with real token:');
    console.log('    Status:', feedRes.status);
    if (feedRes.status === 200) {
        console.log('    ✅ Feed request succeeded — no redirect loop will occur');
    } else if (feedRes.status === 401) {
        console.log('    ❌ 401 returned — Axios interceptor WILL redirect to /login');
        console.log('    Response:', JSON.stringify(feedRes.body));
    }

    // 5. Test with bad token (simulate old "undefined" storage bug)
    const badTokenRes = await request('GET', `${RENDER_API}/feed`, null, { Authorization: 'Bearer undefined' });
    console.log('\n[5] GET /api/feed with "Bearer undefined" (old bug):');
    console.log('    Status:', badTokenRes.status, '← this was causing the redirect loop');

    console.log('\n=== VERIFICATION COMPLETE ===');
}
run().catch(console.error);
