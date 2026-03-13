const ProjectMember = require('../models/ProjectMember');
const Project = require('../models/Project');

/**
 * 获取用户有权限访问的项目 ID 列表
 */
async function getUserProjectIds(userId, userRole) {
  // admin 可以访问所有项目
  if (userRole === 'admin') {
    const projects = await Project.find().select('_id');
    return projects.map(p => p._id.toString());
  }

  // 获取用户创建的项目
  const ownedProjects = await Project.find({ createdBy: userId }).select('_id');
  const ownedIds = ownedProjects.map(p => p._id.toString());

  // 获取用户作为成员的项目
  const memberships = await ProjectMember.find({ userId }).select('projectId');
  const memberIds = memberships.map(m => m.projectId.toString());

  // 合并并去重
  return [...new Set([...ownedIds, ...memberIds])];
}

/**
 * 检查用户是否有权限访问指定项目
 */
async function checkProjectAccess(userId, projectId, userRole) {
  // admin 可以访问所有项目
  if (userRole === 'admin') {
    return true;
  }

  // 检查是否是项目创建者
  const project = await Project.findOne({ _id: projectId, createdBy: userId });
  if (project) {
    return true;
  }

  // 检查是否是项目成员
  const membership = await ProjectMember.findOne({ projectId, userId });
  return !!membership;
}

/**
 * 中间件：确保用户有权限访问项目
 */
async function requireProjectAccess(req, res, next) {
  try {
    const projectId = req.params.projectId || req.params.id || req.body.projectId || req.query.projectId;
    
    if (!projectId) {
      return res.status(400).json({ error: '缺少项目 ID' });
    }

    const hasAccess = await checkProjectAccess(req.user._id, projectId, req.user.role);
    
    if (!hasAccess) {
      return res.status(403).json({ error: '无权访问此项目' });
    }

    next();
  } catch (error) {
    console.error('检查项目权限错误:', error);
    res.status(500).json({ error: '权限检查失败' });
  }
}

/**
 * 添加项目成员
 */
async function addProjectMember(projectId, userId, role = 'developer', invitedBy = null) {
  try {
    // 检查是否已经是成员
    const existing = await ProjectMember.findOne({ projectId, userId });
    if (existing) {
      return { success: false, error: '用户已经是项目成员' };
    }

    const member = new ProjectMember({
      projectId,
      userId,
      role,
      invitedBy
    });

    await member.save();
    return { success: true, member };
  } catch (error) {
    console.error('添加项目成员错误:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 移除项目成员
 */
async function removeProjectMember(projectId, userId) {
  try {
    await ProjectMember.deleteOne({ projectId, userId });
    return { success: true };
  } catch (error) {
    console.error('移除项目成员错误:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  getUserProjectIds,
  checkProjectAccess,
  requireProjectAccess,
  addProjectMember,
  removeProjectMember
};
