# Docker 容器化部署

本文档介绍如何使用 Docker 和 Docker Compose 部署 ErrorCatcher 系统。

## 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 4GB 可用内存
- 至少 20GB 可用磁盘空间

## 快速开始

### 1. 安装 Docker

#### Ubuntu/Debian

```bash
# 卸载旧版本
sudo apt remove docker docker-engine docker.io containerd runc

# 安装依赖
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release

# 添加 Docker 官方 GPG 密钥
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 添加 Docker 仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 验证安装
docker --version
docker compose version
```

#### CentOS

```bash
# 安装依赖
sudo yum install -y yum-utils

# 添加 Docker 仓库
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安装 Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
docker --version
docker compose version
```

#### macOS

```bash
# 使用 Homebrew
brew install --cask docker

# 或下载 Docker Desktop
# https://www.docker.com/products/docker-desktop
```

### 2. 配置 Docker

```bash
# 将当前用户添加到 docker 组
sudo usermod -aG docker $USER

# 重新登录或执行
newgrp docker

# 验证
docker run hello-world
```

## Docker Compose 部署

### 1. 创建 docker-compose.yml

在项目根目录创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  # MongoDB 数据库
  mongodb:
    image: mongo:7.0
    container_name: error-catcher-mongodb
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD:-admin123}
      MONGO_INITDB_DATABASE: error-catcher
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - error-catcher-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  # API Server
  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    container_name: error-catcher-api
    restart: always
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      PORT: 3001
      MONGODB_URI: mongodb://error_catcher_user:${DB_PASSWORD:-password123}@mongodb:27017/error-catcher?authSource=error-catcher
      JWT_SECRET: ${JWT_SECRET:-your-super-secret-jwt-key-change-this}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN:-7d}
      CORS_ORIGIN: ${CORS_ORIGIN:-*}
      LOG_LEVEL: ${LOG_LEVEL:-info}
      DINGTALK_WEBHOOK: ${DINGTALK_WEBHOOK:-}
      DINGTALK_SECRET: ${DINGTALK_SECRET:-}
    ports:
      - "3001:3001"
    volumes:
      - ./api:/app
      - /app/node_modules
      - api_logs:/app/logs
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - error-catcher-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Admin Dashboard
  admin:
    build:
      context: ./admin
      dockerfile: Dockerfile.prod
    container_name: error-catcher-admin
    restart: always
    environment:
      VITE_API_URL: ${VITE_API_URL:-http://localhost:3001}
      VITE_WS_URL: ${VITE_WS_URL:-http://localhost:3001}
    ports:
      - "3000:80"
    depends_on:
      - api
    networks:
      - error-catcher-network

  # Nginx 反向代理（可选）
  nginx:
    image: nginx:alpine
    container_name: error-catcher-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - nginx_logs:/var/log/nginx
    depends_on:
      - api
      - admin
    networks:
      - error-catcher-network

networks:
  error-catcher-network:
    driver: bridge

volumes:
  mongodb_data:
    driver: local
  mongodb_config:
    driver: local
  api_logs:
    driver: local
  nginx_logs:
    driver: local
```

### 2. 创建环境变量文件

创建 `.env` 文件：

```bash
# 环境
NODE_ENV=production

# MongoDB
MONGO_ROOT_PASSWORD=your-strong-root-password
DB_PASSWORD=your-strong-db-password

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com

# 日志
LOG_LEVEL=info

# API URL
VITE_API_URL=https://api.your-domain.com
VITE_WS_URL=https://api.your-domain.com

# 钉钉通知（可选）
DINGTALK_WEBHOOK=
DINGTALK_SECRET=
```

### 3. 创建 MongoDB 初始化脚本

创建 `mongo-init.js`：

```javascript
// 切换到应用数据库
db = db.getSiblingDB('error-catcher');

// 创建应用用户
db.createUser({
  user: 'error_catcher_user',
  pwd: process.env.DB_PASSWORD || 'password123',
  roles: [
    {
      role: 'readWrite',
      db: 'error-catcher'
    }
  ]
});

// 创建集合
db.createCollection('users');
db.createCollection('projects');
db.createCollection('errors');
db.createCollection('issues');
db.createCollection('alerts');
db.createCollection('notification_configs');

// 创建索引
db.errors.createIndex({ projectId: 1, timestamp: -1 });
db.errors.createIndex({ issueId: 1 });
db.errors.createIndex({ resolved: 1 });

db.issues.createIndex({ projectId: 1, status: 1 });
db.issues.createIndex({ fingerprint: 1 }, { unique: true });

db.project_members.createIndex({ userId: 1, projectId: 1 }, { unique: true });

print('MongoDB initialization completed');
```

### 4. 优化 Dockerfile

#### API Dockerfile (生产环境)

创建 `api/Dockerfile.prod`：

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production && npm cache clean --force

# 复制源代码
COPY . .

# 运行阶段
FROM node:18-alpine

# 安装 curl（用于健康检查）
RUN apk add --no-cache curl

WORKDIR /app

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 从构建阶段复制文件
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

# 创建日志目录
RUN mkdir -p logs && chown nodejs:nodejs logs

# 切换到非 root 用户
USER nodejs

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# 启动应用
CMD ["node", "src/index.js"]
```

#### Admin Dockerfile (生产环境)

创建 `admin/Dockerfile.prod`：

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci && npm cache clean --force

# 复制源代码
COPY . .

# 构建
RUN npm run build

# 运行阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
```

创建 `admin/nginx.conf`：

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### 5. 启动服务

```bash
# 构建镜像
docker compose build

# 启动所有服务
docker compose up -d

# 查看日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f api
docker compose logs -f admin
```

### 6. 初始化数据

```bash
# 进入 API 容器
docker compose exec api sh

# 创建管理员账号
npm run create-admin

# 退出容器
exit
```

### 7. 验证部署

```bash
# 检查服务状态
docker compose ps

# 测试 API
curl http://localhost:3001/health

# 访问管理后台
# http://localhost:3000
```

## 单独使用 Docker

### 构建镜像

```bash
# 构建 API 镜像
docker build -t error-catcher-api:latest -f api/Dockerfile.prod ./api

# 构建 Admin 镜像
docker build -t error-catcher-admin:latest -f admin/Dockerfile.prod ./admin
```

### 创建网络

```bash
docker network create error-catcher-network
```

### 启动 MongoDB

```bash
docker run -d \
  --name error-catcher-mongodb \
  --network error-catcher-network \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  -e MONGO_INITDB_DATABASE=error-catcher \
  -v mongodb_data:/data/db \
  mongo:7.0
```

### 启动 API

```bash
docker run -d \
  --name error-catcher-api \
  --network error-catcher-network \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://error_catcher_user:password123@error-catcher-mongodb:27017/error-catcher?authSource=error-catcher \
  -e JWT_SECRET=your-super-secret-jwt-key \
  -e CORS_ORIGIN=* \
  error-catcher-api:latest
```

### 启动 Admin

```bash
docker run -d \
  --name error-catcher-admin \
  --network error-catcher-network \
  -p 3000:80 \
  -e VITE_API_URL=http://localhost:3001 \
  error-catcher-admin:latest
```

## 生产环境优化

### 1. 使用多阶段构建

已在上面的 Dockerfile 中实现，可以显著减小镜像大小。

### 2. 资源限制

在 `docker-compose.yml` 中添加：

```yaml
services:
  api:
    # ... 其他配置
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### 3. 日志管理

```yaml
services:
  api:
    # ... 其他配置
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 4. 健康检查

已在 Dockerfile 和 docker-compose.yml 中配置。

### 5. 自动重启

```yaml
services:
  api:
    restart: unless-stopped
```

## 常用命令

### 服务管理

```bash
# 启动服务
docker compose up -d

# 停止服务
docker compose stop

# 重启服务
docker compose restart

# 停止并删除容器
docker compose down

# 停止并删除容器和卷
docker compose down -v
```

### 日志查看

```bash
# 查看所有日志
docker compose logs

# 实时查看日志
docker compose logs -f

# 查看特定服务日志
docker compose logs api
docker compose logs -f api --tail=100
```

### 容器管理

```bash
# 查看运行中的容器
docker compose ps

# 进入容器
docker compose exec api sh
docker compose exec mongodb mongosh

# 查看容器资源使用
docker stats
```

### 镜像管理

```bash
# 查看镜像
docker images

# 删除未使用的镜像
docker image prune

# 删除所有未使用的资源
docker system prune -a
```

### 数据管理

```bash
# 查看卷
docker volume ls

# 备份数据卷
docker run --rm -v mongodb_data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb-backup.tar.gz /data

# 恢复数据卷
docker run --rm -v mongodb_data:/data -v $(pwd):/backup alpine tar xzf /backup/mongodb-backup.tar.gz -C /
```

## 数据备份和恢复

### 备份

```bash
# 创建备份脚本
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"

mkdir -p $BACKUP_DIR

# 备份 MongoDB
docker compose exec -T mongodb mongodump \
  --uri="mongodb://error_catcher_user:password123@localhost:27017/error-catcher?authSource=error-catcher" \
  --archive=/tmp/backup.archive

docker compose cp mongodb:/tmp/backup.archive $BACKUP_DIR/mongodb_${DATE}.archive

echo "Backup completed: mongodb_${DATE}.archive"
EOF

chmod +x backup.sh

# 执行备份
./backup.sh
```

### 恢复

```bash
# 恢复脚本
cat > restore.sh << 'EOF'
#!/bin/bash
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file>"
  exit 1
fi

# 复制备份文件到容器
docker compose cp $BACKUP_FILE mongodb:/tmp/restore.archive

# 恢复数据
docker compose exec mongodb mongorestore \
  --uri="mongodb://error_catcher_user:password123@localhost:27017/error-catcher?authSource=error-catcher" \
  --archive=/tmp/restore.archive

echo "Restore completed"
EOF

chmod +x restore.sh

# 执行恢复
./restore.sh backups/mongodb_20240101_120000.archive
```

### 自动备份

```bash
# 添加到 crontab
crontab -e

# 每天凌晨 2 点备份
0 2 * * * /path/to/backup.sh >> /var/log/docker-backup.log 2>&1
```

## 监控和调试

### 查看容器状态

```bash
# 查看容器详细信息
docker compose ps -a

# 查看容器资源使用
docker stats

# 查看容器进程
docker compose top
```

### 调试容器

```bash
# 查看容器日志
docker compose logs api --tail=100

# 进入容器调试
docker compose exec api sh

# 查看容器内进程
docker compose exec api ps aux

# 查看容器网络
docker network inspect error-catcher-network
```

### 性能分析

```bash
# 查看容器资源使用
docker stats --no-stream

# 查看镜像大小
docker images | grep error-catcher
```

## 故障排除

### 容器无法启动

```bash
# 查看容器日志
docker compose logs api

# 检查配置
docker compose config

# 重新构建
docker compose build --no-cache api
docker compose up -d api
```

### 网络问题

```bash
# 检查网络
docker network ls
docker network inspect error-catcher-network

# 重建网络
docker compose down
docker network prune
docker compose up -d
```

### 数据持久化问题

```bash
# 检查卷
docker volume ls
docker volume inspect mongodb_data

# 清理并重建
docker compose down -v
docker compose up -d
```

### MongoDB 连接失败

```bash
# 进入 MongoDB 容器
docker compose exec mongodb mongosh

# 测试连接
docker compose exec api sh
npm run test-db
```

## 安全建议

1. 不要在镜像中硬编码密钥
2. 使用 Docker secrets 管理敏感信息
3. 定期更新基础镜像
4. 使用非 root 用户运行容器
5. 限制容器资源使用
6. 启用 Docker 内容信任
7. 定期扫描镜像漏洞

```bash
# 扫描镜像漏洞
docker scan error-catcher-api:latest
```

## 相关文档

- [生产部署](./PRODUCTION.md)
- [数据库配置](./DATABASE.md)
- [Nginx 配置](./NGINX.md)
- [系统架构](./ARCHITECTURE.md)
