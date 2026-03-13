const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { authenticate } = require('../middleware/auth');
const { getUserProjectIds, checkProjectAccess } = require('../middleware/projectAccess');

// 获取项目列表
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit, pageSize, status, platform } = req.query;
    
    // 支持 pageSize 和 limit 两种参数名，优先使用 pageSize
    const pageLimit = parseInt(pageSize || limit || 20);
    
    // 获取用户有权限的项目 ID
    const projectIds = await getUserProjectIds(req.user._id, req.user.role);
    
    const query = { _id: { $in: projectIds } };
    
    if (status) query.status = status;
    if (platform) query.platform = platform;

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .populate('createdBy', 'username email')
      .populate('owner', 'username email')
      .sort({ createdAt: -1 })
      .limit(pageLimit)
      .skip((page - 1) * pageLimit);

    // 为每个项目添加统计数据
    const Error = require('../models/Error');
    const Issue = require('../models/Issue');
    const Alert = require('../models/Alert');
    
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const [errorCount, issueCount, alertCount] = await Promise.all([
          Error.countDocuments({ projectId: project._id }),
          Issue.countDocuments({ projectId: project._id }),
          Alert.countDocuments({ projectId: project._id })
        ]);
        
        return {
          ...project.toObject(),
          errorCount,
          issueCount,
          alertCount
        };
      })
    );

    res.json({ 
      projects: projectsWithStats,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('获取项目列表错误:', error);
    res.status(500).json({ error: '获取项目列表失败' });
  }
});

// 创建项目
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, platform, framework } = req.body;

    if (!name) {
      return res.status(400).json({ error: '项目名称不能为空' });
    }

    // 生成 API Key
    const apiKey = Project.generateApiKey();

    const project = new Project({
      name,
      description,
      platform,
      framework,
      apiKey,
      createdBy: req.user._id,
      owner: req.user._id
    });

    await project.save();
    await project.populate('createdBy', 'username email');
    await project.populate('owner', 'username email');

    res.status(201).json(project);
  } catch (error) {
    console.error('创建项目错误:', error);
    console.error('错误详情:', error.message);
    res.status(500).json({ error: '创建项目失败', details: error.message });
  }
});

// 获取项目详情
router.get('/:id', authenticate, async (req, res) => {
  try {
    // 检查权限
    const hasAccess = await checkProjectAccess(req.user._id, req.params.id, req.user.role);
    if (!hasAccess) {
      return res.status(403).json({ error: '无权访问此项目' });
    }

    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('owner', 'username email')
      .populate('defaultAlertId');

    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: '获取项目详情失败' });
  }
});

// 更新项目
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, description, platform, framework, status, settings, defaultAlertId, owner } = req.body;
    
    const project = await Project.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (platform) project.platform = platform;
    if (framework) project.framework = framework;
    if (status) project.status = status;
    if (settings) project.settings = { ...project.settings, ...settings };
    if (defaultAlertId !== undefined) project.defaultAlertId = defaultAlertId || null;
    if (owner !== undefined) project.owner = owner || null;

    await project.save();
    await project.populate('createdBy', 'username email');
    await project.populate('owner', 'username email');

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: '更新项目失败' });
  }
});

// 删除项目
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: '项目不存在或无权删除' });
    }

    // 删除相关数据
    const Error = require('../models/Error');
    const Issue = require('../models/Issue');
    const Alert = require('../models/Alert');
    const NotificationConfig = require('../models/NotificationConfig');

    await Promise.all([
      Error.deleteMany({ projectId: project._id }),
      Issue.deleteMany({ projectId: project._id }),
      Alert.deleteMany({ projectId: project._id }),
      NotificationConfig.deleteMany({ projectId: project._id })
    ]);

    // 删除项目
    await Project.findByIdAndDelete(req.params.id);

    res.json({ 
      message: '项目删除成功',
      deletedProject: project.name
    });
  } catch (error) {
    console.error('删除项目失败:', error);
    res.status(500).json({ error: '删除项目失败' });
  }
});

// 重新生成 API Key
router.post('/:id/regenerate-key', authenticate, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }

    project.apiKey = Project.generateApiKey();
    await project.save();

    res.json({
      message: 'API Key 已重新生成',
      apiKey: project.apiKey
    });
  } catch (error) {
    res.status(500).json({ error: '重新生成 API Key 失败' });
  }
});

// 获取项目统计
router.get('/:id/stats', authenticate, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }

    const Error = require('../models/Error');
    const { days = 7 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await Error.aggregate([
      {
        $match: {
          projectId: project._id,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: ['$resolved', 1, 0] }
          },
          uniqueUsers: { $addToSet: '$userId' }
        }
      }
    ]);

    const result = stats[0] || { total: 0, resolved: 0, uniqueUsers: [] };

    res.json({
      totalErrors: result.total,
      resolvedErrors: result.resolved,
      unresolvedErrors: result.total - result.resolved,
      uniqueUsers: result.uniqueUsers.filter(Boolean).length,
      days: parseInt(days)
    });
  } catch (error) {
    res.status(500).json({ error: '获取统计失败' });
  }
});

// 获取项目成员（用于分配任务等）
router.get('/:id/members', authenticate, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }

    // 返回所有活跃用户作为可选成员
    const User = require('../models/User');
    const members = await User.find({ status: 'active' })
      .select('_id username email avatar')
      .sort({ username: 1 });

    res.json({
      members,
      owner: project.owner,
      createdBy: project.createdBy
    });
  } catch (error) {
    console.error('获取项目成员失败:', error);
    res.status(500).json({ error: '获取项目成员失败' });
  }
});

// 设置默认告警规则
router.patch('/:id/default-alert', authenticate, async (req, res) => {
  try {
    const { alertId } = req.body;
    
    // 检查权限
    const hasAccess = await checkProjectAccess(req.user._id, req.params.id, req.user.role);
    if (!hasAccess) {
      return res.status(403).json({ error: '无权修改此项目' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }

    // 如果提供了 alertId，验证告警是否属于该项目
    if (alertId) {
      const Alert = require('../models/Alert');
      const alert = await Alert.findOne({ _id: alertId, projectId: project._id });
      if (!alert) {
        return res.status(400).json({ error: '告警规则不存在或不属于此项目' });
      }
    }

    project.defaultAlertId = alertId || null;
    await project.save();
    await project.populate('defaultAlertId');

    res.json({
      message: alertId ? '默认告警规则已设置' : '默认告警规则已清除',
      defaultAlertId: project.defaultAlertId
    });
  } catch (error) {
    console.error('设置默认告警失败:', error);
    res.status(500).json({ error: '设置默认告警失败' });
  }
});

module.exports = router;
