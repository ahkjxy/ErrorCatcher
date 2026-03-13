# ErrorCatcher API Server

后端 API 服务，使用 MongoDB 数据库。

## 技术栈

- Node.js
- Express
- MongoDB
- Mongoose

## 安装 MongoDB

### macOS

```bash
# 使用 Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# 验证安装
mongosh --version
```

### Ubuntu/Debian

```bash
# 导入公钥
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# 添加源
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 安装
sudo apt update
sudo apt install -y mongodb-org

# 启动服务
sudo systemctl start mongod
sudo systemctl enable mongod

# 验证
mongosh --version
```

### Windows

1. 下载安装程序: https://www.mongodb.com/try/download/community
2. 运行安装程序，选择 "Complete" 安装
3. 勾选 "Install MongoDB as a Service"
4. 安装完成后，MongoDB 会自动启动

验证安装：
```cmd
mongosh --version
```

## 快速开始

### 1. 安装依赖

```bash
cd api
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/error-catcher
```

### 3. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

服务将运行在 http://localhost:3001

### 4. 验证

```bash
curl http://localhost:3001/health
```

应该返回：

```json
{
  "status": "ok",
  "database": "MongoDB",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## API 端点

### POST /api/errors/report

接收错误报告。

**请求体：**
```json
{
  "errors": [
    {
      "type": "fetch",
      "status": 404,
      "url": "/api/data",
      "message": "Not Found",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "appName": "my-app",
      "environment": "production"
    }
  ]
}
```

**响应：**
```json
{
  "success": true,
  "count": 1,
  "receivedAt": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/errors

获取错误列表。

**查询参数：**
- `page`: 页码（默认 1）
- `limit`: 每页数量（默认 50）
- `appName`: 应用名称
- `environment`: 环境
- `type`: 错误类型
- `resolved`: 是否已解决
- `startDate`: 开始日期
- `endDate`: 结束日期

### GET /api/errors/:id

获取错误详情。

### PATCH /api/errors/:id/resolve

标记错误为已解决。

**请求体：**
```json
{
  "notes": "已修复",
  "resolvedBy": "admin"
}
```

### DELETE /api/errors/:id

删除错误。

### GET /api/stats/overview

获取统计概览。

**查询参数：**
- `appName`: 应用名称
- `environment`: 环境
- `days`: 天数（默认 7）

### GET /api/stats/apps

获取应用列表及统计。

### GET /health

健康检查。

## 数据库管理

### 使用 MongoDB Shell

```bash
# 连接到数据库
mongosh

# 切换到 error-catcher 数据库
use error-catcher

# 查看所有错误
db.errors.find().sort({timestamp: -1}).limit(10)

# 查看统计
db.errors.aggregate([
  { $group: { _id: "$appName", count: { $sum: 1 } } }
])

# 查看索引
db.errors.getIndexes()
```

### 清理旧数据

```bash
mongosh error-catcher --eval 'db.errors.deleteMany({timestamp: {$lt: new Date(Date.now() - 30*24*60*60*1000)}})'
```

### 备份数据库

```bash
mongodump --db error-catcher --out /backup
```

### 恢复数据库

```bash
mongorestore --db error-catcher /backup/error-catcher
```

## 性能优化

### 创建索引

索引会在应用启动时自动创建，包括：

- `appName` - 应用名称
- `type` - 错误类型
- `timestamp` - 时间戳
- `resolved` - 解决状态
- `appName + timestamp` - 复合索引
- `type + timestamp` - 复合索引

### 查看查询性能

```javascript
db.errors.find({appName: "my-app"}).explain("executionStats")
```

## 故障排除

### MongoDB 连接失败

检查 MongoDB 是否运行：

```bash
# macOS
brew services list | grep mongodb

# Linux
sudo systemctl status mongod

# Windows
services.msc (查找 MongoDB)
```

### 端口被占用

```bash
# 查看端口占用
lsof -i :3001
lsof -i :27017

# 修改 .env 中的 PORT
```

### 权限问题

```bash
# Linux 修改数据目录权限
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown mongodb:mongodb /tmp/mongodb-27017.sock
```

## 部署

### 使用 PM2

```bash
npm install -g pm2
pm2 start src/index.js --name error-catcher-api
pm2 save
pm2 startup
```

### 使用 systemd

创建 `/etc/systemd/system/error-catcher-api.service`:

```ini
[Unit]
Description=ErrorCatcher API
After=network.target mongod.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/api
ExecStart=/usr/bin/node src/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl enable error-catcher-api
sudo systemctl start error-catcher-api
```

## 监控

### 日志

```bash
# PM2
pm2 logs error-catcher-api

# systemd
sudo journalctl -u error-catcher-api -f
```

### 数据库状态

```bash
mongosh --eval "db.serverStatus()"
```

### 数据库大小

```bash
mongosh error-catcher --eval "db.stats()"
```

## MongoDB Atlas（云数据库）

如果不想本地安装 MongoDB，可以使用免费的 MongoDB Atlas：

1. 注册: https://www.mongodb.com/cloud/atlas/register
2. 创建免费集群
3. 获取连接字符串
4. 更新 `.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/error-catcher
```
