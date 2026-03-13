# 最佳实践

## 配置建议

### 1. 使用环境变量

```javascript
const tracker = initErrorTracker({
  reportUrl: process.env.VUE_APP_ERROR_REPORT_URL,
  projectId: process.env.VUE_APP_PROJECT_ID,
  environment: process.env.NODE_ENV,
  debug: process.env.NODE_ENV === 'development'
});
```

### 2. 设置合理的采样率

生产环境可以降低采样率以减少服务器负载：

```javascript
{
  sampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 1
}
```

### 3. 忽略不重要的错误

```javascript
{
  ignoreUrls: [
    /analytics/,
    /tracking/,
    /\.(jpg|png|gif|svg)$/,
    '/health',
    '/favicon.ico'
  ],
  
  beforeSend(error) {
    // 忽略 404
    if (error.status === 404) return false;
    
    // 忽略跨域脚本错误
    if (error.message === 'Script error.') return false;
    
    return error;
  }
}
```

## 错误处理

### 1. 异步操作错误处理

```javascript
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    return await response.json();
  } catch (error) {
    tracker.report(error, {
      action: 'fetchData',
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}
```

### 2. 组件错误边界

React:
```jsx
<ErrorBoundary
  fallback={<ErrorPage />}
>
  <App />
</ErrorBoundary>
```

Vue:
```javascript
app.config.errorHandler = (err, instance, info) => {
  tracker.report(err, {
    component: instance?.$options?.name,
    lifecycle: info
  });
};
```

### 3. 手动上报关键错误

```javascript
function criticalOperation() {
  try {
    // 关键操作
  } catch (error) {
    tracker.report(error, {
      critical: true,
      operation: 'criticalOperation',
      userId: currentUser.id
    });
    
    // 显示用户友好的错误提示
    showErrorMessage('操作失败，请稍后重试');
  }
}
```

## 性能优化

### 1. 批量上报

```javascript
{
  maxBatchSize: 20,
  delay: 2000
}
```

### 2. 延迟初始化

```javascript
// 等待页面加载完成后初始化
window.addEventListener('load', () => {
  const tracker = initErrorTracker({
    reportUrl: 'http://your-api.com/api/errors/report',
    projectId: 'your-project-id'
  });
});
```

### 3. 使用 Web Worker（高级）

```javascript
// 在 Web Worker 中处理错误上报
const worker = new Worker('error-reporter.js');

tracker.config.beforeSend = (error) => {
  worker.postMessage({ type: 'report', error });
  return false; // 阻止默认上报
};
```

## 安全建议

### 1. 过滤敏感信息

```javascript
{
  beforeSend(error) {
    // 移除敏感字段
    if (error.requestBody) {
      const body = JSON.parse(error.requestBody);
      delete body.password;
      delete body.token;
      error.requestBody = JSON.stringify(body);
    }
    
    // 过滤 URL 参数
    if (error.url) {
      error.url = error.url.replace(/token=[^&]+/, 'token=***');
    }
    
    return error;
  }
}
```

### 2. 使用 HTTPS

```javascript
{
  reportUrl: 'https://your-api.com/api/errors/report'
}
```

### 3. 验证上报来源

后端 API：
```javascript
app.post('/api/errors/report', (req, res) => {
  // 验证来源
  const origin = req.headers.origin;
  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // 处理错误
});
```

## 监控策略

### 1. 设置告警

```javascript
// 后端检测错误频率
const errorCount = await Error.countDocuments({
  projectId: 'your-project-id',
  timestamp: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
});

if (errorCount > 100) {
  sendAlert('错误频率过高');
}
```

### 2. 错误分级

```javascript
{
  onError(error) {
    const level = getErrorLevel(error);
    
    if (level === 'critical') {
      // 立即通知
      sendImmediateAlert(error);
    }
  }
}

function getErrorLevel(error) {
  if (error.status >= 500) return 'critical';
  if (error.status >= 400) return 'warning';
  return 'info';
}
```

### 3. 用户反馈

```javascript
{
  onError(error) {
    if (error.type === 'fetch' && error.status >= 500) {
      showUserFeedback('服务暂时不可用，我们正在处理');
    }
  }
}
```

## 测试

### 1. 测试错误捕获

```javascript
// 测试 JS 错误
function testJsError() {
  throw new Error('Test error');
}

// 测试 Promise 错误
function testPromiseError() {
  Promise.reject(new Error('Test promise error'));
}

// 测试 API 错误
async function testApiError() {
  await fetch('/api/not-found');
}
```

### 2. 验证上报

```javascript
const tracker = initErrorTracker({
  reportUrl: '/api/errors/report',
  debug: true, // 开启调试模式
  onError(error) {
    console.log('Error reported:', error);
  }
});
```

## 维护

### 1. 定期清理旧数据

```javascript
// 删除 30 天前的错误
await Error.deleteMany({
  timestamp: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
});
```

### 2. 监控存储空间

```javascript
const stats = await Error.aggregate([
  {
    $group: {
      _id: null,
      totalSize: { $sum: { $bsonSize: '$$ROOT' } },
      count: { $sum: 1 }
    }
  }
]);
```

### 3. 定期审查错误

- 每周查看高频错误
- 标记已解决的错误
- 更新忽略规则
