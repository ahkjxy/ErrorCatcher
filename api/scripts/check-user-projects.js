#!/usr/bin/env node

/**
 * 检查用户的项目权限
 * 用法: node api/scripts/check-user-projects.js <username>
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env.dev') });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const ProjectMember = require('../src/models/ProjectMember');
const { getUserProjectIds } = require('../src/middleware/projectAccess');

async function checkUserProjects(username) {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/error-catcher');
    console.log('✅ 已连接到数据库\n');

    // 查找用户
    const user = await User.findOne({ username }).select('-password');
    if (!user) {
      console.log(`❌ 用户 "${username}" 不存在`);
      process.exit(1);
    }

    console.log('📋 用户信息:');
    console.log(`  ID: ${user._id}`);
    console.log(`  用户名: ${user.username}`);
    console.log(`  邮箱: ${user.email}`);
    console.log(`  角色: ${user.role}`);
    console.log('');

    // 获取用户创建的项目
    const ownedProjects = await Project.find({ createdBy: user._id }).select('name');
    console.log(`🏗️  创建的项目 (${ownedProjects.length}):`);
    ownedProjects.forEach(p => {
      console.log(`  - ${p.name} (${p._id})`);
    });
    console.log('');

    // 获取用户作为成员的项目
    const memberships = await ProjectMember.find({ userId: user._id })
      .populate('projectId', 'name')
      .populate('invitedBy', 'username');
    console.log(`👥 成员项目 (${memberships.length}):`);
    memberships.forEach(m => {
      console.log(`  - ${m.projectId.name} (${m.projectId._id})`);
      console.log(`    角色: ${m.role}`);
      console.log(`    加入时间: ${m.joinedAt}`);
      if (m.invitedBy) {
        console.log(`    邀请人: ${m.invitedBy.username}`);
      }
    });
    console.log('');

    // 使用权限中间件获取所有有权限的项目
    const allowedProjectIds = await getUserProjectIds(user._id, user.role);
    console.log(`✅ 有权限的项目 ID (${allowedProjectIds.length}):`);
    const allowedProjects = await Project.find({ _id: { $in: allowedProjectIds } }).select('name');
    allowedProjects.forEach(p => {
      console.log(`  - ${p.name} (${p._id})`);
    });

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await mongoose.disconnect();
  }
}

const username = process.argv[2];
if (!username) {
  console.log('用法: node check-user-projects.js <username>');
  console.log('示例: node check-user-projects.js lh');
  process.exit(1);
}

checkUserProjects(username);
