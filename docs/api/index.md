# API 参考

ErrorCatcher 提供了完整的 API 接口，用于配置、控制和扩展错误监控功能。

## 快速导航

- **[方法](/api/methods)** - 所有可用的 API 方法
- **[事件](/api/events)** - 事件和钩子函数
- **[详细错误捕获](/api/detailed-error-capture)** - 自动捕获的详细信息

## 核心 API

### ErrorCatcher 类

ErrorCatcher 是主要的类，用于初始化和管理错误监控。

```javascript
import ErrorCatcher from './src/core/ErrorCatcher.js';

const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id'
});
```

## 公开方法（9 个）

| 方法 | 说明 |
|------|------|
| `init()` | 初始化错误监控 |
| `destroy()` | 销毁实例并停止监控 |
| `report(error, context)` | 手动上报错误 |
| `setUser(user)` | 设置用户信息 |
| `setTag(key, value)` | 设置单个标签 |
| `setTags(tags)` | 批量设置标签 |
| `setContext(key, value)` | 设置上下文 |
| `setExtra(key, value)` | 设置额外数据 |
| `addBreadcrumb(breadcrumb)` | 添加面包屑 |

## 只读属性（4 个）

| 属性 | 说明 |
|------|------|
| `config` | 配置对象 |
| `initialized` | 初始化状态 |
| `isServer` | 服务端环境标志 |
| `isBrowser` | 浏览器环境标志 |

## 全局函数（1 个）

| 函数 | 说明 |
|------|------|
| `initErrorTracker(config)` | 便捷初始化函数 |

## 配置选项（20 个）

完整的配置选项请查看 [配置指南](/guide/configuration)。

### 必需配置

- `reportUrl` - 错误上报地址
- `projectId` - 项目 ID

### 可选配置

- `apiKey` - API 密钥
- `environment` - 环境标识
- `release` - 版本号
- `sampleRate` - 采样率
- `maxBatchSize` - 批量大小
- `delay` - 发送延迟
- `maxRetries` - 最大重试次数
- `debug` - 调试模式
- `autoStart` - 自动启动
- `autoIntegrate` - 自动集成框架
- `vue` - Vue 实例
- `react` - React 集成
- `axios` - axios 实例
- `jquery` - jQuery 集成
- `router` - 路由实例
- `ignoreUrls` - 忽略的 URL
- `beforeSend` - 发送前钩子
- `onError` - 错误回调
- `fetch` - 自定义 fetch

## 自动捕获的错误类型（10 个）

ErrorCatcher 会自动捕获以下类型的错误：

- `global_error` - 全局 JavaScript 错误
- `promise_rejection` - Promise 拒绝
- `fetch_error` - Fetch API 错误
- `fetch_network_error` - Fetch 网络错误
- `xhr_error` - XMLHttpRequest 错误
- `xhr_network_error` - XMLHttpRequest 网络错误
- `axios_error` - Axios 错误
- `axios_network_error` - Axios 网络错误
- `jquery_ajax_error` - jQuery Ajax 错误
- `vue_error` - Vue 组件错误

## 下一步

- [查看所有方法](/api/methods)
- [查看事件和钩子](/api/events)
- [了解详细错误捕获](/api/detailed-error-capture)
- [配置选项详解](/guide/configuration)
