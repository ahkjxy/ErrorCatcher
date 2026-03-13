# ErrorCatcher 部署指南

本目录包含 ErrorCatcher 项目的完整部署文档和系统架构说明。

## 📁 文档结构

- [部署更新](./DEPLOYMENT_UPDATE.md) - 最新部署文档更新和总结
- [系统架构](./ARCHITECTURE.md) - 系统整体架构和技术栈
- [本地开发](./LOCAL.md) - 本地开发环境搭建
- [生产部署](./PRODUCTION.md) - 生产环境部署指南
- [Docker 部署](./DOCKER.md) - Docker 容器化部署
- [Nginx 配置](./NGINX.md) - Nginx 反向代理配置
- [数据库配置](./DATABASE.md) - MongoDB 数据库配置
- [环境变量](./ENVIRONMENT.md) - 环境变量配置说明
- [常见问题](./FAQ.md) - 常见问题解答

## 🚀 快速开始

### 本地开发

```bash
# 1. 安装依赖
npm run install:all

# 2. 配置环境变量
cp api/.env.example api/.env
cp admin/.env.example admin/.env

# 3. 启动 MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# 4. 创建管理员账号
cd api && npm run create-admin

# 5. 启动所有服务
npm run dev
```

### 生产部署

**方式 1: Docker Compose（推荐）**

```bash
# 1. 配置环境变量
cp .env.example .env
nano .env

# 2. 启动所有服务
docker-compose up -d

# 3. 创建管理员账号
docker-compose exec api npm run create-admin
```

**方式 2: PM2**

```bash
# 1. 安装依赖
npm run install:all

# 2. 配置环境变量
cp api/.env.example api/.env
cp admin/.env.example admin/.env

# 3. 启动服务
npm run deploy
```

**方式 3: 手动部署**

详见 [PRODUCTION.md](./PRODUCTION.md)

## 📊 系统组件

### 核心服务

| 服务 | 端口 | 说明 |
|------|------|------|
| API Server | 3001 | 后端 API 服务 |
| Admin Dashboard | 3000 | 管理后台 |
| Docs | 5173 | 文档站点 |
| MongoDB | 27017 | 数据库 |

### 可选服务

| 服务 | 端口 | 说明 |
|------|------|------|
| Nginx | 80/443 | 反向代理 |
| Redis | 6379 | 缓存（可选）|

## 🚀 部署方式对比

| 方式 | 难度 | 速度 | 推荐场景 | 文档 |
|------|------|------|--------|------|
| Docker Compose | ⭐ 简单 | ⚡ 快 | 快速部署、开发测试 | [DOCKER.md](./DOCKER.md) |
| PM2 | ⭐⭐ 中等 | ⚡⚡ 中等 | 小型生产环境 | [PRODUCTION.md](./PRODUCTION.md) |
| 手动部署 | ⭐⭐⭐ 复杂 | ⚡⚡⚡ 慢 | 自定义配置 | [PRODUCTION.md](./PRODUCTION.md) |
| Kubernetes | ⭐⭐⭐⭐ 很复杂 | ⚡⚡⚡⚡ 很快 | 大规模部署 | 待补充 |

## 🔧 技术栈

### 前端
- Vue 3 + Vite
- Vue Router
- Pinia
- ECharts
- TailwindCSS

### 后端
- Node.js + Express
- MongoDB + Mongoose
- Socket.io
- JWT 认证

### 部署
- Docker + Docker Compose
- PM2
- Nginx

## 📝 部署检查清单

### 部署前

- [ ] 配置环境变量
- [ ] 准备 MongoDB 数据库
- [ ] 配置域名和 SSL 证书
- [ ] 准备钉钉机器人（可选）

### 部署后

- [ ] 创建管理员账号
- [ ] 测试 API 接口
- [ ] 测试管理后台登录
- [ ] 配置告警规则
- [ ] 设置数据备份

## 🔒 安全建议

1. **修改默认密码**：首次登录后立即修改管理员密码
2. **使用 HTTPS**：生产环境必须使用 HTTPS
3. **限制访问**：配置防火墙规则，只开放必要端口
4. **定期备份**：设置 MongoDB 自动备份
5. **更新依赖**：定期更新依赖包，修复安全漏洞

## 📞 获取帮助

- 查看详细文档：[ARCHITECTURE.md](./ARCHITECTURE.md)
- 常见问题：[FAQ.md](./FAQ.md)
- 本地开发：[LOCAL.md](./LOCAL.md)
- 生产部署：[PRODUCTION.md](./PRODUCTION.md)
- Docker 部署：[DOCKER.md](./DOCKER.md)

## 📄 许可证

MIT License
