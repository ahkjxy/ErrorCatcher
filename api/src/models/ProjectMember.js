const mongoose = require('mongoose');

const projectMemberSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'developer', 'viewer'],
    default: 'developer',
    required: true
  },
  
  joinedAt: {
    type: Date,
    default: Date.now
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastActivity: Date
}, {
  timestamps: true
});

// 复合索引 - 移除字段级别的 index: true，只使用 schema.index()
projectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });
projectMemberSchema.index({ projectId: 1, role: 1 });
projectMemberSchema.index({ userId: 1 });

module.exports = mongoose.model('ProjectMember', projectMemberSchema);
