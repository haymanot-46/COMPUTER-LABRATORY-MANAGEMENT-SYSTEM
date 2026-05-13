const Redis = require('ioredis');
require('dotenv').config();

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
};

// Create Redis client
const redisClient = new Redis(redisConfig);

// Cache prefix
const CACHE_PREFIX = 'clms:';

// Cache TTL in seconds
const CACHE_TTL = {
  SHORT: 60,           // 1 minute
  MEDIUM: 300,         // 5 minutes
  LONG: 3600,          // 1 hour
  DAY: 86400           // 24 hours
};

// Connect to Redis
const connectRedis = async () => {
  try {
    await redisClient.ping();
    console.log('✅ Redis connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    console.log('💡 Redis is optional. Continuing without Redis...');
    return false;
  }
};

// Cache middleware
const cache = (keyPrefix, ttl = CACHE_TTL.MEDIUM) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id || 'anonymous';
      const cacheKey = `${CACHE_PREFIX}${keyPrefix}:${userId}:${req.originalUrl}`;
      
      const cachedData = await redisClient.get(cacheKey);
      
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }
      
      // Store original send method
      const originalSend = res.json;
      
      // Override send method to cache response
      res.json = function(data) {
        if (res.statusCode === 200) {
          redisClient.setex(cacheKey, ttl, JSON.stringify(data));
        }
        originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error.message);
      next();
    }
  };
};

// Clear cache by pattern
const clearCache = async (pattern) => {
  try {
    const keys = await redisClient.keys(`${CACHE_PREFIX}${pattern}`);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`✅ Cleared ${keys.length} cache keys`);
    }
    return keys.length;
  } catch (error) {
    console.error('Failed to clear cache:', error.message);
    return 0;
  }
};

// Get cached data
const getCache = async (key) => {
  try {
    const data = await redisClient.get(`${CACHE_PREFIX}${key}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get cache:', error.message);
    return null;
  }
};

// Set cached data
const setCache = async (key, data, ttl = CACHE_TTL.MEDIUM) => {
  try {
    await redisClient.setex(`${CACHE_PREFIX}${key}`, ttl, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to set cache:', error.message);
    return false;
  }
};

// Delete cached data
const deleteCache = async (key) => {
  try {
    await redisClient.del(`${CACHE_PREFIX}${key}`);
    return true;
  } catch (error) {
    console.error('Failed to delete cache:', error.message);
    return false;
  }
};

module.exports = {
  redisClient,
  redisConfig,
  connectRedis,
  cache,
  clearCache,
  getCache,
  setCache,
  deleteCache,
  CACHE_TTL,
  CACHE_PREFIX
};