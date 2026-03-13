const axios = require('axios');

async function triggerTestError() {
  try {
    const payload = {
      errors: [{
        type: 'exception',
        status: 0,
        statusText: 'Exception',
        url: 'http://localhost:64194/test',
        method: 'MANUAL',
        message: '钉钉通知测试 - 应该触发告警',
        stack: 'Error: 钉钉通知测试\n    at test.js:1:1',
        level: 'error',
        fingerprint: ['dingtalk-test-' + Date.now()],
        tags: {},
        user: null,
        contexts: {},
        extra: {},
        breadcrumbs: [],
        release: null,
        timestamp: new Date().toISOString(),
        pageUrl: 'http://localhost:64194/test',
        projectId: '69a69b5a6b650638ebe3d896',
        apiKey: 'ec_af9d006b050643d3bd21b39984a4a8172557279feac2d4e95005dfc997ecdf37',
        appName: 'Test App',
        environment: 'development',
        screenResolution: '1920x1080',
        viewportSize: '1293x958',
        browserLanguage: 'zh-CN',
        timezone: 'Asia/Shanghai',
        referrer: '',
        userAgent: 'Mozilla/5.0 Test'
      }],
      batchSize: 1,
      sentAt: new Date().toISOString(),
      appName: 'Test App',
      environment: 'development',
      projectId: '69a69b5a6b650638ebe3d896'
    };

    console.log('发送测试错误...');
    const response = await axios.post('http://localhost:3001/api/errors/report', payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'ec_af9d006b050643d3bd21b39984a4a8172557279feac2d4e95005dfc997ecdf37'
      }
    });

    console.log('✅ 测试错误已发送:', response.data);
    console.log('\n请查看后端控制台日志，应该看到:');
    console.log('  [AlertService] 检查错误的告警规则...');
    console.log('  [AlertService] 找到 X 个启用的告警规则');
    console.log('  [AlertService] 评估告警: LB通用告警');
    console.log('  [AlertService] 🚨 触发告警: LB通用告警');
    console.log('  [AlertService] 发送 dingtalk 通知...');
    console.log('\n如果看到这些日志但没收到钉钉通知，请检查钉钉 Webhook 配置');
  } catch (error) {
    console.error('❌ 发送失败:', error.message);
    if (error.response) {
      console.error('响应:', error.response.data);
    }
  }
}

triggerTestError();
