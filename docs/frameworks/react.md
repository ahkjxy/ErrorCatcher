# React 集成

ErrorCatcher 支持 React，可以自动捕获全局错误。对于组件错误，建议使用 Error Boundary。

## 安装

```bash
npm install error-catcher
```

## 基础使用

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import ErrorCatcher from 'error-catcher';
import App from './App';

// 创建 ErrorCatcher 实例
const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  react: true,  // 启用 React 集成
  environment: 'production',
  debug: process.env.NODE_ENV === 'development'
});

// 将 tracker 添加到 window（可选）
window.errorTracker = tracker;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## 使用 Context

创建 ErrorTracker Context：

```javascript
// contexts/ErrorTrackerContext.js
import React, { createContext, useContext } from 'react';
import ErrorCatcher from 'error-catcher';

const ErrorTrackerContext = createContext(null);

export const ErrorTrackerProvider = ({ children }) => {
  const tracker = new ErrorCatcher({
    reportUrl: process.env.REACT_APP_ERROR_REPORT_URL,
    projectId: process.env.REACT_APP_ERROR_PROJECT_ID,
    apiKey: process.env.REACT_APP_ERROR_API_KEY,
    react: true,
    environment: process.env.NODE_ENV,
    debug: process.env.NODE_ENV === 'development'
  });
  
  return (
    <ErrorTrackerContext.Provider value={tracker}>
      {children}
    </ErrorTrackerContext.Provider>
  );
};

export const useErrorTracker = () => {
  const context = useContext(ErrorTrackerContext);
  if (!context) {
    throw new Error('useErrorTracker must be used within ErrorTrackerProvider');
  }
  return context;
};
```

在应用中使用：

```javascript
// index.js
import { ErrorTrackerProvider } from './contexts/ErrorTrackerContext';

root.render(
  <ErrorTrackerProvider>
    <App />
  </ErrorTrackerProvider>
);
```

## 在组件中使用

```javascript
import { useErrorTracker } from './contexts/ErrorTrackerContext';

function MyComponent() {
  const errorTracker = useErrorTracker();
  
  const handleAction = async () => {
    try {
      await fetchData();
    } catch (error) {
      errorTracker.report(error, {
        component: 'MyComponent',
        action: 'handleAction'
      });
    }
  };
  
  return (
    <button onClick={handleAction}>执行操作</button>
  );
}
```

## Error Boundary

创建 Error Boundary 组件：

```javascript
// components/ErrorBoundary.js
import React from 'react';
import { useErrorTracker } from '../contexts/ErrorTrackerContext';

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.props.errorTracker.report(error, {
      type: 'react_error_boundary',
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
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

export function ErrorBoundary({ children, fallback }) {
  const errorTracker = useErrorTracker();
  
  return (
    <ErrorBoundaryClass errorTracker={errorTracker} fallback={fallback}>
      {children}
    </ErrorBoundaryClass>
  );
}
```

使用 Error Boundary：

```javascript
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

## 自动捕获

ErrorCatcher 会自动捕获：

- ✅ 全局 JavaScript 错误
- ✅ Promise 未处理的拒绝
- ✅ Fetch/XHR 请求错误
- ⚠️ React 组件错误（需要使用 Error Boundary）

## 完整配置示例

```javascript
const tracker = new ErrorCatcher({
  // 必需配置
  reportUrl: process.env.REACT_APP_ERROR_REPORT_URL,
  projectId: process.env.REACT_APP_ERROR_PROJECT_ID,
  apiKey: process.env.REACT_APP_ERROR_API_KEY,
  
  // React 集成
  react: true,
  
  // 基础配置
  environment: process.env.NODE_ENV,
  release: process.env.REACT_APP_VERSION || '1.0.0',
  
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
    if (process.env.NODE_ENV === 'development') {
      console.log('Error captured:', error);
    }
  }
});
```

## 使用 React Router

```javascript
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useErrorTracker } from './contexts/ErrorTrackerContext';

function App() {
  const location = useLocation();
  const errorTracker = useErrorTracker();
  
  useEffect(() => {
    // 记录路由变化
    errorTracker.addBreadcrumb({
      category: 'navigation',
      message: `Navigated to ${location.pathname}`,
      level: 'info',
      data: {
        pathname: location.pathname,
        search: location.search
      }
    });
  }, [location, errorTracker]);
  
  return (
    <div>
      {/* Your app */}
    </div>
  );
}
```

## API 方法

```javascript
const errorTracker = useErrorTracker();

// 手动上报错误
errorTracker.report(error, {
  component: 'MyComponent',
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

// 设置上下文
errorTracker.setContext('device', {
  type: 'mobile',
  os: 'iOS'
});

// 设置额外数据
errorTracker.setExtra('orderId', '12345');

// 添加面包屑
errorTracker.addBreadcrumb({
  category: 'user',
  message: 'User clicked button',
  level: 'info',
  data: {
    buttonId: 'submit'
  }
});
```

## 自动捕获的数据

### 全局错误
- `type`: 'global_error'
- `message`: 错误消息
- `stack`: 错误堆栈
- `filename`: 文件名
- `lineno`: 行号
- `colno`: 列号

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
// types/error-tracker.d.ts
import ErrorCatcher from 'error-catcher';

declare global {
  interface Window {
    errorTracker: ErrorCatcher;
  }
}

export {};
```

## 最佳实践

### 1. 使用环境变量

```bash
# .env.production
REACT_APP_ERROR_REPORT_URL=https://api.example.com/api/errors/report
REACT_APP_ERROR_PROJECT_ID=your-project-id
REACT_APP_ERROR_API_KEY=your-api-key
REACT_APP_VERSION=1.0.0

# .env.development
REACT_APP_ERROR_REPORT_URL=http://localhost:3001/api/errors/report
REACT_APP_ERROR_PROJECT_ID=dev-project-id
REACT_APP_ERROR_API_KEY=dev-api-key
```

### 2. 自定义 Hook

```javascript
// hooks/useErrorHandler.js
import { useCallback } from 'react';
import { useErrorTracker } from '../contexts/ErrorTrackerContext';

export const useErrorHandler = (componentName) => {
  const errorTracker = useErrorTracker();
  
  const handleError = useCallback((error, context = {}) => {
    errorTracker.report(error, {
      ...context,
      component: componentName
    });
  }, [errorTracker, componentName]);
  
  return handleError;
};

// 使用
function MyComponent() {
  const handleError = useErrorHandler('MyComponent');
  
  const fetchData = async () => {
    try {
      await fetch('/api/data');
    } catch (error) {
      handleError(error, { action: 'fetchData' });
    }
  };
}
```

### 3. 异步错误处理

```javascript
import { useEffect } from 'react';
import { useErrorTracker } from './contexts/ErrorTrackerContext';

function DataComponent() {
  const errorTracker = useErrorTracker();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        const data = await response.json();
        // 处理数据
      } catch (error) {
        errorTracker.report(error, {
          component: 'DataComponent',
          action: 'fetchData'
        });
      }
    };
    
    fetchData();
  }, [errorTracker]);
  
  return <div>Data Component</div>;
}
```

### 4. 用户认证后设置用户信息

```javascript
function LoginComponent() {
  const errorTracker = useErrorTracker();
  
  const handleLogin = async (credentials) => {
    try {
      const user = await login(credentials);
      
      // 设置用户信息
      errorTracker.setUser({
        id: user.id,
        username: user.username,
        email: user.email
      });
    } catch (error) {
      errorTracker.report(error, {
        component: 'LoginComponent',
        action: 'login'
      });
    }
  };
  
  return <LoginForm onSubmit={handleLogin} />;
}
```

## 相关文档

- [配置详解](/guide/configuration)
- [API 方法](/api/methods)
- [最佳实践](/guide/best-practices)
