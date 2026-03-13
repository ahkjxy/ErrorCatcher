# ErrorCatcher 系统架构

## 系统概述

ErrorCatcher 是一个完整的前端错误监控平台，包含错误收集 SDK、后端 API、管理后台和文档站点。

## 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户应用层                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Vue App │  │ React App│  │ Nuxt App │  │ jQuery   │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │             │             │             │                │
│       └─────────────┴─────────────┴─────────────┘                │
│                          │                                        │
│                   ErrorCatcher.js                                 │
│                   (错误收集 SDK)                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP/WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Nginx 反向代理                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   /api/*     │  │   /admin/*   │  │   /docs/*    │          │
│  │  → API:3001  │  │ → Admin:3000 │  │ → Docs:5173  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  API Server  │  │    Admin     │  │     Docs     │
│  (Node.js)   │  │   (Vue 3)    │  │ (VitePress)  │
│  Port: 3001  │  │  Port: 3000  │  │ Port: 5173   │
└──────┬───────┘  └──────────────┘  └──────────────┘
       │
       ├─────────────┐
       ▼             ▼
┌──────────────┐  ┌──────────────┐
│   MongoDB    │  │   钉钉机器人   │
│  Port: 27017 │  │  (可选)       │
└──────────────┘  └──────────────┘
```

## 核心组件

### 1. ErrorCatcher.js (SDK)

**位置**: `src/core/ErrorCatcher.js`

**功能**:
- 自动捕获 JavaScript 错误
- 拦截 fetch/XHR 请求
- 集成主流框架（Vue、React、Nuxt 等）
- 批量上报错误
- 失败重试机制

**技术特点**:
- 零依赖
- 自动检测框架
- 支持 SSR
- 体积小巧（< 10KB）

**工作流程**:
```
1. 初始化 → 检测环境和框架
2. 安装拦截器 → fetch/XHR/全局错误
3. 捕获错误 → 添加到队列
4. 批量上报 → 定时发送到服务器
5. 失败重试 → 最多重试 3 次
```

### 2. API Server (后端)

**位置**: `api/`

**技术栈**:
- Node.js 18+
- Express 4.x
- MongoDB + Mongoose
- Socket.io (实时通信)
- JWT (身份认证)

**核心模块**:

#### 路由层 (`api/src/routes/`)
```
routes/
├── auth.js          # 用户认证（登录、注册）
├── users.js         # 用户管理
├── projects.js      # 项目管理
├── errors.js        # 错误上报和查询
├── issues.js        # 问题分组管理
├── alerts.js        # 告警规则
├── notifications.js # 通知配置
├── templates.js     # 消息模板
└── stats.js         # 统计数据
```

#### 数据模型 (`api/src/models/`)
```
models/
├── User.js              # 用户模型
├── Project.js           # 项目模型
├── ProjectMember.js     # 项目成员关联
├── Error.js             # 错误记录
├── Issue.js             # 问题分组
├── Alert.js             # 告警规则
├── AlertHistory.js      # 告警历史
├── NotificationConfig.js # 通知配置
├── NotificationTemplate.js # 消息模板
├── APIToken.js          # API 令牌
└── Comment.js           # 评论
```

#### 中间件 (`api/src/middleware/`)
```
middleware/
├── auth.js           # JWT 认证
├── projectAccess.js  # 项目权限控制
└── issueGrouping.js  # 错误分组算法
```

#### 服务层 (`api/src/services/`)
```
services/
├── notificationService.js  # 钉钉通知服务
└── alertService.js         # 告警检测服务
```

**数据流**:
```
Client Request
    ↓
Express Router
    ↓
Auth Middleware (验证 JWT)
    ↓
Project Access Middleware (检查权限)
    ↓
Route Handler
    ↓
Service Layer (业务逻辑)
    ↓
Model Layer (数据库操作)
    ↓
Response
```

### 3. Admin Dashboard (管理后台)

**位置**: `admin/`

**技术栈**:
- Vue 3 (Composition API)
- Vite 5.x
- Vue Router 4.x
- Pinia (状态管理)
- ECharts (图表)
- TailwindCSS (样式)

**页面结构**:
```
views/
├── LoginModern.vue          # 登录页
├── DashboardModern.vue      # 仪表盘
├── ErrorsModern.vue         # 错误列表
├── ErrorDetailModern.vue    # 错误详情
├── IssuesModern.vue         # 问题列表
├── IssueDetailModern.vue    # 问题详情
├── ProjectsModern.vue       # 项目管理
├── ProjectDetailModern.vue  # 项目详情
├── AlertsModern.vue         # 告警规则
├── AlertFormModern.vue      # 告警配置
├── NotificationConfigsModern.vue # 通知配置
├── UsersManagement.vue      # 用户管理
├── AppsModern.vue           # 应用管理
└── ProfileModern.vue        # 个人设置
```

**核心功能**:
- 实时错误监控（WebSocket）
- 错误趋势分析（ECharts）
- 问题分组管理
- 告警规则配置
- 钉钉通知集成
- 用户权限管理

### 4. Docs (文档站点)

**位置**: `docs/`

**技术栈**:
- VitePress 1.x
- Markdown
- Vue 3

**文档结构**:
```
docs/
├── guide/           # 使用指南
│   ├── getting-started.md
│   ├── configuration.md
│   ├── custom-report.md
│   ├── ssr.md
│   └── best-practices.md
├── api/             # API 文档
│   ├── methods.md
│   └── events.md
└── frameworks/      # 框架集成
    ├── vue2.md
    ├── vue3.md
    ├── react.md
    ├── nuxt2.md
    ├── nuxt3.md
    ├── nextjs.md
    ├── jquery.md
    └── php.md
```

## 数据库设计

### MongoDB 集合

#### users (用户)
```javascript
{
  _id: ObjectId,
  username: String,      // 用户名
  email: String,         // 邮箱
  password: String,      // 密码（bcrypt 加密）
  role: String,          // 角色：admin/user
  createdAt: Date,
  updatedAt: Date
}
```

#### projects (项目)
```javascript
{
  _id: ObjectId,
  name: String,          // 项目名称
  description: String,   // 项目描述
  apiKey: String,        // API 密钥
  owner: ObjectId,       // 创建者
  status: String,        // 状态：active/archived
  createdAt: Date,
  updatedAt: Date
}
```

#### project_members (项目成员)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,      // 用户 ID
  projectId: ObjectId,   // 项目 ID
  createdAt: Date
}
```

#### errors (错误记录)
```javascript
{
  _id: ObjectId,
  projectId: ObjectId,   // 项目 ID
  type: String,          // 错误类型
  message: String,       // 错误消息
  stack: String,         // 堆栈信息
  url: String,           // 请求 URL
  method: String,        // 请求方法
  status: Number,        // HTTP 状态码
  userAgent: String,     // 用户代理
  pageUrl: String,       // 页面 URL
  environment: String,   // 环境
  issueId: ObjectId,     // 关联问题 ID
  resolved: Boolean,     // 是否已解决
  timestamp: Date,       // 发生时间
  createdAt: Date
}
```

#### issues (问题分组)
```javascript
{
  _id: ObjectId,
  projectId: ObjectId,   // 项目 ID
  fingerprint: String,   // 问题指纹
  type: String,          // 错误类型
  message: String,       // 错误消息
  firstSeen: Date,       // 首次出现
  lastSeen: Date,        // 最后出现
  count: Number,         // 出现次数
  status: String,        // 状态：open/resolved/ignored
  assignee: ObjectId,    // 负责人
  createdAt: Date,
  updatedAt: Date
}
```

#### alerts (告警规则)
```javascript
{
  _id: ObjectId,
  projectId: ObjectId,   // 项目 ID
  name: String,          // 规则名称
  type: String,          // 类型：frequency/new_error
  threshold: Number,     // 阈值
  timeWindow: Number,    // 时间窗口（分钟）
  enabled: Boolean,      // 是否启用
  notificationConfigId: ObjectId, // 通知配置
  createdAt: Date,
  updatedAt: Date
}
```

#### notification_configs (通知配置)
```javascript
{
  _id: ObjectId,
  projectId: ObjectId,   // 项目 ID
  name: String,          // 配置名称
  type: String,          // 类型：dingtalk
  webhook: String,       // Webhook URL
  secret: String,        // 密钥
  templateId: ObjectId,  // 消息模板
  enabled: Boolean,      // 是否启用
  createdAt: Date,
  updatedAt: Date
}
```

### 索引设计

```javascript
// errors 集合
errors.createIndex({ projectId: 1, timestamp: -1 });
errors.createIndex({ issueId: 1 });
errors.createIndex({ resolved: 1 });

// issues 集合
issues.createIndex({ projectId: 1, status: 1 });
issues.createIndex({ fingerprint: 1 }, { unique: true });

// project_members 集合
project_members.createIndex({ userId: 1, projectId: 1 }, { unique: true });
```

## 权限控制

### 角色定义

#### Admin (管理员)
- 查看所有项目和数据
- 管理所有用户
- 创建、编辑、删除用户
- 分配用户到项目

#### User (普通用户)
- 查看自己创建的项目
- 查看被分配的项目
- 管理自己项目的数据
- 不能访问用户管理

### 权限检查流程

```javascript
// 1. JWT 认证
auth middleware → 验证 token → 获取用户信息

// 2. 项目权限检查
projectAccess middleware → 
  if (user.role === 'admin') {
    // 管理员：访问所有项目
    return next();
  } else {
    // 普通用户：只访问有权限的项目
    const projectIds = await getUserProjectIds(user.id);
    req.userProjectIds = projectIds;
    return next();
  }

// 3. 数据过滤
route handler → 
  if (user.role === 'admin') {
    // 返回所有数据
    return await Model.find(query);
  } else {
    // 只返回用户有权限的数据
    return await Model.find({
      ...query,
      projectId: { $in: req.userProjectIds }
    });
  }
```

## 实时通信

### WebSocket 架构

```javascript
// Server (api/src/index.js)
const io = require('socket.io')(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('Client connected');
  
  // 加入项目房间
  socket.on('join-project', (projectId) => {
    socket.join(`project-${projectId}`);
  });
});

// 新错误时广播
io.to(`project-${projectId}`).emit('new-error', errorData);
```

```javascript
// Client (admin/src/main.js)
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  socket.emit('join-project', currentProjectId);
});

socket.on('new-error', (error) => {
  // 更新错误列表
  errorStore.addError(error);
});
```

## 告警系统

### 告警检测流程

```
1. 错误上报 → API 接收
    ↓
2. 保存到数据库
    ↓
3. 触发告警检测
    ↓
4. 检查告警规则
    ↓
5. 满足条件 → 发送通知
    ↓
6. 记录告警历史
```

### 告警类型

#### 频率告警
```javascript
{
  type: 'frequency',
  threshold: 10,        // 阈值：10 次
  timeWindow: 5         // 时间窗口：5 分钟
}
// 含义：5 分钟内出现 10 次错误则告警
```

#### 新错误告警
```javascript
{
  type: 'new_error',
  enabled: true
}
// 含义：首次出现的错误立即告警
```

### 钉钉通知

```javascript
// 1. 构建消息
const message = {
  msgtype: 'markdown',
  markdown: {
    title: '错误告警',
    text: renderTemplate(template, errorData)
  },
  at: {
    atMobiles: ['13800138000'],
    isAtAll: false
  }
};

// 2. 计算签名
const sign = crypto
  .createHmac('sha256', secret)
  .update(timestamp + '\n' + secret)
  .digest('base64');

// 3. 发送请求
await axios.post(webhook + '&timestamp=' + timestamp + '&sign=' + sign, message);
```

## 性能优化

### 前端优化
- 路由懒加载
- 组件按需加载
- 图表数据虚拟滚动
- 请求防抖和节流
- 本地缓存（localStorage）

### 后端优化
- MongoDB 索引优化
- 批量查询和更新
- 数据分页
- 响应缓存
- 连接池管理

### SDK 优化
- 批量上报（减少请求）
- 错误采样（降低负载）
- 失败重试（提高成功率）
- 字符串截断（减少数据量）

## 扩展性设计

### 水平扩展

```
┌─────────────┐
│   Nginx     │ (负载均衡)
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
   ▼       ▼
┌─────┐ ┌─────┐
│ API │ │ API │ (多实例)
│  1  │ │  2  │
└──┬──┘ └──┬──┘
   │       │
   └───┬───┘
       ▼
   ┌─────────┐
   │ MongoDB │ (副本集)
   └─────────┘
```

### 功能扩展

- 支持更多通知渠道（企业微信、邮件、Slack）
- Source Map 支持
- 性能监控
- 用户行为回放
- AI 智能分析

## 安全措施

### 认证和授权
- JWT Token 认证
- 密码 bcrypt 加密
- API Key 验证
- 基于角色的访问控制（RBAC）

### 数据安全
- HTTPS 加密传输
- 敏感信息脱敏
- SQL 注入防护（Mongoose）
- XSS 防护
- CSRF 防护

### 运维安全
- 定期数据备份
- 日志审计
- 异常监控
- 访问限流

## 监控和日志

### 应用监控
- API 响应时间
- 错误率统计
- 数据库性能
- 内存使用

### 日志管理
```javascript
// 使用 winston 记录日志
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 相关文档

- [本地开发](./LOCAL.md)
- [生产部署](./PRODUCTION.md)
- [Docker 部署](./DOCKER.md)
- [数据库配置](./DATABASE.md)
