# SSR 错误测试说明

## 测试步骤

### 1. 启动服务
```bash
cd examples/nuxt3
npm run dev
```

### 2. 访问测试页面
打开浏览器访问：http://localhost:3033

### 3. 测试 SSR 错误

#### 方法 1：点击"触发服务端错误"按钮
- 点击首页的"🔥 触发服务端错误"按钮
- 会跳转到 `/test-ssr-error` 页面
- 页面会在服务端渲染时抛出错误
- 你会看到自定义的错误页面

#### 方法 2：直接访问 SSR 错误页面
- 直接在浏览器访问：http://localhost:3033/test-ssr-error
- 页面会在服务端渲染时抛出错误

#### 方法 3：测试 useAsyncData 错误
- 点击首页的"⚡ useAsyncData 错误"按钮
- 会触发数据获取错误

#### 方法 4：测试服务端 API 错误
- 点击首页的"🌐 服务端 API 调用错误"按钮
- 会调用一个会抛出错误的服务端 API

## 预期结果

### 服务端控制台
你应该看到类似的日志：
```
[ErrorCatcher Server] 捕获到 app:error: Cannot read properties of null (reading "property") - 这是一个测试 SSR 错误
[ErrorCatcher] Sending to server: {
  url: 'http://localhost:3001/api/errors/report',
  errorCount: 1,
  payload: {...}
}
[ErrorCatcher] ✅ Batch sent: 1 errors
```

### 浏览器
- 看到自定义的错误页面
- 错误页面显示错误信息和状态码
- 有"返回首页"和"返回上一页"按钮
- 可以点击"显示技术详情"查看完整错误信息

### 后端管理界面
1. 访问：http://localhost:5173
2. 登录后进入"错误"页面
3. 应该能看到新上报的 SSR 错误
4. 错误类型应该是 `ssr_error`
5. 错误消息应该包含完整的错误信息

## 错误类型说明

### ssr_error
- 在服务端渲染时发生的错误
- 通过 `app:error` hook 捕获
- 包含 statusCode、statusMessage 等信息

### ssr_vue_error
- Vue 组件在服务端渲染时的错误
- 通过 `vue:error` hook 捕获
- 包含组件名称和生命周期信息

### error_page
- 在错误页面（error.vue）中捕获的错误
- 在客户端通过 ErrorCatcher 手动上报
- 包含完整的错误上下文

## 调试技巧

### 1. 启用调试模式
在 `nuxt.config.ts` 中设置：
```typescript
errorCatcher: {
  debug: true,  // 启用调试日志
  // ...
}
```

### 2. 查看服务端日志
服务端错误会在终端输出详细日志，包括：
- 错误捕获时机
- 错误内容
- 上报状态

### 3. 查看浏览器控制台
客户端错误会在浏览器控制台输出，包括：
- 错误页面的错误信息
- ErrorCatcher 的上报状态

### 4. 检查网络请求
在浏览器开发者工具的 Network 标签中：
- 查找到 `/api/errors/report` 的 POST 请求
- 检查请求 payload 和响应

## 常见问题

### Q: 为什么之前会收到多次通知？
A: 因为错误被多次捕获：
1. 服务端的 `app:error` hook 捕获一次
2. 服务端的 `vue:error` hook 可能再捕获一次
3. 客户端的错误页面手动上报一次
4. 客户端的 ErrorCatcher 自动捕获可能再捕获

现在已经通过以下方式修复：
- 添加错误指纹去重机制
- 移除客户端错误页面的手动上报
- 5秒内相同的错误只上报一次

### Q: 为什么看不到错误上报？
A: 检查以下几点：
1. 确保后端 API 服务正在运行（http://localhost:3001）
2. 检查 `nuxt.config.ts` 中的 `reportUrl` 配置是否正确
3. 查看服务端终端日志，确认是否有错误信息
4. 确保 `debug: true` 已启用，查看详细日志

### Q: 错误页面没有显示？
A: 确保 `error.vue` 文件存在于项目根目录

### Q: 服务端错误没有被捕获？
A: 检查插件是否正确加载：
1. 查看服务端日志是否有 `[ErrorCatcher Server] ✅ Initialized`
2. 确认 `plugins/error-catcher.js` 文件存在
3. 检查 `nuxt.config.ts` 中是否正确配置了插件

### Q: 客户端和服务端错误有什么区别？
A: 
- **服务端错误**：在 Node.js 环境中发生，通过 Nuxt hooks 捕获，立即上报
- **客户端错误**：在浏览器中发生，通过 window 事件监听器捕获，批量上报

## 技术实现

### 服务端错误捕获流程
1. 页面在服务端渲染时抛出错误
2. Nuxt 的 `app:error` hook 被触发
3. ErrorCatcher 插件捕获错误
4. **生成错误指纹进行去重检查**（防止重复上报）
5. 调用 `tracker.captureError()` 添加到队列
6. 立即调用 `tracker.sendBatch()` 发送到后端
7. 后端接收并存储错误

### 错误去重机制
为了防止同一个错误被多次上报，插件实现了以下去重机制：

1. **错误指纹生成**：基于错误消息、状态码和堆栈跟踪的前100个字符生成唯一指纹
2. **内存缓存**：使用 Set 记录已上报的错误指纹
3. **自动清理**：5秒后自动清除记录，避免内存泄漏
4. **跳过重复**：如果检测到相同指纹的错误，直接跳过上报

这样可以确保即使错误被多个 hook 捕获，也只会上报一次。

### 客户端错误捕获流程
1. 错误页面在客户端渲染
2. `onMounted` 钩子执行，记录错误信息
3. **不再手动上报**（因为服务端已经上报）
4. 避免重复上报

### 为什么不在客户端重复上报？
- SSR 错误在服务端已经被捕获和上报
- 客户端的错误页面只是展示错误信息
- 重复上报会导致同一个错误产生多条记录
- 通过服务端去重机制确保只上报一次

## 相关文件

- `pages/test-ssr-error.vue` - SSR 错误测试页面
- `server/api/test-server-error.ts` - 服务端 API 错误端点
- `error.vue` - 自定义错误页面
- `plugins/error-catcher.js` - ErrorCatcher 插件
- `nuxt.config.ts` - Nuxt 配置文件
