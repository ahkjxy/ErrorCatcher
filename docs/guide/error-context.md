# 错误上下文结构

ErrorCatcher 使用标准的错误上下文结构来组织和传输错误信息。

## 标准上下文结构

### 基础字段

```javascript
{
  // 必需字段
  type: 'manual',              // 错误类型
  level: 'error',              // 错误级别
  
  // 可选字段
  component: 'UserProfile',    // 组件名
  action: 'handleClick',       // 操作名
  tags: {                       // 标签
    section: 'payment',
    feature: 'checkout'
  },
  extra: {                      // 额外数据
    userId: '123',
    orderId: 'order-456'
  }
}
```

## 错误类型 (type)

| 类型 | 说明 | 自动捕获 |
|------|------|--------|
| `global_error` | 全局 JavaScript 错误 | ✅ |
| `promise_rejection` | Promise 拒绝 | ✅ |
| `vue_error` | Vue 组件错误 | ✅ |
| `fetch_error` | Fetch API 错误 | ✅ |
| `xhr_error` | XMLHttpRequest 错误 | ✅ |
| `axios_error` | Axios 错误 | ✅ |
| `jquery_ajax_error` | jQuery Ajax 错误 | ✅ |
| `manual` | 手动上报 | ❌ |

## 错误级别 (level)

| 级别 | 说明 | 用途 |
|------|------|------|
| `fatal` | 致命错误 | 应用崩溃 |
| `error` | 错误 | 功能失败 |
| `warning` | 警告 | 潜在问题 |
| `info` | 信息 | 调试信息 |
| `debug` | 调试 | 开发调试 |

## 手动上报示例

### 基础上报

```javascript
try {
  await fetchData();
} catch (error) {
  tracker.report(error, {
    type: 'manual',
    level: 'error'
  });
}
```

### 带上下文的上报

```javascript
try {
  await processPayment(orderId);
} catch (error) {
  tracker.report(error, {
    type: 'manual',
    level: 'error',
    component: 'PaymentForm',
    action: 'processPayment',
    tags: {
      section: 'payment',
      feature: 'checkout'
    },
    extra: {
      orderId: orderId,
      amount: amount,
      currency: 'USD'
    }
  });
}
```

### 业务逻辑错误

```javascript
if (balance < amount) {
  tracker.report(new Error('Insufficient balance'), {
    type: 'manual',
    level: 'warning',
    component: 'Wallet',
    action: 'withdraw',
    extra: {
      balance: balance,
      amount: amount,
      userId: userId
    }
  });
}
```

### 异步操作错误

```javascript
async function loadUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    tracker.report(error, {
      type: 'manual',
      level: 'error',
      action: 'loadUserData',
      extra: {
        userId: userId,
        timestamp: new Date().toISOString()
      }
    });
    throw error;
  }
}
```

## 使用标签 (tags)

标签用于分类和过滤错误。

```javascript
// 单个标签
tracker.setTag('page', 'checkout');

// 多个标签
tracker.setTags({
  page: 'checkout',
  feature: 'payment',
  version: '1.0.0'
});

// 在上报时添加标签
tracker.report(error, {
  type: 'manual',
  tags: {
    page: 'checkout',
    feature: 'payment'
  }
});
```

## 使用额外数据 (extra)

额外数据用于存储与错误相关的自定义信息。

```javascript
// 设置全局额外数据
tracker.setExtra({
  userId: '123',
  sessionId: 'session-456'
});

// 在上报时添加额外数据
tracker.report(error, {
  type: 'manual',
  extra: {
    orderId: 'order-789',
    amount: 99.99,
    currency: 'USD'
  }
});
```

## 使用上下文 (context)

上下文用于存储应用的当前状态。

```javascript
// 设置上下文
tracker.setContext({
  page: 'checkout',
  step: 'payment',
  formData: {
    email: 'user@example.com',
    country: 'US'
  }
});

// 在上报时添加上下文
tracker.report(error, {
  type: 'manual',
  context: {
    page: 'checkout',
    step: 'payment'
  }
});
```

## 使用面包屑 (breadcrumbs)

面包屑记录用户操作的历史。

```javascript
// 添加面包屑
tracker.addBreadcrumb({
  category: 'user_action',
  message: 'User clicked submit button',
  level: 'info',
  data: {
    formId: 'checkout-form',
    timestamp: Date.now()
  }
});

// 常见面包屑类型
tracker.addBreadcrumb({
  category: 'navigation',
  message: 'User navigated to checkout',
  level: 'info'
});

tracker.addBreadcrumb({
  category: 'http',
  message: 'POST /api/payment',
  level: 'info',
  data: {
    status: 200,
    duration: 150
  }
});

tracker.addBreadcrumb({
  category: 'console',
  message: 'Warning message',
  level: 'warning'
});
```

## 完整示例

```javascript
// 初始化
const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  apiKey: 'your-api-key'
});

// 设置用户信息
tracker.setUser({
  id: '12345',
  username: 'john_doe',
  email: 'john@example.com'
});

// 设置全局标签
tracker.setTags({
  version: '1.0.0',
  environment: 'production'
});

// 设置全局额外数据
tracker.setExtra({
  sessionId: 'session-123',
  buildNumber: '456'
});

// 添加面包屑
tracker.addBreadcrumb({
  category: 'user_action',
  message: 'User started checkout',
  level: 'info'
});

// 处理错误
try {
  await processPayment(orderId);
} catch (error) {
  // 添加错误相关的面包屑
  tracker.addBreadcrumb({
    category: 'error',
    message: 'Payment processing failed',
    level: 'error'
  });
  
  // 上报错误
  tracker.report(error, {
    type: 'manual',
    level: 'error',
    component: 'PaymentForm',
    action: 'processPayment',
    tags: {
      section: 'payment',
      feature: 'checkout'
    },
    extra: {
      orderId: orderId,
      amount: amount,
      currency: 'USD',
      retryCount: 1
    }
  });
}
```

## 最佳实践

1. **使用一致的上下文结构** - 便于分析和过滤
2. **添加有意义的标签** - 便于分类和搜索
3. **记录关键信息** - 在 extra 中存储重要的业务数据
4. **使用面包屑** - 记录用户操作历史
5. **避免敏感信息** - 不要上报密码、令牌等敏感数据

## 下一步

- [手动上报错误](/guide/custom-report)
- [最佳实践](/guide/best-practices)
- [API 方法](/api/methods)
