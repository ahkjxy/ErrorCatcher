const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const ChatSession = require('../models/ChatSession');

// 获取会话列表
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const sessions = await ChatSession.find({ createdBy: req.user._id })
      .select('title configSnapshot createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(100);
    res.json({ sessions });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 获取单个会话（含消息）
router.get('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!session) return res.status(404).json({ error: '会话不存在' });
    res.json({ session });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 创建新会话
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { configId, configSnapshot } = req.body;
    const session = await ChatSession.create({
      configId,
      configSnapshot: configSnapshot || '',
      messages: [],
      createdBy: req.user._id
    });
    res.json({ session });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 追加消息（对话结束后保存）
router.post('/:id/messages', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { messages } = req.body; // [{ role, content }]
    const session = await ChatSession.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!session) return res.status(404).json({ error: '会话不存在' });

    session.messages.push(...messages);
    session.updatedAt = new Date();

    // 自动生成标题（只在第一次有内容时）
    if (session.title === '新对话') session.autoTitle();

    await session.save();
    res.json({ ok: true, title: session.title });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 重命名会话
router.patch('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { title } = req.body;
    const session = await ChatSession.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { title },
      { new: true }
    );
    if (!session) return res.status(404).json({ error: '会话不存在' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 删除会话
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await ChatSession.deleteOne({ _id: req.params.id, createdBy: req.user._id });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
