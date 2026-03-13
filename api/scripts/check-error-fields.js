const mongoose = require('mongoose');
const Error = require('../src/models/Error');

async function checkErrorFields() {
  try {
    await mongoose.connect('mongodb://localhost:27017/error-catcher-dev');
    console.log('✅ 已连接到数据库');

    // 获取最近的 10 个错误
    const errors = await Error.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    console.log(`\n找到 ${errors.length} 个错误记录\n`);

    errors.forEach((error, index) => {
      console.log(`\n========== 错误 ${index + 1} ==========`);
      console.log('ID:', error._id);
      console.log('类型:', error.type);
      console.log('消息:', error.message);
      console.log('时间:', error.timestamp);
      console.log('\n--- URL 信息 ---');
      console.log('pageUrl (页面URL):', error.pageUrl || '❌ 未设置');
      console.log('url (API URL):', error.url || '❌ 未设置');
      console.log('method:', error.method || '未设置');
      console.log('status:', error.status || '未设置');
      console.log('statusText:', error.statusText || '未设置');
      console.log('duration:', error.duration || '未设置');
      console.log('\n--- 其他信息 ---');
      console.log('userAgent:', error.userAgent ? '✅ 已设置' : '❌ 未设置');
      console.log('referrer:', error.referrer || '未设置');
      console.log('projectId:', error.projectId);
    });

    await mongoose.disconnect();
    console.log('\n✅ 已断开数据库连接');
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

checkErrorFields();
