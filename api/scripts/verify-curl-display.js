/**
 * 验证 cURL 命令在前端页面的展示
 * 
 * 这个脚本会：
 * 1. 检查数据库中是否有包含 curlCommand 的错误
 * 2. 验证 API 返回的数据是否包含 curlCommand
 * 3. 提供前端测试指南
 */

const mongoose = require('mongoose');
const Error = require('../src/models/Error');
const Issue = require('../src/models/Issue');
require('dotenv').config({ path: '../.env.dev' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/error-catcher';

async function verifyCurlDisplay() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. 检查数据库中的错误
    console.log('📊 Checking database for errors with cURL commands...');
    const errorsWithCurl = await Error.find({ 
      curlCommand: { $exists: true, $ne: null } 
    }).limit(5);

    console.log(`✅ Found ${errorsWithCurl.length} errors with cURL commands\n`);

    if (errorsWithCurl.length === 0) {
      console.log('⚠️  No errors with cURL commands found.');
      console.log('   Run: node scripts/test-curl-feature.js to create test data\n');
      return;
    }

    // 2. 显示错误详情
    console.log('📝 Error Details:\n');
    errorsWithCurl.forEach((error, index) => {
      console.log(`${index + 1}. Error ID: ${error._id}`);
      console.log(`   Type: ${error.type}`);
      console.log(`   Message: ${error.message}`);
      console.log(`   Method: ${error.method} ${error.url}`);
      console.log(`   Status: ${error.status}`);
      console.log(`   Has cURL: ${!!error.curlCommand}`);
      console.log(`   cURL Preview: ${error.curlCommand?.substring(0, 60)}...`);
      console.log('');
    });

    // 3. 检查 Issues
    console.log('📊 Checking Issues with cURL commands...');
    const issues = await Issue.find({}).populate('sampleEvent').limit(10);
    const issuesWithCurl = issues.filter(issue => issue.sampleEvent?.curlCommand);

    console.log(`✅ Found ${issuesWithCurl.length} issues with cURL commands\n`);

    if (issuesWithCurl.length > 0) {
      console.log('📝 Issue Details:\n');
      issuesWithCurl.slice(0, 3).forEach((issue, index) => {
        console.log(`${index + 1}. Issue ID: ${issue._id}`);
        console.log(`   Title: ${issue.title}`);
        console.log(`   Count: ${issue.count} events`);
        console.log(`   Has cURL: ${!!issue.sampleEvent?.curlCommand}`);
        console.log('');
      });
    }

    // 4. 验证 API 字段
    console.log('🔍 Verifying API Response Fields...\n');
    const sampleError = errorsWithCurl[0];
    const errorObj = sampleError.toObject();
    
    console.log('✅ Error Object Fields:');
    console.log(`   - _id: ${!!errorObj._id}`);
    console.log(`   - message: ${!!errorObj.message}`);
    console.log(`   - type: ${!!errorObj.type}`);
    console.log(`   - method: ${!!errorObj.method}`);
    console.log(`   - url: ${!!errorObj.url}`);
    console.log(`   - status: ${!!errorObj.status}`);
    console.log(`   - curlCommand: ${!!errorObj.curlCommand}`);
    console.log(`   - requestHeaders: ${!!errorObj.requestHeaders}`);
    console.log(`   - requestBody: ${!!errorObj.requestBody}`);
    console.log('');

    // 5. 前端测试指南
    console.log('🎯 Frontend Testing Guide:\n');
    console.log('1. Start the admin panel:');
    console.log('   cd admin && npm run dev\n');
    
    console.log('2. Navigate to Errors page:');
    console.log('   http://localhost:5173/errors\n');
    
    console.log('3. Look for errors with purple "cURL" indicator\n');
    
    console.log('4. Click on an error to view details:');
    console.log(`   http://localhost:5173/errors/${errorsWithCurl[0]._id}\n`);
    
    console.log('5. In the Overview tab, you should see:');
    console.log('   - "cURL Command" section');
    console.log('   - Green code block with the command');
    console.log('   - "Copy" button in the top right');
    console.log('   - Helper text below the command\n');
    
    console.log('6. Test the Copy button:');
    console.log('   - Click "Copy" button');
    console.log('   - Should see success toast');
    console.log('   - Paste in terminal to verify\n');

    if (issuesWithCurl.length > 0) {
      console.log('7. Test Issues page:');
      console.log('   http://localhost:5173/issues\n');
      
      console.log('8. Click on an issue with cURL indicator:');
      console.log(`   http://localhost:5173/issues/${issuesWithCurl[0]._id}\n`);
      
      console.log('9. Verify cURL command displays in Overview tab\n');
    }

    // 6. 示例 cURL 命令
    console.log('📋 Example cURL Command:\n');
    console.log(errorsWithCurl[0].curlCommand);
    console.log('');

    // 7. 测试 cURL 命令
    console.log('🧪 Test the cURL command:');
    console.log('   1. Copy the command above');
    console.log('   2. Paste in your terminal');
    console.log('   3. Run it to reproduce the API request');
    console.log('   4. Verify the response matches the error\n');

    // 8. 检查清单
    console.log('✅ Verification Checklist:\n');
    console.log('   [ ] Errors with cURL commands exist in database');
    console.log('   [ ] cURL indicator shows in error list');
    console.log('   [ ] cURL command displays in error detail page');
    console.log('   [ ] Copy button works');
    console.log('   [ ] cURL command can be executed in terminal');
    console.log('   [ ] Issues with cURL commands display correctly');
    console.log('   [ ] cURL indicator shows in issue list');
    console.log('   [ ] cURL command displays in issue detail page\n');

    // 9. 常见问题
    console.log('❓ Troubleshooting:\n');
    console.log('   Q: cURL command not showing?');
    console.log('   A: Check if error.curlCommand exists in API response\n');
    
    console.log('   Q: Copy button not working?');
    console.log('   A: Check browser console for clipboard errors\n');
    
    console.log('   Q: cURL indicator not showing in list?');
    console.log('   A: Verify error.curlCommand is not null/undefined\n');

    console.log('✨ Verification complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// 运行验证
verifyCurlDisplay();
