const mongoose = require('mongoose');
require('dotenv').config();

const Project = require('../src/models/Project');

async function checkProjectOwner() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/error-catcher');
    console.log('✅ 已连接到数据库');

    const projects = await Project.find()
      .populate('owner', 'username email')
      .populate('createdBy', 'username email')
      .limit(5);

    console.log('\n📋 项目列表:');
    projects.forEach(project => {
      console.log('\n项目:', project.name);
      console.log('  ID:', project._id);
      console.log('  创建者:', project.createdBy?.username || project.createdBy?.email || '未设置');
      console.log('  负责人:', project.owner?.username || project.owner?.email || '未设置');
      console.log('  owner 字段值:', project.owner);
    });

    await mongoose.disconnect();
    console.log('\n✅ 已断开数据库连接');
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

checkProjectOwner();
