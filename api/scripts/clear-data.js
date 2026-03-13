#!/usr/bin/env node

/**
 * 清空数据脚本
 * 用于清空数据库中的所有错误数据
 */

const mongoose = require('mongoose');
require('dotenv').config();

// 连接数据库
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/error-catcher-dev';

// 错误模型定义
const errorSchema = new mongoose.Schema({
  type: String,
  message: String,
  stack: String,
  url: String,
  line: Number,
  column: Number,
  appId: String,
  appName: String,
  environment: String,
  userId: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false },
  context: mongoose.Schema.Types.Mixed
});

const Error = mongoose.model('Error', errorSchema);

async function clearData() {
  try {
    console.log('🔗 连接数据库...');
    console.log(`   MongoDB URI: ${MONGODB_URI}`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    // 统计现有数据
    const count = await Error.countDocuments();
    
    if (count === 0) {
      console.log('ℹ️  数据库中没有数据\n');
      return;
    }

    console.log(`⚠️  发现 ${count} 条数据`);
    console.log('   准备清空所有数据...\n');
    
    // 等待3秒确认
    console.log('   3秒后开始清空数据，按 Ctrl+C 取消...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('   2...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('   1...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 删除所有数据
    const result = await Error.deleteMany({});
    
    console.log('\n✅ 数据清空完成');
    console.log(`   已删除 ${result.deletedCount} 条数据\n`);

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 数据库连接已关闭');
  }
}

// 运行脚本
clearData();
