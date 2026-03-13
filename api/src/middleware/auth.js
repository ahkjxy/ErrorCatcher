const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT 密钥（应该从环境变量读取）
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// 生成 JWT Token
exports.generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// 验证 Token 中间件
exports.authenticate = async (req, res, next) => {
  try {
    // 从 header 获取 token
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }

    // 验证 token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 查找用户
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ error: '账号已被禁用' });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: '无效的令牌' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: '令牌已过期' });
    }
    res.status(500).json({ error: '认证失败' });
  }
};

// 可选认证（不强制要求登录）
exports.optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (user && user.status === 'active') {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // 忽略错误，继续执行
    next();
  }
};

// 角色验证中间件
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: '权限不足' });
    }

    next();
  };
};

// 项目权限验证
exports.checkProjectAccess = (requiredRole = 'viewer') => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.projectId || req.body.projectId;
      const Project = require('../models/Project');
      
      const project = await Project.findById(projectId);
      
      if (!project) {
        return res.status(404).json({ error: '项目不存在' });
      }

      // 检查用户是否是项目成员
      const member = project.members.find(
        m => m.userId.toString() === req.user._id.toString()
      );

      if (!member && req.user.role !== 'admin') {
        return res.status(403).json({ error: '无权访问此项目' });
      }

      // 检查角色权限
      const roleHierarchy = {
        owner: 4,
        admin: 3,
        developer: 2,
        viewer: 1
      };

      const requiredLevel = roleHierarchy[requiredRole] || 1;
      const userLevel = member ? roleHierarchy[member.role] : 0;

      if (userLevel < requiredLevel && req.user.role !== 'admin') {
        return res.status(403).json({ error: '权限不足' });
      }

      req.project = project;
      req.projectRole = member?.role;
      next();
    } catch (error) {
      res.status(500).json({ error: '权限验证失败' });
    }
  };
};
