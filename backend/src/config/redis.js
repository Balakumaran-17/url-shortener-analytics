// Redis client connection configuration (optional integration)
// If Redis becomes available, this file initializes the connection.
// Currently it provides fallback methods so the app works without Redis.

let redisClient = null;
let isRedisEnabled = false;

const initRedis = async () => {
  if (process.env.REDIS_URL) {
    try {
      // If we decide to use standard 'redis' npm package in the future:
      // const { createClient } = require('redis');
      // redisClient = createClient({ url: process.env.REDIS_URL });
      // await redisClient.connect();
      // isRedisEnabled = true;
      console.log('Redis connection configured (Optional cache placeholder ready)');
    } catch (err) {
      console.warn('Failed to connect to Redis. Caching falls back to DB:', err.message);
    }
  } else {
    console.log('Redis URL not provided. Caching disabled (DB direct access enabled)');
  }
};

const getCache = async (key) => {
  if (!isRedisEnabled) return null;
  try {
    return await redisClient.get(key);
  } catch (err) {
    return null;
  }
};

const setCache = async (key, value, expirySeconds = 3600) => {
  if (!isRedisEnabled) return;
  try {
    await redisClient.set(key, value, {
      EX: expirySeconds
    });
  } catch (err) {
    // Silent fail
  }
};

const deleteCache = async (key) => {
  if (!isRedisEnabled) return;
  try {
    await redisClient.del(key);
  } catch (err) {
    // Silent fail
  }
};

module.exports = {
  initRedis,
  getCache,
  setCache,
  deleteCache,
  isRedisEnabled: () => isRedisEnabled
};
