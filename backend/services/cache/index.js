// Cache Abstraction Layer
// Defaulting to MemoryCache for Phase 2. Can be swapped with RedisCache later.

const cacheImplementation = require('./MemoryCache');

class CacheService {
    async get(key) {
        return cacheImplementation.get(key);
    }

    async set(key, value, ttlSeconds = 300) {
        return cacheImplementation.set(key, value, ttlSeconds);
    }

    async delete(key) {
        return cacheImplementation.delete(key);
    }
}

module.exports = new CacheService();
