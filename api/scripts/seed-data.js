#!/usr/bin/env node

/**
 * 演示数据生成脚本
 * 用于快速生成测试数据，方便查看管理后台效果
 */

const mongoose = require('mongoose');
require('dotenv').config();

// 连接数据库
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/error-catcher-dev';

// 错误类型
const ERROR_TYPES = ['js', 'promise', 'fetch', 'xhr', 'resource'];

// 应用列表
const APPS = [
  { id: 'vue3-app', name: 'Vue3 商城', environment: 'production' },
  { id: 'react-app', name: 'React 后台', environment: 'production' },
  { id: 'nuxt3-app', name: 'Nuxt3 官网', environment: 'production' },
  { id: 'nextjs-app', name: 'Next.js 博客', environment: 'staging' },
  { id: 'jquery-app', name: 'jQuery 管理系统', environment: 'production' }
];

// 错误消息模板
const ERROR_MESSAGES = [
  'Cannot read property \'map\' of undefined',
  'Uncaught TypeError: Cannot read properties of null',
  'ReferenceError: $ is not defined',
  'Network request failed',
  'Failed to fetch',
  'Timeout of 5000ms exceeded',
  'Unexpected token < in JSON at position 0',
  'Maximum call stack size exceeded',
  'Cannot set property of undefined',
  'Invalid or unexpected token',
  'SyntaxError: Unexpected end of JSON input',
  'TypeError: Cannot convert undefined to object',
  'RangeError: Maximum call stack size exceeded',
  'URIError: URI malformed',
  'EvalError: eval is not defined'
];

// URL 列表
const URLS = [
  'https://example.com/',
  'https://example.com/products',
  'https://example.com/cart',
  'https://example.com/checkout',
  'https://example.com/user/profile',
  'https://example.com/admin/dashboard',
  'https://example.com/api/users',
  'https://example.com/api/products',
  'https://example.com/login',
  'https://example.com/register'
];

// 堆栈信息模板
const STACK_TEMPLATES = [
  `TypeError: Cannot read property 'map' of undefined
    at ProductList.render (ProductList.vue:45:23)
    at VueComponent.Vue._render (vue.runtime.esm.js:3548:22)
    at VueComponent.updateComponent (vue.runtime.esm.js:4066:21)
    at Watcher.get (vue.runtime.esm.js:4479:25)
    at new Watcher (vue.runtime.esm.js:4468:12)`,
  
  `ReferenceError: $ is not defined
    at HTMLDocument.<anonymous> (main.js:12:5)
    at fire (jquery-3.6.0.min.js:2:3150)
    at Object.add [as done] (jquery-3.6.0.min.js:2:3515)
    at jQuery.fn.init.jQuery.fn.ready (jquery-3.6.0.min.js:2:2990)`,
  
  `Error: Network request failed
    at XMLHttpRequest.xhr.onerror (fetch.js:23:16)
    at XMLHttpRequest.dispatchEvent (EventTarget.js:104:19)
    at XMLHttpRequest.setReadyState (XMLHttpRequest.js:592:14)
    at XMLHttpRequest.__didCompleteResponse (XMLHttpRequest.js:388:10)`,
  
  `TypeError: Cannot read properties of null (reading 'addEventListener')
    at setupEventListeners (app.js:156:12)
    at initApp (app.js:234:5)
    at DOMContentLoaded (app.js:345:3)`,
  
  `SyntaxError: Unexpected token < in JSON at position 0
    at JSON.parse (<anonymous>)
    at Response.json (fetch.js:567:15)
    at processResponse (api.js:89:23)
    at async fetchUserData (user.js:45:18)`
];

// 用户 ID 列表
const USER_IDS = [
  'user_001', 'user_002', 'user_003', 'user_004', 'user_005',
  'user_006', 'user_007', 'user_008', 'user_009', 'user_010',
  'user_011', 'user_012', 'user_013', 'user_014', 'user_015'
];

// 浏览器信息
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

// 随机选择函数
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 随机数字范围
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成随机日期（最近30天）
function randomDate(daysAgo = 30) {
  const now = new Date();
  const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  const randomTime = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(randomTime);
}

// 生成单条错误数据
function generateError() {
  const app = randomChoice(APPS);
  const errorType = randomChoice(ERROR_TYPES);
  const isResolved = Math.random() > 0.7; // 30% 已解决
  
  return {
    type: errorType,
    message: randomChoice(ERROR_MESSAGES),
    stack: randomChoice(STACK_TEMPLATES),
    url: randomChoice(URLS),
    line: randomInt(1, 500),
    column: randomInt(1, 100),
    appId: app.id,
    appName: app.name,
    environment: app.environment,
    userId: Math.random() > 0.3 ? randomChoice(USER_IDS) : undefined,
    userAgent: randomChoice(USER_AGENTS),
    timestamp: randomDate(30),
    resolved: isResolved,
    context: {
      version: `${randomInt(1, 3)}.${randomInt(0, 9)}.${randomInt(0, 20)}`,
      page: randomChoice(URLS).split('/').pop() || 'home',
      browser: randomChoice(['Chrome', 'Firefox', 'Safari', 'Edge']),
      os: randomChoice(['Windows', 'macOS', 'Linux', 'iOS', 'Android']),
      screenResolution: randomChoice(['1920x1080', '1366x768', '1440x900', '2560x1440']),
      language: randomChoice(['zh-CN', 'en-US', 'ja-JP']),
      network: randomChoice(['4g', 'wifi', '5g', '3g'])
    }
  };
}

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

// 主函数
async function seedData() {
  try {
    console.log('🔗 连接数据库...');
    console.log(`   MongoDB URI: ${MONGODB_URI}`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    // 清空现有数据（可选）
    const existingCount = await Error.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  发现 ${existingCount} 条现有数据`);
      console.log('   是否清空现有数据？(将在5秒后自动跳过清空)');
      
      // 等待5秒，如果没有中断则跳过清空
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log('   跳过清空，直接添加新数据\n');
    }

    // 生成演示数据
    console.log('📝 生成演示数据...\n');
    
    const errors = [];
    const totalCount = 200; // 生成200条数据
    
    for (let i = 0; i < totalCount; i++) {
      errors.push(generateError());
      
      // 显示进度
      if ((i + 1) % 20 === 0) {
        console.log(`   已生成 ${i + 1}/${totalCount} 条数据...`);
      }
    }

    console.log('\n💾 插入数据到数据库...');
    await Error.insertMany(errors);
    console.log('✅ 数据插入成功\n');

    // 统计信息
    console.log('📊 数据统计:');
    console.log('='.repeat(50));
    
    const total = await Error.countDocuments();
    console.log(`   总错误数: ${total}`);
    
    const resolved = await Error.countDocuments({ resolved: true });
    console.log(`   已解决: ${resolved}`);
    console.log(`   未解决: ${total - resolved}`);
    
    console.log('\n   按类型统计:');
    for (const type of ERROR_TYPES) {
      const count = await Error.countDocuments({ type });
      console.log(`   - ${type}: ${count}`);
    }
    
    console.log('\n   按应用统计:');
    for (const app of APPS) {
      const count = await Error.countDocuments({ appId: app.id });
      console.log(`   - ${app.name}: ${count}`);
    }
    
    console.log('='.repeat(50));
    console.log('\n✨ 演示数据生成完成！');
    console.log('\n🚀 下一步:');
    console.log('   1. 启动 API: npm run dev');
    console.log('   2. 访问管理后台: http://localhost:3000');
    console.log('   3. 查看演示数据\n');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 数据库连接已关闭');
  }
}

// 运行脚本
seedData();
