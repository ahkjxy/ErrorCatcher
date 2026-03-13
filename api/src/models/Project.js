const mongoose = require('mongoose');
const crypto = require('crypto');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  apiKey: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  platform: {
    type: String,
    enum: ['web', 'mobile', 'desktop', 'server'],
    default: 'web'
  },
  framework: {
    type: String,
    enum: ['vue2', 'vue3', 'react', 'nuxt2', 'nuxt3', 'nextjs', 'jquery', 'vanilla', 'other'],
    default: 'other'
  },
  settings: {
    enableSourceMap: {
      type: Boolean,
      default: false
    },
    sampleRate: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 1
    },
    ignoreUrls: [String],
    ignoreErrors: [String]
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // 默认告警规则
  defaultAlertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert',
    default: null
  },
  
  // 数据保留 (PRD 增强)
  dataRetention: {
    errorDays: {
      type: Number,
      default: 90
    },
    issueDays: {
      type: Number,
      default: 365
    },
    autoCleanup: {
      type: Boolean,
      default: false
    }
  },
  
  // 通知设置 (PRD 增强)
  notifications: {
    newError: {
      type: Boolean,
      default: true
    },
    highFrequency: {
      type: Boolean,
      default: true
    },
    critical: {
      type: Boolean,
      default: true
    },
    channels: [{
      type: {
        type: String,
        enum: ['email', 'webhook', 'dingtalk', 'wechat', 'slack']
      },
      config: mongoose.Schema.Types.Mixed,
      enabled: Boolean
    }]
  },
  
  // 集成配置 (PRD 增强)
  integrations: {
    github: {
      enabled: Boolean,
      repo: String,
      token: String
    },
    gitlab: {
      enabled: Boolean,
      repo: String,
      token: String
    },
    jira: {
      enabled: Boolean,
      project: String,
      token: String
    }
  },
  
  // 统计缓存 (PRD 增强)
  stats: {
    totalErrors: {
      type: Number,
      default: 0
    },
    unresolvedIssues: {
      type: Number,
      default: 0
    },
    affectedUsers: {
      type: Number,
      default: 0
    },
    todayErrors: {
      type: Number,
      default: 0
    },
    lastActivity: Date,
    updatedAt: Date
  }
}, {
  timestamps: true
});

// 生成 API Key
projectSchema.statics.generateApiKey = function() {
  return 'ec_' + crypto.randomBytes(32).toString('hex');
};

// 创建项目前自动生成 API Key
projectSchema.pre('save', function(next) {
  if (this.isNew && !this.apiKey) {
    this.apiKey = projectSchema.statics.generateApiKey();
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
