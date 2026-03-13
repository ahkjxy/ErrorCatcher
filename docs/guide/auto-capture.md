# 自动捕获功能

ErrorCatcher 会自动捕获应用中发生的各种错误，无需手动配置。

## 支持的错误类型

### JavaScript 运行时错误

自动捕获所有未处理的 JavaScript 错误。

```javascript
// 自动捕获
throw new Error('Something went wrong');

// 自动捕获
const obj = null;
obj.property; // TypeError: Cannot read property 'property' of null

// 自动捕获
undefined.method(); // TypeError: undefined is not a function
```

### Promise Rejections

自动捕获所有未处理的 Promise 拒绝。

```javascript
// 自动捕获
Promise.reject(new Error('Promise failed'));

// 自动捕获
async function fetchData() {
  throw new Error('Async error');
}
fetchData(); // 未添加 .catch()
```

### Fetch API 错误

自动捕获 Fetch API 的 4xx/5xx 错误响应。

```javascript
// 自动捕获 4xx/5xx 错误
fetch('/api/data')
  .then(res => res.json());

// 自动捕获网络错误
fetch('/api/data')
  .catch(error => {
    // 自动上报
  });
```

### XMLHttpRequest 错误

自动捕获 XMLHttpRequest 的 4xx/5xx 错误。

```javascript
// 自动捕获 4xx/5xx 错误
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/data');
xhr.send();

// 自动捕获网络错误
xhr.onerror = function() {
  // 自动上报
};
```

### Axios 错误

需要在初始化时传入 axios 实例，ErrorCatcher 会自动拦截所有错误。

```javascript
import axios from 'axios';
import ErrorCatcher from 'error-catcher';

const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  axios: axios  // 传入 axios 实例
});

// 自动捕获所有 axios 错误
axios.get('/api/data');
axios.post('/api/data', { data: 'test' });
```

### jQuery Ajax 错误

ErrorCatcher 会自动检测 jQuery 并拦截所有 $.ajax 错误。

```javascript
// 自动检测 jQuery 并捕获错误
$.ajax({
  url: '/api/data',
  method: 'GET',
  error: function(xhr, status, error) {
    // 自动上报
  }
});

// 也支持 $.get 和 $.post
$.get('/api/data');
$.post('/api/data', { data: 'test' });
```

### Vue 组件错误

传入 Vue 实例后，ErrorCatcher 会自动捕获 Vue 组件中的错误。

```javascript
// Vue 2
import Vue from 'vue';
import ErrorCatcher from 'error-catcher';

const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  vue: Vue  // 传入 Vue 构造函数
});

// Vue 3
import { createApp } from 'vue';
import ErrorCatcher from 'error-catcher';

const app = createApp(App);

const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  vue: app  // 传入 Vue 应用实例
});
```

### React 错误

启用 React 集成后，ErrorCatcher 会捕获全局错误。建议配合 Error Boundary 使用。

```javascript
import ErrorCatcher from 'error-catcher';

const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  react: true  // 启用 React 集成
});
```

## 错误类型分类

### 网络错误

- `fetch_error` - Fetch API 错误
- `xhr_error` - XMLHttpRequest 错误
- `axios_error` - Axios 错误
- `jquery_ajax_error` - jQuery Ajax 错误

### 运行时错误

- `global_error` - 全局 JavaScript 错误
- `vue_error` - Vue 组件错误
- `promise_rejection` - Promise 拒绝

### 自定义错误

- `manual` - 手动上报的错误

## 禁用自动捕获

如果需要禁用某些自动捕获功能，可以在初始化时配置：

```javascript
const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  
  // 使用 beforeSend 钩子过滤错误
  beforeSend: (error) => {
    // 忽略 404 错误
    if (error.status === 404) {
      return false;
    }
    
    // 忽略特定 URL 的错误
    if (error.url && error.url.includes('/health')) {
      return false;
    }
    
    // 忽略跨域脚本错误
    if (error.message === 'Script error.') {
      return false;
    }
    
    return error;
  }
});
```

## 性能影响

自动捕获功能对应用性能的影响很小：

- **内存占用**: ~50KB
- **CPU 使用**: <1%
- **网络请求**: 仅在发生错误时发送

## 最佳实践

1. **始终启用自动捕获** - 这是捕获意外错误的最佳方式
2. **配合手动上报** - 对于业务逻辑错误，使用手动上报
3. **使用采样率** - 在生产环境中降低采样率以减少服务器负载
4. **过滤不重要的错误** - 使用 `beforeSend` 钩子过滤不需要的错误

## 下一步

- [手动上报错误](/guide/custom-report)
- [配置选项](/guide/configuration)
- [最佳实践](/guide/best-practices)
