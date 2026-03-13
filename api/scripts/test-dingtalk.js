#!/usr/bin/env node

/**
 * 钉钉通知测试脚本
 * 
 * 使用方法:
 * 1. 设置环境变量或直接修改配置
 * 2. 运行: node api/scripts/test-dingtalk.js
 */

const axios = require('axios');
const crypto = require('crypto');

// 配置信息（请替换为你的实际配置）
const config = {
  webhook: process.env.DINGTALK_WEBHOOK || 'https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN',
  secret: process.env.DINGTALK_SECRET || '',  // 可选，加签密钥
  atMobiles: process.env.DINGTALK_AT_MOBILES ? process.env.DINGTALK_AT_MOBILES.split(',') : [],
  atAll: process.env.DINGTALK_AT_ALL === 'true'
};

/**
 * 生成签名
 */
function generateSign(secret) {
  const timestamp = Date.now();
  const stringToSign = `${timestamp}\n${secret}`;
  const sign = crypto
    .createHmac('sha256', secret)
    .update(stringToSign)
    .digest('base64');
  
  return { timestamp, sign };
}

/**
 * 发送文本消息
 */
async function sendTextMessage() {
  console.log('\n📝 测试文本消息...');
  
  let url = config.webhook;
  if (config.secret) {
    const { timestamp, sign } = generateSign(config.secret);
    url += `&timestamp=${timestamp}&sign=${encodeURIComponent(sign)}`;
  }
  
  const payload = {
    msgtype: 'text',
    text: {
      content: '🧪 这是一条测试消息\n\n来自 ErrorCatcher 钉钉通知测试'
    },
    at: {
      atMobiles: config.atMobiles,
      isAtAll: config.atAll
    }
  };
  
  try {
    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    console.log('✅ 发送成功:', response.data);
    return true;
  } catch (error) {
    console.error('❌ 发送失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
    return false;
  }
}

/**
 * 发送 Markdown 消息
 */
async function sendMarkdownMessage() {
  console.log('\n📋 测试 Markdown 消息...');
  
  let url = config.webhook;
  if (config.secret) {
    const { timestamp, sign } = generateSign(config.secret);
    url += `&timestamp=${timestamp}&sign=${encodeURIComponent(sign)}`;
  }
  
  const payload = {
    msgtype: 'markdown',
    markdown: {
      title: '测试告警通知',
      text: `### 🚨 告警触发\n\n` +
            `**告警名称:** TypeError: Cannot read property 'map' of undefined\n\n` +
            `**优先级:** high\n\n` +
            `**原因:** 错误次数超过阈值 (10次/5分钟)\n\n` +
            `**错误次数:** 156\n\n` +
            `**影响用户:** 23\n\n` +
            `**时间:** ${new Date().toLocaleString('zh-CN')}\n\n` +
            `---\n\n` +
            `这是一条测试消息，来自 ErrorCatcher`
    },
    at: {
      atMobiles: config.atMobiles,
      isAtAll: config.atAll
    }
  };
  
  try {
    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    console.log('✅ 发送成功:', response.data);
    return true;
  } catch (error) {
    console.error('❌ 发送失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
    return false;
  }
}

/**
 * 发送链接消息
 */
async function sendLinkMessage() {
  console.log('\n🔗 测试链接消息...');
  
  let url = config.webhook;
  if (config.secret) {
    const { timestamp, sign } = generateSign(config.secret);
    url += `&timestamp=${timestamp}&sign=${encodeURIComponent(sign)}`;
  }
  
  const payload = {
    msgtype: 'link',
    link: {
      title: '告警: TypeError 错误',
      text: '检测到 TypeError 错误，影响 23 个用户，请及时处理',
      messageUrl: 'https://your-domain.com/issues/123',
      picUrl: 'https://img.alicdn.com/imgextra/i1/O1CN01qKQqJZ1YZ8Z8Z8Z8Z_!!6000000003073-2-tps-1200-600.png'
    }
  };
  
  try {
    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    console.log('✅ 发送成功:', response.data);
    return true;
  } catch (error) {
    console.error('❌ 发送失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
    return false;
  }
}

/**
 * 发送 ActionCard 消息
 */
async function sendActionCardMessage() {
  console.log('\n🎴 测试 ActionCard 消息...');
  
  let url = config.webhook;
  if (config.secret) {
    const { timestamp, sign } = generateSign(config.secret);
    url += `&timestamp=${timestamp}&sign=${encodeURIComponent(sign)}`;
  }
  
  const payload = {
    msgtype: 'actionCard',
    actionCard: {
      title: '🚨 高优先级告警',
      text: `### 告警详情\n\n` +
            `**错误类型:** TypeError\n\n` +
            `**错误消息:** Cannot read property 'map' of undefined\n\n` +
            `**发生次数:** 156 次\n\n` +
            `**影响用户:** 23 人\n\n` +
            `**时间:** ${new Date().toLocaleString('zh-CN')}`,
      btnOrientation: '0',
      btns: [
        {
          title: '查看详情',
          actionURL: 'https://your-domain.com/issues/123'
        },
        {
          title: '标记已读',
          actionURL: 'https://your-domain.com/alerts/mark-read'
        }
      ]
    }
  };
  
  try {
    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    console.log('✅ 发送成功:', response.data);
    return true;
  } catch (error) {
    console.error('❌ 发送失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
    return false;
  }
}

/**
 * 验证配置
 */
function validateConfig() {
  console.log('\n🔍 验证配置...');
  
  if (!config.webhook || config.webhook.includes('YOUR_TOKEN')) {
    console.error('❌ 错误: 请设置正确的 Webhook 地址');
    console.log('\n💡 提示:');
    console.log('1. 在钉钉群中创建自定义机器人');
    console.log('2. 复制 Webhook 地址');
    console.log('3. 设置环境变量: export DINGTALK_WEBHOOK="your_webhook_url"');
    console.log('4. 或直接修改脚本中的 config.webhook');
    return false;
  }
  
  console.log('✅ Webhook 地址已配置');
  
  if (config.secret) {
    console.log('✅ 加签密钥已配置');
  } else {
    console.log('⚠️  未配置加签密钥（可选）');
  }
  
  if (config.atMobiles.length > 0) {
    console.log(`✅ @ 手机号: ${config.atMobiles.join(', ')}`);
  }
  
  if (config.atAll) {
    console.log('⚠️  将 @所有人');
  }
  
  return true;
}

/**
 * 主函数
 */
async function main() {
  console.log('🤖 ErrorCatcher 钉钉通知测试工具');
  console.log('='.repeat(50));
  
  // 验证配置
  if (!validateConfig()) {
    process.exit(1);
  }
  
  // 运行测试
  const tests = [
    { name: '文本消息', fn: sendTextMessage },
    { name: 'Markdown 消息', fn: sendMarkdownMessage },
    { name: '链接消息', fn: sendLinkMessage },
    { name: 'ActionCard 消息', fn: sendActionCardMessage }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const success = await test.fn();
    results.push({ name: test.name, success });
    
    // 等待 2 秒，避免频率限制
    if (test !== tests[tests.length - 1]) {
      console.log('\n⏳ 等待 2 秒...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // 输出测试结果
  console.log('\n' + '='.repeat(50));
  console.log('📊 测试结果汇总:');
  console.log('='.repeat(50));
  
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.success ? '成功' : '失败'}`);
  });
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log('\n' + '='.repeat(50));
  console.log(`总计: ${successCount}/${totalCount} 测试通过`);
  console.log('='.repeat(50));
  
  if (successCount === totalCount) {
    console.log('\n🎉 所有测试通过！钉钉通知配置正确。');
  } else {
    console.log('\n⚠️  部分测试失败，请检查配置和网络连接。');
  }
}

// 运行测试
main().catch(error => {
  console.error('\n💥 测试过程中发生错误:', error);
  process.exit(1);
});
