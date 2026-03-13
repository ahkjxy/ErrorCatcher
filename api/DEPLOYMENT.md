# 部署指南

## 环境说明

项目支持 4 个环境：

- **dev** - 开发环境
- **test** - 测试环境
- **pre** - 预发布环境
- **prod** - 生产环境

## 环境配置

### 1. 配置文件

每个环境都有对应的配置文件：

```
api/
├── config/
│   ├── index.js      # 配置入口
│   ├── dev.js        # 开发环境配置
│   ├── test.js       # 测试环境配置
│   ├── pre.js        # 预发布环境配置
│   └── prod.js       # 生产环境配置
└── .env.{env}        # 环境变量文件
```

### 2. 环境变量

每个环境需要创建对应的 `.env` 文件：

```bash
# 开发环境
cp .env.dev .env

# 测试环境
cp .env.test .env

# 预发布环境
cp .env.pre .env

# 生产环境
cp .env.prod .env
```

## 本地开发

### 开发环境

```bash
cd api
npm install

# 方式1: 使用 npm script
npm run dev

# 方式2: 使用环境变量文件
npm run start:dev
```

访问: http://localhost:3001

### 测试环境

```bash
npm run test
# 或
npm run start:test
```

## 服务器部署

### 1. 准备工作

```bash
# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 MongoDB
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb

# 安装 PM2
sudo npm install -g pm2
```

### 2. 部署代码

```bash
# 克隆代码
git clone https://github.com/yourusername/error-catcher.git
cd error-catcher/api

# 安装依赖
npm install --production
```

### 3. 配置环境

#### 测试环境

```bash
# 创建环境变量文件
cp .env.test .env

# 编辑配置
nano .env

# 修改以下配置
NODE_ENV=test
MONGODB_URI=mongodb://test-server:27017/error-catcher-test
CORS_ORIGIN=http://test.example.com
```

#### 预发布环境

```bash
cp .env.pre .env
nano .env

# 修改配置
NODE_ENV=pre
MONGODB_URI=mongodb://pre-server:27017/error-catcher-pre
CORS_ORIGIN=https://pre.example.com
```

#### 生产环境

```bash
cp .env.prod .env
nano .env

# 修改配置
NODE_ENV=prod
MONGODB_URI=mongodb://prod-server:27017/error-catcher
CORS_ORIGIN=https://example.com
JWT_SECRET=your-super-secret-key-change-this
```

### 4. 使用 PM2 启动

#### 测试环境

```bash
pm2 start src/index.js --name error-catcher-test --env test
pm2 save
pm2 startup
```

#### 预发布环境

```bash
pm2 start src/index.js --name error-catcher-pre --env pre
pm2 save
pm2 startup
```

#### 生产环境

```bash
pm2 start src/index.js --name error-catcher-prod --env prod -i max
pm2 save
pm2 startup
```

### 5. PM2 配置文件

创建 `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'error-catcher-dev',
      script: './src/index.js',
      env: {
        NODE_ENV: 'dev'
      }
    },
    {
      name: 'error-catcher-test',
      script: './src/index.js',
      env: {
        NODE_ENV: 'test'
      }
    },
    {
      name: 'error-catcher-pre',
      script: './src/index.js',
      env: {
        NODE_ENV: 'pre'
      },
      instances: 2,
      exec_mode: 'cluster'
    },
    {
      name: 'error-catcher-prod',
      script: './src/index.js',
      env: {
        NODE_ENV: 'prod'
      },
      instances: 'max',
      exec_mode: 'cluster',
      max_memory_restart: '1G'
    }
  ]
};
```

使用配置文件启动：

```bash
# 启动测试环境
pm2 start ecosystem.config.js --only error-catcher-test

# 启动预发布环境
pm2 start ecosystem.config.js --only error-catcher-pre

# 启动生产环境
pm2 start ecosystem.config.js --only error-catcher-prod
```

## Nginx 配置

### 测试环境

```nginx
server {
    listen 80;
    server_name test-api.example.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 预发布环境

```nginx
server {
    listen 80;
    server_name pre-api.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pre-api.example.com;

    ssl_certificate /etc/letsencrypt/live/pre-api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pre-api.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 生产环境

```nginx
upstream error_catcher_prod {
    least_conn;
    server localhost:3001;
    server localhost:3002;
    server localhost:3003;
    server localhost:3004;
}

server {
    listen 80;
    server_name api.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 限流
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    location / {
        proxy_pass http://error_catcher_prod;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 健康检查
    location /health {
        proxy_pass http://error_catcher_prod;
        access_log off;
    }
}
```

## 监控和维护

### 查看日志

```bash
# PM2 日志
pm2 logs error-catcher-prod

# 实时日志
pm2 logs error-catcher-prod --lines 100

# 错误日志
pm2 logs error-catcher-prod --err
```

### 监控状态

```bash
# 查看进程状态
pm2 status

# 查看详细信息
pm2 show error-catcher-prod

# 监控面板
pm2 monit
```

### 重启服务

```bash
# 重启
pm2 restart error-catcher-prod

# 重载（零停机）
pm2 reload error-catcher-prod

# 停止
pm2 stop error-catcher-prod

# 删除
pm2 delete error-catcher-prod
```

### 更新代码

```bash
# 拉取最新代码
git pull

# 安装依赖
npm install --production

# 重载服务（零停机）
pm2 reload error-catcher-prod
```

## 数据库备份

### 自动备份脚本

创建 `backup.sh`:

```bash
#!/bin/bash

ENV=$1
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/mongodb"

mkdir -p $BACKUP_DIR

case $ENV in
  test)
    DB_NAME="error-catcher-test"
    ;;
  pre)
    DB_NAME="error-catcher-pre"
    ;;
  prod)
    DB_NAME="error-catcher"
    ;;
  *)
    echo "Usage: $0 {test|pre|prod}"
    exit 1
    ;;
esac

mongodump --db $DB_NAME --out $BACKUP_DIR/${DB_NAME}_${DATE}

# 保留最近7天的备份
find $BACKUP_DIR -name "${DB_NAME}_*" -mtime +7 -exec rm -rf {} \;

echo "Backup completed: ${DB_NAME}_${DATE}"
```

添加到 crontab:

```bash
# 每天凌晨2点备份生产环境
0 2 * * * /path/to/backup.sh prod

# 每天凌晨3点备份预发布环境
0 3 * * * /path/to/backup.sh pre
```

## 故障排除

### 检查环境

```bash
# 查看当前环境
curl http://localhost:3001/health

# 查看详细信息（非生产环境）
curl http://localhost:3001/info
```

### 常见问题

1. **端口被占用**
   ```bash
   lsof -i :3001
   kill -9 <PID>
   ```

2. **MongoDB 连接失败**
   ```bash
   sudo systemctl status mongodb
   sudo systemctl restart mongodb
   ```

3. **内存不足**
   ```bash
   pm2 restart error-catcher-prod --max-memory-restart 1G
   ```
