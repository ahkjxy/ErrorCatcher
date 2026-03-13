const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  logo: String,
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'private'
  },
  
  // 统计信息
  stats: {
    memberCount: {
      type: Number,
      default: 0
    },
    projectCount: {
      type: Number,
      default: 0
    },
    issueCount: {
      type: Number,
      default: 0
    },
    unresolvedCount: {
      type: Number,
      default: 0
    }
  },
  
  // 设置
  settings: {
    autoAssign: {
      enabled: {
        type: Boolean,
        default: false
      },
      strategy: {
        type: String,
        enum: ['round-robin', 'load-balance', 'expertise'],
        default: 'round-robin'
      },
      conditions: mongoose.Schema.Types.Mixed
    },
    autoLabel: {
      enabled: {
        type: Boolean,
        default: false
      },
      rules: [mongoose.Schema.Types.Mixed]
    },
    autoClose: {
      enabled: {
        type: Boolean,
        default: false
      },
      conditions: mongoose.Schema.Types.Mixed,
      delay: Number  // 天数
    },
    notifications: {
      newMember: {
        type: Boolean,
        default: true
      },
      memberLeave: {
        type: Boolean,
        default: true
      },
      projectChange: {
        type: Boolean,
        default: true
      },
      criticalIssue: {
        type: Boolean,
        default: true
      },
      channels: [mongoose.Schema.Types.Mixed]
    }
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// 索引
teamSchema.index({ createdBy: 1 });
teamSchema.index({ createdAt: -1 });

// 生成 slug
teamSchema.pre('save', function(next) {
  if (this.isNew && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  next();
});

module.exports = mongoose.model('Team', teamSchema);
