# Nuxt 3 集成

ErrorCatcher 支持 Nuxt 3，可以在客户端和服务端安全运行。

## 安装

```bash
npm install error-catcher
```

## 创建插件

创建 `plugins/error-catcher.client.js`：

```javascript
import ErrorCatcher from 'error-catcher';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  
  const tracker = new ErrorCatcher({
    reportUrl: config.public.errorCatcher.reportUrl,
    projectId: config.public.errorCatcher.projectId,
    apiKey: config.public.errorCatcher.apiKey,
    vue: nuxtApp.vueApp,  // 传入 Vue 应用实例
    environment: config.public.errorCatcher.environment,
    debug: config.public.errorCatcher.debug
  });
  
  return {
    provide: {
      errorTracker: tracker
    }
  };
});
```

## 配置 nuxt.config.ts

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      errorCatcher: {
        reportUrl: process.env.ERROR_REPORT_URL || 'http://localhost:3001/api/errors/report',
        projectId: process.env.ERROR_PROJECT_ID || 'your-project-id',
        apiKey: process.env.ERROR_API_KEY || 'your-api-key',
        environment: process.env.NODE_ENV || 'development',
        debug: process.env.NODE_ENV === 'development'
      }
    }
  }
});
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

<script setup>
const { $errorTracker } = useNuxtApp();

const handleAction = async () => {
  try {
    await $fetch('/api/data');
  } catch (error) {
    $errorTracker.report(error, {
      page: 'home',
      action: 'handleAction'
    });
  }
};
</script>
```

## 在 Composables 中使用

```javascript
// composables/useData.js
export const useData = () => {
  const { $errorTracker } = useNuxtApp();
  
  const fetchData = async () => {
    try {
      const data = await $fetch('/api/data');
      return data;
    } catch (error) {
      $errorTracker.report(error, {
        composable: 'useData',
        method: 'fetchData'
      });
      throw error;
    }
  };
  
  return {
    fetchData
  };
};
```

## 在服务端 API 中使用

```javascript
// server/api/data.js
export default defineEventHandler(async (event) => {
  try {
    const data = await fetchDataFromDB();
    return data;
  } catch (error) {
    // 服务端错误需要手动上报
    console.error('Server error:', error);
    throw createError({
      statusCode: 500,
      message: 'Internal Server Error'
    });
  }
});
```

## 自动捕获

ErrorCatcher 会自动捕获 Vue 组件错误、全局 JavaScript 错误、Promise 拒绝和网络请求错误。详见 [自动捕获功能](/guide/auto-capture.md)。

## 完整配置示例

```javascript
// plugins/error-catcher.client.js
import ErrorCatcher from 'error-catcher';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  
  const tracker = new ErrorCatcher({
    // 必需配置
    reportUrl: config.public.errorCatcher.reportUrl,
    projectId: config.public.errorCatcher.projectId,
    apiKey: config.public.errorCatcher.apiKey,
    
    // Vue 集成
    vue: nuxtApp.vueApp,
    
    // 基础配置
    environment: config.public.errorCatcher.environment,
    release: config.public.errorCatcher.version || '1.0.0',
    
    // 采样和批量
    sampleRate: 0.8,
    maxBatchSize: 20,
    delay: 2000,
    
    // 功能开关
    debug: config.public.errorCatcher.debug,
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
      if (config.public.errorCatcher.debug) {
        console.log('Error captured:', error);
      }
    }
  });
  
  return {
    provide: {
      errorTracker: tracker
    }
  };
});
```

## API 方法

详见 [错误上下文结构](/guide/error-context.md) 了解完整的 API 方法和上下文结构。

常用方法：

```javascript
const { $errorTracker } = useNuxtApp();

// 手动上报错误
$errorTracker.report(error, {
  page: 'home',
  action: 'handleAction'
});

// 设置用户信息
$errorTracker.setUser({
  id: 'user-123',
  username: 'john_doe',
  email: 'john@example.com'
});

// 设置标签
$errorTracker.setTag('page', 'checkout');
$errorTracker.setTags({
  page: 'checkout',
  version: '1.0.0'
});

// 添加面包屑
$errorTracker.addBreadcrumb({
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
- `lifecycle`: 生命周期钩子
- `message`: 错误消息
- `stack`: 错误堆栈

### Fetch 错误
- `type`: 'fetch_error'
- `url`: 请求地址
- `method`: 请求方法
- `status`: HTTP 状态码
- `statusText`: 状态文本
- `response`: 响应内容
- `duration`: 请求耗时

## TypeScript 支持

```typescript
// types/nuxt.d.ts
import type ErrorCatcher from 'error-catcher';

declare module '#app' {
  interface NuxtApp {
    $errorTracker: ErrorCatcher;
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $errorTracker: ErrorCatcher;
  }
}

export {};
```

## 最佳实践

### 1. 用户认证后设置用户信息

```javascript
// composables/useAuth.js
export const useAuth = () => {
  const { $errorTracker } = useNuxtApp();
  
  const login = async (credentials) => {
    try {
      const user = await $fetch('/api/auth/login', {
        method: 'POST',
        body: credentials
      });
      
      // 设置用户信息
      $errorTracker.setUser({
        id: user.id,
        username: user.username,
        email: user.email
      });
      
      return user;
    } catch (error) {
      $errorTracker.report(error, {
        action: 'login'
      });
      throw error;
    }
  };
  
  const logout = () => {
    $errorTracker.setUser(null);
  };
  
  return {
    login,
    logout
  };
};
```

### 2. 全局错误页面

```vue
<!-- error.vue -->
<template>
  <div>
    <h1>{{ error.statusCode }}</h1>
    <p>{{ error.message }}</p>
    <button @click="handleError">返回首页</button>
  </div>
</template>

<script setup>
const props = defineProps(['error']);
const { $errorTracker } = useNuxtApp();

onMounted(() => {
  $errorTracker.report(props.error, {
    page: 'error',
    statusCode: props.error.statusCode
  });
});

const handleError = () => {
  clearError({ redirect: '/' });
};
</script>
```

### 3. 使用环境变量

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      errorCatcher: {
        reportUrl: process.env.ERROR_REPORT_URL,
        projectId: process.env.ERROR_PROJECT_ID,
        apiKey: process.env.ERROR_API_KEY,
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version,
        debug: process.env.NODE_ENV === 'development'
      }
    }
  }
});
```

## 相关文档

- [配置详解](/guide/configuration)
- [API 方法](/api/methods)
- [SSR 支持](/guide/ssr)
- [最佳实践](/guide/best-practices)

