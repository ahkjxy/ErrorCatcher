# Next.js 集成

ErrorCatcher 支持 Next.js，可以在客户端和服务端安全运行。

## 安装

```bash
npm install error-catcher
```

## App Router (Next.js 13+)

### 客户端配置

创建 `app/providers.tsx`：

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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
        environment: process.env.NODE_ENV,
        debug: process.env.NODE_ENV === 'development'
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
  const context = useContext(ErrorTrackerContext);
  if (!context) {
    throw new Error('useErrorTracker must be used within ErrorTrackerProvider');
  }
  return context;
}
```

在 `app/layout.tsx` 中使用：

```typescript
import { ErrorTrackerProvider } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>
        <ErrorTrackerProvider>
          {children}
        </ErrorTrackerProvider>
      </body>
    </html>
  );
}
```

### 在页面中使用

```typescript
'use client';

import { useErrorTracker } from '../providers';

export default function Page() {
  const errorTracker = useErrorTracker();

  const handleAction = async () => {
    try {
      await fetch('/api/data');
    } catch (error) {
      errorTracker.report(error as Error, {
        page: 'home',
        action: 'handleAction'
      });
    }
  };

  return (
    <button onClick={handleAction}>执行操作</button>
  );
}
```

### 服务端 API 路由

```typescript
// app/api/data/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = await fetchDataFromDB();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

## Pages Router (Next.js 12 及以下)

### 客户端配置

创建 `lib/errorTracker.js`：

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
      environment: process.env.NODE_ENV,
      debug: process.env.NODE_ENV === 'development'
    });
  }

  return tracker;
}
```

在 `pages/_app.js` 中初始化：

```javascript
import { useEffect } from 'react';
import { getErrorTracker } from '../lib/errorTracker';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // 初始化 ErrorTracker
    getErrorTracker();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
```

### 在页面中使用

```javascript
import { getErrorTracker } from '../lib/errorTracker';

export default function Home() {
  const handleAction = async () => {
    try {
      await fetch('/api/data');
    } catch (error) {
      const tracker = getErrorTracker();
      tracker?.report(error, {
        page: 'home',
        action: 'handleAction'
      });
    }
  };

  return (
    <button onClick={handleAction}>执行操作</button>
  );
}
```

### API 路由

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

## 环境变量配置

创建 `.env.local` 文件：

```bash
NEXT_PUBLIC_ERROR_REPORT_URL=http://localhost:3001/api/errors/report
NEXT_PUBLIC_ERROR_PROJECT_ID=your-project-id
NEXT_PUBLIC_ERROR_API_KEY=your-api-key
```

## 自动捕获

ErrorCatcher 会自动捕获全局 JavaScript 错误、Promise 拒绝和网络请求错误。详见 [自动捕获功能](/guide/auto-capture.md)。

⚠️ React 组件错误需要使用 Error Boundary 配合捕获。

## Error Boundary

```typescript
'use client';

import React from 'react';
import { useErrorTracker } from './providers';

class ErrorBoundaryClass extends React.Component<
  { children: React.ReactNode; errorTracker: any },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.errorTracker?.report(error, {
      type: 'react_error_boundary',
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>出错了</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const errorTracker = useErrorTracker();
  
  return (
    <ErrorBoundaryClass errorTracker={errorTracker}>
      {children}
    </ErrorBoundaryClass>
  );
}
```

## 完整配置示例

```javascript
const tracker = new ErrorCatcher({
  // 必需配置
  reportUrl: process.env.NEXT_PUBLIC_ERROR_REPORT_URL,
  projectId: process.env.NEXT_PUBLIC_ERROR_PROJECT_ID,
  apiKey: process.env.NEXT_PUBLIC_ERROR_API_KEY,
  
  // React 集成
  react: true,
  
  // 基础配置
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_VERSION || '1.0.0',
  
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
    /_next\//,
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
```

## API 方法

详见 [错误上下文结构](/guide/error-context.md) 了解完整的 API 方法和上下文结构。

常用方法：

```javascript
const errorTracker = useErrorTracker();

// 手动上报错误
errorTracker.report(error, {
  page: 'home',
  action: 'handleAction'
});

// 设置用户信息
errorTracker.setUser({
  id: 'user-123',
  username: 'john_doe',
  email: 'john@example.com'
});

// 设置标签
errorTracker.setTag('page', 'checkout');
errorTracker.setTags({
  page: 'checkout',
  version: '1.0.0'
});

// 添加面包屑
errorTracker.addBreadcrumb({
  category: 'navigation',
  message: 'User navigated to checkout',
  level: 'info'
});
```

## 最佳实践

### 1. 使用环境变量

```bash
# .env.production
NEXT_PUBLIC_ERROR_REPORT_URL=https://api.example.com/api/errors/report
NEXT_PUBLIC_ERROR_PROJECT_ID=prod-project-id
NEXT_PUBLIC_ERROR_API_KEY=prod-api-key
NEXT_PUBLIC_VERSION=1.0.0

# .env.development
NEXT_PUBLIC_ERROR_REPORT_URL=http://localhost:3001/api/errors/report
NEXT_PUBLIC_ERROR_PROJECT_ID=dev-project-id
NEXT_PUBLIC_ERROR_API_KEY=dev-api-key
```

### 2. 用户认证后设置用户信息

```typescript
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useErrorTracker } from './providers';

export function UserTracker() {
  const { data: session } = useSession();
  const errorTracker = useErrorTracker();

  useEffect(() => {
    if (session?.user) {
      errorTracker.setUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name
      });
    } else {
      errorTracker.setUser(null);
    }
  }, [session, errorTracker]);

  return null;
}
```

### 3. 自定义 Hook

```typescript
import { useCallback } from 'react';
import { useErrorTracker } from './providers';

export function useErrorHandler(componentName: string) {
  const errorTracker = useErrorTracker();

  const handleError = useCallback((error: Error, context: Record<string, any> = {}) => {
    errorTracker.report(error, {
      ...context,
      component: componentName
    });
  }, [errorTracker, componentName]);

  return handleError;
}
```

## 相关文档

- [配置详解](/guide/configuration)
- [API 方法](/api/methods)
- [SSR 支持](/guide/ssr)
- [最佳实践](/guide/best-practices)
