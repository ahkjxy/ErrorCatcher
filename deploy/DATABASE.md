# MongoDB 数据库配置指南

本文档详细介绍 ErrorCatcher 系统的 MongoDB 数据库配置、优化和维护。

## 数据库概述

ErrorCatcher 使用 MongoDB 作为主数据库，存储用户、项目、错误、问题、告警等数据。

### 数据库信息

- 数据库名称: `error-catcher`
- MongoDB 版本: 5.0+
- 存储引擎: WiredTiger
- 认证方式: SCRAM-SHA-256

## 安装 MongoDB

### Ubuntu/Debian

```bash
# 导入公钥
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# 添加源
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 更新并安装
sudo apt update
sudo apt install -y mongodb-org

# 启动服务
sudo systemctl start mongod
sudo systemctl enable mongod

# 验证
sudo systemctl status mongod
mongosh --version
```

### CentOS/RHEL

```bash
# 创建仓库文件
sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo << EOF
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc
EOF

# 安装
sudo yum install -y mongodb-org

# 启动服务
sudo systemctl start mongod
sudo systemctl enable mongod
```

### macOS

```bash
# 使用 Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0

# 启动服务
brew services start mongodb-community@7.0

# 验证
mongosh --version
```

### Docker

```bash
# 拉取镜像
docker pull mongo:7.0

# 启动容器
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -v mongodb_data:/data/db \
  mongo:7.0
```

## 数据库初始化

### 1. 连接 MongoDB

```bash
# 本地连接
mongosh

# 远程连接
mongosh "mongodb://hostname:27017"

# 使用认证连接
mongosh "mongodb://username:password@hostname:27017/database"
```

### 2. 创建数据库和用户

```javascript
// 切换到 admin 数据库
use admin

// 创建管理员用户
db.createUser({
  user: "admin",
  pwd: "your-strong-admin-password",
  roles: [
    { role: "root", db: "admin" }
  ]
})

// 切换到应用数据库
use error-catcher

// 创建应用用户
db.createUser({
  user: "error_catcher_user",
  pwd: "your-strong-app-password",
  roles: [
    { role: "readWrite", db: "error-catcher" },
    { role: "dbAdmin", db: "error-catcher" }
  ]
})

// 验证用户
db.auth("error_catcher_user", "your-strong-app-password")
```

### 3. 创建集合

```javascript
// 切换到应用数据库
use error-catcher

// 创建集合
db.createCollection("users")
db.createCollection("projects")
db.createCollection("project_members")
db.createCollection("errors")
db.createCollection("issues")
db.createCollection("alerts")
db.createCollection("alert_history")
db.createCollection("notification_configs")
db.createCollection("notification_templates")
db.createCollection("api_tokens")
db.createCollection("comments")
db.createCollection("activities")
```

### 4. 创建索引

```javascript
// users 集合
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ username: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
db.users.createIndex({ createdAt: -1 })

// projects 集合
db.projects.createIndex({ apiKey: 1 }, { unique: true })
db.projects.createIndex({ owner: 1 })
db.projects.createIndex({ status: 1 })
db.projects.createIndex({ createdAt: -1 })

// project_members 集合
db.project_members.createIndex({ userId: 1, projectId: 1 }, { unique: true })
db.project_members.createIndex({ projectId: 1 })
db.project_members.createIndex({ userId: 1 })

// errors 集合（重要）
db.errors.createIndex({ projectId: 1, timestamp: -1 })
db.errors.createIndex({ issueId: 1 })
db.errors.createIndex({ resolved: 1 })
db.errors.createIndex({ projectId: 1, resolved: 1, timestamp: -1 })
db.errors.createIndex({ type: 1 })
db.errors.createIndex({ environment: 1 })
db.errors.createIndex({ createdAt: -1 })

// issues 集合（重要）
db.issues.createIndex({ projectId: 1, status: 1 })
db.issues.createIndex({ fingerprint: 1 }, { unique: true })
db.issues.createIndex({ projectId: 1, lastSeen: -1 })
db.issues.createIndex({ projectId: 1, count: -1 })
db.issues.createIndex({ assignee: 1 })
db.issues.createIndex({ status: 1 })

// alerts 集合
db.alerts.createIndex({ projectId: 1 })
db.alerts.createIndex({ enabled: 1 })
db.alerts.createIndex({ type: 1 })

// alert_history 集合
db.alert_history.createIndex({ alertId: 1, triggeredAt: -1 })
db.alert_history.createIndex({ projectId: 1, triggeredAt: -1 })

// notification_configs 集合
db.notification_configs.createIndex({ projectId: 1 })
db.notification_configs.createIndex({ enabled: 1 })

// api_tokens 集合
db.api_tokens.createIndex({ token: 1 }, { unique: true })
db.api_tokens.createIndex({ projectId: 1 })
db.api_tokens.createIndex({ userId: 1 })

// comments 集合
db.comments.createIndex({ issueId: 1, createdAt: -1 })
db.comments.createIndex({ userId: 1 })

// activities 集合
db.activities.createIndex({ projectId: 1, createdAt: -1 })
db.activities.createIndex({ userId: 1, createdAt: -1 })
db.activities.createIndex({ type: 1 })
```

## 配置文件

### 基础配置

编辑 `/etc/mongod.conf`：

```yaml
# 网络配置
net:
  port: 27017
  bindIp: 127.0.0.1  # 生产环境改为 0.0.0.0 或具体 IP

# 存储配置
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
  engine: wiredTiger
  wiredTiger:
    engineConfig:
      cacheSizeGB: 2  # 根据服务器内存调整

# 日志配置
systemLog:
  destination: file
  path: /var/log/mongodb/mongod.log
  logAppend: true
  logRotate: reopen

# 进程管理
processManagement:
  fork: true
  pidFilePath: /var/run/mongodb/mongod.pid

# 安全配置
security:
  authorization: enabled

# 操作分析
operationProfiling:
  mode: slowOp
  slowOpThresholdMs: 100
```

### 生产环境配置

```yaml
# 网络配置
net:
  port: 27017
  bindIp: 0.0.0.0
  maxIncomingConnections: 1000

# 存储配置
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
    commitIntervalMs: 100
  engine: wiredTiger
  wiredTiger:
    engineConfig:
      cacheSizeGB: 4
      journalCompressor: snappy
    collectionConfig:
      blockCompressor: snappy
    indexConfig:
      prefixCompression: true

# 日志配置
systemLog:
  destination: file
  path: /var/log/mongodb/mongod.log
  logAppend: true
  logRotate: reopen
  verbosity: 0

# 安全配置
security:
  authorization: enabled
  javascriptEnabled: false

# 操作分析
operationProfiling:
  mode: slowOp
  slowOpThresholdMs: 50

# 副本集配置（可选）
replication:
  replSetName: error-catcher-rs
```

重启 MongoDB：

```bash
sudo systemctl restart mongod
```

## 连接字符串

### 基本连接

```bash
# 无认证
mongodb://localhost:27017/error-catcher

# 有认证
mongodb://username:password@localhost:27017/error-catcher?authSource=error-catcher

# 多个主机（副本集）
mongodb://username:password@host1:27017,host2:27017,host3:27017/error-catcher?replicaSet=error-catcher-rs&authSource=error-catcher
```

### 连接选项

```bash
mongodb://username:password@localhost:27017/error-catcher?
  authSource=error-catcher&
  maxPoolSize=100&
  minPoolSize=10&
  maxIdleTimeMS=60000&
  retryWrites=true&
  w=majority&
  readPreference=primary
```

## 性能优化

### 1. 索引优化

```javascript
// 查看索引使用情况
db.errors.aggregate([
  { $indexStats: {} }
])

// 查看慢查询
db.system.profile.find().sort({ ts: -1 }).limit(10)

// 分析查询计划
db.errors.find({ projectId: "xxx" }).explain("executionStats")

// 删除未使用的索引
db.errors.dropIndex("index_name")
```

### 2. 查询优化

```javascript
// 使用投影减少数据传输
db.errors.find(
  { projectId: "xxx" },
  { message: 1, timestamp: 1, _id: 0 }
)

// 使用 limit 限制结果
db.errors.find({ projectId: "xxx" }).limit(100)

// 使用聚合管道
db.errors.aggregate([
  { $match: { projectId: "xxx" } },
  { $group: { _id: "$type", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

### 3. 连接池配置

在应用中配置：

```javascript
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 100,      // 最大连接数
  minPoolSize: 10,       // 最小连接数
  maxIdleTimeMS: 60000,  // 最大空闲时间
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

### 4. 内存配置

```yaml
# /etc/mongod.conf
storage:
  wiredTiger:
    engineConfig:
      # 设置为服务器内存的 50-60%
      cacheSizeGB: 4
```

### 5. 数据压缩

```yaml
storage:
  wiredTiger:
    engineConfig:
      journalCompressor: snappy
    collectionConfig:
      blockCompressor: snappy
```

## 数据维护

### 1. 数据清理

```javascript
// 删除 90 天前的已解决错误
db.errors.deleteMany({
  resolved: true,
  timestamp: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
})

// 删除 30 天前的告警历史
db.alert_history.deleteMany({
  triggeredAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
})

// 删除 60 天前的活动记录
db.activities.deleteMany({
  createdAt: { $lt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) }
})
```

### 2. 数据归档

```javascript
// 归档旧数据到另一个集合
db.errors.aggregate([
  {
    $match: {
      timestamp: { $lt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) }
    }
  },
  { $out: "errors_archive" }
])

// 删除已归档的数据
db.errors.deleteMany({
  timestamp: { $lt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) }
})
```

### 3. 数据库维护

```javascript
// 查看数据库统计
db.stats()

// 查看集合统计
db.errors.stats()

// 压缩集合（回收空间）
db.runCommand({ compact: "errors" })

// 重建索引
db.errors.reIndex()

// 验证集合
db.errors.validate()
```

## 备份和恢复

### 1. 使用 mongodump

```bash
# 备份整个数据库
mongodump \
  --uri="mongodb://username:password@localhost:27017/error-catcher?authSource=error-catcher" \
  --out=/backup/mongodb/$(date +%Y%m%d)

# 备份特定集合
mongodump \
  --uri="mongodb://username:password@localhost:27017/error-catcher?authSource=error-catcher" \
  --collection=errors \
  --out=/backup/mongodb/$(date +%Y%m%d)

# 压缩备份
mongodump \
  --uri="mongodb://username:password@localhost:27017/error-catcher?authSource=error-catcher" \
  --archive=/backup/mongodb/backup_$(date +%Y%m%d).archive \
  --gzip
```

### 2. 使用 mongorestore

```bash
# 恢复整个数据库
mongorestore \
  --uri="mongodb://username:password@localhost:27017/error-catcher?authSource=error-catcher" \
  /backup/mongodb/20240101

# 恢复特定集合
mongorestore \
  --uri="mongodb://username:password@localhost:27017/error-catcher?authSource=error-catcher" \
  --collection=errors \
  /backup/mongodb/20240101/error-catcher/errors.bson

# 恢复压缩备份
mongorestore \
  --uri="mongodb://username:password@localhost:27017/error-catcher?authSource=error-catcher" \
  --archive=/backup/mongodb/backup_20240101.archive \
  --gzip
```

### 3. 自动备份脚本

创建 `/usr/local/bin/mongodb-backup.sh`：

```bash
#!/bin/bash

# 配置
BACKUP_DIR="/backup/mongodb"
DB_URI="mongodb://username:password@localhost:27017/error-catcher?authSource=error-catcher"
RETENTION_DAYS=7
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
mongodump \
  --uri="$DB_URI" \
  --archive="${BACKUP_DIR}/backup_${DATE}.archive" \
  --gzip

# 检查备份是否成功
if [ $? -eq 0 ]; then
  echo "Backup completed successfully: backup_${DATE}.archive"
  
  # 删除旧备份
  find $BACKUP_DIR -name "backup_*.archive" -mtime +$RETENTION_DAYS -delete
  echo "Old backups cleaned up (retention: ${RETENTION_DAYS} days)"
else
  echo "Backup failed!"
  exit 1
fi
```

设置权限并添加到 crontab：

```bash
sudo chmod +x /usr/local/bin/mongodb-backup.sh

# 添加到 crontab（每天凌晨 2 点）
sudo crontab -e
0 2 * * * /usr/local/bin/mongodb-backup.sh >> /var/log/mongodb-backup.log 2>&1
```

## 监控

### 1. 查看服务器状态

```javascript
// 服务器状态
db.serverStatus()

// 数据库状态
db.stats()

// 当前操作
db.currentOp()

// 连接信息
db.serverStatus().connections
```

### 2. 慢查询分析

```javascript
// 启用分析
db.setProfilingLevel(1, { slowms: 100 })

// 查看慢查询
db.system.profile.find().sort({ ts: -1 }).limit(10).pretty()

// 关闭分析
db.setProfilingLevel(0)
```

### 3. 监控脚本

创建 `/usr/local/bin/mongodb-monitor.sh`：

```bash
#!/bin/bash

echo "=== MongoDB Status ==="
mongosh --quiet --eval "
  var status = db.serverStatus();
  print('Connections: ' + status.connections.current + '/' + status.connections.available);
  print('Memory: ' + (status.mem.resident) + 'MB');
  print('Operations: ' + JSON.stringify(status.opcounters));
"

echo ""
echo "=== Database Stats ==="
mongosh error-catcher --quiet --eval "
  var stats = db.stats();
  print('Collections: ' + stats.collections);
  print('Data Size: ' + (stats.dataSize / 1024 / 1024).toFixed(2) + 'MB');
  print('Index Size: ' + (stats.indexSize / 1024 / 1024).toFixed(2) + 'MB');
"
```

## 安全配置

### 1. 启用认证

```yaml
# /etc/mongod.conf
security:
  authorization: enabled
```

### 2. 网络安全

```yaml
# 只监听本地
net:
  bindIp: 127.0.0.1

# 或指定 IP
net:
  bindIp: 127.0.0.1,192.168.1.100
```

### 3. 防火墙配置

```bash
# 只允许特定 IP 访问
sudo ufw allow from 192.168.1.0/24 to any port 27017

# 或使用 iptables
sudo iptables -A INPUT -p tcp -s 192.168.1.0/24 --dport 27017 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 27017 -j DROP
```

### 4. SSL/TLS 加密

```yaml
# /etc/mongod.conf
net:
  ssl:
    mode: requireSSL
    PEMKeyFile: /etc/ssl/mongodb.pem
    CAFile: /etc/ssl/ca.pem
```

## 故障排除

### 连接失败

```bash
# 检查服务状态
sudo systemctl status mongod

# 查看日志
sudo tail -f /var/log/mongodb/mongod.log

# 测试连接
mongosh "mongodb://localhost:27017"
```

### 性能问题

```javascript
// 查看慢查询
db.system.profile.find({ millis: { $gt: 100 } }).sort({ ts: -1 })

// 查看当前操作
db.currentOp({ "active": true, "secs_running": { "$gt": 3 } })

// 杀死慢查询
db.killOp(opid)
```

### 磁盘空间不足

```bash
# 查看磁盘使用
df -h

# 压缩数据库
mongosh error-catcher --eval "db.runCommand({ compact: 'errors' })"

# 清理日志
sudo logrotate -f /etc/logrotate.d/mongodb
```

## 相关文档

- [生产部署](./PRODUCTION.md)
- [Docker 部署](./DOCKER.md)
- [系统架构](./ARCHITECTURE.md)
- [环境变量](./ENVIRONMENT.md)
