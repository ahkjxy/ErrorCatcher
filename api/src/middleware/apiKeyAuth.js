const Project = require('../models/Project');
const mongoose = require('mongoose');

/**
 * API Key 验证中间件
 * 用于验证错误上报接口的API Key
 */
const validateApiKey = async (req, res, next) => {
  try {
    // 从多个位置获取API Key
    const apiKey = 
      req.body?.apiKey || 
      req.query?.apiKey || 
      req.headers['x-api-key'] ||
      req.headers['authorization']?.replace('Bearer ', '');

    if (!apiKey) {
      return res.status(401).json({
        error: 'Missing API Key',
        message: '请提供有效的API Key'
      });
    }

    // 查找项目
    const project = await Project.findOne({ apiKey });

    if (!project) {
      console.warn(`[API Key] 无效的API Key: ${apiKey.substring(0, 10)}...`);
      return res.status(401).json({
        error: 'Invalid API Key',
        message: 'API Key无效或已过期'
      });
    }

    // 检查项目是否被禁用
    if (project.disabled) {
      console.warn(`[API Key] 项目已禁用: ${project.name}`);
      return res.status(403).json({
        error: 'Project disabled',
        message: '此项目已被禁用，无法上报错误'
      });
    }

    // 检查API Key是否在黑名单中
    if (project.apiKeyBlacklist && project.apiKeyBlacklist.includes(apiKey)) {
      console.warn(`[API Key] API Key在黑名单中: ${apiKey.substring(0, 10)}...`);
      return res.status(403).json({
        error: 'API Key blacklisted',
        message: 'API Key已被禁用'
      });
    }

    // 将项目信息附加到请求对象
    req.project = project;
    req.apiKey = apiKey;

    // 记录API Key使用
    if (project.apiKeyStats) {
      project.apiKeyStats.lastUsed = new Date();
      project.apiKeyStats.usageCount = (project.apiKeyStats.usageCount || 0) + 1;
      await project.save();
    }

    next();
  } catch (error) {
    console.error('[API Key] 验证错误:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: '服务器错误'
    });
  }
};

/**
 * 可选的API Key验证 - 如果提供了API Key则验证，否则继续
 */
const validateApiKeyOptional = async (req, res, next) => {
  try {
    const apiKey = 
      req.body?.apiKey || 
      req.query?.apiKey || 
      req.headers['x-api-key'] ||
      req.headers['authorization']?.replace('Bearer ', '');

    if (!apiKey) {
      // 没有提供API Key，继续
      return next();
    }

    // 查找项目
    const project = await Project.findOne({ apiKey });

    if (!project) {
      console.warn(`[API Key] 无效的API Key: ${apiKey.substring(0, 10)}...`);
      return res.status(401).json({
        error: 'Invalid API Key',
        message: 'API Key无效或已过期'
      });
    }

    // 检查项目是否被禁用
    if (project.disabled) {
      console.warn(`[API Key] 项目已禁用: ${project.name}`);
      return res.status(403).json({
        error: 'Project disabled',
        message: '此项目已被禁用'
      });
    }

    // 将项目信息附加到请求对象
    req.project = project;
    req.apiKey = apiKey;

    next();
  } catch (error) {
    console.error('[API Key] 验证错误:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: '服务器错误'
    });
  }
};

/**
 * 获取项目ID - 从API Key或请求体
 */
const getProjectIdFromRequest = (req) => {
  // 优先使用API Key关联的项目
  if (req.project && req.project._id) {
    return req.project._id;
  }

  // 其次使用请求体中的projectId
  if (req.body?.projectId) {
    try {
      return new mongoose.Types.ObjectId(req.body.projectId);
    } catch (e) {
      return null;
    }
  }

  return null;
};

module.exports = {
  validateApiKey,
  validateApiKeyOptional,
  getProjectIdFromRequest
};
