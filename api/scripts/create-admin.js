#!/usr/bin/env node

/**
 * 创建管理员账号脚本
 */

const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/error-catcher-dev';

async function createAdmin() {
  try {
    console.log('🔗 连接数据库...');
    console.log(`   MongoDB URI: ${MONGODB_URI}`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    // 检查是否已存在管理员
    const existingAdmin = await User.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  管理员账号已存在');
      console.log(`   用户名: ${existingAdmin.username}`);
      console.log(`   邮箱: ${existingAdmin.email}`);
      console.log(`   角色: ${existingAdmin.role}\n`);
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question('是否重置密码？(y/N): ', async (answer) => {
        if (answer.toLowerCase() === 'y') {
          existingAdmin.password = 'admin123';
          await existingAdmin.save();
          console.log('\n✅ 密码已重置为: admin123\n');
        } else {
          console.log('\n已取消\n');
        }
        readline.close();
        await mongoose.connection.close();
      });
      
      return;
    }

    // 创建管理员账号
    const admin = new User({
      username: 'admin',
      email: 'admin@errorcatcher.com',
      password: 'admin123',
      role: 'admin'
    });

    await admin.save();

    console.log('✅ 管理员账号创建成功！');
    console.log('='.repeat(50));
    console.log('   用户名: admin');
    console.log('   密码: admin123');
    console.log('   邮箱: admin@errorcatcher.com');
    console.log('   角色: admin');
    console.log('='.repeat(50));
    console.log('\n⚠️  请在首次登录后立即修改密码！\n');
    console.log('🚀 下一步:');
    console.log('   1. 启动 API: npm run dev');
    console.log('   2. 启动管理后台: cd ../admin && npm run dev');
    console.log('   3. 访问: http://localhost:3000');
    console.log('   4. 使用上述账号登录\n');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

createAdmin();
