# ErrorCatcher API Methods

Complete reference for all public methods available in ErrorCatcher.

## Core Methods

### init()

Initialize ErrorCatcher and start monitoring errors.

```javascript
const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id'
});

tracker.init();
```

**Note:** If `autoStart: true` (default), `init()` is called automatically.

---

### destroy()

Stop error monitoring and restore original methods.

```javascript
tracker.destroy();
```

---

### report(error, context)

Manually report an error with optional context.

**Parameters:**
- `error` (Error): The error object to report
- `context` (Object, optional): Additional context data

```javascript
try {
  riskyOperation();
} catch (error) {
  tracker.report(error, {
    type: 'manual',
    level: 'error',
    tags: { section: 'payment' },
    extra: { orderId: '12345' }
  });
}
```

**Automatically Captured Details:**
- DOM state (active element, scroll position, viewport size)
- Browser info (memory, performance, connection)
- Network info (online status, connection type)
- User agent and device information
- Request/response details (for HTTP errors)
- Vue component context (if applicable)

---

## User Management

### setUser(user)

Set user information for all subsequent errors.

**Parameters:**
- `user` (Object): User information object
  - `id` (string, optional): User ID
  - `username` (string, optional): Username
  - `email` (string, optional): User email
  - Any other custom fields

```javascript
tracker.setUser({
  id: 'user_12345',
  username: 'john_doe',
  email: 'john@example.com',
  role: 'admin'
});
```

---

## Tags Management

### setTag(key, value)

Set a single tag for all subsequent errors.

**Parameters:**
- `key` (string): Tag key
- `value` (string): Tag value

```javascript
tracker.setTag('environment', 'production');
tracker.setTag('version', '2.0.0');
```

---

### setTags(tags)

Set multiple tags at once.

**Parameters:**
- `tags` (Object): Object with key-value pairs

```javascript
tracker.setTags({
  environment: 'production',
  version: '2.0.0',
  region: 'us-west'
});
```

---

## Context Management

### setContext(key, value)

Set context data for all subsequent errors.

**Parameters:**
- `key` (string): Context key
- `value` (any): Context value (can be any type)

```javascript
tracker.setContext('device', {
  type: 'mobile',
  os: 'iOS',
  version: '15.0'
});

tracker.setContext('app', {
  name: 'MyApp',
  version: '1.2.3'
});
```

---

## Extra Data

### setExtra(key, value)

Set extra data for all subsequent errors.

**Parameters:**
- `key` (string): Extra data key
- `value` (any): Extra data value (can be any type)

```javascript
tracker.setExtra('lastAction', 'checkout');
tracker.setExtra('cartTotal', 99.99);
tracker.setExtra('items', ['item1', 'item2']);
```

---

## Breadcrumbs

### addBreadcrumb(breadcrumb)

Add a breadcrumb to track user actions leading to an error.

**Parameters:**
- `breadcrumb` (Object): Breadcrumb data
  - `category` (string, optional): Category (default: 'default')
  - `message` (string, optional): Breadcrumb message
  - `level` (string, optional): Level (default: 'info')
  - `data` (Object, optional): Additional data

```javascript
tracker.addBreadcrumb({
  category: 'navigation',
  message: 'User navigated to checkout',
  level: 'info',
  data: { from: '/cart', to: '/checkout' }
});

tracker.addBreadcrumb({
  category: 'user',
  message: 'User clicked pay button',
  level: 'info',
  data: { amount: 99.99 }
});
```

**Note:** Maximum 100 breadcrumbs are kept (oldest are removed).

---

## Complete Example

```javascript
import ErrorCatcher from 'error-catcher';

// Initialize
const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  environment: 'production',
  debug: false
});

tracker.init();

// Set user
tracker.setUser({
  id: 'user_12345',
  username: 'john_doe',
  email: 'john@example.com'
});

// Set tags
tracker.setTags({
  version: '2.0.0',
  region: 'us-west'
});

// Set context
tracker.setContext('device', {
  type: 'mobile',
  os: 'iOS'
});

// Set extra data
tracker.setExtra('feature', 'checkout');

// Add breadcrumbs
tracker.addBreadcrumb({
  category: 'navigation',
  message: 'User opened checkout',
  level: 'info'
});

// Manual error reporting
try {
  processPayment();
} catch (error) {
  tracker.report(error, {
    level: 'error',
    tags: { payment_method: 'credit_card' },
    extra: { amount: 99.99 }
  });
}

// Cleanup on app unmount
tracker.destroy();
```

---

## Advanced: Detailed Error Information

ErrorCatcher automatically captures comprehensive error details:

### DOM State Information
```javascript
{
  documentReady: 'complete',
  activeElement: 'BUTTON',
  activeElementId: 'checkout-btn',
  activeElementClass: 'btn-primary',
  visibilityState: 'visible',
  documentHeight: 2500,
  documentWidth: 1920,
  scrollPosition: { x: 0, y: 500 },
  viewport: { width: 1920, height: 1080 }
}
```

### Browser Information
```javascript
{
  userAgent: 'Mozilla/5.0...',
  language: 'en-US',
  languages: ['en-US', 'en'],
  platform: 'MacIntel',
  hardwareConcurrency: 8,
  deviceMemory: 16,
  maxTouchPoints: 0,
  vendor: 'Google Inc.',
  cookieEnabled: true,
  doNotTrack: null,
  onLine: true,
  memory: {
    usedJSHeapSize: 45000000,
    totalJSHeapSize: 50000000,
    jsHeapSizeLimit: 2000000000
  },
  performance: {
    navigationStart: 1234567890,
    domContentLoadedEventEnd: 1234567950,
    loadEventEnd: 1234568000,
    duration: 110
  },
  connection: {
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false,
    type: 'wifi'
  },
  storage: {
    localStorage: { size: 5000, itemCount: 10 },
    sessionStorage: { size: 2000, itemCount: 5 }
  }
}
```

### Network Information
```javascript
{
  online: true,
  type: 'wifi',
  effectiveType: '4g',
  downlink: 10,
  rtt: 50,
  saveData: false
}
```

### HTTP Request Details (for API errors)
```javascript
{
  url: 'https://api.example.com/orders',
  method: 'POST',
  status: 500,
  statusText: 'Internal Server Error',
  requestHeaders: { 'Content-Type': 'application/json' },
  requestBody: '{"orderId":"12345"}',
  responseHeaders: { 'Content-Type': 'application/json' },
  response: '{"error":"Database connection failed"}',
  responseSize: 1024,
  duration: 234,
  timing: {
    startTime: 1234567890,
    endTime: 1234567890,
    duration: 234
  },
  curlCommand: 'curl -X POST "https://api.example.com/orders" ...'
}
```

### Vue Component Context (for Vue errors)
```javascript
{
  componentName: 'CheckoutForm',
  lifecycle: 'mounted',
  componentPath: '/src/components/CheckoutForm.vue',
  props: { orderId: '12345', total: 99.99 },
  data: { loading: false, error: null },
  computed: ['isValid', 'totalWithTax'],
  methods: ['submit', 'validate'],
  parentComponent: 'CheckoutPage',
  route: {
    path: '/checkout',
    name: 'checkout',
    params: { orderId: '12345' },
    query: { step: '2' }
  }
}
```

---

## Framework Integration

### Vue 2/3

```javascript
// In main.js
import ErrorCatcher from 'error-catcher';

const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  vue: app // Pass Vue instance
});

tracker.init();

// Make available globally
app.config.globalProperties.$errorTracker = tracker;

// In components
export default {
  mounted() {
    this.$errorTracker.setUser({ id: 'user_123' });
    this.$errorTracker.addBreadcrumb({
      message: 'Component mounted',
      category: 'lifecycle'
    });
  }
}
```

### React

```javascript
import ErrorCatcher from 'error-catcher';

const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  react: true
});

tracker.init();

// In components
useEffect(() => {
  tracker.setUser({ id: 'user_123' });
  tracker.addBreadcrumb({
    message: 'Component mounted',
    category: 'lifecycle'
  });
}, []);
```

### Nuxt 2/3

```javascript
// In plugins/error-catcher.js
export default ({ app }, inject) => {
  const tracker = new ErrorCatcher({
    reportUrl: 'http://your-api.com/api/errors/report',
    projectId: 'your-project-id'
  });
  
  tracker.init();
  inject('errorTracker', tracker);
};

// In pages/components
export default {
  mounted() {
    this.$errorTracker.setUser({ id: 'user_123' });
  }
}
```

---

## Method Summary

| Method | Description | Example |
|--------|-------------|---------|
| `init()` | Initialize monitoring | `tracker.init()` |
| `destroy()` | Stop monitoring | `tracker.destroy()` |
| `report(error, context)` | Manual error report | `tracker.report(error, { level: 'error' })` |
| `setUser(user)` | Set user info | `tracker.setUser({ id: '123' })` |
| `setTag(key, value)` | Set single tag | `tracker.setTag('env', 'prod')` |
| `setTags(tags)` | Set multiple tags | `tracker.setTags({ env: 'prod' })` |
| `setContext(key, value)` | Set context | `tracker.setContext('device', {...})` |
| `setExtra(key, value)` | Set extra data | `tracker.setExtra('action', 'checkout')` |
| `addBreadcrumb(breadcrumb)` | Add breadcrumb | `tracker.addBreadcrumb({ message: '...' })` |

---

## Configuration Options

```javascript
const tracker = new ErrorCatcher({
  // Required
  reportUrl: 'http://your-api.com/errors',
  projectId: 'your-project-id',
  
  // Optional
  apiKey: 'your-api-key',
  environment: 'production',
  release: '1.0.0',
  
  // Sampling and Performance
  sampleRate: 1,           // 0-1, default: 1 (100%)
  maxBatchSize: 10,        // Errors per batch, default: 10
  delay: 1000,             // Batch send delay (ms), default: 1000
  maxRetries: 3,           // Retry attempts, default: 3
  
  // Features
  debug: false,            // Enable debug logging
  autoStart: true,         // Auto-initialize on load
  autoIntegrate: true,     // Auto-detect frameworks
  
  // Framework Integration
  vue: null,               // Vue instance
  react: false,            // Enable React integration
  axios: null,             // Axios instance
  jquery: false,           // Enable jQuery integration
  router: null,            // Router instance
  
  // Advanced
  ignoreUrls: [],          // URLs to ignore
  beforeSend: (error) => error,  // Modify error before sending
  onError: (error) => {},  // Error callback
  fetch: null              // Custom fetch for SSR
});
```

---

## Automatic Error Capture

ErrorCatcher automatically captures and reports:

### ✅ Global JavaScript Errors
- Uncaught exceptions
- Syntax errors
- Runtime errors

### ✅ Promise Rejections
- Unhandled promise rejections
- Async/await errors

### ✅ Fetch API Errors
- Network errors
- HTTP error responses (4xx, 5xx)
- Request/response details
- Response size and timing

### ✅ XMLHttpRequest Errors
- Network errors
- HTTP error responses
- Request/response headers
- Response size and timing

### ✅ Axios Errors
- Request/response errors
- Network errors
- Complete request/response data
- Request timing

### ✅ jQuery AJAX Errors
- AJAX request failures
- Network errors
- Response data

### ✅ Vue Errors
- Component lifecycle errors
- Template errors
- Component context (props, data, methods)
- Route information

### ✅ React Errors
- Component render errors
- Lifecycle errors
- (Use Error Boundaries for component-level errors)

---

## Notes

- All `set*` methods affect all subsequent errors
- Breadcrumbs are limited to 100 entries (FIFO)
- User, tags, context, and extra data are included in every error report
- Use `report()` for manual error reporting
- Automatic error capture works for all supported frameworks
- DOM state, browser info, and network info are automatically captured
- Use `beforeSend` hook to filter sensitive information
- Use `sampleRate` to reduce server load in high-traffic environments

---

## Best Practices

1. **Set user information early**
   ```javascript
   tracker.setUser({ id: userId, email: userEmail });
   ```

2. **Use tags for categorization**
   ```javascript
   tracker.setTags({ version: '1.0.0', environment: 'production' });
   ```

3. **Add breadcrumbs for critical actions**
   ```javascript
   tracker.addBreadcrumb({ category: 'payment', message: 'Payment initiated' });
   ```

4. **Filter sensitive data**
   ```javascript
   beforeSend: (error) => {
     if (error.requestBody?.password) {
       error.requestBody.password = '[REDACTED]';
     }
     return error;
   }
   ```

5. **Use sampling in production**
   ```javascript
   sampleRate: 0.1  // Report 10% of errors
   ```

6. **Monitor performance**
   ```javascript
   tracker.addBreadcrumb({
     category: 'performance',
     message: 'API call completed',
     data: { duration: 234, status: 200 }
   });
   ```

---
