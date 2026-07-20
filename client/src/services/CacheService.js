import localforage from 'localforage';

// Configure localforage instance for IndexedDB
localforage.config({
  name: 'PriceSmart',
  storeName: 'offline_store',
  description: 'IndexedDB for offline capabilities'
});

class CacheService {
  /**
   * Set item in offline cache with optional TTL
   * @param {string} key 
   * @param {any} data 
   * @param {number} ttlMs Time to live in ms
   */
  async set(key, data, ttlMs = 1000 * 60 * 60 * 24) {
    try {
      const payload = {
        data,
        expiry: Date.now() + ttlMs
      };
      await localforage.setItem(key, payload);
    } catch (err) {
      console.warn('Offline cache set failed:', err);
    }
  }

  /**
   * Get item from offline cache, validating expiration
   * @param {string} key 
   * @returns {any} Data or null if expired/missing
   */
  async get(key) {
    try {
      const payload = await localforage.getItem(key);
      if (!payload) return null;
      
      if (Date.now() > payload.expiry) {
        await localforage.removeItem(key);
        return null;
      }
      return payload.data;
    } catch (err) {
      console.warn('Offline cache get failed:', err);
      return null;
    }
  }

  /**
   * Remove item from offline cache
   * @param {string} key 
   */
  async remove(key) {
    try {
      await localforage.removeItem(key);
    } catch (err) {
      console.warn('Offline cache remove failed:', err);
    }
  }
}

export default new CacheService();
