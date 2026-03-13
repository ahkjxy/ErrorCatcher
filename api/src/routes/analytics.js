const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Error = require('../models/Error');
const Issue = require('../models/Issue');
const Project = require('../models/Project');
const { authenticate } = require('../middleware/auth');
const { getUserProjectIds } = require('../middleware/projectAccess');

// 获取分析数据
router.get('/overview', authenticate, async (req, res) => {
  try {
    const { 
      projectId, 
      startDate, 
      endDate, 
      compareStartDate, 
      compareEndDate,
      view,
      sort,
      granularity,
      browser,
      os,
      country
    } = req.query;

    // 获取用户有权限的项目列表
    const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);

    // 权限检查
    if (projectId && !allowedProjectIds.includes(projectId)) {
      return res.status(403).json({ error: '无权访问此项目' });
    }

    // 构建查询条件
    let issueErrorFilter = projectId
      ? { projectId: new mongoose.Types.ObjectId(projectId) }
      : { projectId: { $in: allowedProjectIds.map(id => new mongoose.Types.ObjectId(id)) } };

    // 添加过滤条件
    if (browser) {
      issueErrorFilter.userAgent = { $regex: browser, $options: 'i' };
    }
    if (os) {
      issueErrorFilter.userAgent = { $regex: os, $options: 'i' };
    }

    // 解析日期
    const start = new Date(startDate);
    const end = new Date(endDate);
    const compareStart = compareStartDate ? new Date(compareStartDate) : null;
    const compareEnd = compareEndDate ? new Date(compareEndDate) : null;

    // 当前周期数据
    const [
      currentTotal,
      currentResolved,
      currentByLevel,
      currentByBrowser,
      currentByOS,
      currentTrend,
      topErrors,
      affectedUsers,
      topErrorsByFrequency,
      topErrorsByImpact
    ] = await Promise.all([
      Error.countDocuments({
        ...issueErrorFilter,
        timestamp: { $gte: start, $lte: end }
      }),
      Error.countDocuments({
        ...issueErrorFilter,
        timestamp: { $gte: start, $lte: end },
        resolved: true
      }),
      getErrorsByLevel(issueErrorFilter, start, end),
      getErrorsByBrowser(issueErrorFilter, start, end),
      getErrorsByOS(issueErrorFilter, start, end),
      getErrorTrend(issueErrorFilter, start, end, granularity),
      getTopErrors(issueErrorFilter, start, end, sort),
      getAffectedUsers(issueErrorFilter, start, end),
      getTopErrorsByFrequency(issueErrorFilter, start, end),
      getTopErrorsByImpact(issueErrorFilter, start, end)
    ]);

    // 对比周期数据（如果提供）
    let compareData = null;
    if (compareStart && compareEnd) {
      const [
        compareTotal,
        compareResolved,
        compareByLevel,
        compareTrend
      ] = await Promise.all([
        Error.countDocuments({
          ...issueErrorFilter,
          timestamp: { $gte: compareStart, $lte: compareEnd }
        }),
        Error.countDocuments({
          ...issueErrorFilter,
          timestamp: { $gte: compareStart, $lte: compareEnd },
          resolved: true
        }),
        getErrorsByLevel(issueErrorFilter, compareStart, compareEnd),
        getErrorTrend(issueErrorFilter, compareStart, compareEnd)
      ]);

      compareData = {
        total: compareTotal,
        resolved: compareResolved,
        byLevel: compareByLevel,
        trend: compareTrend,
        // 计算变化百分比
        totalChange: currentTotal > 0 ? (((currentTotal - compareTotal) / compareTotal) * 100).toFixed(1) : 0,
        resolvedChange: compareResolved > 0 ? (((currentResolved - compareResolved) / compareResolved) * 100).toFixed(1) : 0
      };
    }

    res.json({
      current: {
        total: currentTotal,
        resolved: currentResolved,
        unresolved: currentTotal - currentResolved,
        resolutionRate: currentTotal > 0 ? ((currentResolved / currentTotal) * 100).toFixed(1) : 0,
        affectedUsers: affectedUsers,
        byLevel: currentByLevel,
        byBrowser: currentByBrowser,
        byOS: currentByOS,
        trend: currentTrend,
        topErrors,
        topErrorsByFrequency,
        topErrorsByImpact,
        errorCategories: getErrorCategories(topErrors)
      },
      compare: compareData,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// 导出报表功能
router.post('/export', authenticate, async (req, res) => {
  try {
    const { type, startDate, endDate, view, projectId } = req.body;

    // 获取用户有权限的项目列表
    const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);

    // 权限检查
    if (projectId && !allowedProjectIds.includes(projectId)) {
      return res.status(403).json({ error: '无权访问此项目' });
    }

    // 构建查询条件
    const issueErrorFilter = projectId
      ? { projectId: new mongoose.Types.ObjectId(projectId) }
      : { projectId: { $in: allowedProjectIds.map(id => new mongoose.Types.ObjectId(id)) } };

    const start = new Date(startDate);
    const end = new Date(endDate);

    // 获取数据
    const [
      totalErrors,
      resolvedErrors,
      byLevel,
      byBrowser,
      byOS,
      topErrors
    ] = await Promise.all([
      Error.countDocuments({
        ...issueErrorFilter,
        timestamp: { $gte: start, $lte: end }
      }),
      Error.countDocuments({
        ...issueErrorFilter,
        timestamp: { $gte: start, $lte: end },
        resolved: true
      }),
      getErrorsByLevel(issueErrorFilter, start, end),
      getErrorsByBrowser(issueErrorFilter, start, end),
      getErrorsByOS(issueErrorFilter, start, end),
      getTopErrors(issueErrorFilter, start, end)
    ]);

    const reportData = {
      summary: {
        totalErrors,
        resolvedErrors,
        resolutionRate: totalErrors > 0 ? ((resolvedErrors / totalErrors) * 100).toFixed(1) : 0,
        dateRange: { start: startDate, end: endDate }
      },
      byLevel,
      byBrowser,
      byOS,
      topErrors
    };

    // 生成文件名
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `analytics-report-${timestamp}.${type}`;

    if (type === 'pdf') {
      // 模拟PDF生成 - 实际项目中可以使用puppeteer或其他PDF库
      res.json({
        success: true,
        downloadUrl: `/api/analytics/download/${filename}`,
        filename,
        data: reportData
      });
    } else if (type === 'excel') {
      // 模拟Excel生成 - 实际项目中可以使用exceljs
      res.json({
        success: true,
        downloadUrl: `/api/analytics/download/${filename}`,
        filename,
        data: reportData
      });
    } else {
      res.status(400).json({ error: 'Unsupported export type' });
    }
  } catch (error) {
    console.error('Failed to export report:', error);
    res.status(500).json({ error: 'Failed to export report' });
  }
});

// 获取用户分布数据
router.get('/users', authenticate, async (req, res) => {
  try {
    const { projectId, startDate, endDate } = req.query;

    const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);

    if (projectId && !allowedProjectIds.includes(projectId)) {
      return res.status(403).json({ error: '无权访问此项目' });
    }

    const issueErrorFilter = projectId
      ? { projectId: new mongoose.Types.ObjectId(projectId) }
      : { projectId: { $in: allowedProjectIds.map(id => new mongoose.Types.ObjectId(id)) } };

    const start = new Date(startDate);
    const end = new Date(endDate);

    // 获取受影响的用户数
    const affectedUsers = await Error.aggregate([
      {
        $match: {
          ...issueErrorFilter,
          timestamp: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$user.id',
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          _id: { $ne: null, $ne: '' }  // 排除空的用户ID
        }
      },
      {
        $count: 'total'
      }
    ]);

    // 获取用户错误分布
    const userDistribution = await Error.aggregate([
      {
        $match: {
          ...issueErrorFilter,
          timestamp: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$user.id',
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          _id: { $ne: null, $ne: '' }  // 排除空的用户ID
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      affectedUsers: affectedUsers[0]?.total || 0,
      topAffectedUsers: userDistribution
    });
  } catch (error) {
    console.error('Failed to fetch user analytics:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

// 辅助函数：按级别分类
async function getErrorsByLevel(filter, startDate, endDate) {
  const result = await Error.aggregate([
    {
      $match: {
        ...filter,
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$level',
        count: { $sum: 1 }
      }
    }
  ]);

  const levelMap = {
    fatal: 0,
    error: 0,
    warning: 0,
    info: 0,
    debug: 0
  };

  result.forEach(item => {
    const level = (item._id || 'error').toLowerCase();
    if (levelMap.hasOwnProperty(level)) {
      levelMap[level] = item.count;
    }
  });

  return levelMap;
}

// 辅助函数：按浏览器分类
async function getErrorsByBrowser(filter, startDate, endDate) {
  const result = await Error.aggregate([
    {
      $match: {
        ...filter,
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
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
    {
      $sort: { count: -1 }
    }
  ]);

  return result;
}

// 辅助函数：按操作系统分类
async function getErrorsByOS(filter, startDate, endDate) {
  const result = await Error.aggregate([
    {
      $match: {
        ...filter,
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $project: {
        os: {
          $cond: {
            if: { $regexMatch: { input: '$userAgent', regex: 'Windows', options: 'i' } },
            then: 'Windows',
            else: {
              $cond: {
                if: { $regexMatch: { input: '$userAgent', regex: 'Mac', options: 'i' } },
                then: 'macOS',
                else: {
                  $cond: {
                    if: { $regexMatch: { input: '$userAgent', regex: 'Linux', options: 'i' } },
                    then: 'Linux',
                    else: {
                      $cond: {
                        if: { $regexMatch: { input: '$userAgent', regex: 'iPhone|iPad', options: 'i' } },
                        then: 'iOS',
                        else: {
                          $cond: {
                            if: { $regexMatch: { input: '$userAgent', regex: 'Android', options: 'i' } },
                            then: 'Android',
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
        }
      }
    },
    {
      $group: {
        _id: '$os',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  return result;
}

// 辅助函数：获取趋势数据
async function getErrorTrend(filter, startDate, endDate, granularity = 'day') {
  let dateFormat;
  switch (granularity) {
    case 'week':
      dateFormat = '%Y-%U'; // 年-周
      break;
    case 'month':
      dateFormat = '%Y-%m'; // 年-月
      break;
    case 'day':
    default:
      dateFormat = '%Y-%m-%d'; // 年-月-日
      break;
  }

  const result = await Error.aggregate([
    {
      $match: {
        ...filter,
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: '$timestamp' } },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  return result;
}

// 辅助函数：获取 Top 错误
async function getTopErrors(filter, startDate, endDate, sort = 'frequency') {
  let sortField;
  switch (sort) {
    case 'impact':
      sortField = { userCount: -1 };
      break;
    case 'recent':
      sortField = { lastOccurred: -1 };
      break;
    case 'frequency':
    default:
      sortField = { count: -1 };
      break;
  }

  const result = await Error.aggregate([
    {
      $match: {
        ...filter,
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$message',
        message: { $first: '$message' },  // 添加message字段
        count: { $sum: 1 },
        type: { $first: '$type' },
        level: { $first: '$level' },
        lastOccurred: { $max: '$timestamp' },
        projectId: { $first: '$projectId' },
        userCount: { $addToSet: '$user.id' }
      }
    },
    {
      $addFields: {
        userCount: { 
          $size: { 
            $filter: {
              input: '$userCount',
              cond: { $and: [{ $ne: ['$$this', null] }, { $ne: ['$$this', ''] }] }
            }
          }
        }
      }
    },
    {
      $sort: sortField
    },
    {
      $limit: 10
    },
    {
      $lookup: {
        from: 'projects',
        localField: 'projectId',
        foreignField: '_id',
        as: 'project'
      }
    },
    {
      $unwind: {
        path: '$project',
        preserveNullAndEmptyArrays: true
      }
    }
  ]);

  return result;
}

// 辅助函数：获取受影响用户数
async function getAffectedUsers(filter, startDate, endDate) {
  const result = await Error.aggregate([
    {
      $match: {
        ...filter,
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$user.id'
      }
    },
    {
      $match: {
        _id: { $ne: null, $ne: '' }  // 排除空的用户ID
      }
    },
    {
      $count: 'total'
    }
  ]);

  return result[0]?.total || 0;
}

// 辅助函数：按频率获取Top错误
async function getTopErrorsByFrequency(filter, startDate, endDate) {
  return await getTopErrors(filter, startDate, endDate, 'frequency');
}

// 辅助函数：按影响获取Top错误
async function getTopErrorsByImpact(filter, startDate, endDate) {
  return await getTopErrors(filter, startDate, endDate, 'impact');
}

// 辅助函数：获取错误分类
function getErrorCategories(topErrors) {
  const categories = [
    {
      name: 'JavaScript错误',
      description: '前端JavaScript运行时错误',
      count: topErrors.filter(e => e.type === 'javascript').length,
      suggestions: ['检查代码逻辑', '添加错误边界', '优化异步处理']
    },
    {
      name: '网络错误',
      description: 'API请求和网络连接错误',
      count: topErrors.filter(e => e.type === 'network').length,
      suggestions: ['检查API状态', '添加重试机制', '优化超时设置']
    },
    {
      name: '资源错误',
      description: '静态资源加载失败',
      count: topErrors.filter(e => e.type === 'resource').length,
      suggestions: ['检查资源路径', '优化CDN配置', '添加资源回退']
    }
  ];

  return categories.filter(c => c.count > 0);
}

// 下载导出文件
router.get('/download/:filename', authenticate, async (req, res) => {
  try {
    const { filename } = req.params;
    
    // 验证文件名格式
    if (!filename.match(/^analytics-report-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.(pdf|excel)$/)) {
      return res.status(400).json({ error: 'Invalid filename format' });
    }

    // 模拟文件生成和下载
    // 在实际项目中，这里应该从文件系统或临时存储中读取生成的文件
    const fileType = filename.split('.').pop();
    const timestamp = new Date().toISOString();
    
    if (fileType === 'pdf') {
      // 模拟PDF内容
      const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Analytics Report - ${timestamp}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
300
%%EOF`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(Buffer.from(pdfContent));
    } else if (fileType === 'excel') {
      // 模拟Excel内容 (CSV格式)
      const csvContent = `Analytics Report - ${timestamp}
Date Range,Errors,Resolved,Resolution Rate
${timestamp},100,80,80%

Error Levels
Level,Count
Fatal,5
Error,45
Warning,30
Info,15
Debug,5

Top Errors
Error Message,Count,Level
TypeError: Cannot read property,25,Error
ReferenceError: undefined variable,15,Error
Network timeout,10,Warning`;

      res.setHeader('Content-Type', 'application/vnd.ms-excel');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvContent);
    } else {
      res.status(400).json({ error: 'Unsupported file type' });
    }
  } catch (error) {
    console.error('Failed to download file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

module.exports = router;
