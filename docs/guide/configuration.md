# 配置详解

## 构造函数

```javascript
const tracker = new ErrorCatcher(config);
```

## 必需配置

### reportUrl

- 类型: `string`
- 必填: 是
- 别名: `dsn`

错误上报的 API 地址。

```javascript
{
  reportUrl: 'http://your-api.com/api/errors/report'
}
```

### projectId

- 类型: `string`
- 必填: 是

项目ID，用于标识不同的项目。

```javascript
{
  projectId: 'your-project-id'
}
```

### apiKey

- 类型: `string`
- 必填: 是

API 密钥，用于身份验证。

```javascript
{
  apiKey: 'your-api-key'
}
```

## 基础配置

### environment

- 类型: `string`
- 默认值: `'production'`

环境标识，如 `production`、`development`、`test`、`staging`。

```javascript
{
  environment: process.env.NODE_ENV
}
```

### release

- 类型: `string`
- 默认值: `null`

版本号，用于追踪不同版本的错误。

```javascript
{
  release: '1.0.0'
}
```

## 采样和批量

### sampleRate

- 类型: `number`
- 默认值: `1`
- 范围: `0-1`

错误采样率，1 表示 100% 上报，0.5 表示 50% 上报。

```javascript
{
  sampleRate: 0.5 // 50% 采样
}
```

### maxBatchSize

- 类型: `number`
- 默认值: `10`

批量上报的最大错误数量。达到此数量时立即发送。

```javascript
{
  maxBatchSize: 20
}
```

### delay

- 类型: `number`
- 默认值: `1000`

批量上报的延迟时间（毫秒）。定时检查并发送错误队列。

```javascript
{
  delay: 2000 // 2秒
}
```

### maxRetries

- 类型: `number`
- 默认值: `3`

上报失败时的最大重试次数。

```javascript
{
  maxRetries: 5
}
```

## 功能开关

### debug

- 类型: `boolean`
- 默认值: `false`

是否在控制台打印调试信息。

```javascript
{
  debug: true
}
```

### autoStart

- 类型: `boolean`
- 默认值: `true`

是否自动启动监控。设为 `false` 时需要手动调用 `init()`。

```javascript
{
  autoStart: false
}
```

### autoIntegrate

- 类型: `boolean`
- 默认值: `true`

是否自动检测并集成框架（Vue、React、jQuery、axios 等）。

```javascript
{
  autoIntegrate: true
}
```

## 框架集成

### vue

- 类型: `Vue | App | null`
- 默认值: `null`

Vue 实例或应用实例。传入后会自动捕获 Vue 组件错误。

```javascript
// Vue 2
import Vue from 'vue';
{
  vue: Vue
}

// Vue 3
import { createApp } from 'vue';
const app = createApp(App);
{
  vue: app
}
```

### react

- 类型: `boolean`
- 默认值: `false`

是否启用 React 集成。

```javascript
{
  react: true
}
```

### axios

- 类型: `AxiosInstance | null`
- 默认值: `null`

axios 实例。传入后会自动拦截 axios 请求错误。

```javascript
import axios from 'axios';
{
  axios: axios
}
```

### jquery

- 类型: `boolean`
- 默认值: `false`

是否启用 jQuery 集成。设为 `true` 或自动检测到 jQuery 时会拦截 `$.ajax` 错误。

```javascript
{
  jquery: true
}
```

### router

- 类型: `Router | null`
- 默认值: `null`

路由实例（Vue Router、React Router 等）。

```javascript
{
  router: router
}
```

## 高级配置

### ignoreUrls

- 类型: `Array<string | RegExp>`
- 默认值: `[/\.(jpg|jpeg|png|gif|svg|css|woff|woff2|ttf|eot)$/i, '/favicon.ico']`

忽略特定 URL 的错误。支持字符串和正则表达式。

```javascript
{
  ignoreUrls: [
    '/health',
    '/metrics',
    /analytics/,
    /\.(jpg|png|gif)$/i
  ]
}
```

## 钩子函数

### beforeSend

- 类型: `Function`
- 参数: `(error: ErrorData) => ErrorData | false`

发送前处理错误数据，返回 `false` 可阻止上报。

```javascript
{
  beforeSend(error) {
    // 过滤敏感信息
    if (error.url?.includes('password')) {
      return false;
    }
    
    // 修改错误数据
    error.customField = 'value';
    return error;
  }
}
```

### onError

- 类型: `Function`
- 参数: `(error: ErrorData) => void`

错误捕获后的回调。

```javascript
{
  onError(error) {
    console.log('Error captured:', error);
    // 可以在这里做额外处理
  }
}
```

## SSR 配置

### fetch

- 类型: `Function | null`
- 默认值: `null`

Node.js 环境的 fetch 实现（如 `node-fetch`）。

```javascript
import fetch from 'node-fetch';
{
  fetch: fetch
}
```

## 完整配置示例

```javascript
const tracker = new ErrorCatcher({
  // 必需配置
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  
  // 基础配置
  environment: 'production',
  release: '1.0.0',
  
  // 采样和批量
  sampleRate: 0.8,
  maxBatchSize: 20,
  delay: 2000,
  maxRetries: 5,
  
  // 功能开关
  debug: false,
  autoStart: true,
  autoIntegrate: true,
  
  // 框架集成
  vue: app,
  react: false,
  axios: axios,
  jquery: false,
  router: router,
  
  // 高级配置
  ignoreUrls: [
    '/health',
    /analytics/,
    /\.(jpg|png|gif)$/i
  ],
  
  // 钩子函数
  beforeSend(error) {
    // 过滤敏感信息
    if (error.url?.includes('sensitive')) {
      return false;
    }
    return error;
  },
  
  onError(error) {
    console.log('Error captured:', error);
  }
});
```

## 环境变量配置

建议使用环境变量管理敏感配置：

```bash
# .env
ERROR_REPORT_URL=http://your-api.com/api/errors/report
ERROR_PROJECT_ID=your-project-id
ERROR_API_KEY=your-api-key
NODE_ENV=production
```

在代码中使用：

```javascript
const tracker = new ErrorCatcher({
  reportUrl: process.env.ERROR_REPORT_URL,
  projectId: process.env.ERROR_PROJECT_ID,
  apiKey: process.env.ERROR_API_KEY,
  environment: process.env.NODE_ENV
});
```

## 自动捕获的数据

ErrorCatcher 会自动捕获以下信息，无需在配置中手动添加：

### API 错误自动捕获
- `type` - 错误类型（fetch_error, xhr_error, axios_error 等）
- `url` - 请求地址（完整 URL，包含查询参数）
- `method` - 请求方法（GET, POST, PUT, DELETE 等）
- `status` - HTTP 状态码
- `statusText` - 状态文本
- `requestHeaders` - 请求头（axios）
- `requestBody` - 请求体（axios）
- `response` - 响应内容（截断至 2000 字符）
- `responseHeaders` - 响应头（axios）
- `duration` - 请求耗时（毫秒）

### 浏览器信息自动捕获
- `userAgent` - 用户代理字符串
- `pageUrl` - 当前页面 URL

### 错误信息自动捕获
- `message` - 错误消息
- `stack` - 错误堆栈
- `filename` - 错误文件
- `lineno` - 错误行号
- `colno` - 错误列号

### 时间信息自动捕获
- `timestamp` - 错误发生时间（ISO 8601 格式）

### 配置信息自动添加
- `projectId` - 项目 ID
- `apiKey` - API 密钥
- `environment` - 环境
- `release` - 版本号

::: tip
由于这些信息会自动捕获，在手动上报错误时无需重复添加。
:::
