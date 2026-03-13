# Vue 2 集成

⚠️ **注意**: Vue 2 已于 2024 年 12 月 31 日停止维护。建议升级到 Vue 3。

ErrorCatcher 支持 Vue 2，可以自动捕获 Vue 组件错误。

## 安装

```bash
npm install error-catcher
```

## 基础使用

```javascript
import Vue from 'vue';
import ErrorCatcher from 'error-catcher';
import App from './App.vue';

// 创建 ErrorCatcher 实例
const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  vue: Vue,  // 传入 Vue 构造函数
  environment: 'production',
  debug: process.env.NODE_ENV === 'development'
});

// 将 tracker 添加到 Vue 原型
Vue.prototype.$errorTracker = tracker;

new Vue({
  render: h => h(App)
}).$mount('#app');
```

## 升级建议

如果您正在使用 Vue 2，建议升级到 Vue 3 以获得更好的性能和支持。详见 [Vue 3 集成](/frameworks/vue3.md)。

## 在组件中使用

```vue
<template>
  <div>
    <button @click="handleAction">执行操作</button>
  </div>
</template>

<script>
export default {
  name: 'MyComponent',
  
  methods: {
    async handleAction() {
      try {
        await this.fetchData();
      } catch (error) {
        this.$errorTracker.report(error, {
          component: 'MyComponent',
          action: 'handleAction'
        });
      }
    },
    
    async fetchData() {
      const response = await fetch('/api/data');
      return await response.json();
    }
  }
};
</script>
```

## 自动捕获

ErrorCatcher 会自动捕获：

- ✅ Vue 组件错误（通过 `Vue.config.errorHandler`）
- ✅ 全局 JavaScript 错误
- ✅ Promise 未处理的拒绝
- ✅ Fetch/XHR 请求错误

## 完整配置示例

```javascript
import Vue from 'vue';
import ErrorCatcher from 'error-catcher';

const tracker = new ErrorCatcher({
  // 必需配置
  reportUrl: process.env.VUE_APP_ERROR_REPORT_URL,
  projectId: process.env.VUE_APP_ERROR_PROJECT_ID,
  apiKey: process.env.VUE_APP_ERROR_API_KEY,
  
  // Vue 集成
  vue: Vue,
  
  // 基础配置
  environment: process.env.NODE_ENV,
  release: '1.0.0',
  
  // 采样和批量
  sampleRate: 0.8,
  maxBatchSize: 20,
  delay: 2000,
  
  // 功能开关
  debug: process.env.NODE_ENV === 'development',
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
    if (error.url?.includes('password')) {
      return false;
    }
    return error;
  },
  
  onError(error) {
    console.log('Error captured:', error);
  }
});

// 添加到 Vue 原型
Vue.prototype.$errorTracker = tracker;
```

## 使用 Vuex

```javascript
// store/index.js
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    errorTracker: null
  },
  
  mutations: {
    setErrorTracker(state, tracker) {
      state.errorTracker = tracker;
    }
  },
  
  actions: {
    reportError({ state }, { error, context }) {
      state.errorTracker?.report(error, context);
    }
  }
});

// main.js
import store from './store';

const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  vue: Vue
});

store.commit('setErrorTracker', tracker);
```

## 使用 Vue Router

```javascript
import VueRouter from 'vue-router';

const router = new VueRouter({
  // ...
});

// 路由错误处理
router.onError((error) => {
  tracker.report(error, {
    type: 'router_error',
    route: router.currentRoute.path
  });
});

// 路由守卫中的错误处理
router.beforeEach((to, from, next) => {
  try {
    // 你的逻辑
    next();
  } catch (error) {
    tracker.report(error, {
      type: 'navigation_error',
      from: from.path,
      to: to.path
    });
    next(false);
  }
});
```

## API 方法

```javascript
// 手动上报错误
this.$errorTracker.report(error, {
  component: 'MyComponent',
  action: 'handleAction'
});

// 设置用户信息
this.$errorTracker.setUser({
  id: 'user-123',
  username: 'john_doe',
  email: 'john@example.com'
});

// 设置标签
this.$errorTracker.setTag('page', 'checkout');
this.$errorTracker.setTags({
  page: 'checkout',
  version: '1.0.0'
});

// 设置上下文
this.$errorTracker.setContext('device', {
  type: 'mobile',
  os: 'iOS'
});

// 设置额外数据
this.$errorTracker.setExtra('orderId', '12345');

// 添加面包屑
this.$errorTracker.addBreadcrumb({
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

## 最佳实践

### 1. 使用环境变量

```javascript
// .env.production
VUE_APP_ERROR_REPORT_URL=https://api.example.com/api/errors/report
VUE_APP_ERROR_PROJECT_ID=your-project-id
VUE_APP_ERROR_API_KEY=your-api-key
```

### 2. 全局 Mixin

```javascript
Vue.mixin({
  methods: {
    reportError(error, context = {}) {
      this.$errorTracker?.report(error, {
        ...context,
        component: this.$options.name
      });
    }
  }
});

// 使用
this.reportError(error, { action: 'fetchData' });
```

### 3. 异步组件错误处理

```javascript
const AsyncComponent = () => ({
  component: import('./MyComponent.vue'),
  error: ErrorComponent,
  loading: LoadingComponent,
  delay: 200,
  timeout: 3000
});
```

### 4. 全局错误处理

```javascript
Vue.config.errorHandler = (err, vm, info) => {
  // ErrorCatcher 已经自动处理，这里可以添加额外逻辑
  console.error('Global error:', err);
};
```

## 相关文档

- [配置详解](/guide/configuration)
- [API 方法](/api/methods)
- [最佳实践](/guide/best-practices)

