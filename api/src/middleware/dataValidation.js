/**
 * 错误上报数据验证中间件
 * 验证上报的错误数据格式和大小
 */

const config = require('../../config');

// 默认限制配置
const DEFAULT_LIMITS = {
  maxErrorsPerRequest: 100,
  maxMessageLength: 5000,
  maxStackTraceLength: 50000,
  maxBreadcrumbs: 100,
  maxContextSize: 10000,
  maxTagsSize: 5000,
  maxUserInfoSize: 2000
};

/**
 * 验证单个错误对象
 */
const validateErrorObject = (error, index, limits = DEFAULT_LIMITS) => {
  const errors = [];

  // 检查必填字段 - message 可以从其他字段生成
  if (!error.message || typeof error.message !== 'string') {
    // 对于网络错误，可以从statusText或url生成message
    if (error.type && (error.type.includes('fetch') || error.type.includes('xhr') || error.type.includes('axios'))) {
      if (!error.statusText && !error.url) {
        errors.push(`错误 ${index}: 缺少message字段，且无法从statusText或url生成`);
      }
    } else {
      errors.push(`错误 ${index}: 缺少或无效的message字段`);
    }
  } else if (error.message.length > limits.maxMessageLength) {
    errors.push(`错误 ${index}: message长度超过${limits.maxMessageLength}字符`);
  }

  if (!error.type || typeof error.type !== 'string') {
    errors.push(`错误 ${index}: 缺少或无效的type字段`);
  }

  // 检查可选字段
  if (error.stack && typeof error.stack === 'string') {
    if (error.stack.length > limits.maxStackTraceLength) {
      errors.push(`错误 ${index}: stack长度超过${limits.maxStackTraceLength}字符`);
    }
  }

  if (error.level && !['fatal', 'error', 'warning', 'info', 'debug'].includes(error.level)) {
    errors.push(`错误 ${index}: 无效的level值: ${error.level}`);
  }

  if (error.breadcrumbs && Array.isArray(error.breadcrumbs)) {
    if (error.breadcrumbs.length > limits.maxBreadcrumbs) {
      errors.push(`错误 ${index}: breadcrumbs数量超过${limits.maxBreadcrumbs}`);
    }
  }

  if (error.context && typeof error.context === 'object') {
    const contextSize = JSON.stringify(error.context).length;
    if (contextSize > limits.maxContextSize) {
      errors.push(`错误 ${index}: context大小超过${limits.maxContextSize}字节`);
    }
  }

  if (error.tags && typeof error.tags === 'object') {
    const tagsSize = JSON.stringify(error.tags).length;
    if (tagsSize > limits.maxTagsSize) {
      errors.push(`错误 ${index}: tags大小超过${limits.maxTagsSize}字节`);
    }
  }

  if (error.user && typeof error.user === 'object') {
    const userSize = JSON.stringify(error.user).length;
    if (userSize > limits.maxUserInfoSize) {
      errors.push(`错误 ${index}: user信息大小超过${limits.maxUserInfoSize}字节`);
    }
  }

  // 检查timestamp格式
  if (error.timestamp) {
    const timestamp = new Date(error.timestamp);
    if (isNaN(timestamp.getTime())) {
      errors.push(`错误 ${index}: 无效的timestamp格式`);
    }
  }

  // 检查projectId格式
  if (error.projectId && typeof error.projectId !== 'string') {
    errors.push(`错误 ${index}: projectId必须是字符串`);
  }

  return errors;
};

/**
 * 验证错误上报请求
 */
const validateErrorReport = (req, res, next) => {
  try {
    const { errors } = req.body;
    const limits = config.dataLimits || DEFAULT_LIMITS;

    // 检查errors字段
    if (!errors || !Array.isArray(errors)) {
      return res.status(400).json({
        error: 'Invalid request format',
        message: 'errors字段必须是数组'
      });
    }

    // 检查错误数量
    if (errors.length === 0) {
      return res.status(400).json({
        error: 'Empty errors array',
        message: '至少需要提供一个错误'
      });
    }

    if (errors.length > limits.maxErrorsPerRequest) {
      return res.status(400).json({
        error: 'Too many errors',
        message: `单次请求最多只能上报${limits.maxErrorsPerRequest}个错误，当前: ${errors.length}`
      });
    }

    // 验证每个错误对象
    const validationErrors = [];
    errors.forEach((error, index) => {
      const errs = validateErrorObject(error, index, limits);
      validationErrors.push(...errs);
    });

    if (validationErrors.length > 0) {
      console.warn('[DataValidation] 数据验证失败:', validationErrors);
      return res.status(400).json({
        error: 'Data validation failed',
        message: '上报的数据格式不正确',
        details: validationErrors.slice(0, 10) // 只返回前10个错误
      });
    }

    // 检查请求体总大小
    const requestSize = JSON.stringify(req.body).length;
    const maxRequestSize = 10 * 1024 * 1024; // 10MB
    if (requestSize > maxRequestSize) {
      return res.status(413).json({
        error: 'Payload too large',
        message: `请求体大小超过${maxRequestSize / 1024 / 1024}MB`
      });
    }

    // 验证通过，继续
    next();
  } catch (error) {
    console.error('[DataValidation] 验证错误:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: '服务器错误'
    });
  }
};

/**
 * 清理和规范化错误数据
 */
const sanitizeErrorData = (error) => {
  const sanitized = { ...error };

  // 为网络错误自动生成message字段（如果缺失）
  if (!sanitized.message || typeof sanitized.message !== 'string') {
    if (sanitized.type && (sanitized.type.includes('fetch') || sanitized.type.includes('xhr') || sanitized.type.includes('axios'))) {
      // 从statusText和url生成message
      const method = sanitized.method || 'UNKNOWN';
      const url = sanitized.url || 'unknown';
      const status = sanitized.status || 0;
      const statusText = sanitized.statusText || 'Unknown Error';
      
      sanitized.message = `${method} ${url} - ${status} ${statusText}`;
    } else {
      // 其他类型的错误使用默认message
      sanitized.message = 'Unknown error';
    }
  }

  // 截断过长的字段
  if (sanitized.message && sanitized.message.length > DEFAULT_LIMITS.maxMessageLength) {
    sanitized.message = sanitized.message.substring(0, DEFAULT_LIMITS.maxMessageLength);
  }

  if (sanitized.stack && sanitized.stack.length > DEFAULT_LIMITS.maxStackTraceLength) {
    sanitized.stack = sanitized.stack.substring(0, DEFAULT_LIMITS.maxStackTraceLength);
  }

  // 限制breadcrumbs数量
  if (sanitized.breadcrumbs && Array.isArray(sanitized.breadcrumbs)) {
    sanitized.breadcrumbs = sanitized.breadcrumbs.slice(0, DEFAULT_LIMITS.maxBreadcrumbs);
  }

  // 确保timestamp是有效的
  if (sanitized.timestamp) {
    const ts = new Date(sanitized.timestamp);
    if (isNaN(ts.getTime())) {
      sanitized.timestamp = new Date();
    }
  } else {
    sanitized.timestamp = new Date();
  }

  // 确保level是有效的
  if (!sanitized.level || !['fatal', 'error', 'warning', 'info', 'debug'].includes(sanitized.level)) {
    sanitized.level = 'error';
  }

  // 确保offlineCached和deduplicated是布尔值
  sanitized.offlineCached = Boolean(sanitized.offlineCached);
  sanitized.deduplicated = Boolean(sanitized.deduplicated);

  return sanitized;
};

/**
 * 检测异常的上报模式
 */
const detectAnomalies = (req, res, next) => {
  try {
    const { errors } = req.body;
    const anomalies = [];

    // 检查1: 错误消息重复率
    const messages = errors.map(e => e.message);
    const uniqueMessages = new Set(messages);
    const duplicateRate = 1 - (uniqueMessages.size / messages.length);
    
    if (duplicateRate > 0.9) {
      anomalies.push({
        type: 'high_duplicate_rate',
        severity: 'warning',
        message: `错误消息重复率过高: ${(duplicateRate * 100).toFixed(2)}%`
      });
    }

    // 检查2: 错误类型分布
    const types = errors.map(e => e.type);
    const uniqueTypes = new Set(types);
    if (uniqueTypes.size === 1 && errors.length > 50) {
      anomalies.push({
        type: 'single_error_type',
        severity: 'warning',
        message: `所有错误都是同一类型: ${types[0]}`
      });
    }

    // 检查3: 时间戳异常
    const timestamps = errors.map(e => new Date(e.timestamp).getTime());
    const now = Date.now();
    const futureErrors = timestamps.filter(t => t > now + 60000); // 超过1分钟的未来时间
    if (futureErrors.length > 0) {
      anomalies.push({
        type: 'future_timestamp',
        severity: 'error',
        message: `检测到${futureErrors.length}个未来时间戳的错误`
      });
    }

    // 检查4: 非常旧的时间戳
    const oldErrors = timestamps.filter(t => now - t > 30 * 24 * 60 * 60 * 1000); // 超过30天
    if (oldErrors.length > errors.length * 0.5) {
      anomalies.push({
        type: 'old_timestamp',
        severity: 'warning',
        message: `超过50%的错误时间戳超过30天`
      });
    }

    // 将异常信息附加到请求对象
    req.anomalies = anomalies;

    // 如果有严重异常，记录警告
    const severeAnomalies = anomalies.filter(a => a.severity === 'error');
    if (severeAnomalies.length > 0) {
      console.warn('[Anomaly Detection] 检测到严重异常:', severeAnomalies);
    }

    next();
  } catch (error) {
    console.error('[Anomaly Detection] 检测错误:', error);
    next(); // 继续处理，不中断请求
  }
};

module.exports = {
  validateErrorReport,
  validateErrorObject,
  sanitizeErrorData,
  detectAnomalies,
  DEFAULT_LIMITS
};
