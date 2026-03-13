# 框架集成

ErrorCatcher 支持所有主流 JavaScript 框架，提供开箱即用的集成方案。

## 支持的框架

### Vue 生态

- [Vue 2](/frameworks/vue2) - Vue 2.x 应用集成
- [Vue 3](/frameworks/vue3) - Vue 3.x 应用集成
- [Nuxt 2](/frameworks/nuxt2) - Nuxt 2.x SSR 应用集成
- [Nuxt 3](/frameworks/nuxt3) - Nuxt 3.x SSR 应用集成

### React 生态

- [React](/frameworks/react) - React 应用集成
- [Next.js](/frameworks/nextjs) - Next.js SSR 应用集成

### 其他框架

- [jQuery](/frameworks/jquery) - jQuery 应用集成
- [PHP](/frameworks/php) - PHP 后端集成

## 快速选择

根据你的技术栈选择对应的集成指南：

| 框架 | 版本 | 集成难度 | SSR 支持 |
|------|------|---------|---------|
| Vue 2 | 2.x | ⭐ 简单 | ✅ |
| Vue 3 | 3.x | ⭐ 简单 | ✅ |
| Nuxt 2 | 2.x | ⭐⭐ 中等 | ✅ |
| Nuxt 3 | 3.x | ⭐⭐ 中等 | ✅ |
| React | 16.8+ | ⭐ 简单 | ✅ |
| Next.js | 12+ | ⭐⭐ 中等 | ✅ |
| jQuery | 1.7+ | ⭐ 简单 | ❌ |
| PHP | 7.0+ | ⭐⭐ 中等 | ✅ |

## 通用集成步骤

所有框架的集成都遵循以下基本步骤：

### 1. 安装

```bash
npm install error-catcher
# 或
yarn add error-catcher
```

### 2. 引入

```javascript
import ErrorCatcher from 'error-catcher';
```

### 3. 初始化

```javascript
const errorCatcher = new ErrorCatcher({
  reportUrl: 'https://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  environment: 'production'
});
```

### 4. 框架集成

根据具体框架，传入框架实例：

```javascript
// Vue
new ErrorCatcher({
  vue: app,
  // ...
});

// React
new ErrorCatcher({
  react: true,
  // ...
});

// jQuery
new ErrorCatcher({
  jquery: true,
  // ...
});
```

## 自动检测

ErrorCatcher 支持自动检测框架：

```javascript
new ErrorCatcher({
  autoIntegrate: true, // 默认开启
  // ...
});
```

启用后，ErrorCatcher 会自动检测并集成以下框架：
- Vue (window.Vue)
- React (window.React)
- jQuery (window.jQuery 或 window.$)
- axios (window.axios)

## 功能对比

| 功能 | Vue | React | jQuery | PHP |
|------|-----|-------|--------|-----|
| 全局错误捕获 | ✅ | ✅ | ✅ | ✅ |
| 组件错误捕获 | ✅ | ✅ | ❌ | ❌ |
| HTTP 拦截 | ✅ | ✅ | ✅ | ✅ |
| Promise 捕获 | ✅ | ✅ | ✅ | ✅ |
| 路由监听 | ✅ | ✅ | ❌ | ❌ |
| SSR 支持 | ✅ | ✅ | ❌ | ✅ |
| 面包屑 | ✅ | ✅ | ✅ | ✅ |
| 用户上下文 | ✅ | ✅ | ✅ | ✅ |

## 下一步

选择你使用的框架，查看详细的集成指南：

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 2rem;">
  <a href="/frameworks/vue2" style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; text-decoration: none; color: inherit; transition: all 0.2s;">
    <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🟢</div>
    <div style="font-weight: 600;">Vue 2</div>
    <div style="font-size: 0.875rem; color: #6b7280;">Vue 2.x 集成</div>
  </a>
  
  <a href="/frameworks/vue3" style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; text-decoration: none; color: inherit; transition: all 0.2s;">
    <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🟢</div>
    <div style="font-weight: 600;">Vue 3</div>
    <div style="font-size: 0.875rem; color: #6b7280;">Vue 3.x 集成</div>
  </a>
  
  <a href="/frameworks/nuxt2" style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; text-decoration: none; color: inherit; transition: all 0.2s;">
    <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🟢</div>
    <div style="font-weight: 600;">Nuxt 2</div>
    <div style="font-size: 0.875rem; color: #6b7280;">Nuxt 2.x SSR</div>
  </a>
  
  <a href="/frameworks/nuxt3" style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; text-decoration: none; color: inherit; transition: all 0.2s;">
    <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🟢</div>
    <div style="font-weight: 600;">Nuxt 3</div>
    <div style="font-size: 0.875rem; color: #6b7280;">Nuxt 3.x SSR</div>
  </a>
  
  <a href="/frameworks/react" style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; text-decoration: none; color: inherit; transition: all 0.2s;">
    <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">⚛️</div>
    <div style="font-weight: 600;">React</div>
    <div style="font-size: 0.875rem; color: #6b7280;">React 集成</div>
  </a>
  
  <a href="/frameworks/nextjs" style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; text-decoration: none; color: inherit; transition: all 0.2s;">
    <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">▲</div>
    <div style="font-weight: 600;">Next.js</div>
    <div style="font-size: 0.875rem; color: #6b7280;">Next.js SSR</div>
  </a>
  
  <a href="/frameworks/jquery" style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; text-decoration: none; color: inherit; transition: all 0.2s;">
    <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">📘</div>
    <div style="font-weight: 600;">jQuery</div>
    <div style="font-size: 0.875rem; color: #6b7280;">jQuery 集成</div>
  </a>
  
  <a href="/frameworks/php" style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; text-decoration: none; color: inherit; transition: all 0.2s;">
    <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🐘</div>
    <div style="font-weight: 600;">PHP</div>
    <div style="font-size: 0.875rem; color: #6b7280;">PHP 后端集成</div>
  </a>
</div>

## 需要帮助？

如果你的框架不在列表中，或者遇到集成问题：

- 查看 [通用配置指南](/guide/configuration)
- 查看 [API 文档](/api/methods)
- 提交 [GitHub Issue](https://github.com/yourusername/error-catcher/issues)
