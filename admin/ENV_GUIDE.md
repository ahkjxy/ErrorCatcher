# Admin 环境配置指南

## 环境说明

Admin 项目支持 4 个运行环境：

| 环境 | 配置文件 | 说明 | API 地址 |
|------|---------|------|---------|
| 开发环境 | `.env.dev` | 本地开发 | http://localhost:3001 |
| 测试环境 | `.env.test` | 功能测试 | http://test-api.example.com |
| 预发布环境 | `.env.pre` | 上线前验证 | https://pre-api.example.com |
| 生产环境 | `.env.prod` | 正式生产 | https://api.your-domain.com |

## 环境变量

### VITE_API_URL
- 类型: `string`
- 必需: 是
- 说明: API 服务器地址

```bash
# 开发环境
VITE_API_URL=http://localhost:3001

# 生产环境
VITE_API_URL=https://api.your-domain.com
```

### VITE_WS_URL
- 类型: `string`
- 必需: 是
- 说明: WebSocket 服务器地址（通常与 API 地址相同）

```bash
# 开发环境
VITE_WS_URL=http://localhost:3001

# 生产环境
VITE_WS_URL=https://api.your-domain.com
```

### VITE_ENV
- 类型: `string`
- 必需: 否
- 默认值: 根据 mode 自动设置
- 可选值: `development`, `test`, `pre`, `production`
- 说明: 环境标识

```bash
VITE_ENV=production
```

## 配置文件

### 开发环境 (.env.dev)

```bash
# API 服务器地址
VITE_API_URL=http://localhost:3001

# WebSocket 服务器地址
VITE_WS_URL=http://localhost:3001

# 环境标识
VITE_ENV=development
```

### 测试环境 (.env.test)

```bash
# API 服务器地址
VITE_API_URL=http://test-api.example.com

# WebSocket 服务器地址
VITE_WS_URL=http://test-api.example.com

# 环境标识
VITE_ENV=test
```

### 预发布环境 (.env.pre)

```bash
# API 服务器地址
VITE_API_URL=https://pre-api.example.com

# WebSocket 服务器地址
VITE_WS_URL=https://pre-api.example.com

# 环境标识
VITE_ENV=pre
```

### 生产环境 (.env.prod)

```bash
# API 服务器地址
VITE_API_URL=https://api.your-domain.com

# WebSocket 服务器地址
VITE_WS_URL=https://api.your-domain.com

# 环境标识
VITE_ENV=production
```

## 使用方式

### 开发模式

```bash
# 开发环境（默认）
npm run dev

# 测试环境
npm run dev:test

# 预发布环境
npm run dev:pre

# 生产环境
npm run dev:prod
```

### 构建

```bash
# 生产环境（默认）
npm run build

# 开发环境
npm run build:dev

# 测试环境
npm run build:test

# 预发布环境
npm run build:pre

# 生产环境
npm run build:prod
```

### 预览

```bash
# 预览构建结果
npm run preview

# 预览测试环境构建
npm run preview:test

# 预览预发布环境构建
npm run preview:pre

# 预览生产环境构建
npm run preview:prod
```

## 在代码中使用

### 获取环境变量

```javascript
// 直接使用
const apiUrl = import.meta.env.VITE_API_URL;
const wsUrl = import.meta.env.VITE_WS_URL;
const env = import.meta.env.VITE_ENV;

// 使用环境配置工具
import envConfig from '@/config/env';

console.log('当前环境:', envConfig.env);
console.log('API 地址:', envConfig.apiUrl);
console.log('是否开发环境:', envConfig.isDev);
console.log('是否生产环境:', envConfig.isProd);
```

### 环境判断

```javascript
import { isDev, isTest, isPre, isProd } from '@/config/env';

if (isDev()) {
  console.log('开发环境');
}

if (isProd()) {
  console.log('生产环境');
}
```

### 使用 axios 配置

```javascript
import axios from '@/config/axios';

// axios 实例已自动配置 baseURL
const response = await axios.get('/api/projects');
```

### 环境指示器

在 App.vue 或布局组件中添加环境指示器：

```vue
<template>
  <div>
    <!-- 环境指示器（非生产环境显示） -->
    <EnvIndicator />
    
    <!-- 其他内容 -->
    <router-view />
  </div>
</template>

<script setup>
import EnvIndicator from '@/components/EnvIndicator.vue';
</script>
```

## 部署

### 开发环境

```bash
# 本地运行
npm run dev
```

### 测试环境

```bash
# 构建
npm run build:test

# 部署到测试服务器
scp -r dist/* user@test-server:/var/www/admin/
```

### 预发布环境

```bash
# 构建
npm run build:pre

# 部署到预发布服务器
scp -r dist/* user@pre-server:/var/www/admin/
```

### 生产环境

```bash
# 构建
npm run build:prod

# 部署到生产服务器
scp -r dist/* user@prod-server:/var/www/admin/
```

### 使用 Docker

```bash
# 构建 Docker 镜像（生产环境）
docker build -t error-catcher-admin:prod --build-arg MODE=production .

# 构建 Docker 镜像（预发布环境）
docker build -t error-catcher-admin:pre --build-arg MODE=pre .

# 运行容器
docker run -d -p 80:80 error-catcher-admin:prod
```

## Dockerfile 配置

创建支持多环境的 Dockerfile：

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder

ARG MODE=production

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:${MODE}

# 运行阶段
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## 环境配置最佳实践

### 1. 不要提交敏感信息

```bash
# .gitignore
.env
.env.*
!.env.example
```

### 2. 使用环境变量文件

每个环境创建独立的配置文件：
- `.env.dev` - 开发环境
- `.env.test` - 测试环境
- `.env.pre` - 预发布环境
- `.env.prod` - 生产环境

### 3. 环境变量命名规范

Vite 要求环境变量必须以 `VITE_` 开头才能在客户端代码中访问。

```bash
# 正确
VITE_API_URL=http://localhost:3001

# 错误（无法在客户端访问）
API_URL=http://localhost:3001
```

### 4. 使用配置工具

创建统一的配置工具（如 `src/config/env.js`），方便管理和使用环境变量。

### 5. 环境指示器

在非生产环境显示环境标识，避免误操作。

## 故障排除

### 环境变量未生效

1. 确认文件名正确（`.env.dev`, `.env.test` 等）
2. 确认变量名以 `VITE_` 开头
3. 重启开发服务器
4. 清除缓存：`rm -rf node_modules/.vite`

### 构建后环境变量错误

Vite 在构建时会将环境变量内联到代码中，确保：
1. 使用正确的构建命令（如 `npm run build:prod`）
2. 环境变量文件存在且配置正确
3. 不要在运行时修改环境变量

### API 地址不正确

检查：
1. `.env.*` 文件中的 `VITE_API_URL` 配置
2. `vite.config.js` 中的 proxy 配置
3. axios 配置中的 baseURL

## 相关文档

- [Vite 环境变量文档](https://vitejs.dev/guide/env-and-mode.html)
- [部署指南](../deploy/PRODUCTION.md)
- [Docker 部署](../deploy/DOCKER.md)
