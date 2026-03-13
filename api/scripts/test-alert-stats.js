#!/usr/bin/env node

/**
 * 测试告警统计数据
 */

const mongoose = require('mongoose');
const Alert = require('../src/models/Alert');
const AlertHistory = require('../src/models/AlertHistory');

async function testAlertStats() {
  try {
    await mongoose.connect('mongodb://localhost:27017/errorcatcher');
    console.log('✅ 已连接到 MongoDB\n');

    // 1. 检查启用的告警数量
    console.log('📊 步骤 1: 检查启用的告警');
    console.log('='.repeat(50));
    
    const enabledAlerts = await Alert.find({ enabled: true })
      .populate('projectId', 'name')
      .select('name projectId enabled');
    
    console.log(`找到 ${enabledAlerts.length} 个启用的告警:\n`);
    enabledAlerts.forEach((alert, index) => {
      console.log(`${index + 1}. ${alert.name}`);
      console.log(`   项目: ${alert.projectId?.name || '未知'}`);
      console.log(`   启用: ${alert.enabled ? '✅' : '❌'}`);
      console.log('');
    });

    // 2. 检查今天触发的告警
    console.log('\n📊 步骤 2: 检查今天触发的告警');
    console.log('='.repeat(50));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayHistory = await AlertHistory.find({ triggeredAt: { $gte: today } })
      .populate('alertId', 'name')
      .populate('projectId', 'name')
      .sort('-triggeredAt');
    
    console.log(`今天触发了 ${todayHistory.length} 次告警:\n`);
    todayHistory.forEach((history, index) => {
      console.log(`${index + 1}. ${history.alertId?.name || '未知告警'}`);
      console.log(`   项目: ${history.projectId?.name || '未知'}`);
      console.log(`   触发时间: ${history.triggeredAt.toLocaleString('zh-CN')}`);
      console.log(`   原因: ${history.reason}`);
      console.log(`   错误数: ${history.data?.errorCount || 0}`);
      console.log(`   影响用户: ${history.data?.userCount || 0}`);
      console.log('');
    });

    // 3. 检查所有告警历史
    console.log('\n📊 步骤 3: 检查所有告警历史');
    console.log('='.repeat(50));
    
    const allHistory = await AlertHistory.find()
      .sort('-triggeredAt')
      .limit(10)
      .populate('alertId', 'name')
      .populate('projectId', 'name');
    
    console.log(`最近 10 条告警历史:\n`);
    allHistory.forEach((history, index) => {
      console.log(`${index + 1}. ${history.alertId?.name || '未知告警'}`);
      console.log(`   项目: ${history.projectId?.name || '未知'}`);
      console.log(`   触发时间: ${history.triggeredAt.toLocaleString('zh-CN')}`);
      console.log(`   原因: ${history.reason}`);
      console.log('');
    });

    // 4. 统计数据
    console.log('\n📊 步骤 4: 统计数据');
    console.log('='.repeat(50));
    
    const totalAlerts = await Alert.countDocuments();
    const enabledCount = await Alert.countDocuments({ enabled: true });
    const disabledCount = await Alert.countDocuments({ enabled: false });
    const totalHistory = await AlertHistory.countDocuments();
    const todayCount = await AlertHistory.countDocuments({ triggeredAt: { $gte: today } });
    
    console.log(`总告警规则数: ${totalAlerts}`);
    console.log(`启用的告警: ${enabledCount}`);
    console.log(`禁用的告警: ${disabledCount}`);
    console.log(`总触发次数: ${totalHistory}`);
    console.log(`今天触发次数: ${todayCount}`);

    console.log('\n✅ 测试完成！');
    console.log('\n💡 Dashboard 应该显示:');
    console.log(`   活跃告警: ${enabledCount}`);
    console.log(`   今日触发: ${todayCount}`);

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testAlertStats();
