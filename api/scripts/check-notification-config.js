const mongoose = require('mongoose');
const NotificationConfig = require('../src/models/NotificationConfig');
const NotificationTemplate = require('../src/models/NotificationTemplate');
const Alert = require('../src/models/Alert');
const Project = require('../src/models/Project');

async function check() {
  await mongoose.connect('mongodb://localhost:27017/error-catcher-dev');
  
  console.log('📋 检查通知配置和模板关联\n');
  console.log('='.repeat(60));
  
  // 查找所有通知配置
  const configs = await NotificationConfig.find({})
    .populate('templateId')
    .populate('projectId', 'name');
  
  console.log(`\n找到 ${configs.length} 个通知配置:\n`);
  
  configs.forEach((config, index) => {
    console.log(`${index + 1}. ${config.name} (${config.type})`);
    console.log(`   ID: ${config._id}`);
    console.log(`   项目: ${config.projectId?.name || '全局'}`);
    console.log(`   启用: ${config.enabled ? '✅' : '❌'}`);
    console.log(`   关联模板: ${config.templateId ? `✅ ${config.templateId.name}` : '❌ 无（使用默认模板）'}`);
    if (config.templateId) {
      console.log(`   模板内容预览: ${config.templateId.content.substring(0, 50)}...`);
    }
    console.log('');
  });
  
  // 查找所有模板
  console.log('\n📄 所有消息模板:\n');
  console.log('='.repeat(60));
  
  const templates = await NotificationTemplate.find({})
    .populate('projectId', 'name');
  
  console.log(`\n找到 ${templates.length} 个模板:\n`);
  
  templates.forEach((template, index) => {
    console.log(`${index + 1}. ${template.name}`);
    console.log(`   ID: ${template._id}`);
    console.log(`   项目: ${template.projectId?.name || '全局'}`);
    console.log(`   分类: ${template.category}`);
    console.log(`   标题: ${template.title}`);
    console.log(`   内容: ${template.content}`);
    console.log('');
  });
  
  // 查找告警规则
  console.log('\n🚨 告警规则关联的通知配置:\n');
  console.log('='.repeat(60));
  
  const alerts = await Alert.find({})
    .populate('notificationConfigs')
    .populate('projectId', 'name');
  
  alerts.forEach((alert, index) => {
    console.log(`${index + 1}. ${alert.name}`);
    console.log(`   项目: ${alert.projectId?.name || '未知'}`);
    console.log(`   关联的通知配置:`);
    alert.notificationConfigs.forEach(config => {
      console.log(`     - ${config.name} (templateId: ${config.templateId || '无'})`);
    });
    console.log('');
  });
  
  await mongoose.disconnect();
}

check();
