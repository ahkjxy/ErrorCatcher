#!/usr/bin/env node

/**
 * 创建 Admin 前端项目
 * 用于 ErrorCatcher 集成
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('../src/models/Project');
const User = require('../src/models/User');
const APIToken = require('../src/models/APIToken');
const crypto = require('crypto');

const config = require('../config');

async function setupAdminProject() {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ Connected to MongoDB');

    // 查找 admin 用户
    const adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      console.error('❌ Admin user not found. Please run create-admin.js first.');
      process.exit(1);
    }

    console.log('✅ Found admin user:', adminUser.username);

    // 检查是否已存在 admin-frontend 项目
    let project = await Project.findOne({ name: 'admin-frontend' });

    if (project) {
      console.log('✅ Admin frontend project already exists');
      console.log('   Project ID:', project._id.toString());
      console.log('   Name:', project.name);
      console.log('   API Key:', project.apiKey);
    } else {
      // 生成 API Key
      const apiKey = 'ec_' + crypto.randomBytes(32).toString('hex');
      
      // 创建 admin-frontend 项目
      project = await Project.create({
        name: 'admin-frontend',
        apiKey: apiKey,
        description: 'ErrorCatcher Admin Frontend - 管理后台前端错误监控',
        platform: 'web',
        framework: 'vue3',
        createdBy: adminUser._id,
        owner: adminUser._id,
        settings: {
          sampleRate: 1.0,
          ignoreUrls: [
            '/favicon.ico',
            '/static/',
            '*.map'
          ]
        }
      });

      console.log('✅ Created admin frontend project');
      console.log('   Project ID:', project._id.toString());
      console.log('   Name:', project.name);
      console.log('   API Key:', project.apiKey);
    }

    // 检查是否已有 API Token
    let apiToken = await APIToken.findOne({ 
      userId: adminUser._id,
      name: 'Admin Frontend Token'
    });

    if (apiToken) {
      console.log('✅ API Token already exists');
      console.log('   Token:', apiToken.token);
    } else {
      // 生成 API Token
      const token = 'ect_' + crypto.randomBytes(32).toString('hex');
      
      apiToken = await APIToken.create({
        userId: adminUser._id,
        name: 'Admin Frontend Token',
        description: 'Token for admin frontend error reporting',
        token: token,
        scopes: ['write'],
        expiresAt: null // 永不过期
      });

      console.log('✅ Created API Token');
      console.log('   Token:', apiToken.token);
    }

    // 输出配置信息
    console.log('\n📋 Configuration for admin/.env:');
    console.log('─────────────────────────────────────────');
    console.log(`VITE_ERROR_PROJECT_ID=${project._id.toString()}`);
    console.log('─────────────────────────────────────────');

    console.log('\n✅ Setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Add VITE_ERROR_PROJECT_ID to admin/.env');
    console.log('2. Restart the admin dev server');
    console.log('3. ErrorCatcher will now report errors to this project');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

setupAdminProject();
