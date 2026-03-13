# 事件

ErrorCatcher 会捕获以下类型的错误事件：

## 错误类型

### global_error

全局 JavaScript 错误。

```javascript
{
  type: 'global_error',
  message: '错误消息',
  filename: '文件名',
  lineno: 行号,
  colno: 列号,
  error: '错误对象',
  stack: '堆栈信息',
  timestamp: '时间戳',
  pageUrl: '页面URL',
  userAgent: 'User Agent'
}
```

### promise_rejection

未处理的 Promise 拒绝。

```javascript
{
  type: 'promise_rejection',
  reason: '拒绝原因',
  stack: '堆栈信息',
  timestamp: '时间戳',
  pageUrl: '页面URL'
}
```

### fetch / fetch_error

Fetch 请求错误。

```javascript
{
  type: 'fetch',
  status: HTTP状态码,
  statusText: '状态文本',
  url: '请求URL',
  method: '请求方法',
  requestId: '请求ID',
  requestHeaders: {},
  requestBody: '请求体',
  response: '响应内容',
  responseHeaders: {},
  duration: 请求耗时,
  timestamp: '时间戳',
  userAgent: 'User Agent',
  pageUrl: '页面URL',
  referrer: '来源页面'
}
```

### xhr / xhr_error / xhr_timeout / xhr_abort

XMLHttpRequest 错误。

```javascript
{
  type: 'xhr',
  status: HTTP状态码,
  statusText: '状态文本',
  url: '请求URL',
  method: '请求方法',
  requestId: '请求ID',
  requestHeaders: {},
  requestBody: '请求体',
  response: '响应内容',
  responseHeaders: '响应头',
  duration: 请求耗时,
  timestamp: '时间戳',
  userAgent: 'User Agent',
  pageUrl: '页面URL',
  readyState: XMLHttpRequest状态
}
```

### manual

手动上报的错误。

```javascript
{
  type: 'manual',
  status: 0,
  statusText: 'Manual Error',
  url: '页面URL',
  method: 'MANUAL',
  message: '错误消息',
  stack: '堆栈信息',
  context: {},
  timestamp: '时间戳',
  pageUrl: '页面URL'
}
```

## 通用字段

所有错误都会包含以下字段：

```javascript
{
  environment: '环境',
  pageUrl: '页面URL',
  referrer: '来源页面',
  userAgent: 'User Agent',
  timestamp: '时间戳',
  user: {}, // 用户信息（如已设置）
  tags: {}, // 标签（如已设置）
  contexts: {}, // 上下文（如已设置）
  extra: {}, // 额外数据（如已设置）
  breadcrumbs: [] // 面包屑（最多100条）
}
```

## 钩子函数

### beforeSend

在错误发送前调用，可以修改或阻止错误上报。

```javascript
{
  beforeSend(error) {
    // 过滤敏感信息
    if (error.url?.includes('password')) {
      return false; // 阻止上报
    }
    
    // 修改错误数据
    error.customField = 'value';
    return error;
  }
}
```

### onError

错误捕获后的回调。

```javascript
{
  onError(error) {
    console.log('Error captured:', error);
    
    // 可以在这里做额外处理
    // 例如：显示用户提示
    if (error.type === 'fetch' && error.status === 401) {
      alert('登录已过期，请重新登录');
    }
  }
}
```

## 示例

### 监听特定错误类型

```javascript
const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  
  onError(error) {
    switch (error.type) {
      case 'fetch':
        console.log('API 错误:', error.url);
        break;
      case 'global_error':
        console.log('JS 错误:', error.message);
        break;
      case 'promise_rejection':
        console.log('Promise 错误:', error.reason);
        break;
    }
  }
});
```

### 过滤特定错误

```javascript
const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  
  beforeSend(error) {
    // 忽略 404 错误
    if (error.status === 404) {
      return false;
    }
    
    // 忽略特定消息
    if (error.message?.includes('Script error')) {
      return false;
    }
    
    return error;
  }
});
```
