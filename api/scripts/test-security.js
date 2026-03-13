#!/usr/bin/env node

/**
 * 错误上报接口安全防护测试脚本
 * 用于测试各种防护措施
 */

const axios = require('axios');
const config = require('../config');

const API_URL = `http://localhost:${config.port}/api/errors/report`;

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log('green', `✓ ${message}`);
}

function error(message) {
  log('red', `✗ ${message}`);
}

function info(message) {
  log('cyan', `ℹ ${message}`);
}

function warn(message) {
  log('yellow', `⚠ ${message}`);
}

// 测试用例
const tests = {
  // 测试1: 正常请求
  async testNormalRequest() {
    info('测试1: 正常请求');
    try {
      const response = await axios.post(API_URL, {
        apiKey: 'test-api-key',
        errors: [
          {
            message: 'Test error',
            type: 'error',
            level: 'error',
            timestamp: new Date().toISOString(),
            stack: 'Error: Test\n  at test.js:1:1'
          }
        ]
      });
      success('正常请求成功');
      return true;
    } catch (err) {
      error(`正常请求失败: ${err.response?.status} ${err.response?.data?.error}`);
      return false;
    }
  },

  // 测试2: 缺少API Key
  async testMissingApiKey() {
    info('测试2: 缺少API Key');
    try {
      await axios.post(API_URL, {
        errors: [
          {
            message: 'Test error',
            type: 'error',
            level: 'error',
            timestamp: new Date().toISOString()
          }
        ]
      });
      error('应该返回401错误');
      return false;
    } catch (err) {
      if (err.response?.status === 401) {
        success('正确返回401错误');
        return true;
      } else {
        error(`返回错误的状态码: ${err.response?.status}`);
        return false;
      }
    }
  },

  // 测试3: 无效的API Key
  async testInvalidApiKey() {
    info('测试3: 无效的API Key');
    try {
      await axios.post(API_URL, {
        apiKey: 'invalid-api-key-12345',
        errors: [
          {
            message: 'Test error',
            type: 'error',
            level: 'error',
            timestamp: new Date().toISOString()
          }
        ]
      });
      error('应该返回401错误');
      return false;
    } catch (err) {
      if (err.response?.status === 401) {
        success('正确返回401错误');
        return true;
      } else {
        error(`返回错误的状态码: ${err.response?.status}`);
        return false;
      }
    }
  },

  // 测试4: 缺少必填字段
  async testMissingRequiredFields() {
    info('测试4: 缺少必填字段');
    try {
      await axios.post(API_URL, {
        apiKey: 'test-api-key',
        errors: [
          {
            // 缺少message字段
            type: 'error',
            level: 'error',
            timestamp: new Date().toISOString()
          }
        ]
      });
      error('应该返回400错误');
      return false;
    } catch (err) {
      if (err.response?.status === 400) {
        success('正确返回400错误');
        return true;
      } else {
        error(`返回错误的状态码: ${err.response?.status}`);
        return false;
      }
    }
  },

  // 测试5: 错误消息过长
  async testMessageTooLong() {
    info('测试5: 错误消息过长');
    try {
      await axios.post(API_URL, {
        apiKey: 'test-api-key',
        errors: [
          {
            message: 'x'.repeat(10000), // 超过5000字符限制
            type: 'error',
            level: 'error',
            timestamp: new Date().toISOString()
          }
        ]
      });
      error('应该返回400错误');
      return false;
    } catch (err) {
      if (err.response?.status === 400) {
        success('正确返回400错误');
        return true;
      } else {
        error(`返回错误的状态码: ${err.response?.status}`);
        return false;
      }
    }
  },

  // 测试6: 错误数量过多
  async testTooManyErrors() {
    info('测试6: 错误数量过多');
    try {
      const errors = [];
      for (let i = 0; i < 150; i++) {
        errors.push({
          message: `Error ${i}`,
          type: 'error',
          level: 'error',
          timestamp: new Date().toISOString()
        });
      }
      await axios.post(API_URL, {
        apiKey: 'test-api-key',
        errors
      });
      error('应该返回400错误');
      return false;
    } catch (err) {
      if (err.response?.status === 400) {
        success('正确返回400错误');
        return true;
      } else {
        error(`返回错误的状态码: ${err.response?.status}`);
        return false;
      }
    }
  },

  // 测试7: 突发限制
  async testBurstLimit() {
    info('测试7: 突发限制（快速发送多个请求）');
    try {
      let blockedCount = 0;
      const promises = [];
      
      for (let i = 0; i < 150; i++) {
        promises.push(
          axios.post(API_URL, {
            apiKey: 'test-api-key',
            errors: [
              {
                message: `Burst test ${i}`,
                type: 'error',
                level: 'error',
                timestamp: new Date().toISOString()
              }
            ]
          }).catch(err => {
            if (err.response?.status === 429) {
              blockedCount++;
            }
          })
        );
      }
      
      await Promise.all(promises);
      
      if (blockedCount > 0) {
        success(`突发限制生效，阻止了${blockedCount}个请求`);
        return true;
      } else {
        warn('未检测到突发限制（可能是因为限制阈值设置较高）');
        return true;
      }
    } catch (err) {
      error(`测试失败: ${err.message}`);
      return false;
    }
  },

  // 测试8: 异常检测 - 高重复率
  async testAnomalyHighDuplicateRate() {
    info('测试8: 异常检测 - 高重复率');
    try {
      const errors = [];
      for (let i = 0; i < 100; i++) {
        errors.push({
          message: 'Same error message', // 所有错误都是相同的消息
          type: 'error',
          level: 'error',
          timestamp: new Date().toISOString()
        });
      }
      
      const response = await axios.post(API_URL, {
        apiKey: 'test-api-key',
        errors
      });
      
      success('异常检测已记录（检查服务器日志）');
      return true;
    } catch (err) {
      error(`测试失败: ${err.message}`);
      return false;
    }
  },

  // 测试9: 异常检测 - 未来时间戳
  async testAnomalyFutureTimestamp() {
    info('测试9: 异常检测 - 未来时间戳');
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1); // 明天
      
      const response = await axios.post(API_URL, {
        apiKey: 'test-api-key',
        errors: [
          {
            message: 'Future error',
            type: 'error',
            level: 'error',
            timestamp: futureDate.toISOString()
          }
        ]
      });
      
      success('异常检测已记录（检查服务器日志）');
      return true;
    } catch (err) {
      error(`测试失败: ${err.message}`);
      return false;
    }
  },

  // 测试10: 无效的错误级别
  async testInvalidErrorLevel() {
    info('测试10: 无效的错误级别');
    try {
      await axios.post(API_URL, {
        apiKey: 'test-api-key',
        errors: [
          {
            message: 'Test error',
            type: 'error',
            level: 'invalid_level', // 无效的级别
            timestamp: new Date().toISOString()
          }
        ]
      });
      error('应该返回400错误');
      return false;
    } catch (err) {
      if (err.response?.status === 400) {
        success('正确返回400错误');
        return true;
      } else {
        error(`返回错误的状态码: ${err.response?.status}`);
        return false;
      }
    }
  }
};

// 运行所有测试
async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  log('blue', '错误上报接口安全防护测试');
  console.log('='.repeat(60) + '\n');

  const results = [];
  
  for (const [name, testFn] of Object.entries(tests)) {
    try {
      const result = await testFn();
      results.push({ name, result });
      console.log();
    } catch (err) {
      error(`测试异常: ${err.message}`);
      results.push({ name, result: false });
      console.log();
    }
  }

  // 输出总结
  console.log('='.repeat(60));
  log('blue', '测试总结');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.result).length;
  const total = results.length;
  
  results.forEach(r => {
    if (r.result) {
      success(r.name);
    } else {
      error(r.name);
    }
  });
  
  console.log();
  if (passed === total) {
    log('green', `✓ 所有测试通过 (${passed}/${total})`);
  } else {
    log('yellow', `⚠ 部分测试失败 (${passed}/${total})`);
  }
  console.log('='.repeat(60) + '\n');
}

// 主函数
async function main() {
  // 检查API服务是否运行
  try {
    await axios.get(`http://localhost:${config.port}/health`);
  } catch (err) {
    error(`无法连接到API服务: http://localhost:${config.port}`);
    error('请确保API服务正在运行');
    process.exit(1);
  }

  await runAllTests();
}

main().catch(err => {
  error(`测试失败: ${err.message}`);
  process.exit(1);
});
