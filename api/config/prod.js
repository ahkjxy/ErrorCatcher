module.exports = {
  // 数据库配置
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/error-catcher',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 100,
      minPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
      readPreference: 'primaryPreferred'
    }
  },

  // API 配置
  api: {
    prefix: '/api',
    version: 'v1',
    timeout: 15000
  },

  // 安全配置
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    },
    rateLimitEnabled: true
  },

  // 错误处理
  error: {
    showStack: false,
    showDetails: false
  },

  // 数据保留策略
  dataRetention: {
    enabled: true,
    days: 90 // 生产环境保留90天
  },

  // 性能监控
  monitoring: {
    enabled: true
  },

  // 调试模式
  debug: false
};
