# 自定义上报

除了自动捕获错误，ErrorCatcher 还支持手动上报自定义错误和事件。

## 基础用法

### 手动上报错误

```javascript
try {
  // 你的代码
  riskyOperation();
} catch (error) {
  tracker.report(error, {
    action: 'riskyOperation',
    component: 'UserProfile',
    extra: {
      userId: currentUser.id,
      timestamp: Date.now()
    }
  });
}
```

### 上报自定义事件

```javascript
tracker.report(new Error('Custom event'), {
  type: 'custom',
  eventName: 'user-action',
  action: 'button-click',
  buttonId: 'submit-btn'
});
```

## 高级用法

### 1. 业务错误上报

```javascript
function handlePayment(amount) {
  if (amount <= 0) {
    const error = new Error('Invalid payment amount');
    tracker.report(error, {
      type: 'business_error',
      category: 'payment',
      amount: amount,
      userId: currentUser.id
    });
    return false;
  }
  
  // 处理支付
}
```

### 2. 性能监控

```javascript
const startTime = performance.now();

await fetchData();

const duration = performance.now() - startTime;

if (duration > 3000) {
  tracker.report(new Error('Slow API response'), {
    type: 'performance',
    api: '/api/data',
    duration: duration,
    threshold: 3000
  });
}
```

### 3. 用户行为追踪

使用面包屑功能追踪用户行为：

```javascript
// 添加面包屑
tracker.addBreadcrumb({
  category: 'navigation',
  message: 'User navigated to checkout',
  level: 'info',
  data: {
    from: '/cart',
    to: '/checkout'
  }
});

tracker.addBreadcrumb({
  category: 'user',
  message: 'User clicked submit button',
  level: 'info',
  data: {
    buttonId: 'submit-btn'
  }
});

// 当错误发生时，面包屑会自动包含在错误报告中
```

### 4. 第三方服务错误

```javascript
async function callThirdPartyAPI() {
  try {
    const response = await fetch('https://api.third-party.com/data');
    return await response.json();
  } catch (error) {
    tracker.report(error, {
      type: 'third_party_error',
      service: 'third-party-api',
      endpoint: '/data'
    });
    throw error;
  }
}
```

## 用户和上下文

### 1. 设置用户信息

```javascript
// 用户登录后
tracker.setUser({
  id: 'user-123',
  username: 'john_doe',
  email: 'john@example.com'
});

// 用户登出后
tracker.setUser(null);
```

### 2. 设置标签

```javascript
// 设置单个标签
tracker.setTag('page', 'checkout');

// 批量设置标签
tracker.setTags({
  page: 'checkout',
  version: '1.0.0',
  feature: 'new-ui'
});
```

### 3. 设置上下文

```javascript
// 设置结构化上下文
tracker.setContext('device', {
  type: 'mobile',
  os: 'iOS',
  version: '15.0'
});

tracker.setContext('cart', {
  items: 3,
  total: 99.99
});
```

### 4. 设置额外数据

```javascript
tracker.setExtra('sessionId', 'abc123');
tracker.setExtra('experimentGroup', 'A');
```

## 面包屑

面包屑记录用户行为轨迹，帮助重现错误场景。

### 添加面包屑

```javascript
// 导航面包屑
tracker.addBreadcrumb({
  category: 'navigation',
  message: 'Navigated to /checkout',
  level: 'info'
});

// HTTP 请求面包屑
tracker.addBreadcrumb({
  category: 'http',
  message: 'GET /api/products',
  level: 'info',
  data: {
    status: 200,
    duration: 150
  }
});

// 用户操作面包屑
tracker.addBreadcrumb({
  category: 'user',
  message: 'Clicked checkout button',
  level: 'info',
  data: {
    buttonId: 'checkout-btn'
  }
});

// 错误面包屑
tracker.addBreadcrumb({
  category: 'error',
  message: 'Validation failed',
  level: 'error',
  data: {
    field: 'email',
    reason: 'invalid format'
  }
});
```

### 面包屑级别

- `debug`: 调试信息
- `info`: 一般信息（默认）
- `warning`: 警告
- `error`: 错误

### 面包屑限制

- 最多保留最近的 100 条面包屑
- 超过限制会自动删除最早的面包屑

## 条件上报

### 1. 基于环境

```javascript
function reportError(error, context) {
  if (process.env.NODE_ENV === 'production') {
    tracker.report(error, context);
  } else {
    console.error('Dev Error:', error, context);
  }
}
```

### 2. 基于错误级别

```javascript
function reportError(error, level = 'error') {
  const context = {
    level: level,
    timestamp: new Date().toISOString()
  };
  
  if (level === 'critical') {
    // 立即上报
    tracker.report(error, { ...context, priority: 'high' });
  } else if (level === 'warning') {
    // 批量上报
    tracker.report(error, context);
  }
  // info 级别不上报
}
```

### 3. 基于用户类型

```javascript
function reportError(error, context) {
  // 只上报付费用户的错误
  if (currentUser.isPremium) {
    tracker.report(error, {
      ...context,
      userTier: 'premium'
    });
  }
}
```

## 自定义错误类

```javascript
class BusinessError extends Error {
  constructor(message, code, data) {
    super(message);
    this.name = 'BusinessError';
    this.code = code;
    this.data = data;
  }
}

// 使用
try {
  if (!isValid) {
    throw new BusinessError(
      'Validation failed',
      'VALIDATION_ERROR',
      { field: 'email' }
    );
  }
} catch (error) {
  if (error instanceof BusinessError) {
    tracker.report(error, {
      type: 'business_error',
      code: error.code,
      data: error.data
    });
  }
}
```

## 与其他工具集成

### 1. 与日志系统集成

```javascript
const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  onError(error) {
    // 同时发送到日志系统
    logger.error('Error captured', error);
  }
});
```

### 2. 与分析工具集成

```javascript
const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  onError(error) {
    // 发送到 Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'exception', {
        description: error.message,
        fatal: error.type === 'global_error'
      });
    }
  }
});
```

### 3. 与通知系统集成

```javascript
const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  onError(error) {
    // 严重错误发送通知
    if (error.status >= 500) {
      sendNotification({
        title: 'Critical Error',
        message: error.message
      });
    }
  }
});
```

## 完整示例

```javascript
import ErrorCatcher from 'error-catcher';

// 初始化
const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  environment: 'production',
  debug: false
});

// 设置用户信息
function onUserLogin(user) {
  tracker.setUser({
    id: user.id,
    username: user.username,
    email: user.email
  });
  
  tracker.setTags({
    userRole: user.role,
    userPlan: user.plan
  });
}

// 添加面包屑
function trackNavigation(to, from) {
  tracker.addBreadcrumb({
    category: 'navigation',
    message: `${from} -> ${to}`,
    level: 'info',
    data: { from, to }
  });
}

// 手动上报
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    tracker.report(error, {
      action: 'fetchData',
      api: '/api/data'
    });
    throw error;
  }
}

// 性能监控
function monitorPerformance(api, duration) {
  if (duration > 3000) {
    tracker.report(new Error('Slow API'), {
      type: 'performance',
      api: api,
      duration: duration,
      threshold: 3000
    });
  }
}
```

## 相关文档

- [配置详解](/guide/configuration)
- [API 方法](/api/methods)
- [最佳实践](/guide/best-practices)
