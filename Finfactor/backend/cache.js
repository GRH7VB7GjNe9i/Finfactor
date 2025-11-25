const { LRUCache } = require('lru-cache');

function createCache({ max = 500, ttl = 1000 * 60 * 5 } = {}) {
  const cache = new LRUCache({
    max: max,        // Maximum items
    ttl: ttl         // Time to live in ms
  });

  return {
    get: (key) => cache.get(key),
    set: (key, value, customTtl) =>
      cache.set(key, value, { ttl: customTtl || ttl }),
    del: (key) => cache.delete(key),
    keys: () => [...cache.keys()],
    reset: () => cache.clear()
  };
}

module.exports = { createCache };
