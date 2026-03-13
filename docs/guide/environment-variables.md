# 环境变量配置

ErrorCatcher 支持通过环境变量进行配置，便于在不同环境中使用不同的设置。

## 标准环境变量

### 必需变量

```bash
# 错误上报 API 地址
ERROR_REPORT_URL=http://your-api.com/api/errors/report

# 项目 ID
ERROR_PROJECT_ID=your-project-id

# API 密钥
ERROR_API_KEY=your-api-key
```

### 可选变量

```bash
# 环境标识 (development, staging, production)
ERROR_ENVIRONMENT=production

# 应用版本
ERROR_RELEASE=1.0.0

# 调试模式
ERROR_DEBUG=false

# 采样率 (0-1)
ERROR_SAMPLE_RATE=1

# 批量大小
ERROR_MAX_BATCH_SIZE=10

# 批量延迟 (毫秒)
ERROR_DELAY=1000

# 最大重试次数
ERROR_MAX_RETRIES=3
```

## 框架特定的环境变量

### Vue 应用

```bash
# .env.development
VUE_APP_ERROR_REPORT_URL=http://localhost:3001/api/errors/report
VUE_APP_ERROR_PROJECT_ID=dev-project-id
VUE_APP_ERROR_API_KEY=dev-api-key
VUE_APP_ERROR_ENVIRONMENT=development
VUE_APP_ERROR_DEBUG=true

# .env.production
VUE_APP_ERROR_REPORT_URL=https://api.example.com/api/errors/report
VUE_APP_ERROR_PROJECT_ID=prod-project-id
VUE_APP_ERROR_API_KEY=prod-api-key
VUE_APP_ERROR_ENVIRONMENT=production
VUE_APP_ERROR_DEBUG=false
```

### React 应用

```bash
# .env.development
REACT_APP_ERROR_REPORT_URL=http://localhost:3001/api/errors/report
REACT_APP_ERROR_PROJECT_ID=dev-project-id
REACT_APP_ERROR_API_KEY=dev-api-key
REACT_APP_ERROR_ENVIRONMENT=development
REACT_APP_ERROR_DEBUG=true

# .env.production
REACT_APP_ERROR_REPORT_URL=https://api.example.com/api/errors/report
REACT_APP_ERROR_PROJECT_ID=prod-project-id
REACT_APP_ERROR_API_KEY=prod-api-key
REACT_APP_ERROR_ENVIRONMENT=production
REACT_APP_ERROR_DEBUG=false
```

### Next.js 应用

```bash
# .env.local
NEXT_PUBLIC_ERROR_REPORT_URL=http://localhost:3001/api/errors/report
NEXT_PUBLIC_ERROR_PROJECT_ID=dev-project-id
NEXT_PUBLIC_ERROR_API_KEY=dev-api-key
NEXT_PUBLIC_ERROR_ENVIRONMENT=development
NEXT_PUBLIC_ERROR_DEBUG=true

# .env.production
NEXT_PUBLIC_ERROR_REPORT_URL=https://api.example.com/api/errors/report
NEXT_PUBLIC_ERROR_PROJECT_ID=prod-project-id
NEXT_PUBLIC_ERROR_API_KEY=prod-api-key
NEXT_PUBLIC_ERROR_ENVIRONMENT=production
NEXT_PUBLIC_ERROR_DEBUG=false
```

### Nuxt 应用

```bash
# .env
ERROR_REPORT_URL=http://localhost:3001/api/errors/report
ERROR_PROJECT_ID=dev-project-id
ERROR_API_KEY=dev-api-key
ERROR_ENVIRONMENT=development
ERROR_DEBUG=true

# .env.production
ERROR_REPORT_URL=https://api.example.com/api/errors/report
ERROR_PROJECT_ID=prod-project-id
ERROR_API_KEY=prod-api-key
ERROR_ENVIRONMENT=production
ERROR_DEBUG=false
```

## 在代码中使用环境变量

### Vue 应用

```javascript
import ErrorCatcher from 'error-catcher';

const tracker = new ErrorCatcher({
  reportUrl: process.env.VUE_APP_ERROR_REPORT_URL,
  projectId: process.env.VUE_APP_ERROR_PROJECT_ID,
  apiKey: process.env.VUE_APP_ERROR_API_KEY,
  environment: process.env.VUE_APP_ERROR_ENVIRONMENT,
  debug: process.env.VUE_APP_ERROR_DEBUG === 'true'
});
```

### React 应用

```javascript
import ErrorCatcher from 'error-catcher';

const tracker = new ErrorCatcher({
  reportUrl: process.env.REACT_APP_ERROR_REPORT_URL,
  projectId: process.env.REACT_APP_ERROR_PROJECT_ID,
  apiKey: process.env.REACT_APP_ERROR_API_KEY,
  environment: process.env.REACT_APP_ERROR_ENVIRONMENT,
  debug: process.env.REACT_APP_ERROR_DEBUG === 'true'
});
```

### Next.js 应用

```javascript
import ErrorCatcher from 'error-catcher';

const tracker = new ErrorCatcher({
  reportUrl: process.env.NEXT_PUBLIC_ERROR_REPORT_URL,
  projectId: process.env.NEXT_PUBLIC_ERROR_PROJECT_ID,
  apiKey: process.env.NEXT_PUBLIC_ERROR_API_KEY,
  environment: process.env.NEXT_PUBLIC_ERROR_ENVIRONMENT,
  debug: process.env.NEXT_PUBLIC_ERROR_DEBUG === 'true'
});
```

### Nuxt 应用

```javascript
import ErrorCatcher from 'error-catcher';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  
  const tracker = new ErrorCatcher({
    reportUrl: config.public.errorReport.url,
    projectId: config.public.errorReport.projectId,
    apiKey: config.public.errorReport.apiKey,
    environment: config.public.errorReport.environment,
    debug: config.public.errorReport.debug
  });
  
  return {
    provide: {
      errorTracker: tracker
    }
  };
});
```

在 `nuxt.config.ts` 中配置：

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      errorReport: {
        url: process.env.ERROR_REPORT_URL,
        projectId: process.env.ERROR_PROJECT_ID,
        apiKey: process.env.ERROR_API_KEY,
        environment: process.env.ERROR_ENVIRONMENT,
        debug: process.env.ERROR_DEBUG === 'true'
      }
    }
  }
});
```

## .env.example 模板

创建 `.env.example` 文件作为参考：

```bash
# ErrorCatcher 配置
ERROR_REPORT_URL=http://your-api.com/api/errors/report
ERROR_PROJECT_ID=your-project-id
ERROR_API_KEY=your-api-key
ERROR_ENVIRONMENT=development
ERROR_RELEASE=1.0.0
ERROR_DEBUG=true
ERROR_SAMPLE_RATE=1
ERROR_MAX_BATCH_SIZE=10
ERROR_DELAY=1000
ERROR_MAX_RETRIES=3
```

## 环境特定配置

### 开发环境

```bash
ERROR_REPORT_URL=http://localhost:3001/api/errors/report
ERROR_ENVIRONMENT=development
ERROR_DEBUG=true
ERROR_SAMPLE_RATE=1  # 捕获所有错误
```

### 测试环境

```bash
ERROR_REPORT_URL=https://test-api.example.com/api/errors/report
ERROR_ENVIRONMENT=staging
ERROR_DEBUG=false
ERROR_SAMPLE_RATE=0.8  # 捕获 80% 的错误
```

### 生产环境

```bash
ERROR_REPORT_URL=https://api.example.com/api/errors/report
ERROR_ENVIRONMENT=production
ERROR_DEBUG=false
ERROR_SAMPLE_RATE=0.5  # 捕获 50% 的错误以减少服务器负载
```

## 最佳实践

1. **使用 .env 文件** - 不要在代码中硬编码敏感信息
2. **创建 .env.example** - 为团队成员提供配置模板
3. **忽略 .env 文件** - 在 .gitignore 中添加 `.env*`
4. **环境特定配置** - 为不同环境使用不同的 API Key
5. **安全存储** - 在生产环境中使用安全的密钥管理系统

## 下一步

- [配置选项](/guide/configuration)
- [快速开始](/guide/getting-started)
- [最佳实践](/guide/best-practices)
