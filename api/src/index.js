const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const config = require('../config');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const errorRoutes = require('./routes/errors');
const statsRoutes = require('./routes/stats');
const dashboardRoutes = require('./routes/dashboard');
const analyticsRoutes = require('./routes/analytics');
const issueRoutes = require('./routes/issues');
const alertRoutes = require('./routes/alerts');
const commentRoutes = require('./routes/comments');
const activityRoutes = require('./routes/activities');
const notificationRoutes = require('./routes/notifications');
const templateRoutes = require('./routes/templates');
const aiAnalysisRoutes = require('./routes/aiAnalysis');
const aiConfigRoutes = require('./routes/aiConfig');
const testRoutes = require('./routes/test');
const { connectDB } = require('./db');
const alertService = require('./services/alertService');
const { globalLimiter, authLimiter } = require('./middleware/rateLimit');

const app = express();
const PORT = config.port;

// 连接数据库
connectDB();

// 安全中间件
app.use(helmet(config.security.helmet));

// CORS 配置
app.use(cors(config.cors));

// 压缩
app.use(compression());

// 解析请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 全局速率限制
app.use(globalLimiter);

// 请求日志（开发环境）
if (config.debug) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// API 路由
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/errors', errorRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/notifications/templates', templateRoutes);
app.use('/api/ai/config', aiConfigRoutes); // 更具体的路由要放在前面
app.use('/api/ai', aiAnalysisRoutes);
app.use('/api/test', testRoutes); // 测试路由

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    environment: config.env,
    database: 'MongoDB',
    timestamp: new Date().toISOString(),
    version: require('../package.json').version
  });
});

// 环境信息（仅非生产环境）
if (config.env !== 'prod') {
  app.get('/info', (req, res) => {
    res.json({
      environment: config.env,
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  });
}

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  
  const response = {
    error: 'Internal Server Error'
  };

  if (config.error.showDetails) {
    response.message = err.message;
  }

  if (config.error.showStack) {
    response.stack = err.stack;
  }

  res.status(err.status || 500).json(response);
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path 
  });
});

// 启动服务器
const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`✅ Error Catcher API running`);
  console.log(`📊 Environment: ${config.env}`);
  console.log(`🚀 Port: ${PORT}`);
  console.log(`🗄️  Database: MongoDB`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  if (config.env !== 'prod') {
    console.log(`ℹ️  Info: http://localhost:${PORT}/info`);
  }
  console.log('='.repeat(50));
  
  // 启动告警评估引擎 (每5分钟评估一次)
  setInterval(() => {
    alertService.evaluateAllAlerts().catch(err => {
      console.error('告警评估失败:', err);
    });
  }, 5 * 60 * 1000);
  
  console.log('🚨 Alert evaluation engine started (interval: 5 minutes)');
});

// Socket.io 实时通信
const socketIO = require('socket.io');
const io = socketIO(server, {
  cors: {
    origin: config.cors.origin,
    credentials: true
  }
});

// Socket.io 连接处理
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  
  // 订阅项目更新
  socket.on('subscribe:project', (projectId) => {
    socket.join(`project:${projectId}`);
    console.log(`📡 Client ${socket.id} subscribed to project ${projectId}`);
  });
  
  // 取消订阅项目
  socket.on('unsubscribe:project', (projectId) => {
    socket.leave(`project:${projectId}`);
    console.log(`📡 Client ${socket.id} unsubscribed from project ${projectId}`);
  });
  
  // 订阅所有更新
  socket.on('subscribe:all', () => {
    socket.join('all');
    console.log(`📡 Client ${socket.id} subscribed to all updates`);
  });
  
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// 导出 io 实例供其他模块使用
app.set('io', io);

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = { app, server };
