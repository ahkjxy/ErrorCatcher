const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  // 基本信息
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  
  // 错误指纹（唯一标识）
  fingerprint: {
    type: [String],
    required: true,
    index: true
  },
  
  // 错误信息
  title: {
    type: String,
    required: true
  },
  culprit: String,  // 错误来源（文件名:行号）
  type: {
    type: String,
    required: true,
    index: true
  },
  
  // 状态
  status: {
    type: String,
    enum: ['unresolved', 'resolved', 'ignored'],
    default: 'unresolved',
    index: true
  },
  level: {
    type: String,
    enum: ['fatal', 'error', 'warning', 'info', 'debug'],
    default: 'error',
    index: true
  },
  
  // 统计信息
  count: {
    type: Number,
    default: 0
  },
  userCount: {
    type: Number,
    default: 0
  },
  
  // 时间信息
  firstSeen: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastSeen: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // 关联信息
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // 元数据
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // 标签统计
  tags: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // 示例事件（用于快速展示）
  sampleEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Error'
  },
  
  // 解决信息
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // 备注
  notes: String,
  
  // 优先级 (PRD 增强)
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
    index: true
  },
  
  // 解决信息 (PRD 增强)
  resolution: {
    type: String,
    enum: ['fixed', 'wont-fix', 'duplicate', 'cannot-reproduce']
  },
  resolutionDetails: String,
  
  // 关联信息 (PRD 增强)
  relatedRelease: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Release'
  },
  relatedCommit: String,
  relatedPR: String,
  
  // 标签 (PRD 增强)
  labels: [{
    name: String,
    color: String
  }],
  
  // 统计 (PRD 增强)
  stats: {
    avgPerHour: Number,
    avgPerDay: Number,
    peakTime: Date
  }
}, {
  timestamps: true
});

// 复合索引
issueSchema.index({ projectId: 1, status: 1, lastSeen: -1 });
issueSchema.index({ projectId: 1, fingerprint: 1 }, { unique: true });
issueSchema.index({ projectId: 1, level: 1 });

// 生成短 ID
issueSchema.virtual('shortId').get(function() {
  return this._id.toString().substring(0, 8).toUpperCase();
});

// 生成永久链接
issueSchema.virtual('permalink').get(function() {
  return `/issues/${this._id}`;
});

// 确保虚拟字段被序列化
issueSchema.set('toJSON', { virtuals: true });
issueSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Issue', issueSchema);
