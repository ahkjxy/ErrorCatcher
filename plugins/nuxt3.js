/**
 * ErrorCatcher Nuxt 3 通用插件
 * 自动支持客户端和服务端环境
 * 
 * 使用方法：
 * 1. 复制此文件到项目的 plugins/ 目录
 * 2. 在 nuxt.config.ts 中配置 runtimeConfig
 * 3. 客户端需要将 ErrorCatcher.js 放到 public/ 目录
 */

// 动态导入 ErrorCatcher（服务端）
let ErrorCatcher = null

if (process.server) {
  try {
    // 尝试从 node_modules 导入
    ErrorCatcher = await import('error-catcher').then(m => m.default || m)
  } catch (e) {
    // 如果没有安装包，尝试从相对路径导入
    try {
      const fs = await import('fs')
      const path = await import('path')
      const { fileURLToPath } = await import('url')
      
      const __dirname = path.dirname(fileURLToPath(import.meta.url))
      const errorCatcherPath = path.resolve(__dirname, '../src/core/ErrorCatcher.js')
      
      if (fs.existsSync(errorCatcherPath)) {
        const errorCatcherCode = fs.readFileSync(errorCatcherPath, 'utf-8')
        const module = { exports: {} }
        const func = new Function('module', 'exports', errorCatcherCode)
        func(module, module.exports)
        ErrorCatcher = module.exports
      }
    } catch (err) {
      console.error('[ErrorCatcher] Failed to load on server:', err.message)
    }
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = nuxtApp.$config.public.errorCatcher
  
  if (!config?.reportUrl || !config?.projectId) {
    console.error('[ErrorCatcher] Missing reportUrl or projectId in runtimeConfig')
    return
  }
  
  // ========== 客户端初始化 ==========
  if (process.client) {
    const initClient = () => {
      if (!window.ErrorCatcher) {
        console.error('[ErrorCatcher] ErrorCatcher not found. Make sure ErrorCatcher.js is in public/ directory')
        return
      }
      
      const tracker = new window.ErrorCatcher({
        reportUrl: config.reportUrl,
        projectId: config.projectId,
        apiKey: config.apiKey,
        environment: config.environment || 'production',
        debug: config.debug || false,
        // 自动集成 Vue 和 Router
        vue: nuxtApp.vueApp,
        router: nuxtApp.$router
      })
      
      tracker.init()
      nuxtApp.provide('errorTracker', tracker)
      
      if (config.debug) {
        console.log('[ErrorCatcher Client] ✅ Initialized')
      }
    }
    
    // 等待 ErrorCatcher 加载
    if (typeof window !== 'undefined') {
      if (window.ErrorCatcher) {
        initClient()
      } else {
        window.addEventListener('load', initClient)
      }
    }
  }
  
  // ========== 服务端初始化 ==========
  if (process.server && ErrorCatcher) {
    const tracker = new ErrorCatcher({
      reportUrl: config.reportUrl,
      projectId: config.projectId,
      apiKey: config.apiKey,
      environment: config.environment || 'production',
      debug: config.debug || false,
      fetch: $fetch  // 使用 Nuxt 的 $fetch
    })
    
    tracker.init()
    
    // 自动捕获 SSR 错误
    nuxtApp.hook('app:error', (error) => {
      tracker.captureError({
        type: 'ssr_error',
        message: error.message || 'SSR Error',
        stack: error.stack,
        pageUrl: 'SSR',
        statusCode: error.statusCode,
        statusMessage: error.statusMessage,
        url: error.url,
        timestamp: new Date().toISOString()
      })
    })
    
    // 自动捕获 Vue SSR 错误
    nuxtApp.hook('vue:error', (error, instance, info) => {
      tracker.captureError({
        type: 'ssr_vue_error',
        message: error.message || 'Vue SSR Error',
        stack: error.stack,
        componentName: instance?.$options?.name || 'Unknown',
        lifecycle: info,
        pageUrl: 'SSR',
        timestamp: new Date().toISOString()
      })
    })
    
    nuxtApp.provide('errorTracker', tracker)
    
    if (config.debug) {
      console.log('[ErrorCatcher Server] ✅ Initialized')
    }
  }
})
