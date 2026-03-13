# Nginx 反向代理配置指南

本文档详细介绍如何配置 Nginx 作为 ErrorCatcher 系统的反向代理服务器。

## 安装 Nginx

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install -y nginx

# 启动并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx

# 验证
nginx -v
sudo systemctl status nginx
```

### CentOS/RHEL

```bash
sudo yum install -y nginx

# 启动并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx

# 验证
nginx -v
sudo systemctl status nginx
```

### macOS

```bash
brew install nginx

# 启动
brew services start nginx

# 验证
nginx -v
```

## 基础配置

### 配置文件结构

```
/etc/nginx/
├── nginx.conf              # 主配置文件
├── conf.d/                 # 额外配置目录
│   └── *.conf
├── sites-available/        # 可用站点配置
│   └── error-catcher
└── sites-enabled/          # 启用站点配置（软链接）
    └── error-catcher -> ../sites-available/error-catcher
```

### 主配置文件

编辑 `/etc/nginx/nginx.conf`：

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 2048;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    '$request_time $upstream_response_time';

    access_log /var/log/nginx/access.log main;

    # 基础设置
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # 文件上传大小限制
    client_max_body_size 10M;
    client_body_buffer_size 128k;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;
    gzip_disable "msie6";

    # 包含其他配置
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

## ErrorCatcher 配置

### 完整配置

创建 `/etc/nginx/sites-available/error-catcher`：

```nginx
# 上游服务器配置
upstream api_backend {
    least_conn;
    server 127.0.0.1:3001 max_fails=3 fail_timeout=30s weight=1;
    # 如果有多个 API 实例
    # server 127.0.0.1:3002 max_fails=3 fail_timeout=30s weight=1;
    # server 127.0.0.1:3003 max_fails=3 fail_timeout=30s weight=1;
    keepalive 32;
}

# 限流配置
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
limit_req_zone $binary_remote_addr zone=upload_limit:10m rate=10r/s;
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

# HTTP 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name api.your-domain.com admin.your-domain.com;

    # Let's Encrypt 验证
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        allow all;
    }

    # 其他请求重定向到 HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# API Server HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.your-domain.com;

    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/api.your-domain.com/chain.pem;

    # SSL 协议和加密套件
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;

    # SSL 会话缓存
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # 日志
    access_log /var/log/nginx/api.access.log main;
    error_log /var/log/nginx/api.error.log warn;

    # 限流和连接限制
    limit_req zone=api_limit burst=200 nodelay;
    limit_conn conn_limit 50;
    limit_req_status 429;

    # 根路径
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
        proxy_next_upstream_timeout 10s;

        # 禁用缓存（API 响应）
        proxy_no_cache 1;
        proxy_cache_bypass 1;
    }

    # 错误上报接口（更高限流）
    location /api/errors {
        limit_req zone=upload_limit burst=50 nodelay;
        
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 健康检查（不记录日志）
    location /health {
        proxy_pass http://api_backend;
        access_log off;
        proxy_connect_timeout 5s;
        proxy_read_timeout 5s;
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://api_backend;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}

# Admin Dashboard HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name admin.your-domain.com;

    # SSL 证书配置（同上）
    ssl_certificate /etc/letsencrypt/live/admin.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.your-domain.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/admin.your-domain.com/chain.pem;

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

    # 日志
    access_log /var/log/nginx/admin.access.log main;
    error_log /var/log/nginx/admin.error.log warn;

    # 静态文件目录
    root /var/www/ErrorCatcher/admin/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

### 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/error-catcher /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

## SSL/TLS 配置

### 使用 Let's Encrypt

#### 安装 Certbot

```bash
# Ubuntu/Debian
sudo apt install -y certbot python3-certbot-nginx

# CentOS
sudo yum install -y certbot python3-certbot-nginx
```

#### 申请证书

```bash
# 单个域名
sudo certbot --nginx -d api.your-domain.com

# 多个域名
sudo certbot --nginx -d api.your-domain.com -d admin.your-domain.com

# 通配符证书（需要 DNS 验证）
sudo certbot certonly --manual --preferred-challenges dns -d "*.your-domain.com"
```

#### 自动续期

```bash
# 测试续期
sudo certbot renew --dry-run

# Certbot 会自动添加 cron 任务
# 查看定时任务
sudo systemctl status certbot.timer

# 手动续期
sudo certbot renew
```

### 使用自签名证书（开发环境）

```bash
# 生成私钥和证书
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/nginx.key \
  -out /etc/nginx/ssl/nginx.crt \
  -subj "/C=CN/ST=Beijing/L=Beijing/O=Company/CN=localhost"

# 更新 Nginx 配置
ssl_certificate /etc/nginx/ssl/nginx.crt;
ssl_certificate_key /etc/nginx/ssl/nginx.key;
```

## 性能优化

### 1. 启用 HTTP/2

```nginx
listen 443 ssl http2;
listen [::]:443 ssl http2;
```

### 2. 启用缓存

```nginx
# 在 http 块中添加
proxy_cache_path /var/cache/nginx/api 
                 levels=1:2 
                 keys_zone=api_cache:10m 
                 max_size=1g 
                 inactive=60m 
                 use_temp_path=off;

# 在 location 块中使用
location /api/stats {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_key "$scheme$request_method$host$request_uri";
    proxy_cache_bypass $http_cache_control;
    add_header X-Cache-Status $upstream_cache_status;
    
    proxy_pass http://api_backend;
}
```

### 3. 连接保持

```nginx
upstream api_backend {
    server 127.0.0.1:3001;
    keepalive 32;
    keepalive_requests 100;
    keepalive_timeout 60s;
}

location / {
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_pass http://api_backend;
}
```

### 4. 缓冲优化

```nginx
# 在 http 块中
proxy_buffering on;
proxy_buffer_size 4k;
proxy_buffers 8 4k;
proxy_busy_buffers_size 8k;
proxy_temp_file_write_size 8k;
```

### 5. 工作进程优化

```nginx
# 在 main 块中
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 2048;
    use epoll;
    multi_accept on;
}
```

## 安全配置

### 1. 限流

```nginx
# 定义限流区域
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

# 应用限流
location /api/ {
    limit_req zone=api_limit burst=200 nodelay;
}

location /api/auth/login {
    limit_req zone=login_limit burst=10;
}
```

### 2. IP 黑名单

```nginx
# 创建黑名单文件
# /etc/nginx/conf.d/blacklist.conf
deny 192.168.1.100;
deny 10.0.0.0/8;

# 在 server 块中包含
include /etc/nginx/conf.d/blacklist.conf;
```

### 3. IP 白名单

```nginx
location /admin {
    allow 192.168.1.0/24;
    allow 10.0.0.0/8;
    deny all;
}
```

### 4. 防止 DDoS

```nginx
# 连接限制
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

location / {
    limit_conn conn_limit 10;
    limit_rate 500k;
}
```

### 5. 隐藏版本信息

```nginx
# 在 http 块中
server_tokens off;
more_clear_headers Server;
```

## 日志管理

### 1. 自定义日志格式

```nginx
log_format detailed '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent" '
                    '$request_time $upstream_response_time '
                    '$upstream_addr $upstream_status';

access_log /var/log/nginx/access.log detailed;
```

### 2. 日志轮转

创建 `/etc/logrotate.d/nginx`：

```
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 nginx adm
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
```

### 3. 禁用特定路径日志

```nginx
location /health {
    access_log off;
    error_log off;
}
```

## 监控和调试

### 1. 启用状态页面

```nginx
location /nginx_status {
    stub_status on;
    access_log off;
    allow 127.0.0.1;
    deny all;
}
```

访问：`curl http://localhost/nginx_status`

### 2. 实时日志监控

```bash
# 访问日志
sudo tail -f /var/log/nginx/access.log

# 错误日志
sudo tail -f /var/log/nginx/error.log

# 过滤 5xx 错误
sudo tail -f /var/log/nginx/access.log | grep " 5[0-9][0-9] "
```

### 3. 日志分析

```bash
# 统计状态码
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn

# 统计 IP 访问次数
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -20

# 统计请求 URL
awk '{print $7}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -20

# 统计响应时间
awk '{print $NF}' /var/log/nginx/access.log | sort -n | tail -20
```

## 故障排除

### 配置测试

```bash
# 测试配置文件
sudo nginx -t

# 查看配置详情
sudo nginx -T

# 检查配置语法
sudo nginx -c /etc/nginx/nginx.conf -t
```

### 常见错误

#### 502 Bad Gateway

```bash
# 检查后端服务是否运行
curl http://localhost:3001/health

# 检查 SELinux（CentOS）
sudo setsebool -P httpd_can_network_connect 1

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

#### 504 Gateway Timeout

```nginx
# 增加超时时间
proxy_connect_timeout 120s;
proxy_send_timeout 120s;
proxy_read_timeout 120s;
```

#### 413 Request Entity Too Large

```nginx
# 增加上传大小限制
client_max_body_size 50M;
```

### 性能问题

```bash
# 查看连接数
ss -s

# 查看 Nginx 进程
ps aux | grep nginx

# 查看资源使用
top -p $(pgrep nginx | tr '\n' ',' | sed 's/,$//')
```

## 维护命令

```bash
# 启动
sudo systemctl start nginx

# 停止
sudo systemctl stop nginx

# 重启
sudo systemctl restart nginx

# 重载配置（不中断服务）
sudo systemctl reload nginx

# 查看状态
sudo systemctl status nginx

# 查看版本
nginx -v
nginx -V  # 详细信息

# 测试配置
sudo nginx -t
```

## 相关文档

- [生产部署](./PRODUCTION.md)
- [Docker 部署](./DOCKER.md)
- [系统架构](./ARCHITECTURE.md)
- [常见问题](./FAQ.md)
