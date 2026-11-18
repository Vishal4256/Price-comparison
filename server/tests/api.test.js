const axios = require('axios');
const API_URL = 'http://localhost:5000';

describe('PriceSmart API E2E', () => {
  let token;
  let testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'password123'
  };

  test('1. Health Endpoint', async () => {
    const res = await axios.get(`${API_URL}/health`);
    expect(res.status).toBe(200);
    expect(res.data.status).toBe('ok');
  });

  test('2. Authentication (Register & Login)', async () => {
    // Register
    const regRes = await axios.post(`${API_URL}/api/v1/auth/register`, {
      ...testUser,
      confirmPassword: testUser.password
    });
    expect(regRes.status).toBe(201);
    
    // Login
    const loginRes = await axios.post(`${API_URL}/api/v1/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    expect(loginRes.status).toBe(200);
    expect(loginRes.data.data.token).toBeDefined();
    token = loginRes.data.data.token;
  });

  test('3. Protected Route & Error Handling (Missing Token)', async () => {
    try {
      await axios.get(`${API_URL}/api/v1/dashboard`);
    } catch (err) {
      expect(err.response.status).toBe(401); // Unauthorized
    }
  });

  test('4. Protected Route (Valid Token)', async () => {
    const res = await axios.get(`${API_URL}/api/v1/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(res.status).toBe(200);
    expect(res.data.data).toBeDefined();
  });

  test('5. Alert Creation', async () => {
    const res = await axios.post(`${API_URL}/api/v1/alerts`, {
      productId: '64d3b8f1a1c3b1a2b3c4d5e6', // Dummy ObjectId
      targetPrice: 500
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(res.status).toBe(201);
  });

  test('6. Search Pipeline', async () => {
    const res = await axios.post(`${API_URL}/api/v1/search`, {
      query: 'laptop'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(res.status).toBe(200);
    expect(res.data.data).toBeDefined();
  }, 20000); // 20s timeout for scraping
});
