# ErrorCatcher Examples

这个目录包含了 ErrorCatcher 在不同框架和环境中的使用示例。

## 📁 目录结构

```
examples/
├── ErrorCatcher.js          # ErrorCatcher 核心库（从 src/core 复制）
├── html/                    # 原生 HTML 示例
├── jquery/                  # jQuery 示例
├── vue2/                    # Vue 2 示例
├── nuxt2/                   # Nuxt 2 示例
├── nuxt3/                   # Nuxt 3 示例
└── nextjs/                  # Next.js 示例
```

## 🚀 快速开始

### 1. 原生 HTML 示例

最简单的示例，展示如何在纯 HTML 页面中使用 ErrorCatcher。

```bash
# 使用任何静态服务器打开
cd examples/html
python -m http.server 8080
# 访问 http://localhost:8080
```

### 2. jQuery 示例

```bash
cd examples/jquery
python -m http.server 8080
# 访问 http://localhost:8080
```

### 3. Nuxt 3 示例

```bash
cd examples/nuxt3
npm install
npm run dev
# 访问 http://localhost:3000
```

## ⚙️ 配置说明

所有示例都需要配置：

```javascript
const tracker = new ErrorCatcher({
  reportUrl: 'http://localhost:3001/api/errors/report',
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  environment: 'development',
  debug: true
});
```

## 🔧 故障排除

### ErrorCatcher.js 404 错误

确保文件存在：

```bash
cp src/core/ErrorCatcher.js examples/ErrorCatcher.js
```

### 需要 HTTP 服务器

不能直接用 `file://` 打开，需要 HTTP 服务器：

```bash
# Python
python -m http.server 8080

# Node.js
npx http-server -p 8080
```

## 📚 更多资源

- [完整文档](../docs/)
- [cURL 功能](../docs/features/curl-command.md)
