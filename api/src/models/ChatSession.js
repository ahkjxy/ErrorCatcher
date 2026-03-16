const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const chatSessionSchema = new mongoose.Schema({
  title: { type: String, default: '新对话' },
  configId: { type: mongoose.Schema.Types.ObjectId, ref: 'AIConfig' },
  configSnapshot: { type: String }, // 记录用的模型名
  messages: [messageSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// 自动从第一条用户消息生成标题
chatSessionSchema.methods.autoTitle = function () {
  const first = this.messages.find(m => m.role === 'user');
  if (first) {
    this.title = first.content.slice(0, 30) + (first.content.length > 30 ? '…' : '');
  }
};

module.exports = mongoose.model('ChatSession', chatSessionSchema);
