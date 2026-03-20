const mongoose = require('mongoose');

const errorSchema = new mongoose.Schema({
  // 基本信息
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  appName: {
    type: String,
    default: 'Unknown App'
  },
  environment: {
    type: String,
    default: 'production',
    index: true
  },
  release: {
    type: String,
    index: true
  },
  
  // 错误信息
  type: {
    type: String,
    required: true,
    index: true
  },
  level: {
    type: String,
    enum: ['fatal', 'error', 'warning', 'info', 'debug'],
    default: 'error',
    index: true
  },
  message: {
    type: String,
    required: true
  },
  stack: String,
  
  // 错误分组
  fingerprint: {
    type: [String],
    default: []
  },
  
  // 位置信息
  filename: String,
  lineno: Number,
  colno: Number,
  
  // HTTP 请求信息
  status: Number,
  statusText: String,
  url: String,
  method: String,
  requestId: String,
  requestHeaders: mongoose.Schema.Types.Mixed,
  requestBody: String,
  response: String,
  responseHeaders: mongoose.Schema.Types.Mixed,
  duration: Number,
  curlCommand: String,  // curl 命令用于重现 API 错误
  
  // 用户信息
  user: {
    id: String,
    email: String,
    username: String,
    ip: String
  },
  pageUrl: String,
  referrer: String,
  userAgent: String,
  screenResolution: String,
  viewportSize: String,
  browserLanguage: String,
  timezone: String,
  
  // 详细浏览器信息
  browser: mongoose.Schema.Types.Mixed,
  
  // 网络信息
  network: mongoose.Schema.Types.Mixed,
  
  // DOM 状态
  dom: mongoose.Schema.Types.Mixed,
  
  // Vue 上下文
  vueContext: mongoose.Schema.Types.Mixed,
  
  // 标签和上下文
  tags: mongoose.Schema.Types.Mixed,
  contexts: mongoose.Schema.Types.Mixed,
  extra: mongoose.Schema.Types.Mixed,
  
  // 面包屑
  breadcrumbs: [{
    timestamp: Number,
    category: String,
    message: String,
    level: String,
    data: mongoose.Schema.Types.Mixed
  }],
  
  // 统计信息
  count: {
    type: Number,
    default: 1
  },
  firstOccurred: {
    type: Date,
    default: Date.now
  },
  lastOccurred: {
    type: Date,
    default: Date.now
  },
  
  // 时间戳
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  
  // 解决状态
  resolved: {
    type: Boolean,
    default: false,
    index: true
  },
  resolvedAt: Date,
  resolvedBy: String,
  notes: String,

  // 错误来源标记
  offlineCached: {
    type: Boolean,
    default: false,
    index: true
  },
  deduplicated: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// 复合索引
errorSchema.index({ projectId: 1, timestamp: -1 });
errorSchema.index({ type: 1, timestamp: -1 });
errorSchema.index({ level: 1, timestamp: -1 });
errorSchema.index({ resolved: 1, timestamp: -1 });
errorSchema.index({ message: 'text' }); // 文本搜索索引

module.exports = mongoose.model('Error', errorSchema);
