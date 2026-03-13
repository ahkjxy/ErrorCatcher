# API 参考

ErrorCatcher 提供了丰富的 API 接口，用于配置、控制和扩展错误监控功能。

## 核心 API

### ErrorCatcher 类

ErrorCatcher 是主要的类，用于初始化和管理错误监控。

```javascript
import ErrorCatcher from 'error-catcher';

const errorCatcher = new ErrorCatcher(config);
```

## API 文档

### [方法 API](/api/methods)

ErrorCatcher 实例提供的所有方法：

- `init()` - 初始化错误监控
- `report()` - 手动上报错误
- `setUser()` - 设置用户信息
- `setTag()` / `setTags()` - 设置标签
- `setContext()` - 设置上下文
- `setExtra()` - 设置额外数据
- `addBreadcrumb()` - 添加面包屑
- `destroy()` - 销毁实例

[查看完整方法文档 →](/api/methods)

### [事件 API](/api/events)

ErrorCatcher 支持的事件和钩子：

- `beforeSend` - 发送前钩子
- `onError` - 错误捕获回调

[查看完整事件文档 →](/api/events)

## 配置选项

完整的配置选项请查看 [配置指南](/guide/configuration)。

### 基础配置

```javascript
{
  reportUrl: string,      // 错误上报地址
  projectId: string,      // 项目 ID
  apiKey: string,         // API 密钥（可选）
  environment: string,    // 环境标识
  release: string,        // 版本号
  debug: boolean          // 调试模式
}
```

### 框架集成

```javascript
{
  vue: VueApp,           // Vue 实例
  react: boolean,        // React 集成
  axios: AxiosInstance,  // axios 实例
  jquery: boolean,       // jQuery 集成
  router: Router         // 路由实例
}
```

### 高级配置

```javascript
{
  sampleRate: number,        // 采样率 (0-1)
  maxBatchSize: number,      // 批量大小
  delay: number,             // 发送延迟
  maxRetries: number,        // 最大重试次数
  ignoreUrls: Array,         // 忽略的 URL
  beforeSend: Function,      // 发送前钩子
  onError: Function          // 错误回调
}
```

## 快速示例

### 基础使用

```javascript
import ErrorCatcher from 'error-catcher';

const errorCatcher = new ErrorCatcher({
  reportUrl: 'https://api.example.com/errors',
  projectId: 'my-project',
  environment: 'production'
});
```

### Vue 集成

```javascript
import { createApp } from 'vue';
import ErrorCatcher from 'error-catcher';

const app = createApp(App);

new ErrorCatcher({
  reportUrl: 'https://api.example.com/errors',
  projectId: 'my-project',
  vue: app
});
```

### 手动上报

```javascript
try {
  // 可能出错的代码
  riskyOperation();
} catch (error) {
  errorCatcher.report(error, {
    type: 'manual',
    extra: { operation: 'riskyOperation' }
  });
}
```

### 设置用户信息

```javascript
errorCatcher.setUser({
  id: '12345',
  username: 'john_doe',
  email: 'john@example.com'
});
```

### 添加标签

```javascript
// 单个标签
errorCatcher.setTag('page', 'checkout');

// 多个标签
errorCatcher.setTags({
  page: 'checkout',
  feature: 'payment'
});
```

### 添加面包屑

```javascript
errorCatcher.addBreadcrumb({
  category: 'user_action',
  message: 'User clicked submit button',
  level: 'info',
  data: { formId: 'checkout-form' }
});
```

## TypeScript 支持

ErrorCatcher 提供完整的 TypeScript 类型定义：

```typescript
import ErrorCatcher, { ErrorCatcherConfig } from 'error-catcher';

const config: ErrorCatcherConfig = {
  reportUrl: 'https://api.example.com/errors',
  projectId: 'my-project',
  environment: 'production'
};

const errorCatcher = new ErrorCatcher(config);
```

## 浏览器兼容性

ErrorCatcher 支持所有现代浏览器：

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- iOS Safari 11+
- Android Chrome 60+

对于旧版浏览器，需要以下 polyfills：
- Promise
- fetch (如果使用 fetch 拦截)

## 下一步

- [查看方法 API](/api/methods) - 了解所有可用方法
- [查看事件 API](/api/events) - 了解事件和钩子
- [配置指南](/guide/configuration) - 详细的配置说明
- [最佳实践](/guide/best-practices) - 使用建议和技巧
