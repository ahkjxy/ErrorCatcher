# 环境变量配置说明

本文档详细说明 ErrorCatcher 系统所有环境变量的配置和使用。

## 环境说明

ErrorCatcher 支持 4 个运行环境：

| 环境 | NODE_ENV | 用途 | 数据库 |
|------|----------|------|--------|
| 开发环境 | `dev` | 本地开发调试 | error-catcher-dev |
| 测试环境 | `test` | 功能测试 | error-catcher-test |
| 预发布环境 | `pre` | 上线前验证 | error-catcher-pre |
| 生产环境 | `prod` | 正式生产 | error-catcher |

## API Server 环境变量

### 基础配置

#### NODE_ENV
- 类型: `string`
- 必需: 是
- 默认值: `development`
- 可选值: `dev`, `test`, `pre`, `prod`
- 说明: 运行环境标识

```bash
NODE_ENV=prod
```

#### PORT
- 类型: `number`
- 必需: 否
- 默认值: `3001`
- 说明: API 服务器监听端口

```bash
PORT=3001
```

### 数据库配置

#### MONGODB_URI
- 类型: `string`
- 必需: 是
- 格式: `mongodb://[username:password@]host[:port]/database[?options]`
- 说明: MongoDB 连接字符串

```bash
# 开发环境（无认证）
MONGODB_URI=mongodb://localhost:27017/error-catcher-dev

# 生产环境（有认证）
MONGODB_URI=mongodb://username:password@localhost:27017/error-catcher?authSource=error-catcher

# 副本集
MONGODB_URI=mongodb://user:pass@host1:27017,host2:27017,host3:27017/error-catcher?replicaSet=rs0&authSource=error-catcher
```

常用选项：
- `authSource`: 认证数据库
- `replicaSet`: 副本集名称
- `maxPoolSize`: 最大连接池大小
- `minPoolSize`: 最小连接池大小
- `retryWrites`: 启用重试写入
- `w`: 写入确认级别

### JWT 配置

#### JWT_SECRET
- 类型: `string`
- 必需: 是
- 最小长度: 32 字符
- 说明: JWT 签名密钥，生产环境必须使用强密钥

```bash
# 开发环境
JWT_SECRET=dev-secret-key-change-in-production

# 生产环境（使用强密钥）
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long-and-random
```

生成强密钥：
```bash
# 方式 1: 使用 openssl
openssl rand -base64 32

# 方式 2: 使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### JWT_EXPIRES_IN
- 类型: `string`
- 必需: 否
- 默认值: `7d`
- 格式: 数字+单位 (s=秒, m=分钟, h=小时, d=天)
- 说明: JWT Token 过期时间

```bash
JWT_EXPIRES_IN=7d    # 7 天
JWT_EXPIRES_IN=24h   # 24 小时
JWT_EXPIRES_IN=30m   # 30 分钟
```

### CORS 配置

#### CORS_ORIGIN
- 类型: `string`
- 必需: 否
- 默认值: `*`
- 格式: 单个域名或逗号分隔的多个域名
- 说明: 允许跨域访问的源

```bash
# 开发环境（允许所有）
CORS_ORIGIN=*

# 开发环境（多个本地端口）
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# 生产环境（指定域名）
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com

# 生产环境（多个域名）
CORS_ORIGIN=https://api.example.com,https://admin.example.com,https://app.example.com
```

### 日志配置

#### LOG_LEVEL
- 类型: `string`
- 必需: 否
- 默认值: `info`
- 可选值: `debug`, `info`, `warn`, `error`
- 说明: 日志输出级别

```bash
# 开发环境（详细日志）
LOG_LEVEL=debug

# 测试环境
LOG_LEVEL=info

# 生产环境（只记录错误）
LOG_LEVEL=error
```

### 钉钉通知配置

#### DINGTALK_WEBHOOK
- 类型: `string`
- 必需: 否（如果不使用钉钉通知）
- 格式: `https://oapi.dingtalk.com/robot/send?access_token=xxx`
- 说明: 钉钉机器人 Webhook 地址

```bash
DINGTALK_WEBHOOK=https://oapi.dingtalk.com/robot/send?access_token=your_access_token
```

#### DINGTALK_SECRET
- 类型: `string`
- 必需: 否（如果钉钉机器人启用了签名验证则必需）
- 格式: `SECxxx`
- 说明: 钉钉机器人签名密钥

```bash
DINGTALK_SECRET=SECxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

获取钉钉配置：
1. 打开钉钉群聊
2. 群设置 → 智能群助手 → 添加机器人 → 自定义
3. 设置机器人名称和安全设置
4. 复制 Webhook 地址和密钥

### 其他配置

#### API_PREFIX
- 类型: `string`
- 必需: 否
- 默认值: `/api`
- 说明: API 路由前缀

```bash
API_PREFIX=/api
```

#### RATE_LIMIT_WINDOW
- 类型: `number`
- 必需: 否
- 默认值: `900000` (15分钟)
- 单位: 毫秒
- 说明: 限流时间窗口

```bash
RATE_LIMIT_WINDOW=900000
```

#### RATE_LIMIT_MAX
- 类型: `number`
- 必需: 否
- 默认值: `100`
- 说明: 时间窗口内最大请求数

```bash
RATE_LIMIT_MAX=100
```

## Admin Dashboard 环境变量

### VITE_API_URL
- 类型: `string`
- 必需: 是
- 格式: 完整的 URL（包含协议）
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
- 格式: 完整的 URL（包含协议）
- 说明: WebSocket 服务器地址（通常与 API 地址相同）

```bash
# 开发环境
VITE_WS_URL=http://localhost:3001

# 生产环境
VITE_WS_URL=https://api.your-domain.com
```

## 环境变量文件

### 文件命名规范

```
api/
├── .env.dev          # 开发环境
├── .env.test         # 测试环境
├── .env.pre          # 预发布环境
├── .env.prod         # 生产环境
└── .env.example      # 示例文件

admin/
├── .env.development  # 开发环境
├── .env.production   # 生产环境
└── .env.example      # 示例文件
```

### 开发环境配置

`api/.env.dev`:
```bash
# 环境
NODE_ENV=dev

# 服务器
PORT=3001

# 数据库
MONGODB_URI=mongodb://localhost:27017/error-catcher-dev

# JWT
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# 日志
LOG_LEVEL=debug

# 钉钉（可选）
DINGTALK_WEBHOOK=
DINGTALK_SECRET=
```

`admin/.env.development`:
```bash
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001
```

### 测试环境配置

`api/.env.test`:
```bash
NODE_ENV=test
PORT=3001
MONGODB_URI=mongodb://test-user:test-pass@test-server:27017/error-catcher-test?authSource=error-catcher-test
JWT_SECRET=test-secret-key-different-from-dev
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://test.example.com
LOG_LEVEL=info
DINGTALK_WEBHOOK=https://oapi.dingtalk.com/robot/send?access_token=test_token
DINGTALK_SECRET=SECtest
```

### 预发布环境配置

`api/.env.pre`:
```bash
NODE_ENV=pre
PORT=3001
MONGODB_URI=mongodb://pre-user:pre-pass@pre-server:27017/error-catcher-pre?authSource=error-catcher-pre
JWT_SECRET=pre-secret-key-strong-and-unique
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://pre.example.com
LOG_LEVEL=warn
DINGTALK_WEBHOOK=https://oapi.dingtalk.com/robot/send?access_token=pre_token
DINGTALK_SECRET=SECpre
```

### 生产环境配置

`api/.env.prod`:
```bash
NODE_ENV=prod
PORT=3001
MONGODB_URI=mongodb://prod-user:strong-password@prod-server:27017/error-catcher?authSource=error-catcher&maxPoolSize=100&minPoolSize=10&retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long-and-random-generated
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com,https://api.your-domain.com
LOG_LEVEL=error
DINGTALK_WEBHOOK=https://oapi.dingtalk.com/robot/send?access_token=prod_token
DINGTALK_SECRET=SECprod
```

`admin/.env.production`:
```bash
VITE_API_URL=https://api.your-domain.com
VITE_WS_URL=https://api.your-domain.com
```

## 使用环境变量

### 在代码中读取

```javascript
// Node.js (API)
const port = process.env.PORT || 3001;
const mongoUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;

// Vite (Admin)
const apiUrl = import.meta.env.VITE_API_URL;
const wsUrl = import.meta.env.VITE_WS_URL;
```

### 加载环境变量

#### 使用 dotenv

```javascript
// api/src/index.js
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'dev'}`
});

console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);
```

#### 使用 npm scripts

```json
{
  "scripts": {
    "dev": "NODE_ENV=dev node src/index.js",
    "test": "NODE_ENV=test node src/index.js",
    "pre": "NODE_ENV=pre node src/index.js",
    "prod": "NODE_ENV=prod node src/index.js"
  }
}
```

#### 使用 PM2

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'error-catcher-prod',
    script: './src/index.js',
    env: {
      NODE_ENV: 'prod'
    },
    env_file: '.env.prod'
  }]
};
```

## 安全最佳实践

### 1. 不要提交敏感信息

```bash
# .gitignore
.env
.env.*
!.env.example
```

### 2. 使用强密钥

```bash
# 生成强密钥
openssl rand -base64 32

# 或使用密码生成器
pwgen -s 32 1
```

### 3. 定期轮换密钥

- JWT_SECRET: 每 3-6 个月更换
- 数据库密码: 每 6-12 个月更换
- API 密钥: 根据需要更换

### 4. 使用密钥管理服务

生产环境建议使用：
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault
- Google Secret Manager

### 5. 限制环境变量访问

```bash
# 设置文件权限
chmod 600 .env.prod

# 只允许特定用户访问
chown deploy:deploy .env.prod
```

## 验证配置

### 检查环境变量

```bash
# 查看所有环境变量
printenv

# 查看特定变量
echo $NODE_ENV
echo $MONGODB_URI

# 在 Node.js 中检查
node -e "console.log(process.env.NODE_ENV)"
```

### 验证配置脚本

创建 `scripts/check-env.js`:

```javascript
#!/usr/bin/env node

require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'dev'}`
});

const required = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'CORS_ORIGIN'
];

const optional = [
  'LOG_LEVEL',
  'DINGTALK_WEBHOOK',
  'DINGTALK_SECRET'
];

console.log('=== 环境变量检查 ===\n');

let hasError = false;

// 检查必需变量
console.log('必需变量:');
required.forEach(key => {
  const value = process.env[key];
  if (!value) {
    console.log(`❌ ${key}: 未设置`);
    hasError = true;
  } else {
    // 隐藏敏感信息
    const display = key.includes('SECRET') || key.includes('PASSWORD')
      ? '***'
      : value;
    console.log(`✅ ${key}: ${display}`);
  }
});

// 检查可选变量
console.log('\n可选变量:');
optional.forEach(key => {
  const value = process.env[key];
  if (value) {
    const display = key.includes('SECRET') || key.includes('PASSWORD')
      ? '***'
      : value;
    console.log(`✅ ${key}: ${display}`);
  } else {
    console.log(`⚠️  ${key}: 未设置（可选）`);
  }
});

// 检查 JWT_SECRET 强度
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.log('\n⚠️  警告: JWT_SECRET 长度小于 32 字符，建议使用更强的密钥');
  hasError = true;
}

// 检查生产环境配置
if (process.env.NODE_ENV === 'prod') {
  if (process.env.CORS_ORIGIN === '*') {
    console.log('\n⚠️  警告: 生产环境不应使用 CORS_ORIGIN=*');
    hasError = true;
  }
  if (process.env.LOG_LEVEL === 'debug') {
    console.log('\n⚠️  警告: 生产环境不应使用 LOG_LEVEL=debug');
  }
}

if (hasError) {
  console.log('\n❌ 配置检查失败');
  process.exit(1);
} else {
  console.log('\n✅ 配置检查通过');
}
```

运行检查：

```bash
chmod +x scripts/check-env.js
NODE_ENV=prod ./scripts/check-env.js
```

## 故障排除

### 环境变量未生效

```bash
# 检查文件是否存在
ls -la .env*

# 检查文件内容
cat .env.prod

# 检查是否正确加载
node -e "require('dotenv').config({path:'.env.prod'}); console.log(process.env.NODE_ENV)"
```

### 权限问题

```bash
# 检查文件权限
ls -l .env.prod

# 修改权限
chmod 600 .env.prod
chown $USER:$USER .env.prod
```

### 变量值包含特殊字符

```bash
# 使用引号包裹
JWT_SECRET="key-with-special-chars!@#$%"

# 或使用转义
MONGODB_URI=mongodb://user:pass\@word@localhost:27017/db
```

## 相关文档

- [生产部署](./PRODUCTION.md)
- [Docker 部署](./DOCKER.md)
- [数据库配置](./DATABASE.md)
- [系统架构](./ARCHITECTURE.md)
