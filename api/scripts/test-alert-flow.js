/**
 * 测试告警流程
 * 用于验证告警规则是否正确触发和发送通知
 */

const mongoose = require('mongoose');
const Alert = require('../src/models/Alert');
const NotificationConfig = require('../src/models/NotificationConfig');
const Error = require('../src/models/Error');
const alertService = require('../src/services/alertService');

async function testAlertFlow() {
  try {
    // 连接数据库
    await mongoose.connect('mongodb://localhost:27017/error-catcher', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ 数据库连接成功');

    // 1. 检查项目
    const projectId = '69a69b5a6b650638ebe3d896';
    console.log(`\n📋 检查项目: ${projectId}`);

    // 2. 检查告警规则
    const alerts = await Alert.find({ projectId, enabled: true })
      .populate('notificationConfigs');
    
    console.log(`\n🚨 找到 ${alerts.length} 个启用的告警规则:`);
    alerts.forEach(alert => {
      console.log(`  - ${alert.name} (${alert._id})`);
      console.log(`    条件: level=${JSON.stringify(alert.conditions.level)}, threshold=${alert.conditions.threshold.count}次/${alert.conditions.threshold.timeWindow}分钟`);
      console.log(`    通知配置: ${alert.notificationConfigs.length} 个`);
      alert.notificationConfigs.forEach(config => {
        console.log(`      - ${config.name} (${config.type}) ${config.enabled ? '✅' : '❌'}`);
      });
    });

    if (alerts.length === 0) {
      console.log('\n❌ 没有找到启用的告警规则！');
      console.log('请在管理后台创建告警规则：');
      console.log('1. 访问 http://localhost:5173/alerts');
      console.log('2. 点击"新建告警"');
      console.log('3. 选择项目、设置条件、关联通知配置');
      process.exit(0);
    }

    // 3. 检查最近的错误
    const recentErrors = await Error.find({ projectId })
      .sort({ timestamp: -1 })
      .limit(10);
    
    console.log(`\n📊 最近的错误 (${recentErrors.length} 条):`);
    recentErrors.forEach(error => {
      console.log(`  - ${error.type}: ${error.message.substring(0, 50)}... (${error.level})`);
    });

    // 4. 手动触发告警评估
    console.log('\n🔍 开始评估告警规则...');
    for (const alert of alerts) {
      console.log(`\n评估: ${alert.name}`);
      await alertService.evaluateAlert(alert);
    }

    console.log('\n✅ 测试完成！');
    console.log('\n💡 提示:');
    console.log('- 如果没有发送通知，检查错误数量是否达到阈值');
    console.log('- 查看后端控制台的详细日志');
    console.log('- 确保钉钉 Webhook URL 和密钥配置正确');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n数据库连接已关闭');
  }
}

// 运行测试
testAlertFlow();
