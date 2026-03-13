# ErrorCatcher Quick Reference

Quick reference guide for ErrorCatcher API methods.

## Installation

### Local Development (Current)

ErrorCatcher is not yet published to npm. For local development, use:

**Option 1: Direct dist file**
```html
<script src="./dist/error-catcher.browser.js"></script>
```

**Option 2: Import from source**
```javascript
import ErrorCatcher from './src/core/ErrorCatcher.js';
```

**Option 3: ESM version**
```javascript
import ErrorCatcher from './dist/error-catcher.esm.js';
```

### NPM Installation (Future)

```bash
npm install error-catcher
```

## Basic Usage

```javascript
import ErrorCatcher from 'error-catcher';

const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  environment: 'production'
});

tracker.init();
```

## Manual Error Reporting

```javascript
try {
  riskyOperation();
} catch (error) {
  tracker.report(error, {
    level: 'error',
    tags: { section: 'payment' }
  });
}
```

## API Methods

### Core Methods

| Method | Description | Example |
|--------|-------------|---------|
| `init()` | Initialize monitoring | `tracker.init()` |
| `destroy()` | Stop monitoring | `tracker.destroy()` |
| `report(error, options)` | Manual error report | `tracker.report(new Error('test'), { level: 'error' })` |

### User Management

| Method | Description | Example |
|--------|-------------|---------|
| `setUser(user)` | Set user info | `tracker.setUser({ id: '123', username: 'john' })` |

### Tags Management

| Method | Description | Example |
|--------|-------------|---------|
| `setTag(key, value)` | Set single tag | `tracker.setTag('env', 'production')` |
| `setTags(tags)` | Set multiple tags | `tracker.setTags({ env: 'prod', version: '2.0' })` |

### Context & Extra Data

| Method | Description | Example |
|--------|-------------|---------|
| `setContext(key, value)` | Set context | `tracker.setContext('device', { type: 'mobile' })` |
| `setExtra(key, value)` | Set extra data | `tracker.setExtra('action', 'checkout')` |

### Breadcrumbs

| Method | Description | Example |
|--------|-------------|---------|
| `addBreadcrumb(breadcrumb)` | Add breadcrumb | `tracker.addBreadcrumb({ message: 'User action' })` |

## Configuration Options

```javascript
const tracker = new ErrorCatcher({
  // Required
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  
  // Optional
  apiKey: 'your-api-key',
  environment: 'production',
  release: '1.0.0',
  sampleRate: 1.0,
  maxBatchSize: 10,
  delay: 1000,
  maxRetries: 3,
  debug: false,
  autoStart: true,
  autoIntegrate: true,
  
  // Framework integration
  vue: app,           // Vue instance
  react: true,        // Enable React
  axios: axios,       // Axios instance
  jquery: true,       // Enable jQuery
  
  // Callbacks
  beforeSend: (error) => error,
  onError: (error) => console.log(error),
  
  // Filtering
  ignoreUrls: [/\.jpg$/, '/favicon.ico']
});
```

## Framework Examples

### Vue 2/3

```javascript
import { createApp } from 'vue';
import ErrorCatcher from 'error-catcher';

const app = createApp(App);

const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  vue: app
});

tracker.init();
app.config.globalProperties.$errorTracker = tracker;
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
export default tracker;
```

### Nuxt 2

```javascript
// plugins/error-catcher.js
import ErrorCatcher from 'error-catcher';

export default ({ app }, inject) => {
  const tracker = new ErrorCatcher({
    reportUrl: process.env.ERROR_REPORT_URL,
    projectId: process.env.PROJECT_ID
  });
  
  tracker.init();
  inject('errorTracker', tracker);
};
```

### Nuxt 3

```javascript
// plugins/error-catcher.js
import ErrorCatcher from 'error-catcher';

export default defineNuxtPlugin((nuxtApp) => {
  const tracker = new ErrorCatcher({
    reportUrl: 'http://your-api.com/api/errors/report',
    projectId: 'your-project-id'
  });
  
  tracker.init();
  
  return {
    provide: {
      errorTracker: tracker
    }
  };
});
```

### jQuery

```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="error-catcher.browser.js"></script>
<script>
  const tracker = new ErrorCatcher({
    reportUrl: 'http://your-api.com/api/errors/report',
    projectId: 'your-project-id',
    jquery: true
  });
  
  tracker.init();
</script>
```

### Plain HTML

```html
<script src="error-catcher.browser.js"></script>
<script>
  const tracker = new ErrorCatcher({
    reportUrl: 'http://your-api.com/api/errors/report',
    projectId: 'your-project-id'
  });
  
  tracker.init();
</script>
```

## Common Patterns

### Set User on Login

```javascript
function onLogin(user) {
  tracker.setUser({
    id: user.id,
    username: user.username,
    email: user.email
  });
}
```

### Track User Actions

```javascript
function onButtonClick(action) {
  tracker.addBreadcrumb({
    category: 'user',
    message: `User clicked ${action}`,
    level: 'info',
    data: { action }
  });
}
```

### Add Context for Specific Features

```javascript
function enterCheckout() {
  tracker.setContext('checkout', {
    step: 'payment',
    items: 3,
    total: 99.99
  });
}
```

### Tag Errors by Feature

```javascript
tracker.setTags({
  feature: 'checkout',
  version: '2.0.0',
  environment: 'production'
});
```

### Manual Error Reporting with Context

```javascript
async function processPayment() {
  try {
    await chargeCard();
  } catch (error) {
    tracker.report(error, {
      level: 'error',
      tags: { payment_method: 'credit_card' },
      extra: { 
        amount: 99.99,
        currency: 'USD',
        orderId: '12345'
      }
    });
    throw error;
  }
}
```

## Automatic Error Capture

ErrorCatcher automatically captures:

- ✅ Global JavaScript errors
- ✅ Unhandled Promise rejections
- ✅ Fetch API errors (4xx, 5xx)
- ✅ XMLHttpRequest errors
- ✅ Axios errors (if axios detected)
- ✅ jQuery.ajax errors (if jQuery detected)
- ✅ Vue component errors (if Vue instance provided)
- ✅ React errors (via Error Boundaries)

## Error Data Captured

Each error includes:

- Error type and message
- Stack trace
- Timestamp
- Page URL
- User agent
- **DOM state** (active element, scroll position, viewport)
- **Browser info** (memory, performance, connection)
- **Network info** (online status, connection type)
- User information (if set)
- Tags (if set)
- Context data (if set)
- Extra data (if set)
- Breadcrumbs (last 100)
- For API errors:
  - Request URL
  - HTTP method
  - Status code
  - Request/response headers
  - Request/response body
  - Response size
  - Duration
  - cURL command (for reproduction)
- For Vue errors:
  - Component name and lifecycle
  - Props and data state
  - Parent component info
  - Route information

## Best Practices

1. **Set user early**: Call `setUser()` after login
2. **Use tags for filtering**: Tag errors by feature, version, etc.
3. **Add breadcrumbs**: Track user actions leading to errors
4. **Use context wisely**: Add relevant context for debugging
5. **Sample in production**: Use `sampleRate` to reduce volume
6. **Filter noise**: Use `ignoreUrls` to skip irrelevant errors
7. **Use beforeSend**: Filter or modify errors before sending

## Troubleshooting

### Errors not being reported

1. Check `reportUrl` is correct
2. Check network tab for failed requests
3. Enable `debug: true` to see console logs
4. Verify `init()` was called

### Too many errors

1. Reduce `sampleRate` (e.g., `0.1` for 10%)
2. Add URLs to `ignoreUrls`
3. Use `beforeSend` to filter errors

### Missing context

1. Ensure `setUser()`, `setTags()`, etc. are called before errors occur
2. Check that methods are called on the correct tracker instance

## Links

- [Full API Documentation](./api/methods.md)
- [Detailed Error Capture](./api/detailed-error-capture.md)
- [Configuration Guide](./guide/configuration.md)
- [Framework Integration](./frameworks/)
- [Examples](../examples/)
