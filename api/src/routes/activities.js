const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const { authenticate } = require('../middleware/auth');

// 获取活动列表
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      teamId,
      projectId,
      userId,
      type,
      targetType,
      days = 7
    } = req.query;

    const query = {};
    
    if (teamId) query.teamId = teamId;
    if (projectId) query.projectId = projectId;
    if (userId) query.userId = userId;
    if (type) query.type = type;
    if (targetType) query.targetType = targetType;

    // 时间范围
    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      query.createdAt = { $gte: startDate };
    }

    const total = await Activity.countDocuments(query);
    const activities = await Activity.find(query)
      .populate('userId', 'username email')
      .populate('projectId', 'name')
      .populate('teamId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取活动列表错误:', error);
    res.status(500).json({ error: '获取活动列表失败' });
  }
});

// 获取团队活动
router.get('/team/:teamId', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50, type } = req.query;

    const query = { teamId: req.params.teamId };
    if (type) query.type = type;

    const total = await Activity.countDocuments(query);
    const activities = await Activity.find(query)
      .populate('userId', 'username email')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取团队活动错误:', error);
    res.status(500).json({ error: '获取团队活动失败' });
  }
});

// 获取项目活动
router.get('/project/:projectId', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50, type } = req.query;

    const query = { projectId: req.params.projectId };
    if (type) query.type = type;

    const total = await Activity.countDocuments(query);
    const activities = await Activity.find(query)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取项目活动错误:', error);
    res.status(500).json({ error: '获取项目活动失败' });
  }
});

// 获取用户活动
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50, type } = req.query;

    const query = { userId: req.params.userId };
    if (type) query.type = type;

    const total = await Activity.countDocuments(query);
    const activities = await Activity.find(query)
      .populate('projectId', 'name')
      .populate('teamId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取用户活动错误:', error);
    res.status(500).json({ error: '获取用户活动失败' });
  }
});

// 获取 Issue 活动
router.get('/issue/:issueId', authenticate, async (req, res) => {
  try {
    const activities = await Activity.find({
      targetType: 'issue',
      targetId: req.params.issueId
    })
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });

    res.json({ activities });
  } catch (error) {
    console.error('获取 Issue 活动错误:', error);
    res.status(500).json({ error: '获取 Issue 活动失败' });
  }
});

// 创建活动记录（通常由系统自动调用）
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      teamId,
      projectId,
      type,
      targetType,
      targetId,
      changes,
      metadata
    } = req.body;

    if (!type || !targetType || !targetId) {
      return res.status(400).json({ error: '缺少必填字段' });
    }

    const activity = new Activity({
      teamId,
      projectId,
      userId: req.user._id,
      type,
      targetType,
      targetId,
      changes,
      metadata
    });

    await activity.save();
    await activity.populate('userId', 'username email');

    res.status(201).json(activity);
  } catch (error) {
    console.error('创建活动记录错误:', error);
    res.status(500).json({ error: '创建活动记录失败' });
  }
});

module.exports = router;
