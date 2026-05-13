// backend/utils/redis.js
const redis = require('redis');
const { redisConfig } = require('../config/redis');
const logger = require('./logger');

let client = null;
let isConnected = false;

// Initialize Redis client
const initRedis = async () => {
  if (client) return client;
  
  client = redis.createClient(redisConfig);
  
  client.on('connect', () => {
    isConnected = true;
    logger.info('Redis client connected');
  });
  
  client.on('ready', () => {
    logger.info('Redis client ready');
  });
  
  client.on('error', (err) => {
    isConnected = false;
    logger.error('Redis client error:', err);
  });
  
  client.on('end', () => {
    isConnected = false;
    logger.warn('Redis client disconnected');
  });
  
  await client.connect();
  return client;
};

// Get Redis client
const getClient = () => {
  if (!client) {
    throw new Error('Redis client not initialized. Call initRedis first.');
  }
  return client;
};

// Check connection status
const isRedisConnected = () => isConnected;

// Set value with expiration
const set = async (key, value, ttlSeconds = null) => {
  try {
    const redisClient = getClient();
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    if (ttlSeconds) {
      await redisClient.setEx(key, ttlSeconds, stringValue);
    } else {
      await redisClient.set(key, stringValue);
    }
    return true;
  } catch (error) {
    logger.error('Redis set error:', error);
    return false;
  }
};

// Get value
const get = async (key) => {
  try {
    const redisClient = getClient();
    const value = await redisClient.get(key);
    
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    logger.error('Redis get error:', error);
    return null;
  }
};

// Delete key
const del = async (key) => {
  try {
    const redisClient = getClient();
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error('Redis del error:', error);
    return false;
  }
};

// Check if key exists
const exists = async (key) => {
  try {
    const redisClient = getClient();
    return await redisClient.exists(key) === 1;
  } catch (error) {
    logger.error('Redis exists error:', error);
    return false;
  }
};

// Set expiration
const expire = async (key, ttlSeconds) => {
  try {
    const redisClient = getClient();
    await redisClient.expire(key, ttlSeconds);
    return true;
  } catch (error) {
    logger.error('Redis expire error:', error);
    return false;
  }
};

// Get TTL
const ttl = async (key) => {
  try {
    const redisClient = getClient();
    return await redisClient.ttl(key);
  } catch (error) {
    logger.error('Redis ttl error:', error);
    return -2;
  }
};

// Increment counter
const incr = async (key) => {
  try {
    const redisClient = getClient();
    return await redisClient.incr(key);
  } catch (error) {
    logger.error('Redis incr error:', error);
    return null;
  }
};

// Decrement counter
const decr = async (key) => {
  try {
    const redisClient = getClient();
    return await redisClient.decr(key);
  } catch (error) {
    logger.error('Redis decr error:', error);
    return null;
  }
};

// Hash operations
const hset = async (key, field, value) => {
  try {
    const redisClient = getClient();
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    await redisClient.hSet(key, field, stringValue);
    return true;
  } catch (error) {
    logger.error('Redis hset error:', error);
    return false;
  }
};

const hget = async (key, field) => {
  try {
    const redisClient = getClient();
    const value = await redisClient.hGet(key, field);
    
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    logger.error('Redis hget error:', error);
    return null;
  }
};

const hgetall = async (key) => {
  try {
    const redisClient = getClient();
    const result = await redisClient.hGetAll(key);
    
    const parsed = {};
    for (const [field, value] of Object.entries(result)) {
      try {
        parsed[field] = JSON.parse(value);
      } catch {
        parsed[field] = value;
      }
    }
    return parsed;
  } catch (error) {
    logger.error('Redis hgetall error:', error);
    return {};
  }
};

const hdel = async (key, field) => {
  try {
    const redisClient = getClient();
    await redisClient.hDel(key, field);
    return true;
  } catch (error) {
    logger.error('Redis hdel error:', error);
    return false;
  }
};

// List operations
const lpush = async (key, value) => {
  try {
    const redisClient = getClient();
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    return await redisClient.lPush(key, stringValue);
  } catch (error) {
    logger.error('Redis lpush error:', error);
    return null;
  }
};

const rpush = async (key, value) => {
  try {
    const redisClient = getClient();
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    return await redisClient.rPush(key, stringValue);
  } catch (error) {
    logger.error('Redis rpush error:', error);
    return null;
  }
};

const lpop = async (key) => {
  try {
    const redisClient = getClient();
    const value = await redisClient.lPop(key);
    
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    logger.error('Redis lpop error:', error);
    return null;
  }
};

const rpop = async (key) => {
  try {
    const redisClient = getClient();
    const value = await redisClient.rPop(key);
    
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    logger.error('Redis rpop error:', error);
    return null;
  }
};

const lrange = async (key, start, stop) => {
  try {
    const redisClient = getClient();
    const values = await redisClient.lRange(key, start, stop);
    
    return values.map(value => {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    });
  } catch (error) {
    logger.error('Redis lrange error:', error);
    return [];
  }
};

// Set operations
const sadd = async (key, member) => {
  try {
    const redisClient = getClient();
    const stringMember = typeof member === 'object' ? JSON.stringify(member) : String(member);
    return await redisClient.sAdd(key, stringMember);
  } catch (error) {
    logger.error('Redis sadd error:', error);
    return null;
  }
};

const srem = async (key, member) => {
  try {
    const redisClient = getClient();
    const stringMember = typeof member === 'object' ? JSON.stringify(member) : String(member);
    return await redisClient.sRem(key, stringMember);
  } catch (error) {
    logger.error('Redis srem error:', error);
    return null;
  }
};

const smembers = async (key) => {
  try {
    const redisClient = getClient();
    const members = await redisClient.sMembers(key);
    
    return members.map(member => {
      try {
        return JSON.parse(member);
      } catch {
        return member;
      }
    });
  } catch (error) {
    logger.error('Redis smembers error:', error);
    return [];
  }
};

const sismember = async (key, member) => {
  try {
    const redisClient = getClient();
    const stringMember = typeof member === 'object' ? JSON.stringify(member) : String(member);
    return await redisClient.sIsMember(key, stringMember);
  } catch (error) {
    logger.error('Redis sismember error:', error);
    return false;
  }
};

// Flush database
const flushDb = async () => {
  try {
    const redisClient = getClient();
    await redisClient.flushDb();
    logger.info('Redis database flushed');
    return true;
  } catch (error) {
    logger.error('Redis flushDb error:', error);
    return false;
  }
};

// Get all keys matching pattern
const keys = async (pattern) => {
  try {
    const redisClient = getClient();
    return await redisClient.keys(pattern);
  } catch (error) {
    logger.error('Redis keys error:', error);
    return [];
  }
};

// Scan keys
const scan = async (cursor, pattern, count = 100) => {
  try {
    const redisClient = getClient();
    return await redisClient.scan(cursor, { MATCH: pattern, COUNT: count });
  } catch (error) {
    logger.error('Redis scan error:', error);
    return { cursor: 0, keys: [] };
  }
};

module.exports = {
  initRedis,
  getClient,
  isRedisConnected,
  set,
  get,
  del,
  exists,
  expire,
  ttl,
  incr,
  decr,
  hset,
  hget,
  hgetall,
  hdel,
  lpush,
  rpush,
  lpop,
  rpop,
  lrange,
  sadd,
  srem,
  smembers,
  sismember,
  flushDb,
  keys,
  scan
};