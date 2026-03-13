# 生产环境部署指南

本文档详细介绍如何在生产环境部署 ErrorCatcher 系统。

## 部署前准备

### 服务器要求

#### 最低配置
- CPU: 2 核
- 内存: 4GB
- 硬盘: 50GB SSD
- 带宽: 5Mbps

#### 推荐配置
- CPU: 4 核
- 内存: 8GB
- 硬盘: 100GB SSD
- 带宽: 10Mbps

### 软件要求

- Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- Node.js 18+
- MongoDB 5.0+
- Nginx 1.18+
- PM2 (进程管理)
- Git

## 部署步骤

### 1. 服务器初始化

#### 更新系统

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS
sudo yum update -y
```

#### 创建部署用户

```bash
# 创建用户
sudo useradd -m -s /bin/bash deploy

# 设置密码
sudo passwd deploy

# 添加 sudo 权限
sudo usermod -aG sudo deploy

# 切换到部署用户
su - deploy
```

#### 配置 SSH 密钥

```bash
# 生成密钥
ssh-keygen -t rsa -b 4096 -C "deploy@example.com"

# 添加公钥到 authorized_keys
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 2. 安装依赖软件

#### 安装 Node.js

```bash
# 使用 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version  # v18.x.x
npm --version   # 9.x.x
```

#### 安装 MongoDB

```bash
# 导入公钥
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# 添加源
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 安装
sudo apt update
sudo apt install -y mongodb-org

# 启动并设置开机自启
sudo systemctl start mongod
sudo systemctl enable mongod

# 验证
sudo systemctl status mongod
```

#### 安装 Nginx

```bash
# 安装
sudo apt install -y nginx

# 启动并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx

# 验证
sudo systemctl status nginx
```

#### 安装 PM2

```bash
# 全局安装
sudo npm install -g pm2

# 验证
pm2 --version
```

### 3. 部署代码

#### 克隆代码

```bash
# 创建项目目录
sudo mkdir -p /var/www
sudo chown deploy:deploy /var/www

# 克隆代码
cd /var/www
git clone https://github.com/your-repo/ErrorCatcher.git
cd ErrorCatcher
```

#### 安装依赖

```bash
# API 依赖
cd /var/www/ErrorCatcher/api
npm install --production

# Admin 依赖
cd /var/www/ErrorCatcher/admin
npm install
npm run build

# Docs 依赖（可选）
cd /var/www/ErrorCatcher/docs
npm install
npm run build
```

### 4. 配置环境变量

#### API 配置

```bash
cd /var/www/ErrorCatcher/api
cp .env.example .env.prod

# 编辑配置
nano .env.prod
```

配置内容：

```bash
# 环境
NODE_ENV=prod

# 服务端口
PORT=3001

# MongoDB 连接
MONGODB_URI=mongodb://localhost:27017/error-catcher

# JWT 密钥（必须修改）
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# JWT 过期时间
JWT_EXPIRES_IN=7d

# CORS 配置
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com

# 日志级别
LOG_LEVEL=error

# 钉钉通知（可选）
DINGTALK_WEBHOOK=https://oapi.dingtalk.com/robot/send?access_token=xxx
DINGTALK_SECRET=SECxxx
```

#### Admin 配置

```bash
cd /var/www/ErrorCatcher/admin
nano .env.production
```

配置内容：

```bash
# API 地址
VITE_API_URL=https://api.your-domain.com
VITE_WS_URL=https://api.your-domain.com
```

重新构建：

```bash
npm run build
```

### 5. 配置 MongoDB

#### 创建数据库用户

```bash
# 连接 MongoDB
mongosh

# 切换到 admin 数据库
use admin

# 创建管理员用户
db.createUser({
  user: "admin",
  pwd: "your-strong-password",
  roles: ["root"]
})

# 切换到应用数据库
use error-catcher

# 创建应用用户
db.createUser({
  user: "error_catcher_user",
  pwd: "your-app-password",
  roles: [
    { role: "readWrite", db: "error-catcher" }
  ]
})

# 退出
exit
```

#### 启用认证

```bash
# 编辑配置文件
sudo nano /etc/mongod.conf
```

添加：

```yaml
security:
  authorization: enabled
```

重启 MongoDB：

```bash
sudo systemctl restart mongod
```

#### 更新连接字符串

```bash
# 编辑 API 配置
nano /var/www/ErrorCatcher/api/.env.prod

# 更新 MONGODB_URI
MONGODB_URI=mongodb://error_catcher_user:your-app-password@localhost:27017/error-catcher?authSource=error-catcher
```

### 6. 配置 Nginx

#### 创建配置文件

```bash
sudo nano /etc/nginx/sites-available/error-catcher
```

配置内容：

```nginx
# API Server
upstream api_backend {
    least_conn;
    server 127.0.0.1:3001 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name api.your-domain.com admin.your-domain.com;
    
    # Let's Encrypt 验证
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# API Server HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.your-domain.com;

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;
    
    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 限流配置
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
    limit_req zone=api_limit burst=200 nodelay;
    limit_req_status 429;

    # 日志
    access_log /var/log/nginx/api.access.log;
    error_log /var/log/nginx/api.error.log;

    # 代理配置
    location / {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        
        # WebSocket 支持
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 请求头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓冲设置
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
        
        # 错误处理
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;
        proxy_next_upstream_tries 2;
    }

    # 健康检查（不记录日志）
    location /health {
        proxy_pass http://api_backend;
        access_log off;
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://api_backend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Admin Dashboard HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name admin.your-domain.com;

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/admin.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.your-domain.com/privkey.pem;
    
    # SSL 配置（同上）
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;

    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 日志
    access_log /var/log/nginx/admin.access.log;
    error_log /var/log/nginx/admin.error.log;

    # 静态文件目录
    root /var/www/ErrorCatcher/admin/dist;
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

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }
}
```

#### 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/error-catcher /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

### 7. 配置 SSL 证书

#### 安装 Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

#### 申请证书

```bash
# API 域名
sudo certbot --nginx -d api.your-domain.com

# Admin 域名
sudo certbot --nginx -d admin.your-domain.com

# 或一次性申请多个
sudo certbot --nginx -d api.your-domain.com -d admin.your-domain.com
```

#### 自动续期

```bash
# 测试续期
sudo certbot renew --dry-run

# Certbot 会自动添加 cron 任务
# 查看
sudo systemctl status certbot.timer
```

### 8. 启动应用

#### 初始化数据库

```bash
cd /var/www/ErrorCatcher/api

# 创建管理员账号
npm run create-admin
# 输入：用户名、邮箱、密码
```

#### 使用 PM2 启动

```bash
cd /var/www/ErrorCatcher/api

# 启动生产环境
pm2 start ecosystem.config.js --only error-catcher-prod --env prod

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
# 复制输出的命令并执行
```

#### 验证服务

```bash
# 查看进程状态
pm2 status

# 查看日志
pm2 logs error-catcher-prod

# 查看详细信息
pm2 show error-catcher-prod
```

### 9. 配置防火墙

```bash
# 允许 SSH
sudo ufw allow 22/tcp

# 允许 HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

### 10. 配置数据备份

#### 创建备份脚本

```bash
sudo nano /usr/local/bin/backup-mongodb.sh
```

脚本内容：

```bash
#!/bin/bash

# 配置
BACKUP_DIR="/backup/mongodb"
DB_NAME="error-catcher"
DB_USER="error_catcher_user"
DB_PASS="your-app-password"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
mongodump \
  --uri="mongodb://${DB_USER}:${DB_PASS}@localhost:27017/${DB_NAME}?authSource=${DB_NAME}" \
  --out="${BACKUP_DIR}/${DB_NAME}_${DATE}"

# 压缩备份
cd $BACKUP_DIR
tar -czf "${DB_NAME}_${DATE}.tar.gz" "${DB_NAME}_${DATE}"
rm -rf "${DB_NAME}_${DATE}"

# 删除旧备份
find $BACKUP_DIR -name "${DB_NAME}_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: ${DB_NAME}_${DATE}.tar.gz"
```

设置权限：

```bash
sudo chmod +x /usr/local/bin/backup-mongodb.sh
```

#### 配置定时任务

```bash
# 编辑 crontab
sudo crontab -e

# 添加任务（每天凌晨 2 点备份）
0 2 * * * /usr/local/bin/backup-mongodb.sh >> /var/log/mongodb-backup.log 2>&1
```

## 部署后检查

### 1. 检查服务状态

```bash
# MongoDB
sudo systemctl status mongod

# Nginx
sudo systemctl status nginx

# PM2
pm2 status

# 应用健康检查
curl https://api.your-domain.com/health
```

### 2. 测试 API

```bash
# 测试登录
curl -X POST https://api.your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'

# 测试错误上报
curl -X POST https://api.your-domain.com/api/errors \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-project-api-key" \
  -d '{"type":"Error","message":"Test error","stack":"..."}'
```

### 3. 测试管理后台

访问 https://admin.your-domain.com
- 登录测试
- 查看仪表盘
- 测试实时更新

### 4. 检查日志

```bash
# PM2 日志
pm2 logs error-catcher-prod --lines 100

# Nginx 日志
sudo tail -f /var/log/nginx/api.access.log
sudo tail -f /var/log/nginx/api.error.log

# MongoDB 日志
sudo tail -f /var/log/mongodb/mongod.log
```

## 监控和维护

### 性能监控

```bash
# 安装 PM2 监控
pm2 install pm2-server-monit

# 查看实时监控
pm2 monit

# 查看内存使用
pm2 show error-catcher-prod
```

### 日志管理

```bash
# 查看日志
pm2 logs error-catcher-prod

# 清空日志
pm2 flush

# 日志轮转（已自动配置）
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 更新部署

```bash
# 拉取最新代码
cd /var/www/ErrorCatcher
git pull

# 更新 API
cd api
npm install --production
pm2 reload error-catcher-prod

# 更新 Admin
cd ../admin
npm install
npm run build

# 重载 Nginx
sudo systemctl reload nginx
```

## 故障排除

### API 无法启动

```bash
# 查看错误日志
pm2 logs error-catcher-prod --err

# 检查端口占用
sudo lsof -i :3001

# 检查环境变量
pm2 show error-catcher-prod
```

### MongoDB 连接失败

```bash
# 检查 MongoDB 状态
sudo systemctl status mongod

# 测试连接
mongosh "mongodb://error_catcher_user:your-app-password@localhost:27017/error-catcher?authSource=error-catcher"

# 查看日志
sudo tail -f /var/log/mongodb/mongod.log
```

### Nginx 502 错误

```bash
# 检查 API 是否运行
pm2 status

# 检查 Nginx 配置
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

### SSL 证书问题

```bash
# 检查证书有效期
sudo certbot certificates

# 手动续期
sudo certbot renew

# 测试续期
sudo certbot renew --dry-run
```

## 安全加固

### 1. 系统安全

```bash
# 禁用 root 登录
sudo nano /etc/ssh/sshd_config
# 设置: PermitRootLogin no

# 修改 SSH 端口
# 设置: Port 2222

# 重启 SSH
sudo systemctl restart sshd
```

### 2. 应用安全

- 定期更新依赖包
- 使用强密码
- 启用 2FA（如果支持）
- 限制 API 访问频率
- 定期审计日志

### 3. 数据库安全

- 启用认证
- 使用强密码
- 限制网络访问
- 定期备份
- 加密敏感数据

## 性能优化

### 1. MongoDB 优化

```javascript
// 创建索引
use error-catcher

db.errors.createIndex({ projectId: 1, timestamp: -1 })
db.errors.createIndex({ issueId: 1 })
db.issues.createIndex({ projectId: 1, status: 1 })
db.issues.createIndex({ fingerprint: 1 }, { unique: true })
```

### 2. Nginx 优化

```nginx
# 启用缓存
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

location /api/stats {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_pass http://api_backend;
}
```

### 3. PM2 优化

```bash
# 使用集群模式
pm2 start ecosystem.config.js --only error-catcher-prod -i max

# 设置内存限制
pm2 start ecosystem.config.js --only error-catcher-prod --max-memory-restart 1G
```

## 相关文档

- [系统架构](./ARCHITECTURE.md)
- [Docker 部署](./DOCKER.md)
- [数据库配置](./DATABASE.md)
- [Nginx 配置](./NGINX.md)
- [常见问题](./FAQ.md)
