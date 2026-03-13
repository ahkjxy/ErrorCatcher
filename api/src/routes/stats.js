const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Error = require('../models/Error');
const Project = require('../models/Project');
const { authenticate } = require('../middleware/auth');
const { getUserProjectIds } = require('../middleware/projectAccess');

router.get('/overview', authenticate, async (req, res) => {
  try {
    const { appName, environment, days = 7, projectId } = req.query;

    // 获取用户有权限的项目列表
    const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const query = { timestamp: { $gte: startDate } };
    if (appName) query.appName = appName;
    if (environment) query.environment = environment;
    
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

    const [total, resolved, byType, byLevel, byDay, topErrors, browserStats, byProject] = await Promise.all([
      Error.countDocuments(query),
      Error.countDocuments({ ...query, resolved: true }),
      Error.aggregate([
        { $match: query },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      // 按错误级别统计
      Error.aggregate([
        { $match: query },
        { $group: { _id: '$level', count: { $sum: 1 } } }
      ]),
      // 按天统计
      Error.aggregate([
        { $match: query },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      // Top 错误类型（按 message 分组）
      Error.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$message',
            count: { $sum: 1 },
            type: { $first: '$type' },
            lastOccurred: { $max: '$timestamp' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      // 浏览器统计
      Error.aggregate([
        { $match: query },
        {
          $project: {
            browser: {
              $cond: {
                if: { $regexMatch: { input: '$userAgent', regex: 'Chrome', options: 'i' } },
                then: 'Chrome',
                else: {
                  $cond: {
                    if: { $regexMatch: { input: '$userAgent', regex: 'Safari', options: 'i' } },
                    then: 'Safari',
                    else: {
                      $cond: {
                        if: { $regexMatch: { input: '$userAgent', regex: 'Firefox', options: 'i' } },
                        then: 'Firefox',
                        else: {
                          $cond: {
                            if: { $regexMatch: { input: '$userAgent', regex: 'Edge', options: 'i' } },
                            then: 'Edge',
                            else: 'Other'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          $group: {
            _id: '$browser',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),
      // 按项目统计
      Error.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$projectId',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    // 计算 Top 错误的百分比
    const topErrorsWithPercentage = topErrors.map(item => ({
      message: item._id,
      count: item.count,
      type: item.type,
      lastOccurred: item.lastOccurred,
      percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : 0
    }));

    // 转换错误级别数据
    const levelData = {};
    byLevel.forEach(item => {
      levelData[item._id || 'error'] = item.count;
    });

    // 转换浏览器数据
    const browserData = browserStats.map(item => ({
      name: item._id,
      value: item.count
    }));

    // 获取项目名称并转换项目数据
    const projectIds = byProject.map(item => item._id).filter(id => id);
    const projects = await Project.find({ _id: { $in: projectIds } }).select('name');
    const projectMap = {};
    projects.forEach(p => {
      projectMap[p._id.toString()] = p.name;
    });

    const projectData = byProject.map(item => ({
      _id: item._id,
      name: item._id ? (projectMap[item._id.toString()] || 'Unknown Project') : 'Unknown Project',
      count: item.count
    }));

    // 计算趋势（较上周变化）
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - parseInt(days));
    const prevQuery = { 
      timestamp: { $gte: prevStartDate, $lt: startDate }
    };
    if (appName) prevQuery.appName = appName;
    if (environment) prevQuery.environment = environment;
    if (projectId) {
      prevQuery.projectId = projectId;
    } else {
      prevQuery.projectId = { $in: allowedProjectIds.map(id => new mongoose.Types.ObjectId(id)) };
    }

    const prevTotal = await Error.countDocuments(prevQuery);
    const trend = prevTotal > 0 ? (((total - prevTotal) / prevTotal) * 100).toFixed(1) : 0;

    // 计算今日新增
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayQuery = { timestamp: { $gte: todayStart } };
    if (appName) todayQuery.appName = appName;
    if (environment) todayQuery.environment = environment;
    if (projectId) {
      todayQuery.projectId = projectId;
    } else {
      todayQuery.projectId = { $in: allowedProjectIds.map(id => new mongoose.Types.ObjectId(id)) };
    }
    
    const today = await Error.countDocuments(todayQuery);

    res.json({
      total,
      resolved,
      unresolved: total - resolved,
      today,
      trend: parseFloat(trend),
      byType,
      byLevel: levelData,
      byDay,
      byProject: projectData,
      topErrors: topErrorsWithPercentage,
      browserData
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/apps', authenticate, async (req, res) => {
  try {
    // 获取用户有权限的项目列表
    const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);

    const apps = await Error.aggregate([
      {
        $match: {
          projectId: { $in: allowedProjectIds.map(id => new mongoose.Types.ObjectId(id)) }
        }
      },
      {
        $group: {
          _id: '$appName',
          count: { $sum: 1 },
          lastError: { $max: '$timestamp' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(apps);
  } catch (error) {
    console.error('Error fetching apps:', error);
    res.status(500).json({ error: 'Failed to fetch apps' });
  }
});

module.exports = router;
