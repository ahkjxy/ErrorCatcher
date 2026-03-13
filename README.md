# ErrorCatcher

> ⚠️ **项目状态**: 本项目还未发布到 GitHub，目前仅在本地开发中。

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0.0-blue" alt="version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="license">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome">
</p>

通用的前端错误监控 SDK，**零配置**，**自动集成**所有主流框架，一个文件搞定！

## ✨ 特点

- 🚀 **零配置** - 自动检测并集成所有框架，无需手动配置
- 📦 **单文件** - 无需额外插件，一个 JS 文件搞定
- 🎯 **全框架支持** - Vue 2/3, React, Nuxt 2/3, Next.js, jQuery, 原生 JS
- 🔍 **自动捕获** - fetch, XHR, axios, jQuery.ajax 全自动拦截
- 🌐 **SSR 支持** - 完美支持 Nuxt 和 Next.js 服务端渲染
- 📊 **完整信息** - 自动捕获 URL、method、status、耗时、堆栈等
- 💪 **零依赖** - 不依赖任何第三方库
- 📈 **可视化后台** - 完整的错误统计和分析后台
- 🔐 **权限控制** - 基于项目的访问权限控制，支持多用户协作
- 🔔 **钉钉通知** - 支持钉钉机器人告警，自定义消息模板
- 👥 **用户管理** - 完整的用户管理系统，支持角色权限
- 🤖 **AI 智能分析** - 自动分析错误根因，提供修复建议（NEW!）

## 🚀 快速开始

### 原生 HTML

```html
<script src="error-catcher.js"></script>
<script>
  const tracker = new ErrorCatcher({
    reportUrl: 'http://your-api.com/errors/report',
    projectId: 'your-project-id'
  });
  // 自动初始化，自动检测并集成所有框架
</script>
```

### Vue 2/3

```javascript
import ErrorCatcher from 'error-catcher'

const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/errors/report',
  projectId: 'your-project-id',
  vue: app  // 传入 Vue 实例
})
tracker.init()
```

### Nuxt 2/3

```javascript
// plugins/error-catcher.client.js
import ErrorCatcher from 'error-catcher'

export default function(ctx, inject) {
  const tracker = new ErrorCatcher({
    reportUrl: 'http://your-api.com/errors/report',
    projectId: 'your-project-id',
    vue: ctx.app,
    axios: ctx.$axios  // 自动拦截 axios
  })
  tracker.init()
  inject('errorTracker', tracker)
}
```

### React / Next.js

```javascript
import ErrorCatcher from 'error-catcher'

const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/errors/report',
  projectId: 'your-project-id',
  react: true
})
tracker.init()
```

### jQuery

```html
<script src="jquery.js"></script>
<script src="error-catcher.js"></script>
<script>
  // 自动检测 jQuery 并拦截 $.ajax 错误
  const tracker = new ErrorCatcher({
    reportUrl: 'http://your-api.com/errors/report',
    projectId: 'your-project-id'
  });
</script>
```

## 📖 自动捕获的错误

### 所有环境
- ✅ 全局 JS 错误
- ✅ Promise Rejection
- ✅ fetch 错误（4xx/5xx）
- ✅ XMLHttpRequest 错误（4xx/5xx）

### Vue 2/3
- ✅ 组件错误
- ✅ 生命周期错误
- ✅ 渲染错误

### axios
- ✅ 请求错误
- ✅ 响应错误
- ✅ 网络错误
- ✅ 完整的 URL（包含查询参数）
- ✅ 请求耗时

### jQuery
- ✅ $.ajax 错误
- ✅ $.get / $.post 错误

## 📊 自动捕获的信息

### 所有错误
- 错误类型
- 错误消息
- 堆栈信息
- 时间戳
- 页面 URL
- 用户代理

### API 错误（额外）
- 接口 URL（完整，包含查询参数）
- HTTP 方法
- 状态码
- 状态文本
- 请求头
- 请求体
- 响应头
- 响应体
- 请求耗时

## ⚙️ 配置选项

```javascript
const tracker = new ErrorCatcher({
  // 必需
  reportUrl: 'http://your-api.com/errors/report',
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  
  // 可选
  environment: 'production',
  release: '1.0.0',
  
  // 采样和性能
  sampleRate: 1,              // 0-1, 1 表示 100%
  maxBatchSize: 10,           // 批量大小
  delay: 1000,                // 批量延迟（毫秒）
  
  // 功能开关
  debug: false,               // 调试模式
  autoStart: true,            // 自动启动
  autoIntegrate: true,        // 自动集成框架
  
  // 框架集成（手动）
  vue: null,                  // Vue 实例
  react: false,               // 启用 React
  axios: null,                // axios 实例
  jquery: false,              // 启用 jQuery
  
  // 高级
  ignoreUrls: [               // 忽略的 URL
    /\.(jpg|png|gif)$/i
  ],
  beforeSend: (error) => {    // 发送前钩子
    return error;
  }
});
```

## 📦 项目结构

```
ErrorCatcher/
├── src/
│   └── core/
│       └── ErrorCatcher.js      # 核心库（单文件）
├── plugins/
│   ├── nuxt2.client.js          # Nuxt2 插件
│   ├── nuxt3.client.js          # Nuxt3 插件
│   └── nuxt2.server.js          # SSR 插件
├── examples/
│   ├── html/                    # 原生 HTML 示例
│   ├── jquery/                  # jQuery 示例
│   └── nuxt2/                   # Nuxt2 示例
├── api/                         # 后端 API
└── admin/                       # 管理后台
```

## 🎯 示例

查看 `examples/` 目录获取完整示例：

- `examples/html/` - 原生 HTML 示例
- `examples/jquery/` - jQuery 示例
- `examples/nuxt2/` - Nuxt2 完整示例

## 📚 文档

### 快速开始
- [快速开始](./QUICK_START.md)
- [安装指南](./INSTALL.md)
- [通用使用指南](./UNIVERSAL_USAGE.md)

### 部署文档
- [部署指南总览](./deploy/README.md)
- [系统架构](./deploy/ARCHITECTURE.md)
- [本地开发环境](./deploy/LOCAL.md)
- [生产环境部署](./deploy/PRODUCTION.md)
- [Docker 容器化部署](./deploy/DOCKER.md)
- [Nginx 配置](./deploy/NGINX.md)
- [MongoDB 配置](./deploy/DATABASE.md)
- [环境变量说明](./deploy/ENVIRONMENT.md)
- [常见问题解答](./deploy/FAQ.md)

### 核心功能
- [访问权限控制](./docs/guide/access-control.md)
- [用户管理](./docs/guide/user-management.md)
- [通知配置](./docs/guide/notifications.md)
- [项目管理](./PROJECT_ACCESS_CONTROL_COMPLETE.md)
- [AI 智能分析](./docs/guide/ai-analysis.md) 🆕

### API 和集成
- [API 文档](./docs/guide/configuration.md)
- [框架集成](./docs/frameworks/)
- [钉钉集成](./DINGTALK_INTEGRATION.md)

### 构建和分发
- [构建系统说明](./DISTRIBUTION.md)
- [构建验证报告](./BUILD_VERIFICATION.md)
- [cURL 功能文档](./CURL_FEATURE_COMPLETE.md)

## 🔧 开发

### 本地开发

```bash
# 项目还未发布到 GitHub，请从本地源代码开始
# 确保你已经有项目的本地副本

# 进入项目目录
cd ErrorCatcher

# 安装所有依赖
npm run install:all

# 配置环境变量
cp api/.env.example api/.env
cp admin/.env.example admin/.env

# 启动 MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# 创建管理员账号
cd api && npm run create-admin

# 启动所有服务
npm run dev
```

访问：
- 管理后台: http://localhost:3000
- API 服务: http://localhost:3001
- 文档站点: http://localhost:5173

### Docker 部署

```bash
# 复制环境变量文件
cp .env.example .env

# 编辑配置（修改密码等）
nano .env

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 创建管理员账号
docker-compose exec api npm run create-admin
```

详细部署文档请查看 [deploy/](./deploy/) 目录。

## 📝 License

MIT

## 🤝 贡献

欢迎提交 PR 和 Issue！
