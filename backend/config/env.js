require('dotenv').config();

const requiredEnvVars = [
    'PORT',
    'NODE_ENV',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'MONGODB_URI',
    'GEMINI_API_KEY',
    'CLIENT_URL'
];

function validateEnv() {
    const missing = [];
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            missing.push(envVar);
        }
    }

    if (missing.length > 0) {
        console.error('======================================================');
        console.error('🚨 CRITICAL ERROR: MISSING ENVIRONMENT VARIABLES 🚨');
        console.error('======================================================');
        console.error('The following environment variables are required but missing:');
        missing.forEach(m => console.error(` - ${m}`));
        console.error('\nPlease check your .env file or deployment configuration.');
        console.error('======================================================');
        process.exit(1); // Fail fast
    }
}

module.exports = validateEnv;
