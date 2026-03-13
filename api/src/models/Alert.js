const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  enabled: {
    type: Boolean,
    default: true
  },
  
  // 触发条件
  conditions: {
    level: {
      type: [String],
      enum: ['fatal', 'error', 'warning', 'info', 'debug'],
      default: []
    },
    type: {
      type: [String],
      default: []
    },
    environment: {
      type: [String],
      default: []
    },
    threshold: {
      count: {
        type: Number,
        default: 10
      },
      timeWindow: {
        type: Number,
        default: 5
      },
      userCount: Number
    }
  },
  
  // 关联的通知配置 ID
  notificationConfigs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NotificationConfig'
  }],
  
  // 高级设置
  settings: {
    silencePeriod: {
      type: Number,
      default: 30  // 分钟
    },
    workingHoursOnly: {
      type: Boolean,
      default: false
    },
    workingHours: {
      start: {
        type: String,
        default: '09:00'
      },
      end: {
        type: String,
        default: '18:00'
      }
    },
    escalation: {
      enabled: {
        type: Boolean,
        default: false
      },
      delay: Number,  // 分钟
      actions: [mongoose.Schema.Types.Mixed]
    }
  },
  
  // 统计信息
  stats: {
    lastTriggered: Date,
    triggeredCount: {
      type: Number,
      default: 0
    },
    todayCount: {
      type: Number,
      default: 0
    },
    lastResetDate: Date
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

// 索引
alertSchema.index({ projectId: 1, enabled: 1 });
alertSchema.index({ createdAt: -1 });

// 更新时间
alertSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 重置每日计数
alertSchema.methods.resetDailyCount = function() {
  const today = new Date().toDateString();
  const lastReset = this.stats.lastResetDate ? this.stats.lastResetDate.toDateString() : null;
  
  if (today !== lastReset) {
    this.stats.todayCount = 0;
    this.stats.lastResetDate = new Date();
  }
};

// 检查是否在工作时间
alertSchema.methods.isWorkingHours = function() {
  if (!this.settings.workingHoursOnly) {
    return true;
  }
  
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  return currentTime >= this.settings.workingHours.start && 
         currentTime <= this.settings.workingHours.end;
};

// 检查是否在静默期
alertSchema.methods.isInSilencePeriod = function() {
  if (!this.stats.lastTriggered) {
    return false;
  }
  
  const silencePeriodMs = this.settings.silencePeriod * 60 * 1000;
  const timeSinceLastTrigger = Date.now() - this.stats.lastTriggered.getTime();
  
  return timeSinceLastTrigger < silencePeriodMs;
};

module.exports = mongoose.model('Alert', alertSchema);
