const mongoose = require('mongoose');
const config = require('../config');

async function testNotificationAccess() {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('✓ Connected to MongoDB');

    const User = require('../src/models/User');
    const NotificationConfig = require('../src/models/NotificationConfig');
    const ProjectMember = require('../src/models/ProjectMember');
    const { getUserProjectIds } = require('../src/middleware/projectAccess');

    console.log('\n=== Testing Notification Access ===\n');

    // 找一个普通用户（非 admin）
    const regularUser = await User.findOne({ role: { $ne: 'admin' } });
    if (!regularUser) {
      console.log('✗ No regular user found');
      process.exit(1);
    }
    console.log('Testing with user:', regularUser.username, '(role:', regularUser.role + ')');

    // 获取用户的项目权限
    const allowedProjectIds = await getUserProjectIds(regularUser._id, regularUser.role);
    console.log('\nUser has access to projects:', allowedProjectIds.length);
    allowedProjectIds.forEach(id => console.log('  -', id));

    // 查询用户应该能看到的通知配置
    console.log('\n--- Notification Configs User Should See ---');
    
    const query = {
      $or: [
        { projectId: { $in: allowedProjectIds.map(id => new mongoose.Types.ObjectId(id)) } },
        { projectId: null } // 全局配置
      ]
    };

    const configs = await NotificationConfig.find(query)
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });

    console.log(`Total configs accessible: ${configs.length}`);
    
    configs.forEach(config => {
      if (config.projectId) {
        console.log(`  - ${config.name} (Project: ${config.projectId.name})`);
      } else {
        console.log(`  - ${config.name} (Global)`);
      }
    });

    // 显示所有通知配置
    console.log('\n--- All Notification Configs in Database ---');
    const allConfigs = await NotificationConfig.find({})
      .populate('projectId', 'name');
    
    console.log(`Total configs in database: ${allConfigs.length}`);
    allConfigs.forEach(config => {
      if (config.projectId) {
        console.log(`  - ${config.name} (Project: ${config.projectId.name})`);
      } else {
        console.log(`  - ${config.name} (Global)`);
      }
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

testNotificationAccess();
