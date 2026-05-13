const { getCache, setCache, CACHE_TTL } = require('../config/redis');
const logger = require('../config/logger');

// Cache middleware
const cache = (keyPrefix, ttl = CACHE_TTL.MEDIUM) => {
  return async (req, res, next) => {
    // Skip cache for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    try {
      const userId = req.user?.id || 'anonymous';
      const cacheKey = `${keyPrefix}:${userId}:${req.originalUrl}`;
      
      const cachedData = await getCache(cacheKey);
      
      if (cachedData) {
        logger.debug(`Cache hit: ${cacheKey}`);
        return res.json(cachedData);
      }
      
      // Store original send method
      const originalSend = res.json;
      
      // Override send method to cache response
      res.json = function(data) {
        if (res.statusCode === 200 && data.success !== false) {
          setCache(cacheKey, data, ttl).catch(err => {
            logger.error('Cache set error:', err);
          });
        }
        originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

// Clear cache by pattern
const clearCache = async (pattern) => {
  const { clearCache: clearRedisCache } = require('../config/redis');
  return await clearRedisCache(pattern);
};

// Invalidate user cache
const invalidateUserCache = async (userId) => {
  await clearCache(`user:${userId}:*`);
  await clearCache(`users:list:*`);
};

// Invalidate computer cache
const invalidateComputerCache = async () => {
  await clearCache('computers:*');
};

// Invalidate schedule cache
const invalidateScheduleCache = async () => {
  await clearCache('schedules:*');
};

module.exports = {
  cache,
  clearCache,
  invalidateUserCache,
  invalidateComputerCache,
  invalidateScheduleCache
};