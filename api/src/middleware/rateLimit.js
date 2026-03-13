const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');
const config = require('../../config');

// 创建Redis客户端（可选，如果没有Redis则使用内存存储）
let redisClient = null;
let useRedis = false;

try {
  if (config.redis && config.redis.enabled) {
    redisClient = redis.createClient({
      host: config.redis.host || 'localhost',
      port: config.redis.port || 6379,
      password: config.redis.password
    });
    
    redisClient.on('error', (err) => {
      console.warn('Redis连接失败，使用内存存储:', err.message);
      useRedis = false;
    });
    
    redisClient.on('connect', () => {
      console.log('✅ Redis连接成功');
      useRedis = true;
    });
  }
} catch (err) {
  console.warn('Redis初始化失败，使用内存存储:', err.message);
}

// 创建存储选项
const getStore = () => {
  if (useRedis && redisClient) {
    return new RedisStore({
      client: redisClient,
      prefix: 'rl:' // rate-limit前缀
    });
  }
  // 使用默认的内存存储
  return undefined;
};

// 全局速率限制 - 基于IP
const globalLimiter = rateLimit({
  store: getStore(),
  windowMs: config.rateLimit?.globalWindow || 60 * 60 * 1000, // 1小时
  max: config.rateLimit?.globalMax || 1000, // 1000请求/小时
  keyGenerator: (req) => {
    // 优先使用X-Forwarded-For（代理后的真实IP）
    return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
  },
  skip: (req) => {
    // 跳过健康检查
    return req.path === '/health';
  },
  handler: (req, res) => {
    console.warn(`[RateLimit] 全局限制触发 - IP: ${req.ip}, 路径: ${req.path}`);
    res.status(429).json({
      error: 'Too many requests',
      message: '请求过于频繁，请稍后再试',
      retryAfter: req.rateLimit.resetTime
    });
  },
  standardHeaders: true, // 返回RateLimit-*头
  legacyHeaders: false
});

// 错误上报接口限制 - 基于IP的突发限制
const errorReportBurstLimiter = rateLimit({
  store: getStore(),
  windowMs: config.rateLimit?.burstWindow || 60 * 1000, // 1分钟
  max: config.rateLimit?.burstMax || 100, // 100请求/分钟
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
  },
  handler: (req, res) => {
    console.warn(`[RateLimit] 突发限制触发 - IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests',
      message: '请求过于频繁，请稍后再试',
      retryAfter: req.rateLimit.resetTime
    });
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 错误上报接口限制 - 基于API Key的小时限制
const errorReportApiKeyLimiter = rateLimit({
  store: getStore(),
  windowMs: config.rateLimit?.apiKeyWindow || 60 * 60 * 1000, // 1小时
  max: config.rateLimit?.apiKeyMax || 10000, // 10000请求/小时
  keyGenerator: (req) => {
    // 使用API Key作为限流键
    const apiKey = req.body?.apiKey || req.query?.apiKey || req.headers['x-api-key'];
    if (!apiKey) {
      // 如果没有API Key，使用IP
      return `no-key:${req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip}`;
    }
    return `key:${apiKey}`;
  },
  skip: (req) => {
    // 如果没有API Key，跳过此限制（由其他限制处理）
    return !req.body?.apiKey && !req.query?.apiKey && !req.headers['x-api-key'];
  },
  handler: (req, res) => {
    const apiKey = req.body?.apiKey || req.query?.apiKey || req.headers['x-api-key'];
    console.warn(`[RateLimit] API Key限制触发 - Key: ${apiKey?.substring(0, 10)}...`);
    res.status(429).json({
      error: 'API Key rate limit exceeded',
      message: '此API Key的请求已超过限额',
      retryAfter: req.rateLimit.resetTime
    });
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 认证接口限制 - 防止暴力破解
const authLimiter = rateLimit({
  store: getStore(),
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 5次尝试
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
  },
  skip: (req) => {
    // 只限制登录请求
    return req.path !== '/api/auth/login';
  },
  handler: (req, res) => {
    console.warn(`[RateLimit] 认证限制触发 - IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many login attempts',
      message: '登录尝试过于频繁，请15分钟后再试',
      retryAfter: req.rateLimit.resetTime
    });
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 导出限制器
module.exports = {
  globalLimiter,
  errorReportBurstLimiter,
  errorReportApiKeyLimiter,
  authLimiter,
  redisClient,
  useRedis: () => useRedis
};
