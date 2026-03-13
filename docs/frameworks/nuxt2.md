# Nuxt 2 集成

ErrorCatcher 支持 Nuxt 2，可以在客户端和服务端安全运行。

## 安装

```bash
npm install error-catcher
```

## 创建插件

创建 `plugins/error-catcher.client.js`：

```javascript
import ErrorCatcher from 'error-catcher';

export default function({ $config, app }, inject) {
  const tracker = new ErrorCatcher({
    reportUrl: $config.errorCatcher.reportUrl,
    projectId: $config.errorCatcher.projectId,
    apiKey: $config.errorCatcher.apiKey,
    vue: app,  // 传入 Nuxt 应用实例
    environment: $config.errorCatcher.environment,
    debug: $config.errorCatcher.debug
  });
  
  // 注入到 context 和 Vue 实例
  inject('errorTracker', tracker);
}
```

## 配置 nuxt.config.js

```javascript
export default {
  // 注册插件
  plugins: [
    { src: '~/plugins/error-catcher.client.js', mode: 'client' }
  ],
  
  // 公共运行时配置
  publicRuntimeConfig: {
    errorCatcher: {
      reportUrl: process.env.ERROR_REPORT_URL || 'http://localhost:3001/api/errors/report',
      projectId: process.env.ERROR_PROJECT_ID || 'your-project-id',
      apiKey: process.env.ERROR_API_KEY || 'your-api-key',
      environment: process.env.NODE_ENV || 'development',
      debug: process.env.NODE_ENV === 'development'
    }
  }
};
```

## 环境变量配置

创建 `.env` 文件：

```bash
ERROR_REPORT_URL=http://localhost:3001/api/errors/report
ERROR_PROJECT_ID=your-project-id
ERROR_API_KEY=your-api-key
```

## 在页面中使用

```vue
<template>
  <div>
    <button @click="handleAction">执行操作</button>
  </div>
</template>

<script>
export default {
  methods: {
    async handleAction() {
      try {
        await this.$axios.get('/api/data');
      } catch (error) {
        this.$errorTracker.report(error, {
          page: this.$route.name,
          action: 'handleAction'
        });
      }
    }
  }
};
</script>
```

## 在 asyncData 中使用

```vue
<script>
export default {
  async asyncData({ $axios, $errorTracker, route }) {
    try {
      const data = await $axios.get('/api/data');
      return { data };
    } catch (error) {
      $errorTracker.report(error, {
        page: route.name,
        method: 'asyncData'
      });
      return { data: null };
    }
  }
};
</script>
```

## 在 Vuex 中使用

```javascript
// store/index.js
export const actions = {
  async fetchData({ commit }, payload) {
    try {
      const data = await this.$axios.get('/api/data');
      commit('setData', data);
    } catch (error) {
      this.$errorTracker.report(error, {
        action: 'fetchData',
        store: 'index'
      });
      throw error;
    }
  }
};
```

## 集成 Axios

如果使用 `@nuxtjs/axios` 模块，可以传入 axios 实例：

```javascript
// plugins/error-catcher.client.js
export default function({ $config, app, $axios }, inject) {
  const tracker = new ErrorCatcher({
    reportUrl: $config.errorCatcher.reportUrl,
    projectId: $config.errorCatcher.projectId,
    apiKey: $config.errorCatcher.apiKey,
    vue: app,
    axios: $axios,  // 传入 axios 实例
    environment: $config.errorCatcher.environment,
    debug: $config.errorCatcher.debug
  });
  
  inject('errorTracker', tracker);
}
```

## 自动捕获

ErrorCatcher 会自动捕获 Vue 组件错误、全局 JavaScript 错误、Promise 拒绝和网络请求错误。详见 [自动捕获功能](/guide/auto-capture.md)。

## 完整配置示例

```javascript
// plugins/error-catcher.client.js
import ErrorCatcher from 'error-catcher';

export default function({ $config, app, $axios }, inject) {
  const tracker = new ErrorCatcher({
    // 必需配置
    reportUrl: $config.errorCatcher.reportUrl,
    projectId: $config.errorCatcher.projectId,
    apiKey: $config.errorCatcher.apiKey,
    
    // 框架集成
    vue: app,
    axios: $axios,
    
    // 基础配置
    environment: $config.errorCatcher.environment,
    release: $config.errorCatcher.version,
    
    // 采样和批量
    sampleRate: 0.8,
    maxBatchSize: 20,
    delay: 2000,
    
    // 功能开关
    debug: $config.errorCatcher.debug,
    autoStart: true,
    autoIntegrate: true,
    
    // 高级配置
    ignoreUrls: [
      /_nuxt\//,
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
      if (process.env.NODE_ENV === 'development') {
        console.log('Error captured:', error);
      }
    }
  });
  
  inject('errorTracker', tracker);
}
```

## API 方法

详见 [错误上下文结构](/guide/error-context.md) 了解完整的 API 方法和上下文结构。

常用方法：

```javascript
// 手动上报错误
this.$errorTracker.report(error, {
  page: this.$route.name,
  action: 'handleAction'
});

// 设置用户信息
this.$errorTracker.setUser({
  id: this.$auth.user.id,
  username: this.$auth.user.username,
  email: this.$auth.user.email
});

// 设置标签
this.$errorTracker.setTag('page', this.$route.name);
this.$errorTracker.setTags({
  page: this.$route.name,
  version: '1.0.0'
});

// 添加面包屑
this.$errorTracker.addBreadcrumb({
  category: 'navigation',
  message: `Navigated to ${this.$route.name}`,
  level: 'info'
});
```

## 自动捕获的数据

ErrorCatcher 会自动捕获以下信息：

### Vue 组件错误
- `type`: 'vue_error'
- `componentName`: 组件名称
- `lifecycle`: 生命周期钩子
- `message`: 错误消息
- `stack`: 错误堆栈

### Axios 错误
- `type`: 'axios_error'
- `url`: 完整请求 URL（包含查询参数）
- `method`: 请求方法
- `status`: HTTP 状态码
- `statusText`: 状态文本
- `requestHeaders`: 请求头
- `requestBody`: 请求体
- `response`: 响应内容
- `responseHeaders`: 响应头
- `duration`: 请求耗时

## 最佳实践

### 1. 用户登录后设置用户信息

```javascript
// plugins/auth.js
export default function({ $auth, $errorTracker }) {
  $auth.onRedirect(() => {
    if ($auth.loggedIn) {
      $errorTracker.setUser({
        id: $auth.user.id,
        username: $auth.user.username,
        email: $auth.user.email
      });
    } else {
      $errorTracker.setUser(null);
    }
  });
}
```

### 2. 全局错误处理

```javascript
// nuxt.config.js
export default {
  // 自定义错误页面
  error: '~/layouts/error.vue'
};

// layouts/error.vue
<template>
  <div>
    <h1>{{ error.statusCode }}</h1>
    <p>{{ error.message }}</p>
  </div>
</template>

<script>
export default {
  props: ['error'],
  
  mounted() {
    this.$errorTracker.report(this.error, {
      page: 'error',
      statusCode: this.error.statusCode
    });
  }
};
</script>
```

### 3. 使用环境变量

```javascript
// .env.production
ERROR_REPORT_URL=https://api.example.com/api/errors/report
ERROR_PROJECT_ID=prod-project-id
ERROR_API_KEY=prod-api-key

// .env.development
ERROR_REPORT_URL=http://localhost:3001/api/errors/report
ERROR_PROJECT_ID=dev-project-id
ERROR_API_KEY=dev-api-key
```

## 相关文档

- [配置详解](/guide/configuration)
- [API 方法](/api/methods)
- [SSR 支持](/guide/ssr)
- [最佳实践](/guide/best-practices)

