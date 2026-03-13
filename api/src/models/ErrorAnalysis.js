const mongoose = require('mongoose');

const errorAnalysisSchema = new mongoose.Schema({
  errorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Error',
    required: true,
    index: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  // 分析结果
  rootCause: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['网络错误', '代码错误', '配置错误', '数据错误', '权限错误', '性能问题', '未分类'],
    default: '未分类'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  analysis: {
    type: String
  },
  possibleReasons: [{
    type: String
  }],
  suggestedFixes: [{
    title: String,
    description: String,
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    }
  }],
  preventionTips: [{
    type: String
  }],
  // 关联的相似错误
  relatedErrors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Error'
  }],
  // AI 模型信息
  model: {
    type: String,
    default: 'gpt-4o-mini'
  },
  success: {
    type: Boolean,
    default: true
  },
  // 用户反馈
  feedback: {
    helpful: Boolean,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date,
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  analyzedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 索引
errorAnalysisSchema.index({ errorId: 1 }, { unique: true });
errorAnalysisSchema.index({ projectId: 1, analyzedAt: -1 });
errorAnalysisSchema.index({ category: 1 });
errorAnalysisSchema.index({ confidence: -1 });

module.exports = mongoose.model('ErrorAnalysis', errorAnalysisSchema);
