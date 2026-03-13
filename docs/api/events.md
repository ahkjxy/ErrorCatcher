# 事件 API

ErrorCatcher 支持的事件和钩子函数。

## 钩子函数

### beforeSend

在错误发送前调用，可以修改或阻止错误上报。

**参数**: `(error: ErrorData) => ErrorData | false`

**返回值**:
- 返回修改后的 error 对象 - 继续上报
- 返回 `false` - 阻止上报

**示例**:

```javascript
const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  
  beforeSend(error) {
    // 过滤敏感信息
    if (error.url?.includes('password')) {
      return false; // 不上报
    }
    
    // 修改错误数据
    if (error.requestBody) {
      const body = JSON.parse(error.requestBody);
      delete body.password;
      delete body.token;
      error.requestBody = JSON.stringify(body);
    }
    
    return error; // 上报修改后的错误
  }
});
```

### onError

错误捕获后的回调函数。

**参数**: `(error: ErrorData) => void`

**示例**:

```javascript
const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  
  onError(error) {
    console.log('Error captured:', error);
    
    // 可以在这里做额外处理
    if (error.type === 'fetch' && error.status === 401) {
      // 处理认证错误
      window.location.href = '/login';
    }
  }
});
```

## 错误类型

ErrorCatcher 会自动捕获以下类型的错误：

### global_error

全局 JavaScript 错误。

```javascript
{
  type: 'global_error',
  message: '错误消息',
  filename: '文件名',
  lineno: 行号,
  colno: 列号,
  stack: '堆栈信息'
}
```

### promise_rejection

未处理的 Promise 拒绝。

```javascript
{
  type: 'promise_rejection',
  reason: '拒绝原因',
  stack: '堆栈信息'
}
```

### fetch_error / fetch_network_error

Fetch 请求错误。

```javascript
{
  type: 'fetch_error',
  url: '请求地址',
  method: '请求方法',
  status: HTTP状态码,
  statusText: '状态文本',
  response: '响应内容',
  duration: 请求耗时
}
```

### xhr_error / xhr_network_error

XMLHttpRequest 错误。

```javascript
{
  type: 'xhr_error',
  url: '请求地址',
  method: '请求方法',
  status: HTTP状态码,
  statusText: '状态文本',
  response: '响应内容',
  duration: 请求耗时
}
```

### axios_error / axios_network_error

Axios 错误。

```javascript
{
  type: 'axios_error',
  url: '请求地址',
  method: '请求方法',
  status: HTTP状态码,
  statusText: '状态文本',
  response: '响应内容',
  duration: 请求耗时
}
```

### jquery_ajax_error

jQuery Ajax 错误。

```javascript
{
  type: 'jquery_ajax_error',
  url: '请求地址',
  method: '请求方法',
  status: HTTP状态码,
  statusText: '状态文本',
  response: '响应内容'
}
```

### vue_error

Vue 组件错误。

```javascript
{
  type: 'vue_error',
  componentName: '组件名称',
  lifecycle: '生命周期钩子',
  message: '错误消息',
  stack: '错误堆栈'
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

## 使用示例

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

## 下一步

- [查看所有方法](/api/methods)
- [了解详细错误捕获](/api/detailed-error-capture)
- [配置选项详解](/guide/configuration)
