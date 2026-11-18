import axios from 'axios';

class NotificationService {
  constructor() {
    this.publicKey = 'YOUR_VAPID_PUBLIC_KEY_HERE'; // Should ideally be fetched from API, hardcoded for now based on generated keys
  }

  // Utility to convert Base64 string to Uint8Array
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async requestPermissionAndSubscribe() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging is not supported.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Push notification permission denied.');
        return false;
      }

      // Ensure SW is ready
      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.publicKey)
      });

      // Send to backend
      await axios.post('/api/v1/notifications/subscribe', {
        subscription
      });

      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  }
}

export default new NotificationService();
