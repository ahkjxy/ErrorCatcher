# 常见问题解答 (FAQ)

本文档收集了 ErrorCatcher 部署和使用过程中的常见问题及解决方案。

## 部署相关

### Q1: 如何选择部署方式？

**A:** 根据你的需求选择：

- **本地开发**: 直接运行 `npm run dev`
- **小型项目**: 使用 PM2 部署，简单高效
- **中型项目**: 使用 Docker Compose，易于管理
- **大型项目**: 使用 Kubernetes，支持自动扩缩容

推荐顺序：本地开发 → PM2 → Docker → Kubernetes

### Q2: 最低服务器配置要求是什么？

**A:** 

最低配置：
- CPU: 2 核
- 内存: 4GB
- 硬盘: 50GB SSD
- 带宽: 5Mbps

推荐配置：
- CPU: 4 核
- 内存: 8GB
- 硬盘: 100GB SSD
- 带宽: 10Mbps

### Q3: 支持哪些操作系统？

**A:** 

- Ubuntu 20.04+ ✅ (推荐)
- Debian 11+ ✅
- CentOS 8+ ✅
- macOS 11+ ✅ (开发环境)
- Windows 10+ ⚠️ (仅开发环境，不推荐生产)

### Q4: 可以使用其他数据库吗？

**A:** 

目前只支持 MongoDB。原因：
- 灵活的文档结构适合错误数据
- 高性能的查询和聚合
- 易于扩展

暂不支持 MySQL、PostgreSQL 等关系型数据库。

### Q5: 如何实现高可用部署？

**A:** 

1. **API Server**: 使用 PM2 集群模式或多实例
2. **MongoDB**: 配置副本集（至少 3 个节点）
3. **Nginx**: 配置负载均衡和健康检查
4. **备份**: 定时备份数据库

示例架构：
```
Nginx (负载均衡)
    ↓
API Server (3 实例)
    ↓
MongoDB (副本集: 1 主 + 2 从)
```

## 安装和配置

### Q6: MongoDB 连接失败怎么办？

**A:** 

检查步骤：

1. **确认 MongoDB 运行**
```bash
sudo systemctl status mongod
```

2. **测试连接**
```bash
mongosh "mongodb://localhost:27017"
```

3. **检查认证**
```bash
# 如果启用了认证
mongosh "mongodb://username:password@localhost:27017/error-catcher?authSource=error-catcher"
```

4. **检查防火墙**
```bash
sudo ufw status
sudo ufw allow 27017/tcp
```

5. **检查绑定地址**
```bash
# 编辑 /etc/mongod.conf
net:
  bindIp: 0.0.0.0  # 允许远程连接
```

### Q7: JWT Token 一直提示过期？

**A:** 

可能原因：

1. **服务器时间不同步**
```bash
# 安装 NTP
sudo apt install -y ntp
sudo systemctl start ntp

# 同步时间
sudo ntpdate pool.ntp.org
```

2. **JWT_SECRET 不一致**
```bash
# 确保所有实例使用相同的 JWT_SECRET
echo $JWT_SECRET
```

3. **过期时间设置太短**
```bash
# 增加过期时间
JWT_EXPIRES_IN=7d
```

### Q8: CORS 错误如何解决？

**A:** 

1. **检查 CORS_ORIGIN 配置**
```bash
# api/.env
CORS_ORIGIN=http://localhost:3000,https://your-domain.com
```

2. **确保包含协议和端口**
```bash
# 错误
CORS_ORIGIN=localhost:3000

# 正确
CORS_ORIGIN=http://localhost:3000
```

3. **开发环境可以使用通配符**
```bash
CORS_ORIGIN=*
```

4. **生产环境必须指定具体域名**
```bash
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
```

### Q9: 如何修改默认端口？

**A:** 

1. **修改 API 端口**
```bash
# api/.env
PORT=3001
```

2. **修改 Admin 配置**
```bash
# admin/.env
VITE_API_URL=http://localhost:3001
```

3. **更新 Nginx 配置**
```nginx
upstream api_backend {
    server 127.0.0.1:3001;
}
```

4. **重启服务**
```bash
pm2 restart error-catcher-prod
sudo systemctl reload nginx
```

### Q10: SSL 证书配置失败？

**A:** 

使用 Let's Encrypt：

1. **安装 Certbot**
```bash
sudo apt install -y certbot python3-certbot-nginx
```

2. **申请证书**
```bash
sudo certbot --nginx -d api.your-domain.com -d admin.your-domain.com
```

3. **确保域名解析正确**
```bash
nslookup api.your-domain.com
```

4. **检查防火墙**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

5. **测试续期**
```bash
sudo certbot renew --dry-run
```

## 性能和优化

### Q11: API 响应很慢怎么办？

**A:** 

优化步骤：

1. **检查数据库索引**
```javascript
// 查看慢查询
db.setProfilingLevel(1, { slowms: 100 });
db.system.profile.find().sort({ ts: -1 }).limit(10);
```

2. **优化查询**
```javascript
// 使用投影减少数据传输
db.errors.find({ projectId: "xxx" }, { message: 1, timestamp: 1 });

// 使用 limit
db.errors.find({ projectId: "xxx" }).limit(100);
```

3. **启用 Nginx 缓存**
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m;

location /api/stats {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
}
```

4. **增加 PM2 实例**
```bash
pm2 scale error-catcher-prod 4
```

### Q12: 数据库占用空间太大？

**A:** 

清理策略：

1. **删除旧数据**
```javascript
// 删除 90 天前的已解决错误
db.errors.deleteMany({
  resolved: true,
  timestamp: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
});
```

2. **归档数据**
```javascript
// 归档到另一个集合
db.errors.aggregate([
  { $match: { timestamp: { $lt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } } },
  { $out: "errors_archive" }
]);
```

3. **压缩数据库**
```bash
mongosh error-catcher --eval "db.runCommand({ compact: 'errors' })"
```

4. **配置自动清理**
```javascript
// 在 API 中添加定时任务
const cron = require('node-cron');

cron.schedule('0 2 * * *', async () => {
  await Error.deleteMany({
    resolved: true,
    timestamp: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
  });
});
```

### Q13: 内存使用过高？

**A:** 

1. **限制 PM2 内存**
```bash
pm2 start ecosystem.config.js --max-memory-restart 1G
```

2. **优化 MongoDB 缓存**
```yaml
# /etc/mongod.conf
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 2  # 设置为服务器内存的 50%
```

3. **检查内存泄漏**
```bash
# 查看进程内存
pm2 show error-catcher-prod

# 使用 heapdump 分析
npm install -g heapdump
node --inspect src/index.js
```

4. **增加服务器内存**

## 数据和备份

### Q14: 如何备份数据？

**A:** 

1. **手动备份**
```bash
mongodump \
  --uri="mongodb://user:pass@localhost:27017/error-catcher?authSource=error-catcher" \
  --archive=/backup/backup_$(date +%Y%m%d).archive \
  --gzip
```

2. **自动备份脚本**
```bash
#!/bin/bash
# /usr/local/bin/mongodb-backup.sh
mongodump \
  --uri="$MONGODB_URI" \
  --archive="/backup/backup_$(date +%Y%m%d_%H%M%S).archive" \
  --gzip

# 删除 7 天前的备份
find /backup -name "backup_*.archive" -mtime +7 -delete
```

3. **添加到 crontab**
```bash
# 每天凌晨 2 点备份
0 2 * * * /usr/local/bin/mongodb-backup.sh
```

### Q15: 如何恢复数据？

**A:** 

```bash
# 恢复整个数据库
mongorestore \
  --uri="mongodb://user:pass@localhost:27017/error-catcher?authSource=error-catcher" \
  --archive=/backup/backup_20240101.archive \
  --gzip

# 恢复特定集合
mongorestore \
  --uri="mongodb://user:pass@localhost:27017/error-catcher?authSource=error-catcher" \
  --nsInclude="error-catcher.errors" \
  --archive=/backup/backup_20240101.archive \
  --gzip
```

### Q16: 如何迁移数据到新服务器？

**A:** 

1. **在旧服务器备份**
```bash
mongodump \
  --uri="mongodb://old-server:27017/error-catcher" \
  --archive=/tmp/migration.archive \
  --gzip
```

2. **传输到新服务器**
```bash
scp /tmp/migration.archive user@new-server:/tmp/
```

3. **在新服务器恢复**
```bash
mongorestore \
  --uri="mongodb://new-server:27017/error-catcher" \
  --archive=/tmp/migration.archive \
  --gzip
```

4. **更新配置**
```bash
# 更新 API 配置
MONGODB_URI=mongodb://new-server:27017/error-catcher
```

5. **验证数据**
```bash
mongosh "mongodb://new-server:27017/error-catcher"
db.errors.countDocuments()
db.users.countDocuments()
```

## 安全相关

### Q17: 如何保护 API 安全？

**A:** 

1. **使用 HTTPS**
```bash
sudo certbot --nginx -d api.your-domain.com
```

2. **启用限流**
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
limit_req zone=api_limit burst=200 nodelay;
```

3. **配置防火墙**
```bash
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 27017/tcp  # 禁止外部访问 MongoDB
```

4. **使用强密钥**
```bash
# 生成强 JWT_SECRET
openssl rand -base64 32
```

5. **定期更新依赖**
```bash
npm audit
npm audit fix
```

### Q18: 如何防止 DDoS 攻击？

**A:** 

1. **Nginx 限流**
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

location / {
    limit_req zone=api_limit burst=200 nodelay;
    limit_conn conn_limit 10;
}
```

2. **使用 CDN**
- Cloudflare
- AWS CloudFront
- 阿里云 CDN

3. **配置 fail2ban**
```bash
sudo apt install -y fail2ban

# 配置 Nginx 规则
sudo nano /etc/fail2ban/jail.local
```

4. **监控异常流量**
```bash
# 查看访问最多的 IP
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -20
```

### Q19: 数据库被攻击怎么办？

**A:** 

预防措施：

1. **启用认证**
```yaml
# /etc/mongod.conf
security:
  authorization: enabled
```

2. **限制网络访问**
```yaml
net:
  bindIp: 127.0.0.1  # 只允许本地访问
```

3. **使用强密码**
```javascript
db.createUser({
  user: "admin",
  pwd: "strong-random-password-min-32-chars",
  roles: ["root"]
});
```

4. **定期备份**
```bash
# 每天备份
0 2 * * * /usr/local/bin/mongodb-backup.sh
```

5. **监控日志**
```bash
sudo tail -f /var/log/mongodb/mongod.log
```

## 监控和调试

### Q20: 如何监控系统运行状态？

**A:** 

1. **PM2 监控**
```bash
pm2 monit
pm2 status
pm2 logs
```

2. **Nginx 状态**
```nginx
location /nginx_status {
    stub_status on;
    allow 127.0.0.1;
    deny all;
}
```

3. **MongoDB 监控**
```javascript
db.serverStatus()
db.currentOp()
```

4. **系统资源**
```bash
htop
df -h
free -h
```

5. **使用监控工具**
- Prometheus + Grafana
- PM2 Plus
- New Relic
- Datadog

### Q21: 如何查看错误日志？

**A:** 

1. **PM2 日志**
```bash
# 查看所有日志
pm2 logs

# 查看错误日志
pm2 logs --err

# 查看最近 100 行
pm2 logs --lines 100

# 实时查看
pm2 logs -f
```

2. **Nginx 日志**
```bash
# 访问日志
sudo tail -f /var/log/nginx/access.log

# 错误日志
sudo tail -f /var/log/nginx/error.log

# 过滤 5xx 错误
sudo tail -f /var/log/nginx/access.log | grep " 5[0-9][0-9] "
```

3. **MongoDB 日志**
```bash
sudo tail -f /var/log/mongodb/mongod.log
```

4. **应用日志**
```bash
# 如果使用文件日志
tail -f /var/www/ErrorCatcher/api/logs/error.log
```

### Q22: 502 Bad Gateway 错误？

**A:** 

原因和解决：

1. **API 服务未运行**
```bash
pm2 status
pm2 restart error-catcher-prod
```

2. **端口不匹配**
```bash
# 检查 API 端口
echo $PORT

# 检查 Nginx 配置
sudo nginx -t
```

3. **SELinux 阻止（CentOS）**
```bash
sudo setsebool -P httpd_can_network_connect 1
```

4. **防火墙阻止**
```bash
sudo ufw allow 3001/tcp
```

5. **超时设置太短**
```nginx
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
```

## 其他问题

### Q23: 如何升级到新版本？

**A:** 

1. **备份数据**
```bash
/usr/local/bin/mongodb-backup.sh
```

2. **拉取最新代码**
```bash
cd /var/www/ErrorCatcher
git pull
```

3. **更新依赖**
```bash
cd api && npm install
cd ../admin && npm install && npm run build
```

4. **运行迁移（如果有）**
```bash
cd api && npm run migrate
```

5. **重启服务**
```bash
pm2 reload error-catcher-prod
sudo systemctl reload nginx
```

6. **验证**
```bash
curl https://api.your-domain.com/health
```

### Q24: 如何重置管理员密码？

**A:** 

```bash
cd /var/www/ErrorCatcher/api

# 方式 1: 使用脚本
npm run reset-password

# 方式 2: 直接修改数据库
mongosh error-catcher

# 生成新密码哈希
const bcrypt = require('bcrypt');
const hash = bcrypt.hashSync('new-password', 10);

# 更新密码
db.users.updateOne(
  { email: 'admin@example.com' },
  { $set: { password: hash } }
);
```

### Q25: 如何联系技术支持？

**A:** 

- GitHub Issues: https://github.com/your-repo/issues
- 邮件: support@your-domain.com
- 文档: https://docs.your-domain.com
- 社区: https://community.your-domain.com

## 相关文档

- [生产部署](./PRODUCTION.md)
- [Docker 部署](./DOCKER.md)
- [数据库配置](./DATABASE.md)
- [Nginx 配置](./NGINX.md)
- [环境变量](./ENVIRONMENT.md)
- [系统架构](./ARCHITECTURE.md)
