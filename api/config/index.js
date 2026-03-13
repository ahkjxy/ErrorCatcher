const path = require('path');
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

// 环境配置映射
const envMap = {
  development: 'dev',
  dev: 'dev',
  test: 'test',
  pre: 'pre',
  production: 'prod',
  prod: 'prod'
};

const currentEnv = envMap[env] || 'dev';

// 加载对应环境的配置
const envConfig = require(`./${currentEnv}`);

// 基础配置
const baseConfig = {
  env: currentEnv,
  port: process.env.PORT || 3001,
  
  // 日志配置
  log: {
    level: currentEnv === 'prod' ? 'error' : 'debug',
    format: currentEnv === 'prod' ? 'json' : 'simple'
  },
  
  // CORS 配置
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },
  
  // 速率限制配置
  rateLimit: {
    // 全局限制
    globalWindow: 60 * 60 * 1000,  // 1小时
    globalMax: currentEnv === 'prod' ? 1000 : 10000,
    
    // 突发限制（错误上报）
    burstWindow: 60 * 1000,         // 1分钟
    burstMax: currentEnv === 'prod' ? 100 : 1000,
    
    // API Key限制（错误上报）
    apiKeyWindow: 60 * 60 * 1000,   // 1小时
    apiKeyMax: currentEnv === 'prod' ? 10000 : 100000,
    
    // 认证限制
    authWindow: 15 * 60 * 1000,     // 15分钟
    authMax: 5                       // 5次尝试
  },
  
  // 数据验证配置
  dataLimits: {
    maxErrorsPerRequest: 100,
    maxMessageLength: 5000,
    maxStackTraceLength: 50000,
    maxBreadcrumbs: 100,
    maxContextSize: 10000,
    maxTagsSize: 5000,
    maxUserInfoSize: 2000
  },
  
  // Redis配置（可选，用于分布式速率限制）
  redis: {
    enabled: process.env.REDIS_ENABLED === 'true',
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  }
};

// 合并配置
const config = {
  ...baseConfig,
  ...envConfig
};

module.exports = config;
