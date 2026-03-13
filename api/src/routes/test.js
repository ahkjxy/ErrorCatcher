const express = require('express');
const router = express.Router();

/**
 * 测试路由 - 用于演示项目测试错误捕获
 */

// 触发 500 错误
router.post('/trigger-500', (req, res) => {
  res.status(500).json({
    error: 'Internal Server Error',
    message: '这是一个模拟的 500 错误',
    timestamp: new Date().toISOString()
  });
});

// 触发 404 错误
router.get('/non-existent', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: '请求的资源不存在',
    timestamp: new Date().toISOString()
  });
});

// 触发 400 错误
router.post('/bad-request', (req, res) => {
  res.status(400).json({
    error: 'Bad Request',
    message: '请求参数错误',
    timestamp: new Date().toISOString()
  });
});

// 触发 401 错误
router.get('/unauthorized', (req, res) => {
  res.status(401).json({
    error: 'Unauthorized',
    message: '未授权访问',
    timestamp: new Date().toISOString()
  });
});

// 触发 403 错误
router.get('/forbidden', (req, res) => {
  res.status(403).json({
    error: 'Forbidden',
    message: '禁止访问',
    timestamp: new Date().toISOString()
  });
});

// 触发真实的服务器错误（抛出异常）
router.get('/server-crash', (req, res, next) => {
  // 这会触发真实的服务器错误
  const obj = null;
  obj.property.value = 'test'; // 这会抛出 TypeError
});

// 成功响应（用于对比测试）
router.get('/success', (req, res) => {
  res.json({
    success: true,
    message: '请求成功',
    data: {
      timestamp: new Date().toISOString(),
      random: Math.random()
    }
  });
});

module.exports = router;
