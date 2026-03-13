const mongoose = require('mongoose');

const notificationTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  
  // 模板内容
  title: {
    type: String,
    required: true,
    default: '【{{priority}}】{{projectName}} - {{alertName}}'
  },
  content: {
    type: String,
    required: true,
    default: '触发原因: {{reason}}\n错误数量: {{errorCount}}\n影响用户: {{userCount}}\n时间: {{time}}'
  },
  
  // 所属项目（null 表示全局模板）
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  
  // 是否为默认模板
  isDefault: {
    type: Boolean,
    default: false
  },
  
  // 模板类型（用于分类）
  category: {
    type: String,
    enum: ['error', 'warning', 'info', 'custom'],
    default: 'custom'
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

notificationTemplateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 索引
notificationTemplateSchema.index({ projectId: 1, isDefault: -1 });

module.exports = mongoose.model('NotificationTemplate', notificationTemplateSchema);
