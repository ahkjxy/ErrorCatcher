const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    index: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'issue_created',
      'issue_updated',
      'issue_resolved',
      'issue_assigned',
      'issue_commented',
      'status_changed',
      'priority_changed',
      'label_added',
      'label_removed',
      'project_created',
      'project_updated',
      'release_created',
      'member_added',
      'member_removed',
      'alert_triggered'
    ],
    index: true
  },
  targetType: {
    type: String,
    required: true,
    enum: ['issue', 'project', 'release', 'member', 'alert', 'comment']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  
  // 变更详情
  changes: {
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  },
  
  // 元数据
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// 复合索引
activitySchema.index({ teamId: 1, createdAt: -1 });
activitySchema.index({ projectId: 1, createdAt: -1 });
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

// TTL 索引 - 90天后自动删除
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('Activity', activitySchema);
