module.exports = {
  // 数据库配置
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/error-catcher-pre',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 50,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    }
  },

  // API 配置
  api: {
    prefix: '/api',
    version: 'v1',
    timeout: 20000
  },

  // 安全配置
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:']
        }
      }
    },
    rateLimitEnabled: true
  },

  // 错误处理
  error: {
    showStack: false,
    showDetails: true
  },

  // 数据保留策略
  dataRetention: {
    enabled: true,
    days: 60 // 预发布环境保留60天
  },

  // 性能监控
  monitoring: {
    enabled: true
  },

  // 调试模式
  debug: false
};
