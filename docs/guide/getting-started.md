# 快速开始

ErrorCatcher 是一个通用的前端错误监控 SDK，支持所有主流框架，零依赖，自动集成。

## 安装

详细的安装说明请查看 [安装指南](/guide/installation)。

快速开始（本地开发）：

```javascript
// 方式 1：导入源代码
import ErrorCatcher from './src/core/ErrorCatcher.js';

// 方式 2：导入 dist 文件
import ErrorCatcher from './dist/error-catcher.esm.js';

const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id'
});
```

## 基础使用

## 框架集成

ErrorCatcher 支持自动检测和集成所有主流框架，无需额外配置。

详细的框架集成指南请查看：

- [Vue 2 集成](/frameworks/vue2)
- [Vue 3 集成](/frameworks/vue3)
- [React 集成](/frameworks/react)
- [Nuxt 2 集成](/frameworks/nuxt2)
- [Nuxt 3 集成](/frameworks/nuxt3)
- [Next.js 集成](/frameworks/nextjs)
- [jQuery 集成](/frameworks/jquery)
- [PHP 集成](/frameworks/php)

## 自动捕获

ErrorCatcher 会自动捕获以下类型的错误：

- JavaScript 运行时错误
- Promise Rejections
- Fetch API 错误
- XMLHttpRequest 错误
- Axios 错误（需要传入 axios 实例）
- jQuery Ajax 错误（自动检测）
- Vue 组件错误（传入 Vue 实例后）

详细信息请查看 [自动捕获功能](/guide/auto-capture)

## 手动上报

除了自动捕获，你也可以手动上报错误：

```javascript
try {
  // 你的代码
  await fetchData();
} catch (error) {
  tracker.report(error, {
    type: 'manual',
    action: 'fetchData',
    component: 'UserProfile',
    extra: {
      userId: '123',
      timestamp: Date.now()
    }
  });
}
```

## 配置选项

完整的配置选项请查看 [配置指南](/guide/configuration)。

基础配置示例：

```javascript
const tracker = new ErrorCatcher({
  // 必需配置
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  
  // 环境配置
  environment: 'production',
  release: '1.0.0',
  
  // 采样和性能
  sampleRate: 1,        // 采样率 (0-1)
  maxBatchSize: 10,     // 批量大小
  delay: 1000,          // 批量延迟（毫秒）
  
  // 框架集成
  vue: null,            // Vue 实例
  react: false,         // 启用 React
  axios: null,          // axios 实例
  jquery: false         // 启用 jQuery
});
```

## 下一步

- [完整配置选项](/guide/configuration)
- [API 方法参考](/api/methods)
- [框架集成指南](/frameworks/)
- [最佳实践](/guide/best-practices)
