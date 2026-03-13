# SSR 支持

ErrorCatcher 完美支持服务端渲染（SSR），可以在 Node.js 环境中安全运行。

## 工作原理

ErrorCatcher 会自动检测运行环境：

- **浏览器环境**：自动拦截错误和请求
- **服务端环境**：只支持手动上报，不会拦截全局对象

```javascript
const tracker = new ErrorCatcher(config);

if (tracker.isServer) {
  // 服务端环境
  // 只能使用 tracker.report() 手动上报
} else {
  // 浏览器环境
  // 自动拦截 + 手动上报
}
```

## Nuxt 3 SSR

### 创建插件

`plugins/error-catcher.client.js`：

```javascript
import ErrorCatcher from 'error-catcher';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  
  const tracker = new ErrorCatcher({
    reportUrl: config.public.errorCatcher.reportUrl,
    projectId: config.public.errorCatcher.projectId,
    apiKey: config.public.errorCatcher.apiKey,
    vue: nuxtApp.vueApp,
    environment: config.public.errorCatcher.environment
  });
  
  return {
    provide: {
      errorTracker: tracker
    }
  };
});
```

### 配置

`nuxt.config.ts`：

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      errorCatcher: {
        reportUrl: process.env.ERROR_REPORT_URL,
        projectId: process.env.ERROR_PROJECT_ID,
        apiKey: process.env.ERROR_API_KEY,
        environment: process.env.NODE_ENV
      }
    }
  }
});
```

### 服务端错误捕获

```javascript
// server/api/data.js
export default defineEventHandler(async (event) => {
  try {
    const data = await fetchData();
    return data;
  } catch (error) {
    // 服务端错误需要手动处理
    console.error('Server error:', error);
    throw createError({
      statusCode: 500,
      message: 'Internal Server Error'
    });
  }
});
```

## Nuxt 2 SSR

### 创建插件

`plugins/error-catcher.client.js`：

```javascript
import ErrorCatcher from 'error-catcher';

export default function({ $config, app, $axios }, inject) {
  const tracker = new ErrorCatcher({
    reportUrl: $config.errorCatcher.reportUrl,
    projectId: $config.errorCatcher.projectId,
    apiKey: $config.errorCatcher.apiKey,
    vue: app,
    axios: $axios,
    environment: $config.errorCatcher.environment
  });
  
  inject('errorTracker', tracker);
}
```

### 配置

`nuxt.config.js`：

```javascript
export default {
  plugins: [
    { src: '~/plugins/error-catcher.client.js', mode: 'client' }
  ],
  
  publicRuntimeConfig: {
    errorCatcher: {
      reportUrl: process.env.ERROR_REPORT_URL,
      projectId: process.env.ERROR_PROJECT_ID,
      apiKey: process.env.ERROR_API_KEY,
      environment: process.env.NODE_ENV
    }
  }
};
```

### 服务端中间件

```javascript
// serverMiddleware/error-handler.js
export default function(req, res, next) {
  try {
    next();
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send('Internal Server Error');
  }
}
```

## Next.js SSR

### App Router (Next.js 13+)

`app/providers.tsx`：

```typescript
'use client';

import { createContext, useContext, useState } from 'react';
import ErrorCatcher from 'error-catcher';

const ErrorTrackerContext = createContext<ErrorCatcher | null>(null);

export function ErrorTrackerProvider({ children }: { children: React.ReactNode }) {
  const [tracker] = useState(() => {
    if (typeof window !== 'undefined') {
      return new ErrorCatcher({
        reportUrl: process.env.NEXT_PUBLIC_ERROR_REPORT_URL!,
        projectId: process.env.NEXT_PUBLIC_ERROR_PROJECT_ID!,
        apiKey: process.env.NEXT_PUBLIC_ERROR_API_KEY!,
        react: true,
        environment: process.env.NODE_ENV
      });
    }
    return null;
  });

  return (
    <ErrorTrackerContext.Provider value={tracker}>
      {children}
    </ErrorTrackerContext.Provider>
  );
}

export function useErrorTracker() {
  return useContext(ErrorTrackerContext);
}
```

### Pages Router

`lib/errorTracker.js`：

```javascript
import ErrorCatcher from 'error-catcher';

let tracker = null;

export function getErrorTracker() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!tracker) {
    tracker = new ErrorCatcher({
      reportUrl: process.env.NEXT_PUBLIC_ERROR_REPORT_URL,
      projectId: process.env.NEXT_PUBLIC_ERROR_PROJECT_ID,
      apiKey: process.env.NEXT_PUBLIC_ERROR_API_KEY,
      react: true,
      environment: process.env.NODE_ENV
    });
  }

  return tracker;
}
```

### 服务端 API 路由

```javascript
// pages/api/data.js
export default async function handler(req, res) {
  try {
    const data = await fetchDataFromDB();
    res.status(200).json(data);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
```

## 最佳实践

### 1. 区分客户端和服务端错误

```javascript
tracker.report(error, {
  isServer: typeof window === 'undefined',
  environment: process.env.NODE_ENV
});
```

### 2. 服务端只手动上报

```javascript
if (tracker.isServer) {
  // 服务端环境
  // 不要调用 init()，已自动初始化
  // 只使用 report() 手动上报
  tracker.report(error, {
    isServer: true,
    context: 'server-api'
  });
} else {
  // 客户端环境
  // 自动初始化并拦截错误
}
```

### 3. 统一错误处理

```javascript
// utils/error-handler.js
export function handleError(error, context = {}) {
  const isServer = typeof window === 'undefined';
  
  if (isServer) {
    // 服务端：记录到日志
    console.error('Server error:', error, context);
  } else {
    // 客户端：上报到 ErrorCatcher
    const tracker = getErrorTracker();
    tracker?.report(error, {
      ...context,
      isServer: false
    });
  }
}
```

### 4. 环境检测

```javascript
const tracker = new ErrorCatcher({
  reportUrl: process.env.ERROR_REPORT_URL,
  projectId: process.env.ERROR_PROJECT_ID,
  apiKey: process.env.ERROR_API_KEY,
  environment: process.env.NODE_ENV
});

// 检查环境
console.log('Is server:', tracker.isServer);
console.log('Is browser:', tracker.isBrowser);
```

### 5. 避免内存泄漏

```javascript
// 服务端：不要保持长期引用
if (tracker.isServer) {
  // 每个请求使用独立的错误处理
  // 不要在全局保存 tracker 实例
}

// 客户端：可以全局保存
if (tracker.isBrowser) {
  window.errorTracker = tracker;
}
```

## Node.js 环境配置

如果需要在 Node.js 环境中发送错误，需要提供 fetch 实现：

```javascript
import fetch from 'node-fetch';
import ErrorCatcher from 'error-catcher';

const tracker = new ErrorCatcher({
  reportUrl: process.env.ERROR_REPORT_URL,
  projectId: process.env.ERROR_PROJECT_ID,
  apiKey: process.env.ERROR_API_KEY,
  fetch: fetch  // 提供 fetch 实现
});

// 手动上报
try {
  // 服务端代码
} catch (error) {
  tracker.report(error, {
    isServer: true,
    context: 'node-server'
  });
}
```

## 完整示例

### Nuxt 3 完整示例

```javascript
// plugins/error-catcher.client.js
import ErrorCatcher from 'error-catcher';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const router = useRouter();
  
  const tracker = new ErrorCatcher({
    reportUrl: config.public.errorCatcher.reportUrl,
    projectId: config.public.errorCatcher.projectId,
    apiKey: config.public.errorCatcher.apiKey,
    vue: nuxtApp.vueApp,
    environment: config.public.errorCatcher.environment,
    debug: config.public.errorCatcher.debug
  });
  
  // 监听路由变化
  router.afterEach((to, from) => {
    tracker.addBreadcrumb({
      category: 'navigation',
      message: `${from.path} -> ${to.path}`,
      level: 'info'
    });
  });
  
  return {
    provide: {
      errorTracker: tracker
    }
  };
});
```

### Next.js 完整示例

```typescript
// app/providers.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ErrorCatcher from 'error-catcher';

const ErrorTrackerContext = createContext<ErrorCatcher | null>(null);

export function ErrorTrackerProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [tracker] = useState(() => {
    if (typeof window !== 'undefined') {
      return new ErrorCatcher({
        reportUrl: process.env.NEXT_PUBLIC_ERROR_REPORT_URL!,
        projectId: process.env.NEXT_PUBLIC_ERROR_PROJECT_ID!,
        apiKey: process.env.NEXT_PUBLIC_ERROR_API_KEY!,
        react: true,
        environment: process.env.NODE_ENV,
        debug: process.env.NODE_ENV === 'development'
      });
    }
    return null;
  });

  // 监听路由变化
  useEffect(() => {
    if (tracker) {
      tracker.addBreadcrumb({
        category: 'navigation',
        message: `Navigated to ${pathname}`,
        level: 'info'
      });
    }
  }, [pathname, tracker]);

  return (
    <ErrorTrackerContext.Provider value={tracker}>
      {children}
    </ErrorTrackerContext.Provider>
  );
}

export function useErrorTracker() {
  return useContext(ErrorTrackerContext);
}
```

## 相关文档

- [配置详解](/guide/configuration)
- [API 方法](/api/methods)
- [Nuxt 3 集成](/frameworks/nuxt3)
- [Next.js 集成](/frameworks/nextjs)
- [最佳实践](/guide/best-practices)
