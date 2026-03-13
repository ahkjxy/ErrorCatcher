const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const NotificationTemplate = require('../models/NotificationTemplate');
const { authenticate } = require('../middleware/auth');
const { getUserProjectIds } = require('../middleware/projectAccess');

// 获取可用的模板变量列表
router.get('/variables', authenticate, (req, res) => {
  const variables = [
    { key: 'priority', description: '告警优先级', example: 'high/medium/low' },
    { key: 'projectName', description: '项目名称', example: '我的项目' },
    { key: 'alertName', description: '告警规则名称', example: '生产环境错误告警' },
    { key: 'reason', description: '触发原因', example: '错误数量超过阈值' },
    { key: 'errorCount', description: '错误数量', example: '100' },
    { key: 'userCount', description: '影响用户数', example: '50' },
    { key: 'time', description: '触发时间', example: '2024-03-05 14:30:00' },
    { key: 'level', description: '错误级别', example: 'fatal/error/warning/info' },
    { key: 'environment', description: '环境', example: 'production/staging/development' },
    { key: 'issueTitle', description: '问题标题', example: 'TypeError: Cannot read property...' },
    { key: 'issueType', description: '问题类型', example: 'TypeError' },
    { key: 'culprit', description: '错误来源', example: 'app.js:123' },
    { key: 'firstSeen', description: '首次出现时间', example: '2024-03-01 10:00:00' },
    { key: 'lastSeen', description: '最后出现时间', example: '2024-03-05 14:30:00' },
    // 新增 URL 相关变量
    { key: 'errorMessage', description: '错误消息', example: 'Cannot read property of undefined' },
    { key: 'errorType', description: '错误类型', example: 'fetch_error/xhr_error/exception' },
    { key: 'pageUrl', description: '页面 URL', example: 'https://example.com/page' },
    { key: 'apiUrl', description: 'API URL', example: 'https://api.example.com/users' },
    { key: 'method', description: 'HTTP 方法', example: 'GET/POST/PUT/DELETE' },
    { key: 'status', description: 'HTTP 状态码', example: '404/500' },
    { key: 'statusText', description: '状态文本', example: 'Not Found/Internal Server Error' },
    { key: 'duration', description: '请求耗时(ms)', example: '1234' }
  ];
  
  res.json({ variables });
});

// 获取模板列表
router.get('/', authenticate, async (req, res) => {
  try {
    const { projectId, category } = req.query;
    
    let query = {};
    
    if (projectId) {
      // 如果指定了项目，检查权限
      const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
      if (!allowedProjectIds.includes(projectId)) {
        return res.status(403).json({ error: '无权访问此项目' });
      }
      
      // 返回全局模板和该项目的模板
      query.$or = [
        { projectId: null },
        { projectId: new mongoose.Types.ObjectId(projectId) }
      ];
    } else {
      // 如果没有指定项目
      if (req.user.role === 'admin') {
        // Admin: 返回所有模板（包括全局和所有项目的）
        // query 保持为空对象
      } else {
        // 普通用户: 返回全局模板和有权限的项目模板
        const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
        query.$or = [
          { projectId: null },
          { projectId: { $in: allowedProjectIds.map(id => new mongoose.Types.ObjectId(id)) } }
        ];
      }
    }
    
    if (category) query.category = category;

    const templates = await NotificationTemplate.find(query)
      .populate('projectId', 'name')
      .populate('createdBy', 'username email')
      .sort({ isDefault: -1, createdAt: -1 });

    res.json({ templates });
  } catch (error) {
    console.error('获取模板列表错误:', error);
    res.status(500).json({ error: '获取模板列表失败' });
  }
});

// 创建模板
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, title, content, projectId, isDefault, category } = req.body;

    if (!name || !title || !content) {
      return res.status(400).json({ error: '名称、标题和内容不能为空' });
    }

    // 检查项目权限
    if (projectId) {
      // 如果指定了项目，检查权限
      const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
      if (!allowedProjectIds.includes(projectId)) {
        return res.status(403).json({ error: '无权在此项目创建模板' });
      }
    } else {
      // 如果是全局模板（projectId为null），只有admin可以创建
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: '只有管理员可以创建全局模板' });
      }
    }

    // 如果设置为默认，取消同项目的其他默认模板
    if (isDefault) {
      const query = {};
      if (projectId) {
        query.projectId = new mongoose.Types.ObjectId(projectId);
      } else {
        query.projectId = null;
      }
      await NotificationTemplate.updateMany(query, { isDefault: false });
    }

    const template = new NotificationTemplate({
      name,
      description,
      title,
      content,
      projectId: projectId ? new mongoose.Types.ObjectId(projectId) : null,
      isDefault,
      category: category || 'custom',
      createdBy: req.user._id
    });

    await template.save();
    await template.populate('projectId', 'name');
    await template.populate('createdBy', 'username email');

    res.status(201).json(template);
  } catch (error) {
    console.error('创建模板错误:', error);
    res.status(500).json({ error: '创建模板失败' });
  }
});

// 获取模板详情
router.get('/:id', authenticate, async (req, res) => {
  try {
    const template = await NotificationTemplate.findById(req.params.id)
      .populate('projectId', 'name')
      .populate('createdBy', 'username email');

    if (!template) {
      return res.status(404).json({ error: '模板不存在' });
    }

    // 检查项目权限
    const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
    if (!allowedProjectIds.includes(template.projectId._id.toString())) {
      return res.status(403).json({ error: '无权访问此模板' });
    }

    res.json(template);
  } catch (error) {
    console.error('获取模板详情错误:', error);
    res.status(500).json({ error: '获取模板详情失败' });
  }
});

// 更新模板
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, description, title, content, isDefault, category, projectId } = req.body;

    const template = await NotificationTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: '模板不存在' });
    }

    // 检查原模板的权限
    if (template.projectId) {
      const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
      if (!allowedProjectIds.includes(template.projectId.toString())) {
        return res.status(403).json({ error: '无权修改此模板' });
      }
    } else {
      // 如果是全局模板，只有admin可以修改
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: '只有管理员可以修改全局模板' });
      }
    }

    // 处理 projectId 的更新
    if (projectId !== undefined) {
      if (projectId === null || projectId === '') {
        // 设置为全局模板，只有admin可以
        if (req.user.role !== 'admin') {
          return res.status(403).json({ error: '只有管理员可以创建全局模板' });
        }
        template.projectId = null;
      } else {
        // 设置为项目模板，检查权限
        const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
        if (!allowedProjectIds.includes(projectId)) {
          return res.status(403).json({ error: '无权将模板关联到此项目' });
        }
        template.projectId = new mongoose.Types.ObjectId(projectId);
      }
    }

    // 如果设置为默认，取消同项目的其他默认模板
    if (isDefault && !template.isDefault) {
      const query = { _id: { $ne: template._id } };
      
      if (template.projectId) {
        query.projectId = template.projectId;
      } else {
        query.projectId = null;
      }
      
      await NotificationTemplate.updateMany(query, { isDefault: false });
    }

    if (name) template.name = name;
    if (description !== undefined) template.description = description;
    if (title) template.title = title;
    if (content) template.content = content;
    if (isDefault !== undefined) template.isDefault = isDefault;
    if (category) template.category = category;

    await template.save();
    await template.populate('projectId', 'name');
    await template.populate('createdBy', 'username email');

    res.json(template);
  } catch (error) {
    console.error('更新模板错误:', error);
    res.status(500).json({ error: '更新模板失败' });
  }
});

// 删除模板
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const template = await NotificationTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: '模板不存在' });
    }

    // 检查项目权限
    const allowedProjectIds = await getUserProjectIds(req.user._id, req.user.role);
    if (!allowedProjectIds.includes(template.projectId.toString())) {
      return res.status(403).json({ error: '无权删除此模板' });
    }

    await NotificationTemplate.findByIdAndDelete(req.params.id);

    res.json({ message: '模板删除成功' });
  } catch (error) {
    console.error('删除模板错误:', error);
    res.status(500).json({ error: '删除模板失败' });
  }
});

// 设置为默认模板
router.patch('/:id/set-default', authenticate, async (req, res) => {
  try {
    const template = await NotificationTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: '模板不存在' });
    }

    // 取消同项目的其他默认模板
    await NotificationTemplate.updateMany(
      { 
        projectId: template.projectId,
        _id: { $ne: template._id }
      },
      { isDefault: false }
    );

    template.isDefault = true;
    await template.save();

    res.json({
      message: '已设置为默认模板',
      template
    });
  } catch (error) {
    console.error('设置默认模板错误:', error);
    res.status(500).json({ error: '设置默认模板失败' });
  }
});

module.exports = router;
