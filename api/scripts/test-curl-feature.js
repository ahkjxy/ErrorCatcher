/**
 * 测试 cURL 命令生成功能
 * 
 * 这个脚本会创建一些包含 API 错误的测试数据，
 * 验证 cURL 命令是否正确生成和保存
 */

const mongoose = require('mongoose');
const Error = require('../src/models/Error');
const Project = require('../src/models/Project');
require('dotenv').config({ path: '../.env.dev' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/error-catcher';

async function testCurlFeature() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 查找或创建项目
    let project = await Project.findOne();
    if (!project) {
      console.log('📦 No project found, creating test project...');
      
      // 查找或创建一个用户
      const User = require('../src/models/User');
      let user = await User.findOne();
      if (!user) {
        user = await User.create({
          username: 'testuser',
          email: 'test@example.com',
          password: 'test123',
          role: 'admin'
        });
        console.log(`✅ Created test user: ${user.username}`);
      }
      
      project = await Project.create({
        name: 'Test Project',
        description: 'Test project for cURL feature',
        apiKey: 'test_' + Math.random().toString(36).substring(7),
        environment: 'development',
        createdBy: user._id
      });
      console.log(`✅ Created project: ${project.name} (${project._id})`);
    } else {
      console.log(`📦 Using project: ${project.name} (${project._id})`);
    }

    // 创建测试错误数据
    const testErrors = [
      {
        projectId: project._id,
        type: 'fetch_error',
        level: 'error',
        message: 'HTTP 404: User not found',
        url: 'https://api.example.com/users/999',
        method: 'GET',
        status: 404,
        statusText: 'Not Found',
        fingerprint: ['fetch_error', 'HTTP <num>: User not found'],
        requestHeaders: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test_token_123'
        },
        response: '{"error":"User not found","code":"USER_NOT_FOUND"}',
        duration: 125,
        curlCommand: `curl -X GET 'https://api.example.com/users/999' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer test_token_123'`,
        timestamp: new Date(),
        pageUrl: 'https://example.com/users',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      },
      {
        projectId: project._id,
        type: 'axios_error',
        level: 'error',
        message: 'HTTP 500: Internal Server Error',
        url: 'https://api.example.com/orders',
        method: 'POST',
        status: 500,
        statusText: 'Internal Server Error',
        fingerprint: ['axios_error', 'HTTP <num>: Internal Server Error'],
        requestHeaders: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test_token_456',
          'X-Request-ID': 'req_abc123'
        },
        requestBody: '{"product_id":"prod_123","quantity":2}',
        response: '{"error":"Database connection failed"}',
        duration: 3500,
        curlCommand: `curl -X POST 'https://api.example.com/orders' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer test_token_456' \\
  -H 'X-Request-ID: req_abc123' \\
  -d '{"product_id":"prod_123","quantity":2}'`,
        timestamp: new Date(),
        pageUrl: 'https://example.com/checkout',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      {
        projectId: project._id,
        type: 'xhr_error',
        level: 'error',
        message: 'HTTP 401: Unauthorized',
        url: 'https://api.example.com/profile',
        method: 'PUT',
        status: 401,
        statusText: 'Unauthorized',
        fingerprint: ['xhr_error', 'HTTP <num>: Unauthorized'],
        requestHeaders: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer expired_token'
        },
        requestBody: '{"name":"John Doe","email":"john@example.com"}',
        response: '{"error":"Token expired","code":"TOKEN_EXPIRED"}',
        duration: 89,
        curlCommand: `curl -X PUT 'https://api.example.com/profile' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer expired_token' \\
  -d '{"name":"John Doe","email":"john@example.com"}'`,
        timestamp: new Date(),
        pageUrl: 'https://example.com/settings',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
      }
    ];

    console.log('\n📝 Creating test errors with cURL commands...');
    
    for (const errorData of testErrors) {
      const error = await Error.create(errorData);
      console.log(`✅ Created ${errorData.type}: ${errorData.message}`);
      console.log(`   cURL: ${errorData.curlCommand.substring(0, 50)}...`);
    }

    console.log('\n🔍 Verifying errors in database...');
    const errors = await Error.find({ 
      projectId: project._id,
      curlCommand: { $exists: true, $ne: null }
    }).sort({ timestamp: -1 }).limit(5);

    console.log(`\n✅ Found ${errors.length} errors with cURL commands:`);
    errors.forEach((error, index) => {
      console.log(`\n${index + 1}. ${error.type} - ${error.message}`);
      console.log(`   Method: ${error.method} ${error.url}`);
      console.log(`   Status: ${error.status}`);
      console.log(`   cURL Command:`);
      console.log(`   ${error.curlCommand.split('\n').join('\n   ')}`);
    });

    console.log('\n✅ Test completed successfully!');
    console.log('\n📌 Next steps:');
    console.log('   1. Open the admin panel: http://localhost:5173');
    console.log('   2. Navigate to Errors page');
    console.log('   3. Look for errors with the "cURL" indicator');
    console.log('   4. Click on an error to view details');
    console.log('   5. Find the "cURL Command" section in the Overview tab');
    console.log('   6. Click "Copy" to copy the command to clipboard');
    console.log('   7. Paste and run in your terminal to reproduce the request');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// 运行测试
testCurlFeature();
