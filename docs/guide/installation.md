# 安装指南

ErrorCatcher 目前还未发布到 npm，但你可以通过多种方式在本地开发中使用。

## 本地开发安装

### 方式 1：直接引入 dist 文件（推荐用于浏览器）

最简单的方式是直接引入编译后的 dist 文件：

```html
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <script src="./dist/error-catcher.browser.js"></script>
  <script>
    const tracker = new ErrorCatcher({
      reportUrl: 'http://your-api.com/api/errors/report',
      projectId: 'your-project-id'
    });
  </script>
</body>
</html>
```

**可用的 dist 文件**:
- `dist/error-catcher.browser.js` - 浏览器全局变量版本
- `dist/error-catcher.esm.js` - ES Module 版本
- `dist/error-catcher.cjs.js` - CommonJS 版本
- `dist/error-catcher.js` - 通用版本

### 方式 2：导入源代码（推荐用于开发）

直接从源代码导入，便于调试：

```javascript
import ErrorCatcher from './src/core/ErrorCatcher.js';

const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id'
});
```

### 方式 3：使用 ESM 版本（推荐用于模块化项目）

```javascript
import ErrorCatcher from './dist/error-catcher.esm.js';

const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id'
});
```

### 方式 4：使用 CommonJS 版本

```javascript
const ErrorCatcher = require('./dist/error-catcher.cjs.js');

const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id'
});
```

## 框架集成

### Vue 3

```javascript
import { createApp } from 'vue';
import ErrorCatcher from './src/core/ErrorCatcher.js';
import App from './App.vue';

const app = createApp(App);

const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  vue: app
});

app.provide('errorTracker', tracker);
app.mount('#app');
```

### React

```javascript
import ErrorCatcher from './src/core/ErrorCatcher.js';

const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  react: true
});
```

### Nuxt 3

```javascript
// plugins/error-catcher.client.js
import ErrorCatcher from '../src/core/ErrorCatcher.js';

export default defineNuxtPlugin((nuxtApp) => {
  const tracker = new ErrorCatcher({
    reportUrl: 'http://your-api.com/api/errors/report',
    projectId: 'your-project-id',
    vue: nuxtApp.vueApp
  });

  return {
    provide: {
      errorTracker: tracker
    }
  };
});
```

## NPM 发布（未来）

当 ErrorCatcher 发布到 npm 后，安装会变得更简单：

```bash
npm install error-catcher
# 或
yarn add error-catcher
# 或
pnpm add error-catcher
```

然后导入使用：

```javascript
import ErrorCatcher from 'error-catcher';

const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id'
});
```

## CDN 发布（未来）

当发布到 CDN 后，你可以直接在 HTML 中引入：

```html
<script src="https://unpkg.com/error-catcher/dist/error-catcher.browser.js"></script>
```

## 选择合适的安装方式

| 场景 | 推荐方式 | 优点 |
|------|--------|------|
| 浏览器直接使用 | dist/error-catcher.browser.js | 无需构建工具 |
| 开发调试 | src/core/ErrorCatcher.js | 便于调试源代码 |
| 模块化项目 | dist/error-catcher.esm.js | 支持 tree-shaking |
| Node.js/SSR | dist/error-catcher.cjs.js | CommonJS 兼容 |
| 生产环境 | dist/error-catcher.esm.js | 最优化的输出 |

## 下一步

- [快速开始](/guide/getting-started)
- [配置选项](/guide/configuration)
- [框架集成](/frameworks/)
