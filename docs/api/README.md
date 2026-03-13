# ErrorCatcher API Documentation

Complete API reference for ErrorCatcher error monitoring library.

## 📚 Documentation Structure

### Core Documentation

1. **[API Methods](./methods.md)** - Complete reference for all public methods
   - Core methods (init, destroy, report)
   - User management (setUser)
   - Tags management (setTag, setTags)
   - Context management (setContext)
   - Extra data (setExtra)
   - Breadcrumbs (addBreadcrumb)
   - Configuration options
   - Automatic error capture
   - Best practices

2. **[Detailed Error Capture](./detailed-error-capture.md)** - Comprehensive error information
   - DOM state information
   - Browser information
   - Network information
   - HTTP request details
   - Vue component context
   - Accessing captured information
   - Filtering sensitive data
   - Performance considerations
   - Examples and troubleshooting

### Quick References

- **[Quick Reference](../QUICK_REFERENCE.md)** - Quick lookup for common tasks
- **[Configuration Guide](../guide/configuration.md)** - Configuration options explained

## 🎯 Quick Start

### Installation

```bash
npm install error-catcher
```

### Basic Setup

```javascript
import ErrorCatcher from 'error-catcher';

const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/errors',
  projectId: 'your-project-id'
});

tracker.init();
```

### Set User Information

```javascript
tracker.setUser({
  id: 'user-123',
  email: 'user@example.com',
  username: 'john_doe'
});
```

### Add Tags

```javascript
tracker.setTags({
  version: '1.0.0',
  environment: 'production'
});
```

### Track User Actions

```javascript
tracker.addBreadcrumb({
  category: 'user-action',
  message: 'User clicked checkout',
  level: 'info'
});
```

### Manual Error Reporting

```javascript
try {
  riskyOperation();
} catch (error) {
  tracker.report(error, {
    type: 'custom_error',
    context: 'operation_name'
  });
}
```

## 📖 Method Reference

### Core Methods

| Method | Purpose | Example |
|--------|---------|---------|
| `init()` | Initialize monitoring | `tracker.init()` |
| `destroy()` | Stop monitoring | `tracker.destroy()` |
| `report(error, context)` | Manual error report | `tracker.report(error, { level: 'error' })` |

### User & Context

| Method | Purpose | Example |
|--------|---------|---------|
| `setUser(user)` | Set user information | `tracker.setUser({ id: '123' })` |
| `setTag(key, value)` | Set single tag | `tracker.setTag('env', 'prod')` |
| `setTags(tags)` | Set multiple tags | `tracker.setTags({ env: 'prod' })` |
| `setContext(key, value)` | Set context data | `tracker.setContext('device', {...})` |
| `setExtra(key, value)` | Set extra data | `tracker.setExtra('action', 'checkout')` |
| `addBreadcrumb(breadcrumb)` | Add breadcrumb | `tracker.addBreadcrumb({ message: '...' })` |

### Advanced Methods

| Method | Purpose | Example |
|--------|---------|---------|
| (None - all public methods are listed above) | | |

## 🔧 Configuration

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
  sampleRate: 1,           // 0-1, default: 1
  maxBatchSize: 10,        // Errors per batch
  delay: 1000,             // Batch send delay (ms)
  maxRetries: 3,           // Retry attempts
  
  // Features
  debug: false,            // Enable debug logging
  autoStart: true,         // Auto-initialize
  autoIntegrate: true,     // Auto-detect frameworks
  
  // Framework Integration
  vue: null,               // Vue instance
  react: false,            // Enable React
  axios: null,             // Axios instance
  jquery: false,           // Enable jQuery
  router: null,            // Router instance
  
  // Advanced
  ignoreUrls: [],          // URLs to ignore
  beforeSend: (error) => error,  // Modify error
  onError: (error) => {},  // Error callback
  fetch: null              // Custom fetch for SSR
});
```

## 🎨 Framework Integration

### Vue 2/3

```javascript
import ErrorCatcher from 'error-catcher';

const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/errors',
  projectId: 'your-project-id',
  vue: app
});

tracker.init();
```

### React

```javascript
const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/errors',
  projectId: 'your-project-id',
  react: true
});

tracker.init();
```

### Nuxt 2/3

```javascript
// plugins/error-catcher.js
export default ({ app }, inject) => {
  const tracker = new ErrorCatcher({
    reportUrl: 'http://your-api.com/errors',
    projectId: 'your-project-id'
  });
  
  tracker.init();
  inject('errorTracker', tracker);
};
```

### jQuery

```html
<script src="error-catcher.browser.js"></script>
<script>
  const tracker = new ErrorCatcher({
    reportUrl: 'http://your-api.com/errors',
    projectId: 'your-project-id',
    jquery: true
  });
  
  tracker.init();
</script>
```

## 📊 Automatically Captured Information

### DOM State
- Document ready state
- Active element
- Scroll position
- Viewport size

### Browser Information
- User agent
- Memory usage
- Performance metrics
- Connection information
- Storage information

### Network Information
- Online status
- Connection type
- Download speed
- Round trip time

### HTTP Request Details
- Request URL, method, status
- Request/response headers
- Request/response body
- Response size
- Request duration
- cURL command

### Vue Component Context
- Component name
- Lifecycle hook
- Props and data
- Parent component
- Route information

## 🔒 Security & Privacy

### Filter Sensitive Data

```javascript
const tracker = new ErrorCatcher({
  beforeSend: (errorData) => {
    // Remove passwords
    if (errorData.requestBody?.password) {
      errorData.requestBody.password = '[REDACTED]';
    }
    
    // Remove tokens
    if (errorData.requestHeaders?.Authorization) {
      errorData.requestHeaders.Authorization = '[REDACTED]';
    }
    
    return errorData;
  }
});
```

### Use Sampling

```javascript
const tracker = new ErrorCatcher({
  sampleRate: 0.1  // Report 10% of errors
});
```

## 📈 Performance Tips

1. **Use sampling** for high-traffic environments
2. **Limit breadcrumbs** to critical actions
3. **Filter unnecessary data** in beforeSend
4. **Increase batch delay** to reduce requests
5. **Use ignoreUrls** to skip irrelevant errors

## 🐛 Troubleshooting

### Errors not being reported

1. Check `reportUrl` is correct
2. Verify `init()` was called
3. Enable `debug: true` for console logs
4. Check network tab for failed requests

### Too many errors

1. Reduce `sampleRate`
2. Add URLs to `ignoreUrls`
3. Use `beforeSend` to filter errors

### Missing information

1. Ensure methods called before errors occur
2. Check `beforeSend` isn't filtering data
3. Verify error is of supported type

## 📚 Additional Resources

- [Quick Reference](../QUICK_REFERENCE.md)
- [Configuration Guide](../guide/configuration.md)
- [Best Practices](../guide/best-practices.md)
- [Framework Guides](../frameworks/)
- [Examples](../../examples/)

## 🔗 Related Documentation

- [Admin Documentation](../../admin/DETAILED_ERROR_CAPTURE.md)
- [Quick Start Guide](../../admin/QUICK_START_DETAILED_ERRORS.md)
- [Error Capture Examples](../../admin/DETAILED_ERROR_EXAMPLES.md)
- [Error Capture Summary](../../admin/ERROR_CAPTURE_SUMMARY.md)

## 📝 Version

Current version: 1.0.0

## 📄 License

MIT

