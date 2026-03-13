const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Issue = require('../models/Issue');
const Activity = require('../models/Activity');
const { authenticate } = require('../middleware/auth');

// 获取问题的评论列表
router.get('/issue/:issueId', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const query = {
      issueId: req.params.issueId,
      deleted: false
    };

    const total = await Comment.countDocuments(query);
    const comments = await Comment.find(query)
      .populate('userId', 'username email')
      .populate('mentions', 'username')
      .populate('parentId')
      .sort({ createdAt: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取评论列表错误:', error);
    res.status(500).json({ error: '获取评论列表失败' });
  }
});

// 创建评论
router.post('/', authenticate, async (req, res) => {
  try {
    const { issueId, content, mentions, parentId, attachments } = req.body;

    if (!issueId || !content) {
      return res.status(400).json({ error: 'issueId 和 content 不能为空' });
    }

    // 检查 issue 是否存在
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ error: 'Issue 不存在' });
    }

    const comment = new Comment({
      issueId,
      userId: req.user._id,
      content,
      mentions: mentions || [],
      parentId,
      attachments: attachments || []
    });

    await comment.save();
    await comment.populate('userId', 'username email');
    await comment.populate('mentions', 'username');

    // 创建活动记录
    const activity = new Activity({
      projectId: issue.projectId,
      userId: req.user._id,
      type: 'issue_commented',
      targetType: 'comment',
      targetId: comment._id,
      metadata: {
        issueId: issue._id,
        issueTitle: issue.title
      }
    });
    await activity.save();

    res.status(201).json(comment);
  } catch (error) {
    console.error('创建评论错误:', error);
    res.status(500).json({ error: '创建评论失败' });
  }
});

// 更新评论
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { content, mentions, attachments } = req.body;

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: '评论不存在' });
    }

    // 只能编辑自己的评论
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: '无权编辑此评论' });
    }

    if (content) comment.content = content;
    if (mentions) comment.mentions = mentions;
    if (attachments) comment.attachments = attachments;
    
    comment.edited = true;
    comment.editedAt = new Date();

    await comment.save();
    await comment.populate('userId', 'username email');
    await comment.populate('mentions', 'username');

    res.json(comment);
  } catch (error) {
    console.error('更新评论错误:', error);
    res.status(500).json({ error: '更新评论失败' });
  }
});

// 删除评论（软删除）
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: '评论不存在' });
    }

    // 只能删除自己的评论
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: '无权删除此评论' });
    }

    comment.deleted = true;
    comment.deletedAt = new Date();
    await comment.save();

    res.json({ message: '评论删除成功' });
  } catch (error) {
    console.error('删除评论错误:', error);
    res.status(500).json({ error: '删除评论失败' });
  }
});

// 获取评论的回复
router.get('/:id/replies', authenticate, async (req, res) => {
  try {
    const replies = await Comment.find({
      parentId: req.params.id,
      deleted: false
    })
      .populate('userId', 'username email')
      .populate('mentions', 'username')
      .sort({ createdAt: 1 });

    res.json({ replies });
  } catch (error) {
    console.error('获取回复错误:', error);
    res.status(500).json({ error: '获取回复失败' });
  }
});

module.exports = router;
