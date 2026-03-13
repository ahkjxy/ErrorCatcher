const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

// 获取用户列表
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    
    const query = { status: 'active' }; // 只返回活跃用户
    
    if (search) {
      query.$or = [
        { username: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    
    // 只有管理员可以按角色和状态筛选
    if (req.user.role === 'admin') {
      if (role) query.role = role;
      if (status) {
        query.status = status;
      }
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // 为每个用户获取项目数量
    const ProjectMember = require('../models/ProjectMember');
    const Project = require('../models/Project');
    
    const usersWithProjectCount = await Promise.all(
      users.map(async (user) => {
        // 获取用户作为成员的项目数量
        const memberProjectCount = await ProjectMember.countDocuments({ userId: user._id });
        // 获取用户创建的项目数量
        const ownedProjectCount = await Project.countDocuments({ createdBy: user._id });
        
        return {
          ...user,
          projectCount: memberProjectCount + ownedProjectCount
        };
      })
    );

    res.json({
      users: usersWithProjectCount,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

// 搜索用户（用于添加成员）
router.get('/search', authenticate, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ users: [] });
    }

    const users = await User.find({
      $or: [
        { username: new RegExp(q, 'i') },
        { email: new RegExp(q, 'i') }
      ],
      status: 'active'
    })
      .select('_id username email avatar')
      .limit(10);

    res.json({ users });
  } catch (error) {
    console.error('搜索用户错误:', error);
    res.status(500).json({ error: '搜索失败' });
  }
});

// 获取用户详情
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: '获取用户详情失败' });
  }
});

// 更新用户（仅管理员）
router.patch('/:userId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { email, role, status } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    if (email) user.email = email;
    if (role) user.role = role;
    if (status) user.status = status;

    await user.save();

    res.json({
      message: '用户更新成功',
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: '更新用户失败' });
  }
});

// 删除用户（仅管理员）
router.delete('/:userId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 不能删除自己
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: '不能删除自己的账号' });
    }

    await User.findByIdAndDelete(req.params.userId);

    res.json({ message: '用户删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除用户失败' });
  }
});

// 获取用户的项目列表
router.get('/:userId/projects', authenticate, async (req, res) => {
  try {
    const ProjectMember = require('../models/ProjectMember');
    const Project = require('../models/Project');

    // 获取用户作为成员的项目
    const memberships = await ProjectMember.find({ userId: req.params.userId })
      .populate('projectId', 'name description createdAt')
      .sort({ joinedAt: -1 });

    // 获取用户创建的项目
    const ownedProjects = await Project.find({ createdBy: req.params.userId })
      .select('name description createdAt');

    // 过滤掉已删除项目的成员关系
    const memberProjects = memberships
      .filter(m => m.projectId) // 只保留项目存在的记录
      .map(m => ({
        ...m.projectId.toObject(),
        role: m.role,
        joinedAt: m.joinedAt
      }));

    res.json({
      memberProjects,
      ownedProjects
    });
  } catch (error) {
    console.error('获取用户项目列表错误:', error);
    res.status(500).json({ error: '获取用户项目列表失败' });
  }
});

// 为用户分配项目（仅管理员）
router.post('/:userId/projects', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { projectIds, role = 'developer' } = req.body;
    const ProjectMember = require('../models/ProjectMember');

    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({ error: '请选择至少一个项目' });
    }

    const results = [];
    for (const projectId of projectIds) {
      // 检查是否已经是成员
      const existing = await ProjectMember.findOne({
        projectId,
        userId: req.params.userId
      });

      if (existing) {
        results.push({
          projectId,
          status: 'skipped',
          message: '用户已经是该项目成员'
        });
        continue;
      }

      // 添加成员
      const member = new ProjectMember({
        projectId,
        userId: req.params.userId,
        role,
        invitedBy: req.user._id
      });

      await member.save();
      results.push({
        projectId,
        status: 'success',
        message: '添加成功'
      });
    }

    res.json({
      message: '项目分配完成',
      results
    });
  } catch (error) {
    console.error('分配项目错误:', error);
    res.status(500).json({ error: '分配项目失败' });
  }
});

// 移除用户的项目权限（仅管理员）
router.delete('/:userId/projects/:projectId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const ProjectMember = require('../models/ProjectMember');

    const result = await ProjectMember.deleteOne({
      projectId: req.params.projectId,
      userId: req.params.userId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: '未找到该项目成员关系' });
    }

    res.json({ message: '项目权限移除成功' });
  } catch (error) {
    console.error('移除项目权限错误:', error);
    res.status(500).json({ error: '移除项目权限失败' });
  }
});

module.exports = router;
