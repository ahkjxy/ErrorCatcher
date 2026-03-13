# Detailed Error Capture API

Complete reference for ErrorCatcher's comprehensive error information capture capabilities.

## Overview

ErrorCatcher automatically captures detailed information about errors, including:
- DOM state and browser information
- Network and performance metrics
- HTTP request/response details
- Framework-specific context
- User actions (breadcrumbs)

## Automatically Captured Information

### DOM State

Every error includes current DOM state information:

```javascript
{
  documentReady: 'complete',           // Document ready state
  activeElement: 'BUTTON',             // Current active element tag
  activeElementId: 'checkout-btn',     // Active element ID
  activeElementClass: 'btn-primary',   // Active element classes
  visibilityState: 'visible',          // Page visibility state
  documentHeight: 2500,                // Total document height
  documentWidth: 1920,                 // Total document width
  scrollPosition: {
    x: 0,                              // Horizontal scroll position
    y: 500                             // Vertical scroll position
  },
  viewport: {
    width: 1920,                       // Viewport width
    height: 1080                       // Viewport height
  }
}
```

**Use Cases:**
- Identify if error occurred during page load
- Determine user's current view
- Understand page layout when error occurred

---

### Browser Information

Comprehensive browser and device information:

```javascript
{
  userAgent: 'Mozilla/5.0...',         // Full user agent string
  language: 'en-US',                   // Primary language
  languages: ['en-US', 'en'],          // All supported languages
  platform: 'MacIntel',                // Platform
  hardwareConcurrency: 8,              // CPU cores
  deviceMemory: 16,                    // RAM in GB
  maxTouchPoints: 0,                   // Touch support
  vendor: 'Google Inc.',               // Browser vendor
  cookieEnabled: true,                 // Cookie support
  doNotTrack: null,                    // DNT setting
  onLine: true,                        // Online status
  
  // Memory usage
  memory: {
    usedJSHeapSize: 45000000,          // Used heap (bytes)
    totalJSHeapSize: 50000000,         // Total heap (bytes)
    jsHeapSizeLimit: 2000000000        // Heap limit (bytes)
  },
  
  // Performance metrics
  performance: {
    navigationStart: 1234567890,       // Navigation start time
    domContentLoadedEventEnd: 1234567950,
    loadEventEnd: 1234568000,
    duration: 110                      // Total load time (ms)
  },
  
  // Network connection
  connection: {
    effectiveType: '4g',               // Connection type
    downlink: 10,                      // Download speed (Mbps)
    rtt: 50,                           // Round trip time (ms)
    saveData: false,                   // Data saver mode
    type: 'wifi'                       // Connection type
  },
  
  // Storage information
  storage: {
    localStorage: {
      size: 5000,                      // Total size (bytes)
      itemCount: 10                    // Number of items
    },
    sessionStorage: {
      size: 2000,
      itemCount: 5
    }
  }
}
```

**Use Cases:**
- Identify device/browser compatibility issues
- Detect memory leaks
- Analyze performance bottlenecks
- Understand network conditions

---

### Network Information

Current network status:

```javascript
{
  online: true,                        // Online status
  type: 'wifi',                        // Connection type
  effectiveType: '4g',                 // Effective connection type
  downlink: 10,                        // Download speed (Mbps)
  rtt: 50,                             // Round trip time (ms)
  saveData: false                      // Data saver mode enabled
}
```

**Use Cases:**
- Correlate errors with network conditions
- Identify slow network issues
- Detect offline scenarios

---

### HTTP Request Details

For API errors (Fetch, XHR, Axios):

```javascript
{
  url: 'https://api.example.com/orders',
  method: 'POST',
  status: 500,
  statusText: 'Internal Server Error',
  
  // Request information
  requestHeaders: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token...'
  },
  requestBody: '{"orderId":"12345"}',
  
  // Response information
  responseHeaders: {
    'Content-Type': 'application/json',
    'X-Request-Id': 'req-123'
  },
  response: '{"error":"Database connection failed"}',
  responseSize: 1024,                  // Response size in bytes
  
  // Timing information
  duration: 234,                       // Total request time (ms)
  timing: {
    startTime: 1234567890,
    endTime: 1234567890,
    duration: 234
  },
  
  // cURL command for reproduction
  curlCommand: 'curl -X POST "https://api.example.com/orders" ...'
}
```

**Use Cases:**
- Reproduce API errors
- Analyze API performance
- Debug request/response issues
- Identify server-side problems

---

### Vue Component Context

For Vue errors:

```javascript
{
  componentName: 'CheckoutForm',       // Component name
  lifecycle: 'mounted',                // Lifecycle hook
  componentPath: '/src/components/CheckoutForm.vue',
  
  // Component state
  props: {
    orderId: '12345',
    total: 99.99
  },
  data: {
    loading: false,
    error: null
  },
  
  // Component structure
  computed: ['isValid', 'totalWithTax'],
  methods: ['submit', 'validate'],
  
  // Component hierarchy
  parentComponent: 'CheckoutPage',
  
  // Route information
  route: {
    path: '/checkout',
    name: 'checkout',
    params: { orderId: '12345' },
    query: { step: '2' }
  }
}
```

**Use Cases:**
- Debug component state issues
- Understand component hierarchy
- Trace route-related errors
- Analyze lifecycle problems

---

## Accessing Captured Information

### In Error Details Page

All captured information is displayed in the error details page:

1. **Basic Info** - Error type, message, stack trace
2. **HTTP Info** - Request/response, cURL command
3. **Browser Info** - Memory, performance, connection
4. **DOM State** - Active element, scroll position
5. **User Info** - User ID, email, username
6. **Tags & Context** - Custom data
7. **Breadcrumbs** - User action history

### Programmatically

Access captured information via hooks:

```javascript
const tracker = new ErrorCatcher({
  beforeSend: (errorData) => {
    // Access all captured information
    console.log('DOM State:', errorData.dom);
    console.log('Browser Info:', errorData.browser);
    console.log('Network Info:', errorData.network);
    console.log('HTTP Info:', {
      url: errorData.url,
      status: errorData.status,
      duration: errorData.duration
    });
    
    return errorData;
  }
});
```

---

## Filtering Sensitive Information

Use `beforeSend` to remove sensitive data:

```javascript
const tracker = new ErrorCatcher({
  beforeSend: (errorData) => {
    // Remove sensitive request data
    if (errorData.requestBody) {
      try {
        const body = JSON.parse(errorData.requestBody);
        if (body.password) body.password = '[REDACTED]';
        if (body.creditCard) body.creditCard = '[REDACTED]';
        if (body.ssn) body.ssn = '[REDACTED]';
        errorData.requestBody = JSON.stringify(body);
      } catch (e) {}
    }
    
    // Remove sensitive response data
    if (errorData.response) {
      try {
        const response = JSON.parse(errorData.response);
        if (response.token) response.token = '[REDACTED]';
        if (response.apiKey) response.apiKey = '[REDACTED]';
        errorData.response = JSON.stringify(response);
      } catch (e) {}
    }
    
    // Remove sensitive headers
    if (errorData.requestHeaders?.Authorization) {
      errorData.requestHeaders.Authorization = '[REDACTED]';
    }
    
    return errorData;
  }
});
```

---

## Performance Considerations

### Data Size Limits

- **String truncation**: 2000 characters
- **Breadcrumbs**: Maximum 100 entries
- **Batch size**: Configurable (default: 10)

### Optimization Tips

1. **Use sampling** for high-traffic environments:
   ```javascript
   sampleRate: 0.1  // Report 10% of errors
   ```

2. **Limit breadcrumbs** to critical actions:
   ```javascript
   tracker.addBreadcrumb({
     category: 'critical',
     message: 'Payment initiated'
   });
   ```

3. **Filter unnecessary data**:
   ```javascript
   beforeSend: (errorData) => {
     // Remove large response bodies
     if (errorData.response?.length > 1000) {
       errorData.response = errorData.response.substring(0, 1000);
     }
     return errorData;
   }
   ```

---

## Examples

### Example 1: API Error with Full Context

```javascript
// Error automatically captured with:
// - Request/response details
// - Network information
// - Browser memory usage
// - DOM state
// - User information
// - Breadcrumbs

fetch('/api/orders', {
  method: 'POST',
  body: JSON.stringify({ orderId: '12345' })
})
.catch(error => {
  // All details automatically captured
});
```

### Example 2: Vue Component Error

```javascript
// Error automatically captured with:
// - Component name and lifecycle
// - Props and data state
// - Parent component info
// - Route information
// - DOM state
// - Browser information

export default {
  name: 'CheckoutForm',
  async mounted() {
    // Error here includes full component context
    const order = await this.fetchOrder();
  }
}
```

### Example 3: Manual Error with Custom Context

```javascript
try {
  processPayment();
} catch (error) {
  tracker.report(error, {
    type: 'payment_error',
    extra: {
      orderId: '12345',
      amount: 99.99,
      method: 'credit_card'
    }
  });
  
  // Captured information includes:
  // - Error details
  // - DOM state
  // - Browser info
  // - Network info
  // - Custom extra data
  // - User information
  // - Breadcrumbs
}
```

---

## Data Structure

Complete error data structure:

```javascript
{
  // Basic error info
  type: 'fetch_error',
  message: 'Failed to fetch',
  stack: '...',
  
  // HTTP info (if applicable)
  url: 'https://api.example.com/orders',
  method: 'POST',
  status: 500,
  statusText: 'Internal Server Error',
  requestHeaders: {...},
  requestBody: '...',
  responseHeaders: {...},
  response: '...',
  responseSize: 1024,
  duration: 234,
  curlCommand: '...',
  
  // Captured details
  dom: {...},
  browser: {...},
  network: {...},
  
  // Framework context
  vueContext: {...},  // if Vue error
  
  // User data
  user: { id, email, username },
  tags: {...},
  contexts: {...},
  extra: {...},
  breadcrumbs: [...],
  
  // Metadata
  projectId: '...',
  environment: 'production',
  release: '1.0.0',
  timestamp: '2024-01-01T12:00:00Z',
  userAgent: '...',
  pageUrl: '...'
}
```

---

## Best Practices

1. **Capture at the right level**
   - Use automatic capture for framework errors
   - Use manual reporting for business logic errors

2. **Add meaningful breadcrumbs**
   ```javascript
   tracker.addBreadcrumb({
     category: 'payment',
     message: 'Payment initiated',
     data: { amount: 99.99 }
   });
   ```

3. **Filter sensitive data early**
   ```javascript
   beforeSend: (error) => {
     // Remove PII and secrets
     return error;
   }
   ```

4. **Use tags for categorization**
   ```javascript
   tracker.setTags({
     version: '1.0.0',
     feature: 'checkout'
   });
   ```

5. **Monitor performance**
   ```javascript
   tracker.addBreadcrumb({
     category: 'performance',
     message: 'API call',
     data: { duration: 234 }
   });
   ```

---

## Troubleshooting

### Missing Information

If some information is not captured:

1. Check browser console for errors
2. Verify `debug: true` in configuration
3. Check `beforeSend` hook isn't filtering data
4. Ensure error is of supported type

### Performance Issues

If error reporting is slow:

1. Reduce `sampleRate`
2. Increase `delay` between batches
3. Decrease `maxBatchSize`
4. Filter large data in `beforeSend`

### Privacy Concerns

To protect user privacy:

1. Use `beforeSend` to filter PII
2. Disable storage information capture
3. Use sampling to reduce data collection
4. Review captured data regularly

---

