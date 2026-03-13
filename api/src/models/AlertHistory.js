const mongoose = require('mongoose');

const alertHistorySchema = new mongoose.Schema({
  alertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue'
  },
  
  triggeredAt: {
    type: Date,
    default: Date.now
  },
  reason: {
    type: String,
    required: true
  },
  
  // 通知结果
  notifications: [{
    type: {
      type: String,
      enum: ['email', 'webhook', 'dingtalk', 'wechat', 'slack'],
      required: true
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      required: true
    },
    error: String,
    sentAt: Date,
    responseTime: Number  // 毫秒
  }],
  
  // 相关数据
  data: {
    errorCount: Number,
    userCount: Number,
    errors: [mongoose.Schema.Types.ObjectId]
  }
});

// 索引 - 移除字段级别的 index: true，只使用 schema.index()
alertHistorySchema.index({ alertId: 1, triggeredAt: -1 });
alertHistorySchema.index({ projectId: 1, triggeredAt: -1 });

// TTL 索引 - 90天后自动删除
alertHistorySchema.index({ triggeredAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('AlertHistory', alertHistorySchema);
