const axios = require('axios');

async function triggerApiError() {
  try {
    const payload = {
      errors: [{
        type: 'fetch_error',
        status: 404,
        statusText: 'Not Found',
        url: 'https://api.example.com/users/123',
        method: 'GET',
        level: 'error',
        message: 'API 请求失败: 用户不存在',
        stack: 'Error: API 请求失败\n    at fetchUser (api.js:45:15)',
        fingerprint: ['api-error-' + Date.now()],
        tags: {},
        user: null,
        contexts: {},
        extra: {},
        breadcrumbs: [],
        release: null,
        timestamp: new Date().toISOString(),
        pageUrl: 'http://localhost:3000/users/123',
        projectId: '69a69b5a6b650638ebe3d896',
        apiKey: 'ec_af9d006b050643d3bd21b39984a4a8172557279feac2d4e95005dfc997ecdf37',
        appName: 'Test App',
        environment: 'development',
        duration: 1234,
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

    console.log('发送 API 错误测试...');
    const response = await axios.post('http://localhost:3001/api/errors/report', payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'ec_af9d006b050643d3bd21b39984a4a8172557279feac2d4e95005dfc997ecdf37'
      }
    });

    console.log('✅ API 错误已发送:', response.data);
    console.log('\n请检查:');
    console.log('1. 后端控制台日志 - 应该看到告警触发');
    console.log('2. 钉钉通知 - 应该包含 API URL、请求方法、状态码等信息');
    console.log('3. 管理后台错误详情 - 应该显示 API URL 和页面 URL');
  } catch (error) {
    console.error('❌ 发送失败:', error.message);
    if (error.response) {
      console.error('响应:', error.response.data);
    }
  }
}

triggerApiError();
