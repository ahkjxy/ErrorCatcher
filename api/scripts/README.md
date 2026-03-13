# 数据脚本使用说明

## 📝 可用脚本

### 1. 生成演示数据

生成 200 条演示错误数据，用于测试和演示管理后台功能。

```bash
# 在 api 目录下运行
npm run seed

# 或指定环境
npm run seed:dev   # 开发环境
npm run seed:test  # 测试环境
```

**生成的数据包括：**
- 5 个不同的应用
- 5 种错误类型（js, promise, fetch, xhr, resource）
- 随机的错误消息和堆栈信息
- 随机的用户 ID 和浏览器信息
- 最近 30 天的时间分布
- 约 30% 的错误标记为已解决

### 2. 清空数据

清空数据库中的所有错误数据。

```bash
# 在 api 目录下运行
npm run clear

# 或指定环境
npm run clear:dev  # 开发环境
```

**注意：** 清空操作会有 3 秒倒计时，可以按 Ctrl+C 取消。

---

## 🚀 快速开始

### 首次使用

```bash
# 1. 确保 MongoDB 正在运行
docker ps | grep mongodb

# 2. 进入 api 目录
cd api

# 3. 生成演示数据
npm run seed

# 4. 启动 API 服务
npm run dev

# 5. 启动管理后台（新终端）
cd ../admin
npm run dev

# 6. 访问管理后台
# 打开浏览器访问 http://localhost:3000
```

### 重新生成数据

```bash
# 清空现有数据
npm run clear

# 生成新数据
npm run seed
```

---

## 📊 演示数据详情

### 应用列表

| 应用 ID | 应用名称 | 环境 |
|---------|----------|------|
| vue3-app | Vue3 商城 | production |
| react-app | React 后台 | production |
| nuxt3-app | Nuxt3 官网 | production |
| nextjs-app | Next.js 博客 | staging |
| jquery-app | jQuery 管理系统 | production |

### 错误类型

- **js**: JavaScript 运行时错误
- **promise**: Promise rejection 错误
- **fetch**: Fetch API 请求错误
- **xhr**: XMLHttpRequest 请求错误
- **resource**: 资源加载错误

### 错误消息示例

- Cannot read property 'map' of undefined
- Uncaught TypeError: Cannot read properties of null
- ReferenceError: $ is not defined
- Network request failed
- Failed to fetch
- Timeout of 5000ms exceeded
- Unexpected token < in JSON at position 0
- Maximum call stack size exceeded

### 上下文信息

每条错误都包含以下上下文信息：
- 应用版本
- 页面路径
- 浏览器类型
- 操作系统
- 屏幕分辨率
- 语言设置
- 网络类型

---

## 🔧 自定义数据

如果需要自定义演示数据，可以编辑 `seed-data.js` 文件：

### 修改数据量

```javascript
const totalCount = 200; // 修改这个数字
```

### 修改时间范围

```javascript
// 生成最近 N 天的数据
function randomDate(daysAgo = 30) {
  // 修改 daysAgo 参数
}
```

### 添加自定义应用

```javascript
const APPS = [
  { id: 'my-app', name: '我的应用', environment: 'production' },
  // 添加更多应用...
];
```

### 添加自定义错误消息

```javascript
const ERROR_MESSAGES = [
  '自定义错误消息 1',
  '自定义错误消息 2',
  // 添加更多消息...
];
```

---

## 🐛 故障排除

### 连接数据库失败

```bash
# 检查 MongoDB 是否运行
docker ps | grep mongodb

# 启动 MongoDB
docker start mongodb

# 或创建新容器
docker run -d --name mongodb -p 27017:27017 mongo:7.0
```

### 环境变量未加载

```bash
# 确保 .env 文件存在
ls -la api/.env*

# 如果不存在，复制示例文件
cp api/.env.example api/.env.dev
```

### 脚本执行权限

```bash
# 给脚本添加执行权限
chmod +x api/scripts/seed-data.js
chmod +x api/scripts/clear-data.js
```

---

## 📝 注意事项

1. **数据持久化**: 生成的数据会永久保存在数据库中，除非手动清空
2. **重复运行**: 多次运行 `npm run seed` 会累加数据，不会覆盖
3. **环境隔离**: 不同环境使用不同的数据库，数据互不影响
4. **生产环境**: 不建议在生产环境运行演示数据脚本

---

## 💡 使用建议

1. **开发阶段**: 使用演示数据快速测试功能
2. **演示展示**: 生成数据后展示给客户或团队
3. **压力测试**: 生成大量数据测试性能
4. **UI 调试**: 使用不同类型的数据测试界面显示

---

## 🔗 相关文档

- [快速启动](../../QUICK_START.md)
- [环境配置](../ENV_GUIDE.md)
- [MongoDB 安装](../../MONGODB_INSTALL.md)
- [API 文档](../README.md)
