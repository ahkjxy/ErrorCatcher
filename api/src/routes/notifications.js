const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const NotificationConfig = require('../models/NotificationConfig');
const notificationService = require('../services/notificationService');
const { authenticate } = require('../middleware/auth');
const { getUserProjectIds } = require('../middleware/projectAccess');

// 获取通知配置列表
router.get('/configs', authenticate, async (req, res) => {
  try {
    const { projectId, type } = req.query;
    
    let query = {};
    
    if (projectId) {
      // 如果指定了项目，检查权限
      const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
      if (!allowedProjectIds.includes(projectId)) {
        return res.status(403).json({ error: '无权访问此项目' });
      }
      // 只获取指定项目的配置
      query.projectId = new mongoose.Types.ObjectId(projectId);
    } else {
      // 如果没有指定项目
      if (req.user.role === 'admin') {
        // Admin: 返回所有配置（不限制项目）
        // query 保持为空对象，不添加 projectId 过滤
      } else {
        // 普通用户: 返回有权限的项目配置 + 全局配置
        const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
        query.$or = [
          { projectId: { $in: allowedProjectIds.map(id => new mongoose.Types.ObjectId(id)) } },
          { projectId: null } // 包含全局配置
        ];
      }
    }
    
    if (type) {
      query.type = type;
    }

    const configs = await NotificationConfig.find(query)
      .populate('projectId', 'name')
      .populate('templateId')
      .populate('createdBy', 'username email')
      .sort({ isDefault: -1, createdAt: -1 });

    res.json({ configs });
  } catch (error) {
    console.error('获取通知配置列表错误:', error);
    res.status(500).json({ error: '获取通知配置列表失败' });
  }
});

// 创建通知配置
router.post('/configs', authenticate, async (req, res) => {
  try {
    const { name, description, type, config, projectId, isDefault, templateId } = req.body;

    if (!name || !type || !config) {
      return res.status(400).json({ error: '名称、类型和配置不能为空' });
    }

    // 检查项目权限
    if (projectId) {
      // 如果指定了项目，检查权限
      const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
      if (!allowedProjectIds.includes(projectId)) {
        return res.status(403).json({ error: '无权在此项目创建通知配置' });
      }
    } else {
      // 如果是全局配置（projectId为null），只有admin可以创建
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: '只有管理员可以创建全局通知配置' });
      }
    }

    // 如果设置为默认，取消同类型同项目的其他默认配置
    if (isDefault) {
      const query = { type };
      
      if (projectId) {
        query.projectId = new mongoose.Types.ObjectId(projectId);
      } else {
        query.projectId = null;
      }
      
      await NotificationConfig.updateMany(query, { isDefault: false });
    }

    const notificationConfig = new NotificationConfig({
      name,
      description,
      type,
      config,
      templateId: templateId || null,
      projectId: projectId ? new mongoose.Types.ObjectId(projectId) : null,
      isDefault,
      createdBy: req.user._id
    });

    await notificationConfig.save();
    await notificationConfig.populate('projectId', 'name');
    await notificationConfig.populate('templateId');
    await notificationConfig.populate('createdBy', 'username email');

    res.status(201).json(notificationConfig);
  } catch (error) {
    console.error('创建通知配置错误:', error);
    res.status(500).json({ error: '创建通知配置失败' });
  }
});

// 获取通知配置详情
router.get('/configs/:id', authenticate, async (req, res) => {
  try {
    const config = await NotificationConfig.findById(req.params.id)
      .populate('projectId', 'name')
      .populate('createdBy', 'username email');

    if (!config) {
      return res.status(404).json({ error: '通知配置不存在' });
    }

    // 检查权限
    if (config.projectId) {
      // 如果配置有projectId，检查项目权限
      const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
      if (!allowedProjectIds.includes(config.projectId._id.toString())) {
        return res.status(403).json({ error: '无权访问此通知配置' });
      }
    }
    // 全局配置（projectId为null）所有用户都可以访问

    res.json(config);
  } catch (error) {
    console.error('获取通知配置详情错误:', error);
    res.status(500).json({ error: '获取通知配置详情失败' });
  }
});

// 更新通知配置
router.put('/configs/:id', authenticate, async (req, res) => {
  try {
    const { name, description, config, type, isDefault, templateId, projectId } = req.body;

    const notificationConfig = await NotificationConfig.findById(req.params.id);
    if (!notificationConfig) {
      return res.status(404).json({ error: '通知配置不存在' });
    }

    // 检查项目权限
    // 如果配置有projectId，需要检查权限
    if (notificationConfig.projectId) {
      const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
      if (!allowedProjectIds.includes(notificationConfig.projectId.toString())) {
        return res.status(403).json({ error: '无权修改此通知配置' });
      }
    } else {
      // 如果是全局配置（projectId为null），只有admin可以修改
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: '只有管理员可以修改全局通知配置' });
      }
    }

    // 如果要更新projectId
    if (projectId !== undefined) {
      if (projectId) {
        // 检查新项目的权限
        const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
        if (!allowedProjectIds.includes(projectId)) {
          return res.status(403).json({ error: '无权将配置关联到此项目' });
        }
        notificationConfig.projectId = new mongoose.Types.ObjectId(projectId);
      } else {
        // 设置为全局配置，只有admin可以
        if (req.user.role !== 'admin') {
          return res.status(403).json({ error: '只有管理员可以创建全局通知配置' });
        }
        notificationConfig.projectId = null;
      }
    }

    // 如果设置为默认，取消同类型同项目的其他默认配置
    if (isDefault && !notificationConfig.isDefault) {
      const query = { 
        type: type || notificationConfig.type,
        _id: { $ne: notificationConfig._id }
      };
      
      // 如果有projectId，只取消同项目的默认配置
      if (notificationConfig.projectId) {
        query.projectId = notificationConfig.projectId;
      } else {
        // 如果是全局配置，只取消其他全局配置的默认状态
        query.projectId = null;
      }
      
      await NotificationConfig.updateMany(query, { isDefault: false });
    }

    if (name) notificationConfig.name = name;
    if (description !== undefined) notificationConfig.description = description;
    if (type) notificationConfig.type = type;
    if (config) notificationConfig.config = config;  // 完全替换，不是合并
    if (templateId !== undefined) notificationConfig.templateId = templateId || null;
    if (isDefault !== undefined) notificationConfig.isDefault = isDefault;

    await notificationConfig.save();
    await notificationConfig.populate('projectId', 'name');
    await notificationConfig.populate('templateId');
    await notificationConfig.populate('createdBy', 'username email');

    res.json(notificationConfig);
  } catch (error) {
    console.error('更新通知配置错误:', error);
    res.status(500).json({ error: '更新通知配置失败' });
  }
});

// 删除通知配置
router.delete('/configs/:id', authenticate, async (req, res) => {
  try {
    const config = await NotificationConfig.findById(req.params.id);
    if (!config) {
      return res.status(404).json({ error: '通知配置不存在' });
    }

    // 检查权限
    if (config.projectId) {
      // 如果配置有projectId，检查项目权限
      const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
      if (!allowedProjectIds.includes(config.projectId.toString())) {
        return res.status(403).json({ error: '无权删除此通知配置' });
      }
    } else {
      // 如果是全局配置，只有admin可以删除
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: '只有管理员可以删除全局通知配置' });
      }
    }

    await NotificationConfig.findByIdAndDelete(req.params.id);

    res.json({ message: '通知配置删除成功' });
  } catch (error) {
    console.error('删除通知配置错误:', error);
    res.status(500).json({ error: '删除通知配置失败' });
  }
});

// 测试通知配置
router.post('/configs/:id/test', authenticate, async (req, res) => {
  try {
    const { customMessage, customTitle } = req.body;
    
    const config = await NotificationConfig.findById(req.params.id)
      .populate('projectId', 'name');

    if (!config) {
      return res.status(404).json({ error: '通知配置不存在' });
    }

    // 构造测试数据
    const testData = {
      alert: {
        _id: 'test',
        name: customTitle || '测试通知',
        priority: 'medium',
        projectId: config.projectId || { name: '测试项目' }
      },
      data: {
        errorCount: 10,
        userCount: 5,
        reason: customMessage || '这是一条测试通知消息，用于验证通知配置是否正确'
      }
    };

    const result = await notificationService.send(
      config.type,
      config.config,
      testData
    );

    res.json({
      success: result.success,
      message: result.success ? '测试通知发送成功' : `发送失败: ${result.error}`,
      responseTime: result.responseTime
    });
  } catch (error) {
    console.error('测试通知配置错误:', error);
    res.status(500).json({ error: '测试通知配置失败', message: error.message });
  }
});

// 快速测试（不保存配置）
router.post('/test', authenticate, async (req, res) => {
  try {
    const { type, config, customMessage, customTitle } = req.body;

    if (!type || !config) {
      return res.status(400).json({ error: '类型和配置不能为空' });
    }

    // 构造测试数据
    const testData = {
      alert: {
        _id: 'test',
        name: customTitle || '测试通知',
        priority: 'medium',
        projectId: { name: '测试项目' }
      },
      data: {
        errorCount: 10,
        userCount: 5,
        reason: customMessage || '这是一条测试通知消息，用于验证通知配置是否正确'
      }
    };

    const result = await notificationService.send(type, config, testData);

    res.json({
      success: result.success,
      message: result.success ? '测试通知发送成功' : `发送失败: ${result.error}`,
      responseTime: result.responseTime
    });
  } catch (error) {
    console.error('快速测试通知错误:', error);
    res.status(500).json({ error: '测试通知失败', message: error.message });
  }
});

// 启用/禁用通知配置
router.patch('/configs/:id/toggle', authenticate, async (req, res) => {
  try {
    const config = await NotificationConfig.findById(req.params.id);
    if (!config) {
      return res.status(404).json({ error: '通知配置不存在' });
    }

    // 检查权限
    if (config.projectId) {
      // 如果配置有projectId，检查项目权限
      const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
      if (!allowedProjectIds.includes(config.projectId.toString())) {
        return res.status(403).json({ error: '无权修改此通知配置' });
      }
    } else {
      // 如果是全局配置，只有admin可以修改
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: '只有管理员可以修改全局通知配置' });
      }
    }

    config.enabled = !config.enabled;
    await config.save();

    res.json({
      message: `通知配置已${config.enabled ? '启用' : '禁用'}`,
      enabled: config.enabled
    });
  } catch (error) {
    console.error('切换通知配置状态错误:', error);
    res.status(500).json({ error: '切换通知配置状态失败' });
  }
});

// 设置为默认配置
router.patch('/configs/:id/set-default', authenticate, async (req, res) => {
  try {
    const config = await NotificationConfig.findById(req.params.id);
    if (!config) {
      return res.status(404).json({ error: '通知配置不存在' });
    }

    // 检查权限
    if (config.projectId) {
      // 如果配置有projectId，检查项目权限
      const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
      if (!allowedProjectIds.includes(config.projectId.toString())) {
        return res.status(403).json({ error: '无权修改此通知配置' });
      }
    } else {
      // 如果是全局配置，只有admin可以修改
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: '只有管理员可以修改全局通知配置' });
      }
    }

    // 取消同类型的其他默认配置
    const query = { 
      type: config.type,
      _id: { $ne: config._id }
    };
    
    // 如果有projectId，只取消同项目的默认配置
    if (config.projectId) {
      query.projectId = config.projectId;
    } else {
      // 如果是全局配置，只取消其他全局配置的默认状态
      query.projectId = null;
    }
    
    await NotificationConfig.updateMany(query, { isDefault: false });

    config.isDefault = true;
    await config.save();

    res.json({
      message: '已设置为默认配置',
      config
    });
  } catch (error) {
    console.error('设置默认配置错误:', error);
    res.status(500).json({ error: '设置默认配置失败' });
  }
});

module.exports = router;
