const mongoose = require('mongoose');

/**
 * AI 配置模型
 * 存储 AI 服务提供商的配置信息
 * 支持多个配置，可设置默认配置
 */
const aiConfigSchema = new mongoose.Schema({
  // 配置名称
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // 配置描述
  description: {
    type: String,
    default: ''
  },
  
  // AI 服务提供商
  provider: {
    type: String,
    enum: ['openai', 'deepseek', 'claude', 'gemini', 'wenxin', 'tongyi', 'zhipu', 'moonshot', 'minimax', 'doubao', 'stepfun', 'nvidia', 'xai', 'custom'],
    required: true
  },
  
  // API 配置
  apiKey: {
    type: String,
    required: true
  },
  
  apiUrl: {
    type: String,
    required: true
  },
  
  model: {
    type: String,
    required: true
  },
  
  // 是否为默认配置
  isDefault: {
    type: Boolean,
    default: false
  },
  
  // 是否启用
  enabled: {
    type: Boolean,
    default: true
  },
  
  // 额外配置（不同提供商可能需要不同的配置）
  extraConfig: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // 创建和更新信息
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// 索引
aiConfigSchema.index({ name: 1 });
aiConfigSchema.index({ provider: 1 });
aiConfigSchema.index({ isDefault: 1 });
aiConfigSchema.index({ enabled: 1 });

// 确保只有一个默认配置
aiConfigSchema.pre('save', async function(next) {
  if (this.isDefault) {
    // 将其他配置的 isDefault 设置为 false
    await this.constructor.updateMany(
      { _id: { $ne: this._id }, isDefault: true },
      { $set: { isDefault: false } }
    );
  }
  next();
});

module.exports = mongoose.model('AIConfig', aiConfigSchema);
