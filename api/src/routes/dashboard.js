const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Issue = require('../models/Issue');
const Error = require('../models/Error');
const Project = require('../models/Project');
const { authenticate } = require('../middleware/auth');
const { getUserProjectIds } = require('../middleware/projectAccess');

// 获取 Dashboard 完整数据（方案 1 + 2 + 3）
router.get('/stats', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;

    // 获取用户有权限的项目列表
    const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);

    // 权限检查
    if (projectId && !allowedProjectIds.includes(projectId)) {
      return res.status(403).json({ error: '无权访问此项目' });
    }

    // 构建查询条件（用于 Project 模型）
    const projectFilter = projectId
      ? { _id: projectId }
      : { _id: { $in: allowedProjectIds.map(id => new mongoose.Types.ObjectId(id)) } };

    // 构建查询条件（用于 Issue/Error 模型）
    const issueErrorFilter = projectId
      ? { projectId: new mongoose.Types.ObjectId(projectId) }
      : { projectId: { $in: allowedProjectIds.map(id => new mongoose.Types.ObjectId(id)) } };

    // 时间范围：本周 vs 上周
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - 7);
    thisWeekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(now.getDate() - 14);
    lastWeekStart.setHours(0, 0, 0, 0);

    // 并行获取所有数据
    const [
      totalIssues,
      totalErrors,
      recentIssues,
      projects,
      errorTrendData,
      issueLevelData,
      affectedUsers,
      alertStats,
      // 趋势对比数据
      thisWeekErrors,
      lastWeekErrors,
      thisWeekIssues,
      lastWeekIssues,
      thisWeekUsers,
      lastWeekUsers
    ] = await Promise.all([
      // 1. 总 Issues 数
      Issue.countDocuments(issueErrorFilter),

      // 2. 总 Errors 数
      Error.countDocuments(issueErrorFilter),

      // 3. 最近 5 个 Issues
      Issue.find(issueErrorFilter)
        .sort('-lastSeen')
        .limit(5)
        .select('title level count userCount lastSeen')
        .lean(),

      // 4. 项目列表（方案 3：只获取前 5 个）
      Project.find(projectFilter)
        .limit(5)
        .select('_id name environment')
        .lean(),

      // 5. 7 天错误趋势数据（方案 2：后端计算）
      getErrorTrendData(issueErrorFilter),

      // 6. Issue 按级别分类（方案 2：后端计算）
      getIssueLevelData(issueErrorFilter),

      // 7. 受影响的用户数
      getAffectedUsers(issueErrorFilter),

      // 8. 告警统计数据
      getAlertStats(allowedProjectIds, projectId),

      // 9. 本周 Errors（用 error 数量做趋势，最直观）
      Error.countDocuments({ ...issueErrorFilter, timestamp: { $gte: thisWeekStart } }),
      // 10. 上周 Errors
      Error.countDocuments({ ...issueErrorFilter, timestamp: { $gte: lastWeekStart, $lt: thisWeekStart } }),
      // 11. 本周活跃 Issues（lastSeen 在本周内）
      Issue.countDocuments({ ...issueErrorFilter, lastSeen: { $gte: thisWeekStart } }),
      // 12. 上周活跃 Issues（lastSeen 在上周内）
      Issue.countDocuments({ ...issueErrorFilter, lastSeen: { $gte: lastWeekStart, $lt: thisWeekStart } }),
      // 13. 本周受影响用户
      getAffectedUsersInRange(issueErrorFilter, thisWeekStart, now),
      // 14. 上周受影响用户
      getAffectedUsersInRange(issueErrorFilter, lastWeekStart, thisWeekStart)
    ]);

    // 为项目列表添加统计数据（方案 3：缓存）
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const projectErrorFilter = { projectId: new mongoose.Types.ObjectId(project._id) };
        const [issuesCount, errorsCount, lastError] = await Promise.all([
          Issue.countDocuments(projectErrorFilter),
          Error.countDocuments(projectErrorFilter),
          Error.findOne(projectErrorFilter)
            .sort('-timestamp')
            .select('timestamp')
            .lean()
        ]);

        return {
          _id: project._id,
          name: project.name,
          environment: project.environment,
          stats: {
            issues: issuesCount,
            errors: errorsCount,
            users: 0, // 从 issues 中计算
            lastError: lastError?.timestamp || null
          }
        };
      })
    );

    // 计算趋势百分比（上周 -> 本周）
    const calcTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const stats = {
      totalIssues,
      totalErrors,
      affectedUsers,
      activeAlerts: alertStats.activeAlerts,
      issuesTrend: calcTrend(thisWeekIssues, lastWeekIssues),
      errorsTrend: calcTrend(thisWeekErrors, lastWeekErrors),
      usersTrend: calcTrend(thisWeekUsers, lastWeekUsers),
      triggeredToday: alertStats.triggeredToday
    };

    res.json({
      stats,
      recentIssues,
      projects: projectsWithStats,
      errorTrend: errorTrendData,
      issueLevels: issueLevelData
    });
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// 辅助函数：获取 7 天错误趋势数据
async function getErrorTrendData(errorFilter) {
  try {
    const labels = [];
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      labels.push(date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }));

      const count = await Error.countDocuments({
        ...errorFilter,
        timestamp: { $gte: date, $lt: nextDate }
      });

      data.push(count);
    }

    return { labels, data };
  } catch (error) {
    console.error('Error fetching trend data:', error);
    return { labels: [], data: [] };
  }
}

// 辅助函数：获取 Issue 按级别分类数据
async function getIssueLevelData(projectFilter) {
  try {
    const levels = await Issue.aggregate([
      { $match: projectFilter },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      }
    ]);

    const levelMap = {
      error: 0,
      warning: 0,
      info: 0,
      debug: 0,
      fatal: 0
    };

    levels.forEach(item => {
      const level = (item._id || 'error').toLowerCase();
      if (levelMap.hasOwnProperty(level)) {
        levelMap[level] = item.count;
      }
    });

    return levelMap;
  } catch (error) {
    console.error('Error fetching level data:', error);
    return { error: 0, warning: 0, info: 0, debug: 0, fatal: 0 };
  }
}

// 辅助函数：获取受影响的用户数
async function getAffectedUsers(projectFilter) {
  try {
    const result = await Issue.aggregate([
      { $match: projectFilter },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: '$userCount' }
        }
      }
    ]);

    return result[0]?.totalUsers || 0;
  } catch (error) {
    console.error('Error fetching affected users:', error);
    return 0;
  }
}

// 辅助函数：获取指定时间范围内受影响的用户数
async function getAffectedUsersInRange(projectFilter, startDate, endDate) {
  try {
    const result = await Error.aggregate([
      {
        $match: {
          ...projectFilter,
          timestamp: { $gte: startDate, $lt: endDate },
          'user.id': { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$user.id'
        }
      },
      {
        $count: 'total'
      }
    ]);

    return result[0]?.total || 0;
  } catch (error) {
    console.error('Error fetching affected users in range:', error);
    return 0;
  }
}

// 辅助函数：获取告警统计数据
async function getAlertStats(allowedProjectIds, projectId) {
  try {
    const Alert = require('../models/Alert');
    const AlertHistory = require('../models/AlertHistory');

    // 构建查询条件
    const alertFilter = projectId
      ? { projectId: new mongoose.Types.ObjectId(projectId), enabled: true }
      : { projectId: { $in: allowedProjectIds.map(id => new mongoose.Types.ObjectId(id)) }, enabled: true };

    // 获取启用的告警数量（活跃告警）
    const activeAlerts = await Alert.countDocuments(alertFilter);

    // 获取今天触发的告警次数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const historyFilter = projectId
      ? { projectId: new mongoose.Types.ObjectId(projectId), triggeredAt: { $gte: today } }
      : { projectId: { $in: allowedProjectIds.map(id => new mongoose.Types.ObjectId(id)) }, triggeredAt: { $gte: today } };

    const triggeredToday = await AlertHistory.countDocuments(historyFilter);

    return {
      activeAlerts,
      triggeredToday
    };
  } catch (error) {
    console.error('Error fetching alert stats:', error);
    return {
      activeAlerts: 0,
      triggeredToday: 0
    };
  }
}

module.exports = router;
