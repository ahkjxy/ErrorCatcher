# 本地开发环境搭建

本文档介绍如何在本地搭建 ErrorCatcher 开发环境。

## 系统要求

### 必需软件

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0 或 **yarn**: >= 1.22.0
- **MongoDB**: >= 5.0

### 推荐软件

- **Git**: 版本控制
- **VS Code**: 代码编辑器
- **Postman**: API 测试

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-repo/ErrorCatcher.git
cd ErrorCatcher
```

### 2. 安装依赖

```bash
# 安装所有项目的依赖
npm run install:all

# 或分别安装
cd api && npm install
cd ../admin && npm install
cd ../docs && npm install
```

### 3. 安装 MongoDB

#### macOS

```bash
# 使用 Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0

# 启动 MongoDB
brew services start mongodb-community@7.0

# 验证安装
mongosh
```

#### Linux (Ubuntu/Debian)

```bash
# 导入公钥
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# 添加源
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 安装
sudo apt-get update
sudo apt-get install -y mongodb-org

# 启动
sudo systemctl start mongod
sudo systemctl enable mongod

# 验证
mongosh
```

#### Windows

1. 下载安装包：https://www.mongodb.com/try/download/community
2. 运行安装程序
3. 选择 "Complete" 安装
4. 勾选 "Install MongoDB as a Service"
5. 启动 MongoDB 服务

### 4. 配置环境变量

#### API 配置

```bash
cd api
cp .env.example .env
```

编辑 `api/.env`：

```bash
# 服务器配置
PORT=3001
NODE_ENV=development

# MongoDB 配置
MONGODB_URI=mongodb://localhost:27017/error-catcher-dev

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS 配置
CORS_ORIGIN=http://localhost:3000

# 钉钉配置（可选）
DINGTALK_WEBHOOK=
DINGTALK_SECRET=
```

#### Admin 配置

```bash
cd admin
cp .env.example .env
```

编辑 `admin/.env`：

```bash
# API 地址
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001
```

### 5. 初始化数据库

```bash
cd api

# 创建管理员账号
npm run create-admin
# 输入用户名、邮箱和密码

# （可选）生成演示数据
npm run seed
```

### 6. 启动开发服务器

#### 方式 1: 一键启动（推荐）

```bash
# 在项目根目录
npm run dev
```

这会同时启动：
- API Server (http://localhost:3001)
- Admin Dashboard (http://localhost:3000)
- Docs (http://localhost:5173)

#### 方式 2: 分别启动

```bash
# 终端 1: 启动 API
cd api
npm run dev

# 终端 2: 启动 Admin
cd admin
npm run dev

# 终端 3: 启动 Docs
cd docs
npm run dev
```

### 7. 访问应用

- **管理后台**: http://localhost:3000
- **API 文档**: http://localhost:3001/api-docs (如果配置了 Swagger)
- **文档站点**: http://localhost:5173

## 开发工具配置

### VS Code 推荐插件

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "vue.volar",
    "mongodb.mongodb-vscode",
    "humao.rest-client"
  ]
}
```

### ESLint 配置

项目已配置 ESLint，运行：

```bash
# 检查代码
npm run lint

# 自动修复
npm run lint:fix
```

### Prettier 配置

```bash
# 格式化代码
npm run format
```

## 常用开发命令

### API Server

```bash
cd api

# 开发模式（热重载）
npm run dev

# 生产模式
npm start

# 运行测试
npm test

# 创建管理员
npm run create-admin

# 生成演示数据
npm run seed

# 清空数据
npm run clear

# 数据库迁移
npm run migrate
```

### Admin Dashboard

```bash
cd admin

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 类型检查
npm run type-check

# 代码检查
npm run lint
```

### Docs

```bash
cd docs

# 开发模式
npm run dev

# 构建
npm run build

# 预览
npm run preview
```

## 调试技巧

### 调试 API

#### 使用 VS Code 调试器

创建 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/api/src/index.js",
      "cwd": "${workspaceFolder}/api",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

#### 使用 console.log

```javascript
// 在代码中添加
console.log('Debug:', variable);
```

#### 使用 Postman

1. 导入 API 集合
2. 设置环境变量
3. 测试 API 接口

### 调试前端

#### Vue DevTools

1. 安装 Vue DevTools 浏览器扩展
2. 打开浏览器开发者工具
3. 切换到 Vue 标签

#### 浏览器调试

```javascript
// 在代码中添加断点
debugger;

// 或使用 console
console.log('State:', state);
console.table(data);
```

### 调试 MongoDB

```bash
# 连接到 MongoDB
mongosh

# 切换数据库
use error-catcher-dev

# 查看集合
show collections

# 查询数据
db.errors.find().limit(10)
db.users.find({ role: 'admin' })

# 统计
db.errors.countDocuments()

# 删除数据
db.errors.deleteMany({ resolved: true })
```

## 常见问题

### MongoDB 连接失败

**问题**: `MongoServerError: connect ECONNREFUSED`

**解决**:
```bash
# 检查 MongoDB 是否运行
# macOS
brew services list

# Linux
sudo systemctl status mongod

# 启动 MongoDB
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 端口被占用

**问题**: `Error: listen EADDRINUSE: address already in use :::3001`

**解决**:
```bash
# 查找占用端口的进程
# macOS/Linux
lsof -i :3001

# Windows
netstat -ano | findstr :3001

# 杀死进程
kill -9 <PID>
```

### 依赖安装失败

**问题**: `npm install` 失败

**解决**:
```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules
rm -rf node_modules package-lock.json

# 重新安装
npm install

# 或使用 yarn
yarn install
```

### 前端无法连接 API

**问题**: CORS 错误

**解决**:
1. 检查 `api/.env` 中的 `CORS_ORIGIN` 配置
2. 确保 API 服务器正在运行
3. 检查 `admin/.env` 中的 `VITE_API_URL` 配置

### JWT Token 过期

**问题**: 401 Unauthorized

**解决**:
1. 重新登录获取新 token
2. 检查 `JWT_EXPIRES_IN` 配置
3. 清除浏览器 localStorage

## 开发工作流

### 1. 创建新功能

```bash
# 创建新分支
git checkout -b feature/new-feature

# 开发...

# 提交代码
git add .
git commit -m "feat: add new feature"

# 推送
git push origin feature/new-feature
```

### 2. 代码审查

- 创建 Pull Request
- 等待代码审查
- 修改反馈意见
- 合并到主分支

### 3. 测试

```bash
# 运行单元测试
npm test

# 运行集成测试
npm run test:integration

# 测试覆盖率
npm run test:coverage
```

## 性能优化建议

### 开发环境

1. **使用 SSD 硬盘**: 提高 npm install 速度
2. **增加内存**: 至少 8GB RAM
3. **使用 npm ci**: 比 npm install 更快
4. **启用缓存**: 配置 npm 缓存

### 代码优化

1. **避免不必要的重渲染**: 使用 Vue 的 computed 和 watch
2. **懒加载路由**: 减少初始加载时间
3. **优化图片**: 使用 WebP 格式
4. **代码分割**: 使用动态 import

## 下一步

- [生产部署](./PRODUCTION.md)
- [Docker 部署](./DOCKER.md)
- [系统架构](./ARCHITECTURE.md)
