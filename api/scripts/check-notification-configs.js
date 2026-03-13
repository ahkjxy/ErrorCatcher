const mongoose = require('mongoose');
const NotificationConfig = require('../src/models/NotificationConfig');

mongoose.connect('mongodb://localhost:27017/errorcatcher')
  .then(async () => {
    console.log('✅ 已连接到 MongoDB\n');

    // 查询所有通知配置
    const allConfigs = await NotificationConfig.find()
      .populate('projectId', 'name')
      .populate('createdBy', 'username email');

    console.log(`📊 数据库中共有 ${allConfigs.length} 条通知配置:\n`);

    allConfigs.forEach((config, index) => {
      console.log(`${index + 1}. ${config.name}`);
      console.log(`   类型: ${config.type}`);
      console.log(`   项目: ${config.projectId?.name || '未知项目'}`);
      console.log(`   创建者: ${config.createdBy?.username || '未知'}`);
      console.log(`   默认: ${config.isDefault ? '是' : '否'}`);
      console.log(`   启用: ${config.enabled ? '是' : '否'}`);
      console.log('');
    });

    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ 连接失败:', err);
    process.exit(1);
  });
