/**
 * 诊断告警配置
 */

const mongoose = require('mongoose');
const Alert = require('../src/models/Alert');
const NotificationConfig = require('../src/models/NotificationConfig');
const Error = require('../src/models/Error');

async function diagnose() {
  try {
    await mongoose.connect('mongodb://localhost:27017/error-catcher-dev');
    console.log('✅ 数据库连接成功\n');

    const projectId = '69a69b5a6b650638ebe3d896';

    // 1. 检查告警规则
    console.log('📋 步骤 1: 检查告警规则');
    console.log('='.repeat(50));
    const alerts = await Alert.find({ projectId })
      .populate('notificationConfigs');
    
    console.log(`找到 ${alerts.length} 个告警规则:\n`);
    
    if (alerts.length === 0) {
      console.log('❌ 没有告警规则！');
      console.log('   请在管理后台创建告警规则');
      process.exit(0);
    }

    alerts.forEach((alert, index) => {
      console.log(`${index + 1}. ${alert.name}`);
      console.log(`   ID: ${alert._id}`);
      console.log(`   启用: ${alert.enabled ? '✅ 是' : '❌ 否'}`);
      console.log(`   条件:`);
      console.log(`     - 错误级别: ${JSON.stringify(alert.conditions.level)}`);
      console.log(`     - 阈值: ${alert.conditions.threshold.count}次/${alert.conditions.threshold.timeWindow}分钟`);
      console.log(`   通知配置: ${alert.notificationConfigs.length} 个`);
      alert.notificationConfigs.forEach(config => {
        console.log(`     - ${config.name} (${config.type}) ${config.enabled ? '✅启用' : '❌禁用'}`);
      });
      console.log('');
    });

    // 2. 检查最近的错误
    console.log('\n📊 步骤 2: 检查最近的错误');
    console.log('='.repeat(50));
    const recentErrors = await Error.find({ projectId })
      .sort({ timestamp: -1 })
      .limit(10);
    
    console.log(`最近 10 条错误:\n`);
    recentErrors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.type}: ${error.message.substring(0, 40)}...`);
      console.log(`   级别: ${error.level}, 时间: ${error.timestamp}`);
    });

    // 3. 检查是否满足告警条件
    console.log('\n🔍 步骤 3: 检查是否满足告警条件');
    console.log('='.repeat(50));
    
    for (const alert of alerts) {
      if (!alert.enabled) {
        console.log(`⏭️  跳过未启用的告警: ${alert.name}\n`);
        continue;
      }

      console.log(`检查告警: ${alert.name}`);
      
      const { conditions } = alert;
      const { level, threshold } = conditions;

      // 构建查询
      const query = { projectId };
      if (level && level.length > 0) {
        query.level = { $in: level };
      }

      // 时间窗口
      if (threshold && threshold.timeWindow) {
        const timeWindowMs = threshold.timeWindow * 60 * 1000;
        const startTime = new Date(Date.now() - timeWindowMs);
        query.timestamp = { $gte: startTime };
      }

      const errorCount = await Error.countDocuments(query);
      console.log(`  在 ${threshold.timeWindow} 分钟内的错误数: ${errorCount}`);
      console.log(`  阈值: ${threshold.count}`);
      
      if (errorCount >= threshold.count) {
        console.log(`  ✅ 满足触发条件！应该发送通知`);
      } else {
        console.log(`  ❌ 不满足触发条件 (需要 ${threshold.count - errorCount} 个更多错误)`);
      }
      console.log('');
    }

    // 4. 检查通知配置
    console.log('\n📢 步骤 4: 检查通知配置');
    console.log('='.repeat(50));
    const configs = await NotificationConfig.find({
      _id: { $in: alerts.flatMap(a => a.notificationConfigs.map(c => c._id)) }
    });

    configs.forEach(config => {
      console.log(`${config.name} (${config.type})`);
      console.log(`  启用: ${config.enabled ? '✅' : '❌'}`);
      if (config.type === 'dingtalk') {
        console.log(`  Webhook: ${config.config.webhook ? '✅ 已配置' : '❌ 未配置'}`);
      }
      console.log('');
    });

    console.log('\n✅ 诊断完成！');
    console.log('\n💡 下一步:');
    console.log('1. 如果告警规则未启用，请在管理后台启用');
    console.log('2. 如果不满足触发条件，请调整阈值或发送更多错误');
    console.log('3. 如果满足条件但没收到通知，查看后端日志');

  } catch (error) {
    console.error('❌ 诊断失败:', error);
  } finally {
    await mongoose.disconnect();
  }
}

diagnose();
