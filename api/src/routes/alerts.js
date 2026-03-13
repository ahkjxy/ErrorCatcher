const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Alert = require('../models/Alert');
const AlertHistory = require('../models/AlertHistory');
const { authenticate } = require('../middleware/auth');
const { getUserProjectIds } = require('../middleware/projectAccess');

// 获取告警列表
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      page = 1,
      limit,
      pageSize,
      projectId,
      enabled,
      priority
    } = req.query;

    // 支持 pageSize 和 limit 两种参数名，优先使用 pageSize
    const pageLimit = parseInt(pageSize || limit || 20);

    console.log('获取告警列表请求:', { page, pageLimit, projectId, enabled, priority });

    // 获取用户有权限的项目列表
    const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);

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
    
    if (enabled !== undefined) query.enabled = enabled === 'true';
    if (priority) query.priority = priority;

    console.log('查询条件:', query);

    const total = await Alert.countDocuments(query);
    console.log('告警总数:', total);

    const alerts = await Alert.find(query)
      .populate('projectId', 'name')
      .populate('createdBy', 'username email')
      .populate('notificationConfigs', 'name type')
      .sort({ createdAt: -1 })
      .limit(pageLimit)
      .skip((page - 1) * pageLimit);

    console.log('查询到的告警数量:', alerts.length);
    console.log('告警列表:', JSON.stringify(alerts, null, 2));

    res.json({
      alerts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取告警列表错误:', error);
    res.status(500).json({ error: '获取告警列表失败' });
  }
});

// 创建告警
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      projectId,
      name,
      description,
      priority,
      conditions,
      notificationConfigs,
      settings
    } = req.body;

    console.log('收到创建告警请求:', {
      projectId,
      name,
      description,
      priority,
      conditions,
      notificationConfigs,
      settings
    });

    if (!projectId || !name) {
      return res.status(400).json({ error: 'projectId 和 name 不能为空' });
    }

    // 检查权限
    const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
    if (!allowedProjectIds.includes(projectId)) {
      return res.status(403).json({ error: '无权在此项目创建告警' });
    }

    const alert = new Alert({
      projectId,
      name,
      description,
      priority,
      conditions,
      notificationConfigs: notificationConfigs || [],
      settings,
      createdBy: req.user._id
    });

    console.log('准备保存告警:', alert);
    await alert.save();
    console.log('告警保存成功');
    
    await alert.populate('projectId', 'name');
    await alert.populate('createdBy', 'username email');
    await alert.populate('notificationConfigs', 'name type');

    res.status(201).json(alert);
  } catch (error) {
    console.error('创建告警错误:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ error: '创建告警失败', message: error.message });
  }
});

// 获取告警详情
router.get('/:id', authenticate, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('projectId', 'name')
      .populate('createdBy', 'username email')
      .populate('notificationConfigs');

    if (!alert) {
      return res.status(404).json({ error: '告警不存在' });
    }

    // 检查权限
    const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
    if (!allowedProjectIds.includes(alert.projectId._id.toString())) {
      return res.status(403).json({ error: '无权访问此告警' });
    }

    res.json(alert);
  } catch (error) {
    console.error('获取告警详情错误:', error);
    res.status(500).json({ error: '获取告警详情失败' });
  }
});

// 更新告警
router.put('/:id', authenticate, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: '告警不存在' });
    }

    // 检查权限
    const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
    if (!allowedProjectIds.includes(alert.projectId.toString())) {
      return res.status(403).json({ error: '无权修改此告警' });
    }

    const {
      name,
      description,
      priority,
      enabled,
      conditions,
      notificationConfigs,
      settings
    } = req.body;

    if (name) alert.name = name;
    if (description !== undefined) alert.description = description;
    if (priority) alert.priority = priority;
    if (enabled !== undefined) alert.enabled = enabled;
    if (conditions) alert.conditions = { ...alert.conditions, ...conditions };
    if (notificationConfigs) alert.notificationConfigs = notificationConfigs;
    if (settings) alert.settings = { ...alert.settings, ...settings };

    await alert.save();
    await alert.populate('projectId', 'name');
    await alert.populate('createdBy', 'username email');
    await alert.populate('notificationConfigs', 'name type');

    res.json(alert);
  } catch (error) {
    console.error('更新告警错误:', error);
    res.status(500).json({ error: '更新告警失败' });
  }
});

// 删除告警
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: '告警不存在' });
    }

    // 检查权限
    const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
    if (!allowedProjectIds.includes(alert.projectId.toString())) {
      return res.status(403).json({ error: '无权删除此告警' });
    }

    await Alert.findByIdAndDelete(req.params.id);

    res.json({ message: '告警删除成功' });
  } catch (error) {
    console.error('删除告警错误:', error);
    res.status(500).json({ error: '删除告警失败' });
  }
});

// 测试告警
router.post('/:id/test', authenticate, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('projectId', 'name')
      .populate('notificationConfigs');
    
    if (!alert) {
      return res.status(404).json({ error: '告警不存在' });
    }

    const notificationService = require('../services/notificationService');
    const NotificationConfig = require('../models/NotificationConfig');
    
    // 构造测试数据
    const testData = {
      alert: {
        _id: alert._id,
        name: alert.name,
        priority: alert.priority,
        projectId: alert.projectId
      },
      data: {
        errorCount: 10,
        userCount: 5,
        reason: '这是一条测试告警消息'
      }
    };

    // 发送测试通知
    const results = [];
    const configs = await NotificationConfig.find({
      _id: { $in: alert.notificationConfigs },
      enabled: true
    });

    for (const config of configs) {
      const result = await notificationService.send(
        config.type,
        config.config,
        testData
      );

      results.push({
        type: config.type,
        name: config.name,
        status: result.success ? 'success' : 'failed',
        message: result.success 
          ? `测试通知已发送到 ${config.name}` 
          : `发送失败: ${result.error}`,
        responseTime: result.responseTime
      });
    }

    res.json({
      success: results.some(r => r.status === 'success'),
      results
    });
  } catch (error) {
    console.error('测试告警错误:', error);
    res.status(500).json({ error: '测试告警失败', message: error.message });
  }
});

// 获取告警历史
router.get('/:id/history', authenticate, async (req, res) => {
  try {
    const {
      page = 1,
      limit,
      pageSize,
      days = 7
    } = req.query;

    // 支持 pageSize 和 limit 两种参数名，优先使用 pageSize
    const pageLimit = parseInt(pageSize || limit || 20);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const query = {
      alertId: req.params.id,
      triggeredAt: { $gte: startDate }
    };

    const total = await AlertHistory.countDocuments(query);
    const history = await AlertHistory.find(query)
      .populate('issueId', 'title shortId')
      .sort({ triggeredAt: -1 })
      .limit(pageLimit)
      .skip((page - 1) * pageLimit);

    res.json({
      history,
      pagination: {
        page: parseInt(page),
        limit: pageLimit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取告警历史错误:', error);
    res.status(500).json({ error: '获取告警历史失败' });
  }
});

// 启用/禁用告警
router.patch('/:id/toggle', authenticate, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: '告警不存在' });
    }

    // 检查权限
    const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
    if (!allowedProjectIds.includes(alert.projectId.toString())) {
      return res.status(403).json({ error: '无权修改此告警' });
    }

    alert.enabled = !alert.enabled;
    await alert.save();

    res.json({
      message: `告警已${alert.enabled ? '启用' : '禁用'}`,
      enabled: alert.enabled
    });
  } catch (error) {
    console.error('切换告警状态错误:', error);
    res.status(500).json({ error: '切换告警状态失败' });
  }
});

module.exports = router;
