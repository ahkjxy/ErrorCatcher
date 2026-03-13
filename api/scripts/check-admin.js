#!/usr/bin/env node

/**
 * 检查管理员账号
 */

const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/error-catcher-dev';

async function checkAdmin() {
  try {
    console.log('🔗 连接数据库...');
    console.log(`   MongoDB URI: ${MONGODB_URI}\n`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    // 查找所有用户
    const users = await User.find({});
    
    console.log(`📊 用户统计: 共 ${users.length} 个用户\n`);
    
    if (users.length === 0) {
      console.log('⚠️  数据库中没有用户！');
      console.log('\n请运行以下命令创建管理员账号:');
      console.log('   npm run create-admin\n');
    } else {
      console.log('用户列表:');
      console.log('='.repeat(80));
      users.forEach((user, index) => {
        console.log(`${index + 1}. 用户名: ${user.username}`);
        console.log(`   邮箱: ${user.email}`);
        console.log(`   角色: ${user.role}`);
        console.log(`   状态: ${user.status}`);
        console.log(`   创建时间: ${user.createdAt}`);
        console.log('-'.repeat(80));
      });
      
      // 检查是否有管理员
      const admins = users.filter(u => u.role === 'admin');
      if (admins.length === 0) {
        console.log('\n⚠️  没有管理员账号！');
        console.log('请运行以下命令创建管理员账号:');
        console.log('   npm run create-admin\n');
      } else {
        console.log(`\n✅ 找到 ${admins.length} 个管理员账号\n`);
      }
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 数据库连接已关闭');
  }
}

checkAdmin();
