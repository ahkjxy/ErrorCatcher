const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Error = require('../models/Error');
const { createOrUpdateIssue, generateFingerprint } = require('../middleware/issueGrouping');
const alertService = require('../services/alertService');
const { authenticate } = require('../middleware/auth');
const { getUserProjectIds } = require('../middleware/projectAccess');
const { 
  errorReportBurstLimiter, 
  errorReportApiKeyLimiter 
} = require('../middleware/rateLimit');
const { 
  validateApiKeyOptional, 
  getProjectIdFromRequest 
} = require('../middleware/apiKeyAuth');
const { 
  validateErrorReport, 
  sanitizeErrorData, 
  detectAnomalies 
} = require('../middleware/dataValidation');

// 错误上报接口 - 应用所有安全防护
router.post('/report', 
  errorReportBurstLimiter,           // 突发限制
  errorReportApiKeyLimiter,          // API Key限制
  validateApiKeyOptional,            // API Key验证（可选）
  validateErrorReport,               // 数据验证
  detectAnomalies,                   // 异常检测
  handleErrorReport
);

async function handleErrorReport(req, res) {
  try {
    const { errors, batchSize, sentAt, appName, environment } = req.body;

    // 获取项目ID
    let projectId = getProjectIdFromRequest(req);
    
    if (!projectId) {
      return res.status(400).json({
        error: 'Missing project ID',
        message: '必须提供projectId或有效的API Key'
      });
    }

    // 清理和规范化错误数据
    const processedErrors = errors.map((err, index) => {
      const sanitized = sanitizeErrorData(err);
      
      // 设置项目ID
      sanitized.projectId = projectId;
      
      // 转换 projectId 字符串为 ObjectId
      if (sanitized.projectId && typeof sanitized.projectId === 'string') {
        try {
          sanitized.projectId = new mongoose.Types.ObjectId(sanitized.projectId);
        } catch (e) {
          console.error('Invalid projectId:', sanitized.projectId);
        }
      }
      
      // 生成或规范化 fingerprint
      if (!sanitized.fingerprint || !Array.isArray(sanitized.fingerprint)) {
        sanitized.fingerprint = generateFingerprint(sanitized);
      }
      
      return sanitized;
    });

    // 记录上报信息
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;
    const apiKey = req.apiKey ? req.apiKey.substring(0, 10) + '...' : 'none';
    
    console.log(`[ErrorReport] 接收到${errors.length}个错误 - IP: ${clientIp}, API Key: ${apiKey}, Project: ${projectId}`);

    // 如果检测到异常，记录日志
    if (req.anomalies && req.anomalies.length > 0) {
      console.warn(`[ErrorReport] 检测到${req.anomalies.length}个异常:`, req.anomalies);
    }

    const savedErrors = await Error.insertMany(processedErrors);

    // 为每个错误创建或更新 Issue
    const issuePromises = savedErrors.map(error => 
      createOrUpdateIssue(error).catch(err => {
        console.error('Failed to create/update issue:', err);
        return null;
      })
    );
    
    const issues = await Promise.all(issuePromises);

    // 检查告警规则
    savedErrors.forEach(error => {
      alertService.checkAlertsForError(error).catch(err => {
        console.error('Failed to check alerts:', err);
      });
    });

    // 发送实时通知
    const io = req.app.get('io');
    if (io) {
      savedErrors.forEach((error, index) => {
        const issue = issues[index];
        
        // 发送新错误通知
        io.to(`project:${error.projectId}`).emit('new-error', {
          error: {
            _id: error._id,
            message: error.message,
            level: error.level,
            timestamp: error.timestamp
          }
        });
        
        // 如果是新 Issue，发送 Issue 通知
        if (issue && issue.count === 1) {
          io.to(`project:${error.projectId}`).emit('new-issue', {
            issue: {
              _id: issue._id,
              title: issue.title,
              level: issue.level,
              count: issue.count
            }
          });
        }
        
        // 发送到全局频道
        io.to('all').emit('stats-update', {
          projectId: error.projectId,
          type: 'new-error'
        });
      });
    }

    res.json({
      success: true,
      count: savedErrors.length,
      receivedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving reports:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      error: 'Failed to save error reports',
      details: error.message 
    });
  }
}

// 获取统计数据 - 必须在 /:id 之前
router.get('/stats', authenticate, async (req, res) => {
  try {
    const { projectId, timeRange = 7 } = req.query;

    // 获取用户有权限的项目列表
    const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const query = { timestamp: { $gte: startDate } };
    
    // 如果指定了 projectId，检查权限
    if (projectId) {
      if (!allowedProjectIds.includes(projectId)) {
        return res.status(403).json({ error: '无权访问此项目' });
      }
      query.projectId = projectId;
    } else {
      // 如果没有指定项目，只查询用户有权限的项目
      query.projectId = { $in: allowedProjectIds.map(id => new mongoose.Types.ObjectId(id)) };
    }

    const [totalErrors, unresolvedErrors, resolvedErrors, errorLevel] = await Promise.all([
      Error.countDocuments(query),
      Error.countDocuments({ ...query, resolved: false }),
      Error.countDocuments({ ...query, resolved: true }),
      Error.aggregate([
        { $match: query },
        { $group: { _id: '$level', count: { $sum: 1 } } }
      ])
    ]);

    // 转换错误级别数据
    const levelData = {};
    errorLevel.forEach(item => {
      levelData[item._id] = item.count;
    });

    res.json({
      totalErrors,
      unresolvedErrors,
      resolvedErrors,
      errorLevel: levelData
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const {
      page = 1,
      pageSize,
      limit,
      projectId,
      environment,
      type,
      level,
      resolved,
      search,
      startDate,
      endDate
    } = req.query;

    // 获取用户有权限的项目列表
    const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);

    const pageLimit = parseInt(pageSize || limit || 10);
    const query = {};
    
    // 如果指定了 projectId，检查权限
    if (projectId) {
      if (!allowedProjectIds.includes(projectId)) {
        return res.status(403).json({ error: '无权访问此项目' });
      }
      query.projectId = projectId;
    } else {
      // 如果没有指定项目，只查询用户有权限的项目
      query.projectId = { $in: allowedProjectIds.map(id => new mongoose.Types.ObjectId(id)) };
    }
    
    if (environment) query.environment = environment;
    if (type) query.type = type;
    if (level) query.level = level;
    if (resolved !== undefined && resolved !== '') query.resolved = resolved === 'true';
    if (search) query.message = { $regex: search, $options: 'i' };
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * pageLimit;

    const [errors, total] = await Promise.all([
      Error.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(pageLimit)
        .populate({
          path: 'projectId',
          select: 'name owner',
          populate: {
            path: 'owner',
            select: 'username email'
          }
        })
        .lean(),
      Error.countDocuments(query)
    ]);

    res.json({
      errors,
      total,
      pagination: {
        page: parseInt(page),
        pageSize: pageLimit,
        total,
        pages: Math.ceil(total / pageLimit)
      }
    });
  } catch (error) {
    console.error('Error fetching errors:', error);
    res.status(500).json({ error: 'Failed to fetch errors' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const error = await Error.findById(req.params.id)
      .populate({
        path: 'projectId',
        select: 'name owner',
        populate: {
          path: 'owner',
          select: 'username email'
        }
      });
    
    if (!error) {
      return res.status(404).json({ error: 'Error not found' });
    }

    // 检查权限
    const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
    if (!allowedProjectIds.includes(error.projectId._id.toString())) {
      return res.status(403).json({ error: '无权访问此错误' });
    }

    res.json(error);
  } catch (error) {
    console.error('Error fetching error:', error);
    res.status(500).json({ error: 'Failed to fetch error' });
  }
});

router.patch('/:id', authenticate, async (req, res) => {
  try {
    const errorDoc = await Error.findById(req.params.id);
    
    if (!errorDoc) {
      return res.status(404).json({ error: 'Error not found' });
    }

    // 检查权限
    const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
    if (!allowedProjectIds.includes(errorDoc.projectId.toString())) {
      return res.status(403).json({ error: '无权修改此错误' });
    }

    const { resolved, notes } = req.body;
    
    const updateData = {};
    if (resolved !== undefined) {
      updateData.resolved = resolved;
      if (resolved) {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = req.user.username || req.user.email;
      } else {
        updateData.resolvedAt = null;
        updateData.resolvedBy = null;
      }
    }
    if (notes) updateData.notes = notes;

    const updatedError = await Error.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedError);
  } catch (error) {
    console.error('Error updating error:', error);
    res.status(500).json({ error: 'Failed to update error' });
  }
});

router.patch('/:id/resolve', authenticate, async (req, res) => {
  try {
    const errorDoc = await Error.findById(req.params.id);
    
    if (!errorDoc) {
      return res.status(404).json({ error: 'Error not found' });
    }

    // 检查权限
    const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
    if (!allowedProjectIds.includes(errorDoc.projectId.toString())) {
      return res.status(403).json({ error: '无权修改此错误' });
    }

    const { notes } = req.body;

    const updatedError = await Error.findByIdAndUpdate(
      req.params.id,
      {
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy: req.user.username || req.user.email,
        notes
      },
      { new: true }
    );

    res.json(updatedError);
  } catch (error) {
    console.error('Error resolving error:', error);
    res.status(500).json({ error: 'Failed to resolve error' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const errorDoc = await Error.findById(req.params.id);

    if (!errorDoc) {
      return res.status(404).json({ error: 'Error not found' });
    }

    // 检查权限
    const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
    if (!allowedProjectIds.includes(errorDoc.projectId.toString())) {
      return res.status(403).json({ error: '无权删除此错误' });
    }

    await Error.findByIdAndDelete(req.params.id);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting error:', error);
    res.status(500).json({ error: 'Failed to delete error' });
  }
});

module.exports = router;
