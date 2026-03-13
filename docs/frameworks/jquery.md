# jQuery 集成

ErrorCatcher 支持 jQuery，可以自动捕获 jQuery Ajax 错误。

## 安装

### NPM

```bash
npm install error-catcher
```

### CDN

```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://unpkg.com/error-catcher/dist/error-catcher.min.js"></script>
```

## 基础使用

```html
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script src="error-catcher.js"></script>
</head>
<body>
  <button id="fetch-btn">获取数据</button>

  <script>
    // 创建 ErrorCatcher 实例
    const tracker = new ErrorCatcher({
      reportUrl: 'http://your-api.com/api/errors/report',
      projectId: 'your-project-id',
      apiKey: 'your-api-key',
      jquery: true,  // 启用 jQuery 集成（或自动检测）
      environment: 'production',
      debug: false
    });

    // jQuery Ajax 错误会自动捕获
    $('#fetch-btn').click(function() {
      $.ajax({
        url: '/api/data',
        method: 'GET',
        success: function(data) {
          console.log('Success:', data);
        },
        error: function(xhr, status, error) {
          // ErrorCatcher 已自动捕获，这里可以添加额外处理
          console.error('Error:', error);
        }
      });
    });
  </script>
</body>
</html>
```

## 自动检测

ErrorCatcher 会自动检测 jQuery 的存在，无需手动配置：

```javascript
// 自动检测 jQuery
const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  apiKey: 'your-api-key'
  // jquery: true  // 可选，会自动检测
});
```

## 自动捕获

ErrorCatcher 会自动捕获 jQuery Ajax 错误、全局 JavaScript 错误、Promise 拒绝和网络请求错误。详见 [自动捕获功能](/guide/auto-capture.md)。

## 完整示例

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>jQuery ErrorCatcher Demo</title>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script src="error-catcher.js"></script>
</head>
<body>
  <h1>jQuery ErrorCatcher Demo</h1>
  
  <button id="ajax-get">GET 请求</button>
  <button id="ajax-post">POST 请求</button>
  <button id="ajax-error">触发错误</button>
  <button id="js-error">JS 错误</button>

  <div id="result"></div>

  <script>
    // 初始化 ErrorCatcher
    const tracker = new ErrorCatcher({
      reportUrl: 'http://localhost:3001/api/errors/report',
      projectId: 'jquery-demo',
      apiKey: 'demo-api-key',
      environment: 'development',
      debug: true
    });

    // GET 请求
    $('#ajax-get').click(function() {
      $.ajax({
        url: '/api/users',
        method: 'GET',
        success: function(data) {
          $('#result').html('Success: ' + JSON.stringify(data));
        }
      });
    });

    // POST 请求
    $('#ajax-post').click(function() {
      $.ajax({
        url: '/api/users',
        method: 'POST',
        data: JSON.stringify({ name: 'John' }),
        contentType: 'application/json',
        success: function(data) {
          $('#result').html('Created: ' + JSON.stringify(data));
        }
      });
    });

    // 触发 Ajax 错误
    $('#ajax-error').click(function() {
      $.ajax({
        url: '/api/not-found',
        method: 'GET'
      });
    });

    // 触发 JS 错误
    $('#js-error').click(function() {
      throw new Error('Test JavaScript Error');
    });

    // 手动上报错误
    function handleCustomError() {
      try {
        // 你的代码
        riskyOperation();
      } catch (error) {
        tracker.report(error, {
          action: 'handleCustomError',
          timestamp: new Date().toISOString()
        });
      }
    }
  </script>
</body>
</html>
```

## 使用 $.get 和 $.post

```javascript
// $.get 错误会自动捕获
$.get('/api/data', function(data) {
  console.log('Success:', data);
});

// $.post 错误会自动捕获
$.post('/api/data', { name: 'John' }, function(data) {
  console.log('Success:', data);
});

// $.getJSON 错误会自动捕获
$.getJSON('/api/data', function(data) {
  console.log('Success:', data);
});
```

## 完整配置示例

```javascript
const tracker = new ErrorCatcher({
  // 必需配置
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  
  // jQuery 集成
  jquery: true,
  
  // 基础配置
  environment: 'production',
  release: '1.0.0',
  
  // 采样和批量
  sampleRate: 0.8,
  maxBatchSize: 20,
  delay: 2000,
  
  // 功能开关
  debug: false,
  autoStart: true,
  autoIntegrate: true,
  
  // 高级配置
  ignoreUrls: [
    /analytics/,
    /tracking/,
    /\.(jpg|png|gif)$/
  ],
  
  // 钩子函数
  beforeSend: function(error) {
    if (error.url && error.url.includes('password')) {
      return false;
    }
    return error;
  },
  
  onError: function(error) {
    console.log('Error captured:', error);
  }
});
```

## API 方法

详见 [错误上下文结构](/guide/error-context.md) 了解完整的 API 方法和上下文结构。

常用方法：

```javascript
// 手动上报错误
tracker.report(new Error('Something went wrong'), {
  action: 'buttonClick',
  buttonId: 'submit-btn'
});

// 设置用户信息
tracker.setUser({
  id: 'user-123',
  username: 'john_doe',
  email: 'john@example.com'
});

// 设置标签
tracker.setTag('page', 'checkout');
tracker.setTags({
  page: 'checkout',
  version: '1.0.0'
});

// 添加面包屑
tracker.addBreadcrumb({
  category: 'user',
  message: 'User clicked button',
  level: 'info',
  data: {
    buttonId: 'submit-btn'
  }
});
```

## 自动捕获的数据

ErrorCatcher 会自动捕获以下信息：

### jQuery Ajax 错误
- `type`: 'jquery_ajax_error'
- `url`: 请求地址
- `method`: 请求方法
- `status`: HTTP 状态码
- `statusText`: 状态文本
- `message`: 错误消息
- `response`: 响应内容

### 全局错误
- `type`: 'global_error'
- `message`: 错误消息
- `stack`: 错误堆栈
- `filename`: 文件名
- `lineno`: 行号
- `colno`: 列号

### 浏览器信息
- `userAgent`: 用户代理
- `pageUrl`: 当前页面 URL

### 时间信息
- `timestamp`: 错误发生时间

## 最佳实践

### 1. 全局 Ajax 设置

```javascript
// 设置全局 Ajax 配置
$.ajaxSetup({
  timeout: 10000,
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// 全局 Ajax 错误处理（ErrorCatcher 已自动处理）
$(document).ajaxError(function(event, jqXHR, settings, thrownError) {
  // 可以添加额外的错误处理逻辑
  console.error('Ajax error:', thrownError);
});
```

### 2. 用户操作追踪

```javascript
// 追踪按钮点击
$('button').click(function() {
  tracker.addBreadcrumb({
    category: 'user',
    message: 'Button clicked',
    level: 'info',
    data: {
      buttonId: $(this).attr('id'),
      buttonText: $(this).text()
    }
  });
});

// 追踪表单提交
$('form').submit(function() {
  tracker.addBreadcrumb({
    category: 'user',
    message: 'Form submitted',
    level: 'info',
    data: {
      formId: $(this).attr('id')
    }
  });
});
```

### 3. 页面加载完成后初始化

```javascript
$(document).ready(function() {
  const tracker = new ErrorCatcher({
    reportUrl: 'http://your-api.com/api/errors/report',
    projectId: 'your-project-id',
    apiKey: 'your-api-key'
  });

  // 将 tracker 保存到全局
  window.errorTracker = tracker;
});
```

### 4. 与其他库集成

```javascript
// 与 Bootstrap 集成
$('#myModal').on('show.bs.modal', function() {
  tracker.addBreadcrumb({
    category: 'ui',
    message: 'Modal opened',
    level: 'info'
  });
});

// 与 DataTables 集成
$('#myTable').DataTable({
  ajax: {
    url: '/api/data',
    error: function(xhr, error, thrown) {
      // ErrorCatcher 已自动捕获
      console.error('DataTables error:', thrown);
    }
  }
});
```

## 相关文档

- [配置详解](/guide/configuration)
- [API 方法](/api/methods)
- [最佳实践](/guide/best-practices)
