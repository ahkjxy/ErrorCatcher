const mongoose = require('mongoose');
const crypto = require('crypto');

const apiTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  scopes: [{
    type: String,
    enum: ['read', 'write', 'delete', 'admin']
  }],
  expiresAt: {
    type: Date,
    index: true
  },
  lastUsedAt: Date,
  lastUsedIP: String,
  
  // 使用统计
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// 索引
apiTokenSchema.index({ userId: 1, createdAt: -1 });
apiTokenSchema.index({ expiresAt: 1 });

// 生成 Token
apiTokenSchema.statics.generateToken = function() {
  return 'ect_' + crypto.randomBytes(32).toString('hex');
};

// 检查是否过期
apiTokenSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// 更新最后使用时间
apiTokenSchema.methods.updateLastUsed = function(ip) {
  this.lastUsedAt = new Date();
  this.lastUsedIP = ip;
  this.usageCount += 1;
  return this.save();
};

module.exports = mongoose.model('APIToken', apiTokenSchema);
