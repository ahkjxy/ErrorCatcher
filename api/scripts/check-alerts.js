const mongoose = require('mongoose');
const Alert = require('../src/models/Alert');
const Project = require('../src/models/Project');
const NotificationConfig = require('../src/models/NotificationConfig');

async function checkAlerts() {
  await mongoose.connect('mongodb://localhost:27017/error-catcher-dev');
  
  const allAlerts = await Alert.find({})
    .populate('projectId', 'name')
    .populate('notificationConfigs');
  
  console.log(`总共有 ${allAlerts.length} 个告警规则:\n`);
  
  allAlerts.forEach(alert => {
    console.log(`📋 ${alert.name}`);
    console.log(`   ID: ${alert._id}`);
    console.log(`   项目ID: ${alert.projectId?._id || '未设置'}`);
    console.log(`   项目名: ${alert.projectId?.name || '未知'}`);
    console.log(`   启用: ${alert.enabled ? '✅ 是' : '❌ 否'}`);
    console.log(`   优先级: ${alert.priority}`);
    console.log(`   条件:`);
    console.log(`     - 错误级别: ${JSON.stringify(alert.conditions.level)}`);
    console.log(`     - 错误类型: ${JSON.stringify(alert.conditions.type)}`);
    console.log(`     - 环境: ${JSON.stringify(alert.conditions.environment)}`);
    console.log(`     - 阈值: ${alert.conditions.threshold.count}次/${alert.conditions.threshold.timeWindow}分钟`);
    console.log(`   通知配置: ${alert.notificationConfigs.length} 个`);
    alert.notificationConfigs.forEach(config => {
      console.log(`     - ${config.name} (${config.type}) ${config.enabled ? '✅' : '❌'}`);
    });
    console.log('');
  });
  
  // 检查特定项目的告警
  const targetProjectId = '69a69b5a6b650638ebe3d896';
  console.log(`\n🔍 检查项目 ${targetProjectId} 的启用告警:`);
  const projectAlerts = await Alert.find({
    projectId: targetProjectId,
    enabled: true
  });
  console.log(`找到 ${projectAlerts.length} 个启用的告警规则`);
  
  await mongoose.disconnect();
}

checkAlerts();
