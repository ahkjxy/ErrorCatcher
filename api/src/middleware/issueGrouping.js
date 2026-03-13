const Issue = require('../models/Issue');
const Error = require('../models/Error');

/**
 * 根据错误事件创建或更新 Issue
 * @param {Object} errorEvent - 错误事件对象
 */
async function createOrUpdateIssue(errorEvent) {
  try {
    const fingerprint = errorEvent.fingerprint || [errorEvent.message];
    
    // 查找现有 Issue - 使用数组完全匹配
    let issue = await Issue.findOne({
      projectId: errorEvent.projectId,
      fingerprint: { $eq: fingerprint }  // 使用 $eq 进行数组完全匹配
    });

    if (issue) {
      // 更新现有 Issue
      issue.count += 1;
      issue.lastSeen = errorEvent.timestamp;
      
      // 更新级别（取最高级别）
      const levelPriority = { fatal: 5, error: 4, warning: 3, info: 2, debug: 1 };
      if (levelPriority[errorEvent.level] > levelPriority[issue.level]) {
        issue.level = errorEvent.level;
      }

      // 更新用户计数 - 使用数组完全匹配
      if (errorEvent.user && errorEvent.user.id) {
        const userCount = await Error.distinct('user.id', {
          fingerprint: { $eq: fingerprint },  // 使用 $eq 进行数组完全匹配
          projectId: errorEvent.projectId,
          'user.id': { $exists: true, $ne: null }
        });
        issue.userCount = userCount.length;
      }

      // 更新标签统计
      if (errorEvent.tags) {
        issue.tags = { ...issue.tags, ...errorEvent.tags };
      }

      await issue.save();
    } else {
      // 创建新 Issue
      const title = errorEvent.message || 'Unknown Error';
      const culprit = errorEvent.filename 
        ? `${errorEvent.filename}:${errorEvent.lineno || 0}`
        : errorEvent.url || 'Unknown';

      issue = new Issue({
        projectId: errorEvent.projectId,
        fingerprint: fingerprint,
        title: title,
        culprit: culprit,
        type: errorEvent.type,
        level: errorEvent.level || 'error',
        status: 'unresolved',
        count: 1,
        userCount: errorEvent.user && errorEvent.user.id ? 1 : 0,
        firstSeen: errorEvent.timestamp,
        lastSeen: errorEvent.timestamp,
        sampleEvent: errorEvent._id,
        tags: errorEvent.tags || {},
        metadata: {
          environment: errorEvent.environment,
          release: errorEvent.release
        }
      });

      await issue.save();
    }

    return issue;
  } catch (error) {
    // 如果是重复键错误，尝试更新
    if (error.code === 11000) {
      console.log('Duplicate key error, attempting to update existing issue');
      const fingerprint = errorEvent.fingerprint || [errorEvent.message];
      const issue = await Issue.findOneAndUpdate(
        {
          projectId: errorEvent.projectId,
          fingerprint: { $eq: fingerprint }  // 使用 $eq 进行数组完全匹配
        },
        {
          $inc: { count: 1 },
          $set: { lastSeen: errorEvent.timestamp }
        },
        { new: true }
      );
      return issue;
    }
    console.error('Error creating/updating issue:', error);
    throw error;
  }
}

/**
 * 生成错误指纹
 * @param {Object} errorData - 错误数据
 * @returns {Array} fingerprint
 */
function generateFingerprint(errorData) {
  // 如果已提供 fingerprint，直接使用
  if (errorData.fingerprint && Array.isArray(errorData.fingerprint)) {
    return errorData.fingerprint;
  }

  // 否则根据错误信息生成
  const parts = [];

  // 添加错误类型
  if (errorData.type) {
    parts.push(errorData.type);
  }

  // 添加错误消息（去除动态部分）
  if (errorData.message) {
    // 移除数字、URL、ID 等动态内容
    const normalized = errorData.message
      .replace(/\d+/g, '<num>')
      .replace(/https?:\/\/[^\s]+/g, '<url>')
      .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '<uuid>')
      .replace(/[a-f0-9]{24}/g, '<id>');
    parts.push(normalized);
  }

  // 添加文件名和行号
  if (errorData.filename) {
    parts.push(errorData.filename);
    if (errorData.lineno) {
      parts.push(`line:${errorData.lineno}`);
    }
  }

  return parts.length > 0 ? parts : ['default'];
}

module.exports = {
  createOrUpdateIssue,
  generateFingerprint
};
