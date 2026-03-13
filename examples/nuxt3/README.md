# ErrorCatcher Nuxt 3 示例

这是一个完整的 Nuxt 3 示例项目，展示了 ErrorCatcher 的所有功能。

## 功能展示

### 1. 服务端错误测试 (SSR)
- ✅ SSR 页面渲染错误
- ✅ useAsyncData 错误
- ✅ 服务端 API 调用错误

### 2. 客户端自动捕获错误
- ✅ JS 运行时错误（全局错误）
- ✅ Promise Rejection（未处理的 Promise 错误）
- ✅ Fetch/XHR 错误（自动拦截 HTTP 请求）
- ✅ Vue 组件错误（通过 Vue errorHandler）

### 3. 手动上报错误
- ✅ 自定义业务错误
- ✅ API 错误（带完整上下文）
- ✅ 服务器错误（500 等）

### 4. API 方法
- ✅ `setUser()` - 设置用户信息
- ✅ `setTag()` / `setTags()` - 设置标签
- ✅ `setContext()` - 设置上下文
- ✅ `setExtra()` - 设置额外数据
- ✅ `addBreadcrumb()` - 添加面包屑
- ✅ `report()` - 手动上报错误
- ✅ `disableNavigationTracking()` - 禁用路由跟踪
- ✅ `report()` - 手动上报错误

## 安装和运行

### 1. 安装依赖

```bash
cd examples/nuxt3
npm install
# 或
yarn install
```

### 2. 配置

编辑 `nuxt.config.ts`，配置你的 ErrorCatcher：

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      errorCatcher: {
        reportUrl: 'http://localhost:3001/api/errors/report',
        projectId: 'your-project-id',
        apiKey: 'your-api-key',
        environment: 'development',
        debug: true
      }
    }
  }
})
```

### 3. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

访问 http://localhost:3033

## 项目结构

```
examples/nuxt3/
├── plugins/
│   └── error-catcher.js      # ErrorCatcher 插件
├── public/
│   └── ErrorCatcher.js       # ErrorCatcher 核心库（从 src/core/ 复制）
├── server/
│   └── api/
│       └── test-server-error.ts  # 服务端 API 错误测试
├── pages/
│   ├── index.vue             # 首页（功能演示）
│   └── test-ssr-error.vue    # SSR 错误测试页面
├── error.vue                  # 自定义错误页面
├── app.vue                    # 应用根组件
├── nuxt.config.ts            # Nuxt 配置
├── package.json              # 依赖配置
└── README.md                 # 本文档
```

## 插件实现

### nuxt.config.ts

```typescript
export default defineNuxtConfig({
  plugins: ['~/plugins/error-catcher'],
  
  app: {
    head: {
      script: [
        {
          src: '/ErrorCatcher.js',  // 从 public 目录加载
          type: 'text/javascript'
        }
      ]
    }
  },
  
  runtimeConfig: {
    public: {
      errorCatcher: {
        reportUrl: 'http://localhost:3001/api/errors/report',
        projectId: 'your-project-id',
        apiKey: 'your-api-key',
        environment: 'development',
        debug: true
      }
    }
  }
})
```

### plugins/error-catcher.js

```javascript
export default defineNuxtPlugin((nuxtApp) => {
  // 只在客户端运行
  if (process.server) return
  
  const config = nuxtApp.$config.public.errorCatcher
  
  // ErrorCatcher 从 public/ErrorCatcher.js 加载到 window.ErrorCatcher
  const ErrorCatcher = window.ErrorCatcher
  
  const tracker = new ErrorCatcher({
    reportUrl: config.reportUrl,
    projectId: config.projectId,
    apiKey: config.apiKey,
    environment: config.environment || 'development',
    debug: config.debug !== false,
    // 传入 Vue 实例和路由，自动集成
    vue: nuxtApp.vueApp,
    router: nuxtApp.$router
  })
  
  tracker.init()
  
  return {
    provide: {
      errorTracker: tracker
    }
  }
})
```

## 使用方法

### 在组件中使用

```vue
<script setup>
const { $errorTracker } = useNuxtApp()

// 手动上报错误
const handleError = () => {
  try {
    // 你的代码
  } catch (err) {
    $errorTracker.report(err, {
      type: 'custom_error',
      extra: { customData: 'value' }
    })
  }
}

// 设置用户信息
onMounted(() => {
  $errorTracker.setUser({ 
    id: 'user_123',
    username: 'john',
    email: 'john@example.com'
  })
})

// 设置全局上下文
$errorTracker.setContext({
  version: '1.0.0',
  feature: 'checkout'
})
</script>
```

### 在 API 调用中使用

```vue
<script setup>
const { $errorTracker } = useNuxtApp()

const fetchData = async () => {
  try {
    // 使用 $fetch（Nuxt 3 内置）
    const data = await $fetch('/api/endpoint')
    return data
  } catch (err) {
    // 手动上报（如果需要额外上下文）
    $errorTracker.report(err, {
      type: 'api_error',
      url: err.request?.url,
      status: err.response?.status
    })
    throw err
  }
}
</script>
```

## 自动捕获的数据

ErrorCatcher 会自动捕获以下信息：

### 自动拦截的 API 错误（fetch/XHR）
- url - 请求 URL
- method - 请求方法
- status - HTTP 状态码
- statusText - 状态文本
- requestHeaders - 请求头
- requestBody - 请求体
- response - 响应内容
- responseHeaders - 响应头
- duration - 请求耗时
- pageUrl - 当前页面 URL

### 手动上报的错误
需要从错误对象中提取信息并传入 context：
- url - 从 `err.config.url` 或 `err.request.url` 获取
- method - 从 `err.config.method` 获取
- status - 从 `err.response.status` 获取
- 其他自定义字段

### 浏览器信息
- userAgent - 浏览器标识
- language - 语言
- timezone - 时区
- screenResolution - 屏幕分辨率
- viewportSize - 视口大小

### 其他信息
- timestamp - 时间戳
- environment - 环境（development/production）
- userId - 用户 ID（如已设置）
- context - 全局上下文（如已设置）

## 注意事项

1. **ErrorCatcher 加载方式**
   - ErrorCatcher.js 放在 `public/` 目录
   - 通过 `<script>` 标签在 HTML 中加载
   - 插件从 `window.ErrorCatcher` 获取类

2. **自动拦截 vs 手动上报**
   - 自动拦截的 API 错误会包含完整的 URL、method、status 等信息
   - 手动上报的错误需要从错误对象中提取这些信息

2. **asyncData/fetch 钩子**
   - 在 asyncData 或 fetch 钩子中，需要手动上报错误
   - 从 axios 错误对象中提取 URL 信息

3. **调试模式**
   - 开发环境建议开启 `debug: true`
   - 生产环境建议关闭以减少日志输出

4. **环境变量**
   - 可以使用 `.env` 文件管理不同环境的配置
   - 使用 `runtimeConfig` 在客户端和服务端共享配置

## 测试功能

访问示例页面后，你可以：

1. **服务端错误测试**
   - 点击"触发服务端错误"跳转到 SSR 错误页面
   - 点击"useAsyncData 错误"测试数据获取错误
   - 点击"服务端 API 调用错误"测试服务端 API 错误

2. **客户端错误测试**
   - 点击各种按钮触发不同类型的错误
   - 查看操作日志，了解错误捕获情况

3. **API 方法测试**
   - 测试所有 API 方法的功能
   - 查看当前用户、标签、面包屑等状态

4. **后端查看**
   - 在后端管理界面查看上报的错误
   - 检查错误详情、堆栈跟踪等信息

## 相关文档

- [ErrorCatcher 核心文档](../../README.md)
- [通用使用指南](../../UNIVERSAL_USAGE.md)
- [示例项目指南](../../EXAMPLES_GUIDE.md)
- [Nuxt 2 示例](../nuxt2/README.md)

## 技术栈

- Nuxt 3.8+
- Vue 3 Composition API
- ErrorCatcher 核心库

## 许可证

MIT
