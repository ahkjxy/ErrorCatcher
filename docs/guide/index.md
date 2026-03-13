# 介绍

ErrorCatcher 是一个通用的前端错误监控 SDK，支持所有主流框架，零依赖，自动集成。

## 特性

### 🚀 全框架支持

支持 Vue 2/3、React、Nuxt 2/3、Next.js、jQuery、PHP 等所有前端项目，自动检测并集成框架。

### 🔍 全面监控

自动捕获：
- JavaScript 运行时错误
- Promise 未处理的拒绝
- Fetch/XHR 请求错误
- Axios 请求错误（需传入实例）
- jQuery Ajax 错误（自动检测）
- Vue 组件错误（需传入实例）

### 🌐 SSR 友好

完美支持服务端渲染（SSR），在 Node.js 环境中安全运行，自动检测环境。

### 📊 可视化后台

提供完整的错误统计和分析后台：
- 实时错误监控
- 错误趋势分析
- 错误类型分布
- 问题分组管理
- 钉钉告警通知

### 📦 零依赖

核心库零依赖，体积小巧，不会影响应用性能。

### 🎯 灵活配置

支持：
- 错误采样（sampleRate）
- 批量上报（maxBatchSize, delay）
- 自定义过滤（ignoreUrls）
- 发送前处理（beforeSend）
- 错误回调（onError）
- 用户追踪（setUser）
- 面包屑（addBreadcrumb）

## 工作原理

ErrorCatcher 通过以下方式捕获错误：

1. 监听全局 `error` 事件
2. 监听 `unhandledrejection` 事件
3. 拦截 `fetch` API
4. 拦截 `XMLHttpRequest`
5. 集成框架错误处理（Vue、React 等）
6. 集成 axios 拦截器（可选）
7. 集成 jQuery ajaxError（自动检测）

捕获的错误会被批量上报到服务器，支持失败重试。

## 架构

```
┌─────────────────────────────────────────┐
│           Web Application               │
│  (Vue/React/Nuxt/Next.js/jQuery/PHP)   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         ErrorCatcher.js                 │
│  - 自动检测框架                          │
│  - 拦截 fetch/XHR                       │
│  - 批量上报                              │
│  - 失败重试                              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Backend API (Node.js)           │
│  - 错误存储 (MongoDB)                    │
│  - 问题分组                              │
│  - 统计分析                              │
│  - 钉钉通知                              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Admin Dashboard (Vue 3)            │
│  - 错误列表                              │
│  - 问题管理                              │
│  - 统计图表                              │
│  - 告警配置                              │
└─────────────────────────────────────────┘
```

## 核心概念

### 错误 (Error)

每次错误发生时记录的原始数据，包含完整的错误信息、堆栈、请求详情等。

### 问题 (Issue)

相似的错误会被自动分组为一个问题，便于统一管理和修复。分组规则基于：
- 错误类型
- 错误消息
- 堆栈信息
- 请求 URL

### 告警 (Alert)

当错误达到设定的阈值时，自动发送钉钉通知。支持：
- 错误频率告警
- 新错误告警
- 自定义规则

## 快速开始

### 1. 选择框架

- [Vue 3](/frameworks/vue3)
- [Vue 2](/frameworks/vue2)
- [React](/frameworks/react)
- [Nuxt 3](/frameworks/nuxt3)
- [Nuxt 2](/frameworks/nuxt2)
- [Next.js](/frameworks/nextjs)
- [jQuery](/frameworks/jquery)
- [PHP](/frameworks/php)

### 2. 基础使用

```javascript
import ErrorCatcher from 'error-catcher';

const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/api/errors/report',
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  environment: 'production'
});
```

### 3. 查看文档

- [快速开始指南](/guide/getting-started)
- [配置详解](/guide/configuration)
- [API 方法](/api/methods)
- [最佳实践](/guide/best-practices)
