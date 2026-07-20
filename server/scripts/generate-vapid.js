const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('====================================');
console.log('Generated VAPID Keys for Web Push');
console.log('====================================');
console.log('Please add these to your .env file:\n');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:admin@pricesmart.example.com`);
console.log('====================================\n');
