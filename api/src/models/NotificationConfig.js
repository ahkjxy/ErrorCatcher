const mongoose = require('mongoose');

const notificationConfigSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    required: true,
    enum: ['email', 'webhook', 'dingtalk', 'wechat', 'slack']
  },
  config: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  // 关联的通知模板
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NotificationTemplate',
    default: null  // null 表示使用默认模板
  },
  enabled: {
    type: Boolean,
    default: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null  // null 表示全局配置
  },
  isDefault: {
    type: Boolean,
    default: false
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

notificationConfigSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('NotificationConfig', notificationConfigSchema);
