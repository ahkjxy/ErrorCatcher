module.exports = {
  // 数据库配置
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/error-catcher-dev',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },

  // API 配置
  api: {
    prefix: '/api',
    version: 'v1',
    timeout: 30000
  },

  // 安全配置
  security: {
    helmet: {
      contentSecurityPolicy: false // 开发环境关闭 CSP
    },
    rateLimitEnabled: false // 开发环境关闭限流
  },

  // 错误处理
  error: {
    showStack: true,
    showDetails: true
  },

  // 数据保留策略
  dataRetention: {
    enabled: false, // 开发环境不自动清理
    days: 90
  },

  // 性能监控
  monitoring: {
    enabled: false
  },

  // 调试模式
  debug: true
};
