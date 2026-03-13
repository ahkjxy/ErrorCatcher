const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  // 个人偏好
  preferences: {
    defaultProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    itemsPerPage: {
      type: Number,
      default: 25,
      min: 10,
      max: 100
    },
    dateFormat: {
      type: String,
      default: 'YYYY-MM-DD HH:mm:ss'
    },
    timezone: {
      type: String,
      default: 'Asia/Shanghai'
    },
    language: {
      type: String,
      enum: ['zh-CN', 'en-US'],
      default: 'zh-CN'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    enableShortcuts: {
      type: Boolean,
      default: true
    },
    enableRealtime: {
      type: Boolean,
      default: true
    }
  },
  
  // 通知设置
  notifications: {
    newError: {
      enabled: {
        type: Boolean,
        default: true
      },
      level: {
        type: String,
        enum: ['all', 'critical', 'off'],
        default: 'critical'
      }
    },
    issueUpdate: {
      enabled: {
        type: Boolean,
        default: true
      },
      assigned: {
        type: Boolean,
        default: true
      },
      participating: {
        type: Boolean,
        default: true
      }
    },
    assignment: {
      enabled: {
        type: Boolean,
        default: true
      }
    },
    comment: {
      enabled: {
        type: Boolean,
        default: true
      },
      mentions: {
        type: Boolean,
        default: true
      },
      participating: {
        type: Boolean,
        default: false
      }
    },
    alert: {
      enabled: {
        type: Boolean,
        default: true
      },
      priority: {
        type: String,
        enum: ['all', 'high', 'off'],
        default: 'high'
      }
    },
    channels: {
      email: {
        enabled: {
          type: Boolean,
          default: true
        },
        frequency: {
          type: String,
          enum: ['realtime', 'hourly', 'daily'],
          default: 'realtime'
        }
      },
      browser: {
        enabled: {
          type: Boolean,
          default: true
        }
      },
      mobile: {
        enabled: {
          type: Boolean,
          default: false
        }
      }
    },
    schedule: {
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
      doNotDisturb: {
        enabled: {
          type: Boolean,
          default: false
        },
        start: {
          type: String,
          default: '22:00'
        },
        end: {
          type: String,
          default: '08:00'
        }
      },
      weekends: {
        type: Boolean,
        default: false
      }
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserSettings', userSettingsSchema);
