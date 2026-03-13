const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Issue = require('../models/Issue');
const Error = require('../models/Error');
const { authenticate } = require('../middleware/auth');
const { getUserProjectIds } = require('../middleware/projectAccess');

// 获取问题列表（分组后的错误）
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      page = 1,
      limit,
      pageSize,
      projectId,
      status,
      level,
      priority,
      assignedTo,
      timeRange,
      minCount,
      query,
      sort = '-lastSeen'
    } = req.query;

    // 获取用户有权限的项目列表
    const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);

    // 支持 pageSize 和 limit 两种参数名，优先使用 pageSize
    const pageLimit = parseInt(pageSize || limit || 25);
    const filter = {};
    
    // 如果指定了 projectId，检查权限
    if (projectId) {
      if (!allowedProjectIds.includes(projectId)) {
        return res.status(403).json({ error: '无权访问此项目' });
      }
      filter.projectId = projectId;
    } else {
      // 如果没有指定项目，只查询用户有权限的项目
      filter.projectId = { $in: allowedProjectIds.map(id => new mongoose.Types.ObjectId(id)) };
    }
    
    if (status) filter.status = status;
    if (level) filter.level = level;
    if (priority) filter.priority = priority;
    if (query) filter.title = { $regex: query, $options: 'i' };
    if (minCount) filter.count = { $gte: parseInt(minCount) };
    
    // 负责人筛选
    if (assignedTo) {
      if (assignedTo === 'unassigned') {
        filter.assignedTo = { $exists: false };
      } else if (assignedTo === 'me' && req.user) {
        filter.assignedTo = req.user._id;
      } else {
        filter.assignedTo = assignedTo;
      }
    }
    
    // 时间范围筛选
    if (timeRange) {
      const now = new Date();
      let startDate;
      switch (timeRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
      }
      if (startDate) {
        filter.lastSeen = { $gte: startDate };
      }
    }

    const skip = (parseInt(page) - 1) * pageLimit;

    const [issues, total] = await Promise.all([
      Issue.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(pageLimit)
        .populate('sampleEvent')
        .populate('assignedTo', 'username email')
        .populate('projectId', 'name')
        .lean(),
      Issue.countDocuments(filter)
    ]);

    // 为每个 issue 获取最近 7 天的趋势数据
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const issuesWithTrend = await Promise.all(
      issues.map(async (issue) => {
        const trend = await Error.aggregate([
          {
            $match: {
              fingerprint: issue.fingerprint,
              timestamp: { $gte: sevenDaysAgo }
            }
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]);
        
        return {
          ...issue,
          trend,
          projectName: issue.projectId?.name,
          assignedToName: issue.assignedTo?.username
        };
      })
    );

    res.json({
      issues: issuesWithTrend,
      pagination: {
        page: parseInt(page),
        limit: pageLimit,
        pageSize: pageLimit,  // 添加pageSize字段，与前端保持一致
        total,
        pages: Math.ceil(total / pageLimit)
      }
    });
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

// 获取问题详情
router.get('/:id', authenticate, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('sampleEvent')
      .populate('assignedTo', 'username email')
      .populate({
        path: 'projectId',
        select: 'name owner createdBy',
        populate: [
          { path: 'owner', select: 'username email' },
          { path: 'createdBy', select: 'username email' }
        ]
      });
    
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // 检查权限
    const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
    if (!allowedProjectIds.includes(issue.projectId._id.toString())) {
      return res.status(403).json({ error: '无权访问此问题' });
    }

    console.log('[Issue Detail] projectId:', issue.projectId);
    console.log('[Issue Detail] owner:', issue.projectId?.owner);

    // 获取最近的事件
    const events = await Error.find({ fingerprint: issue.fingerprint })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    // 获取标签分布
    const tagStats = await Error.aggregate([
      { $match: { fingerprint: issue.fingerprint } },
      { $project: { tags: { $objectToArray: '$tags' } } },
      { $unwind: '$tags' },
      {
        $group: {
          _id: { key: '$tags.k', value: '$tags.v' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);

    // 获取影响的用户
    const users = await Error.aggregate([
      { $match: { fingerprint: issue.fingerprint, 'user.id': { $exists: true } } },
      {
        $group: {
          _id: '$user.id',
          user: { $first: '$user' },
          count: { $sum: 1 },
          lastSeen: { $max: '$timestamp' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // 获取趋势数据（最近 24 小时）
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const trend = await Error.aggregate([
      {
        $match: {
          fingerprint: issue.fingerprint,
          timestamp: { $gte: oneDayAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d %H:00', date: '$timestamp' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      issue,
      events,
      tags: tagStats,
      users,
      trend
    });
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({ error: 'Failed to fetch issue' });
  }
});

// 更新问题状态
router.put('/:id', authenticate, async (req, res) => {
  try {
    // 先获取 issue 检查权限
    const issueDoc = await Issue.findById(req.params.id);
    if (!issueDoc) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // 检查权限
    const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
    if (!allowedProjectIds.includes(issueDoc.projectId.toString())) {
      return res.status(403).json({ error: '无权修改此问题' });
    }

    const {
      status,
      assignedTo,
      notes,
      priority,
      labels,
      resolution,
      resolutionDetails,
      relatedRelease,
      relatedCommit,
      relatedPR
    } = req.body;
    
    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === 'resolved') {
        updateData.resolvedAt = new Date();
        if (req.user) updateData.resolvedBy = req.user._id;
        if (resolution) updateData.resolution = resolution;
        if (resolutionDetails) updateData.resolutionDetails = resolutionDetails;
        if (relatedRelease) updateData.relatedRelease = relatedRelease;
        if (relatedCommit) updateData.relatedCommit = relatedCommit;
        if (relatedPR) updateData.relatedPR = relatedPR;
      }
    }
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null;
    if (notes) updateData.notes = notes;
    if (priority) updateData.priority = priority;
    if (labels !== undefined) updateData.labels = labels;

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('assignedTo', 'username email');

    res.json(issue);
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({ error: 'Failed to update issue' });
  }
});

// 批量操作
router.put('/bulk', authenticate, async (req, res) => {
  try {
    const { ids, action, data = {} } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid ids' });
    }

    // 获取用户有权限的项目列表
    const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);

    // 检查所有 issues 的权限
    const issues = await Issue.find({ _id: { $in: ids } }).select('projectId');
    for (const issue of issues) {
      if (!allowedProjectIds.includes(issue.projectId.toString())) {
        return res.status(403).json({ error: '无权修改某些问题' });
      }
    }

    let updateData = {};
    
    switch (action) {
      case 'resolve':
        updateData = {
          status: 'resolved',
          resolvedAt: new Date()
        };
        if (req.user) updateData.resolvedBy = req.user._id;
        break;
      
      case 'ignore':
        updateData = { status: 'ignored' };
        break;
      
      case 'unresolve':
        updateData = {
          status: 'unresolved',
          resolvedAt: null,
          resolvedBy: null
        };
        break;
      
      case 'delete':
        await Issue.deleteMany({ _id: { $in: ids } });
        return res.json({ success: true, count: ids.length });
      
      case 'assign':
        if (!data.assignedTo) {
          return res.status(400).json({ error: 'assignedTo is required' });
        }
        updateData = { assignedTo: data.assignedTo };
        break;
      
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    const result = await Issue.updateMany(
      { _id: { $in: ids } },
      updateData
    );

    res.json({
      success: true,
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk updating issues:', error);
    res.status(500).json({ error: 'Failed to bulk update issues' });
  }
});

// 获取问题的事件列表
router.get('/:id/events', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 25 } = req.query;
    const pageLimit = parseInt(limit);
    
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // 检查权限
    const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
    if (!allowedProjectIds.includes(issue.projectId.toString())) {
      return res.status(403).json({ error: '无权访问此问题' });
    }

    const skip = (parseInt(page) - 1) * pageLimit;

    const [events, total] = await Promise.all([
      Error.find({ fingerprint: issue.fingerprint })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(pageLimit)
        .lean(),
      Error.countDocuments({ fingerprint: issue.fingerprint })
    ]);

    res.json({
      events,
      pagination: {
        page: parseInt(page),
        limit: pageLimit,
        total,
        pages: Math.ceil(total / pageLimit)
      }
    });
  } catch (error) {
    console.error('Error fetching issue events:', error);
    res.status(500).json({ error: 'Failed to fetch issue events' });
  }
});

// 获取问题趋势
router.get('/:id/trend', authenticate, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // 检查权限
    const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
    if (!allowedProjectIds.includes(issue.projectId.toString())) {
      return res.status(403).json({ error: '无权访问此问题' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const trend = await Error.aggregate([
      {
        $match: {
          fingerprint: issue.fingerprint,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ data: trend });
  } catch (error) {
    console.error('Error fetching issue trend:', error);
    res.status(500).json({ error: 'Failed to fetch issue trend' });
  }
});

module.exports = router;
