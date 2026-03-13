module.exports = {
  // 数据库配置
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/error-catcher-test',
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
      contentSecurityPolicy: false
    },
    rateLimitEnabled: true
  },

  // 错误处理
  error: {
    showStack: true,
    showDetails: true
  },

  // 数据保留策略
  dataRetention: {
    enabled: true,
    days: 30 // 测试环境保留30天
  },

  // 性能监控
  monitoring: {
    enabled: true
  },

  // 调试模式
  debug: true
};
