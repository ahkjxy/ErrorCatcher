#!/usr/bin/env node

/**
 * 测试 AI 配置 API
 * 
 * 使用方法:
 * node api/scripts/test-ai-config.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001';

// 管理员登录凭证
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

let authToken = '';

// 登录获取 token
async function login() {
  try {
    console.log('🔐 登录中...');
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD
    });
    
    authToken = response.data.token;
    console.log('✅ 登录成功\n');
    return true;
  } catch (error) {
    console.error('❌ 登录失败:', error.response?.data || error.message);
    return false;
  }
}

// 获取当前 AI 配置
async function getAIConfig() {
  try {
    console.log('📋 获取 AI 配置...');
    const response = await axios.get(`${API_URL}/api/ai/config`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ 当前配置:');
    console.log('   - 启用状态:', response.data.enabled ? '已启用' : '未启用');
    console.log('   - 模型:', response.data.model || '未配置');
    console.log('   - API URL:', response.data.apiUrl || '未配置');
    console.log('   - API Key:', response.data.hasApiKey ? `已配置 (${response.data.apiKeyPreview})` : '未配置');
    console.log('');
    return response.data;
  } catch (error) {
    console.error('❌ 获取配置失败:', error.response?.data || error.message);
    return null;
  }
}

// 更新 AI 配置
async function updateAIConfig(config) {
  try {
    console.log('💾 更新 AI 配置...');
    const response = await axios.put(`${API_URL}/api/ai/config`, config, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ 配置更新成功:', response.data.message);
    console.log('   - 启用状态:', response.data.enabled ? '已启用' : '未启用');
    console.log('   - 模型:', response.data.model);
    console.log('');
    return true;
  } catch (error) {
    console.error('❌ 更新配置失败:', error.response?.data || error.message);
    return false;
  }
}

// 测试 AI 配置
async function testAIConfig() {
  try {
    console.log('🧪 测试 AI 配置...');
    const response = await axios.post(`${API_URL}/api/ai/config/test`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ 测试成功:', response.data.message);
    console.log('   - 模型:', response.data.model);
    console.log('');
    return true;
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
    return false;
  }
}

// 主函数
async function main() {
  console.log('='.repeat(60));
  console.log('AI 配置 API 测试');
  console.log('='.repeat(60));
  console.log('');

  // 1. 登录
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ 无法继续测试，登录失败');
    process.exit(1);
  }

  // 2. 获取当前配置
  const currentConfig = await getAIConfig();

  // 3. 更新配置（如果提供了环境变量）
  if (process.env.OPENAI_API_KEY) {
    console.log('🔧 检测到 OPENAI_API_KEY 环境变量，尝试更新配置...\n');
    await updateAIConfig({
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      apiUrl: process.env.OPENAI_API_URL || 'https://api.openai.com/v1'
    });

    // 重新获取配置
    await getAIConfig();

    // 4. 测试配置
    await testAIConfig();
  } else {
    console.log('ℹ️  提示: 设置 OPENAI_API_KEY 环境变量可以测试配置更新和连接测试');
    console.log('   例如: OPENAI_API_KEY=sk-xxx node api/scripts/test-ai-config.js\n');
  }

  console.log('='.repeat(60));
  console.log('测试完成');
  console.log('='.repeat(60));
}

// 运行测试
main().catch(error => {
  console.error('❌ 测试过程中发生错误:', error);
  process.exit(1);
});
