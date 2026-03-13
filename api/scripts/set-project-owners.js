const mongoose = require('mongoose');
require('dotenv').config();

const Project = require('../src/models/Project');

async function setProjectOwners() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/error-catcher');
    console.log('✅ 已连接到数据库');

    // 查找所有没有 owner 的项目
    const projects = await Project.find({ owner: { $exists: false } });
    
    console.log(`\n找到 ${projects.length} 个没有设置负责人的项目`);

    for (const project of projects) {
      // 将 owner 设置为创建者
      project.owner = project.createdBy;
      await project.save();
      console.log(`✅ 已为项目 "${project.name}" 设置负责人`);
    }

    console.log('\n✅ 完成！所有项目都已设置负责人');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

setProjectOwners();
