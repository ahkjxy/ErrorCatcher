# Vue 3 集成

ErrorCatcher 支持 Vue 3，可以自动捕获 Vue 组件错误。

## 安装

```bash
npm install error-catcher
```

## 基础使用

```javascript
import { createApp } from 'vue';
import ErrorCatcher from 'error-catcher';
import App from './App.vue';

const app = createApp(App);

// 创建 ErrorCatcher 实例
const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  vue: app,  // 传入 Vue 应用实例
  environment: 'production',
  debug: import.meta.env.DEV
});

// 将 tracker 注入到应用中（可选）
app.provide('errorTracker', tracker);

app.mount('#app');
```

## 在组件中使用

### Composition API

```vue
<script setup>
import { inject } from 'vue';

const errorTracker = inject('errorTracker');

const handleAction = async () => {
  try {
    await someAsyncOperation();
  } catch (error) {
    errorTracker.report(error, {
      component: 'MyComponent',
      action: 'handleAction'
    });
  }
};
</script>
```

### Options API

```vue
<script>
export default {
  inject: ['errorTracker'],
  
  methods: {
    handleAction() {
      try {
        // 你的代码
      } catch (error) {
        this.errorTracker.report(error, {
          component: 'MyComponent'
        });
      }
    }
  }
};
</script>
```

## 自动捕获

ErrorCatcher 会自动捕获 Vue 组件错误、全局 JavaScript 错误、Promise 拒绝和网络请求错误。详见 [自动捕获功能](/guide/auto-capture.md)。

## 完整配置示例

```javascript
import { createApp } from 'vue';
import ErrorCatcher from 'error-catcher';
import App from './App.vue';

const app = createApp(App);

const tracker = new ErrorCatcher({
  // 必需配置
  reportUrl: import.meta.env.VITE_ERROR_REPORT_URL,
  projectId: import.meta.env.VITE_ERROR_PROJECT_ID,
  apiKey: import.meta.env.VITE_ERROR_API_KEY,
  
  // Vue 集成
  vue: app,
  
  // 基础配置
  environment: import.meta.env.MODE,
  release: '1.0.0',
  
  // 采样和批量
  sampleRate: 0.8,
  maxBatchSize: 20,
  delay: 2000,
  
  // 功能开关
  debug: import.meta.env.DEV,
  autoStart: true,
  autoIntegrate: true,
  
  // 高级配置
  ignoreUrls: [
    /analytics/,
    /tracking/,
    /\.(jpg|png|gif)$/
  ],
  
  // 钩子函数
  beforeSend(error) {
    // 过滤敏感信息
    if (error.url?.includes('password')) {
      return false;
    }
    return error;
  },
  
  onError(error) {
    console.log('Error captured:', error);
  }
});

// 注入到应用
app.provide('errorTracker', tracker);

app.mount('#app');
```

## 使用 Pinia

```javascript
// stores/error.js
import { defineStore } from 'pinia';
import { inject } from 'vue';

export const useErrorStore = defineStore('error', () => {
  const errorTracker = inject('errorTracker');
  
  function reportError(error, context) {
    errorTracker?.report(error, context);
  }
  
  return { reportError };
});
```

## 使用 Vue Router

```javascript
import { createRouter } from 'vue-router';

const router = createRouter({
  // ...
});

// 路由错误处理
router.onError((error) => {
  tracker.report(error, {
    type: 'router_error',
    route: router.currentRoute.value.path
  });
});

// 路由守卫中的错误处理
router.beforeEach(async (to, from) => {
  try {
    // 你的逻辑
  } catch (error) {
    tracker.report(error, {
      type: 'navigation_error',
      from: from.path,
      to: to.path
    });
  }
});
```

## API 方法

详见 [错误上下文结构](/guide/error-context.md) 了解完整的 API 方法和上下文结构。

常用方法：

```javascript
// 手动上报错误
tracker.report(error, {
  component: 'MyComponent',
  action: 'handleAction'
});

// 设置用户信息
tracker.setUser({
  id: 'user-123',
  username: 'john_doe',
  email: 'john@example.com'
});

// 设置标签
tracker.setTag('page', 'checkout');
tracker.setTags({
  page: 'checkout',
  version: '1.0.0'
});

// 添加面包屑
tracker.addBreadcrumb({
  category: 'navigation',
  message: 'User navigated to checkout',
  level: 'info'
});
```

## 自动捕获的数据

ErrorCatcher 会自动捕获以下信息：

### Vue 组件错误
- `type`: 'vue_error'
- `componentName`: 组件名称
- `lifecycle`: 生命周期钩子名称
- `message`: 错误消息
- `stack`: 错误堆栈

### API 错误
- `url`: 请求地址
- `method`: 请求方法
- `status`: HTTP 状态码
- `statusText`: 状态文本
- `response`: 响应内容
- `duration`: 请求耗时

### 浏览器信息
- `userAgent`: 用户代理
- `pageUrl`: 当前页面 URL

### 时间信息
- `timestamp`: 错误发生时间

## TypeScript 支持

```typescript
import { App } from 'vue';
import ErrorCatcher from 'error-catcher';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    errorTracker: ErrorCatcher;
  }
}

// 使用
const app: App = createApp(App);
const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  vue: app
});
```

## 最佳实践

### 1. 使用环境变量

```javascript
// .env.production
VITE_ERROR_REPORT_URL=https://api.example.com/api/errors/report
VITE_ERROR_PROJECT_ID=your-project-id
VITE_ERROR_API_KEY=your-api-key
```

### 2. 异步组件错误处理

```javascript
const AsyncComponent = defineAsyncComponent({
  loader: () => import('./MyComponent.vue'),
  errorComponent: ErrorComponent,
  onError(error, retry, fail) {
    tracker.report(error, {
      type: 'async_component_error',
      component: 'AsyncComponent'
    });
    fail();
  }
});
```

### 3. 全局错误处理

```javascript
app.config.errorHandler = (err, instance, info) => {
  // ErrorCatcher 已经自动处理，这里可以添加额外逻辑
  console.error('Global error:', err);
};
```

## 相关文档

- [配置详解](/guide/configuration)
- [API 方法](/api/methods)
- [最佳实践](/guide/best-practices)
