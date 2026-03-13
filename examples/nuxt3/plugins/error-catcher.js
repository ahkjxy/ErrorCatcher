/**
 * ErrorCatcher Nuxt 3 插件
 * 自动支持客户端和服务端
 */

// 动态导入 ErrorCatcher
let ErrorCatcher = null

// 服务端：直接导入核心库
if (process.server) {
  // 使用动态 import 避免客户端打包
  const fs = await import('fs')
  const path = await import('path')
  const { fileURLToPath } = await import('url')
  
  // 读取 ErrorCatcher 源码
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const errorCatcherPath = path.resolve(__dirname, '../../../src/core/ErrorCatcher.js')
  const errorCatcherCode = fs.readFileSync(errorCatcherPath, 'utf-8')
  
  // 在服务端执行
  const module = { exports: {} }
  const func = new Function('module', 'exports', errorCatcherCode)
  func(module, module.exports)
  ErrorCatcher = module.exports
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = nuxtApp.$config.public.errorCatcher
  
  if (!config.reportUrl || !config.projectId) {
    console.error('[ErrorCatcher] Missing reportUrl or projectId')
    return
  }
  
  // 客户端初始化
  if (process.client) {
    const initClient = () => {
      if (!window.ErrorCatcher) {
        console.error('[ErrorCatcher] ErrorCatcher not loaded from public/ErrorCatcher.js')
        return
      }
      
      const tracker = new window.ErrorCatcher({
        reportUrl: config.reportUrl,
        projectId: config.projectId,
        apiKey: config.apiKey,
        environment: config.environment,
        debug: config.debug,
        vue: nuxtApp.vueApp,
        router: nuxtApp.$router
      })
      
      tracker.init()
      nuxtApp.provide('errorTracker', tracker)
      
      if (config.debug) {
        console.log('[ErrorCatcher Client] ✅ Initialized')
      }
    }
    
    if (typeof window !== 'undefined' && window.ErrorCatcher) {
      initClient()
    } else if (typeof window !== 'undefined') {
      window.addEventListener('load', initClient)
    }
  }
  
  // 服务端初始化
  if (process.server && ErrorCatcher) {
    const tracker = new ErrorCatcher({
      reportUrl: config.reportUrl,
      projectId: config.projectId,
      apiKey: config.apiKey,
      environment: config.environment,
      debug: config.debug,
      fetch: $fetch  // 使用 Nuxt 的 $fetch
    })
    
    tracker.init()
    
    // 用于去重的错误记录
    const reportedErrors = new Set()
    
    // 生成错误指纹
    const getErrorFingerprint = (error) => {
      return `${error.message}-${error.statusCode}-${error.stack?.substring(0, 100)}`
    }

    // 自动捕获错误
    nuxtApp.hook('app:error', async (error) => {
      const fingerprint = getErrorFingerprint(error)
      
      // 检查是否已经上报过
      if (reportedErrors.has(fingerprint)) {
        if (config.debug) {
          console.log('[ErrorCatcher Server] 跳过重复错误:', error.message)
        }
        return
      }
      
      // 标记为已上报
      reportedErrors.add(fingerprint)
      
      // 5秒后清除记录，避免内存泄漏
      setTimeout(() => {
        reportedErrors.delete(fingerprint)
      }, 5000)
      
      if (config.debug) {
        console.log('[ErrorCatcher Server] 捕获到 app:error:', error.message)
      }
      
      // 获取请求 URL
      let pageUrl = 'SSR'
      try {
        // 尝试从 Nuxt 上下文获取请求信息
        const event = nuxtApp.ssrContext?.event
        if (event) {
          const protocol = event.node.req.headers['x-forwarded-proto'] || 'http'
          const host = event.node.req.headers.host || 'localhost'
          const path = event.node.req.url || '/'
          pageUrl = `${protocol}://${host}${path}`
        } else if (error.url) {
          pageUrl = error.url
        }
      } catch (e) {
        // 如果获取失败，使用默认值
        if (config.debug) {
          console.log('[ErrorCatcher Server] 无法获取请求 URL:', e.message)
        }
      }
      
      tracker.captureError({
        type: 'ssr_error',
        message: error.message || 'SSR Error',
        stack: error.stack,
        pageUrl: pageUrl,
        statusCode: error.statusCode,
        statusMessage: error.statusMessage,
        timestamp: new Date().toISOString()
      })
      
      // 立即发送（服务端不会自动批量发送）
      await tracker.sendBatch()
    })
    
    nuxtApp.hook('vue:error', async (error, instance, info) => {
      const fingerprint = getErrorFingerprint(error)
      
      // 检查是否已经上报过
      if (reportedErrors.has(fingerprint)) {
        if (config.debug) {
          console.log('[ErrorCatcher Server] 跳过重复 Vue 错误:', error.message)
        }
        return
      }
      
      reportedErrors.add(fingerprint)
      setTimeout(() => {
        reportedErrors.delete(fingerprint)
      }, 5000)
      
      if (config.debug) {
        console.log('[ErrorCatcher Server] 捕获到 vue:error:', error.message)
      }
      
      // 获取请求 URL
      let pageUrl = 'SSR'
      try {
        const event = nuxtApp.ssrContext?.event
        if (event) {
          const protocol = event.node.req.headers['x-forwarded-proto'] || 'http'
          const host = event.node.req.headers.host || 'localhost'
          const path = event.node.req.url || '/'
          pageUrl = `${protocol}://${host}${path}`
        }
      } catch (e) {
        if (config.debug) {
          console.log('[ErrorCatcher Server] 无法获取请求 URL:', e.message)
        }
      }
      
      tracker.captureError({
        type: 'ssr_vue_error',
        message: error.message || 'Vue SSR Error',
        stack: error.stack,
        componentName: instance?.$options?.name || 'Unknown',
        lifecycle: info,
        pageUrl: pageUrl,
        timestamp: new Date().toISOString()
      })
      
      // 立即发送
      await tracker.sendBatch()
    })
    
    nuxtApp.provide('errorTracker', tracker)
    
    if (config.debug) {
      console.log('[ErrorCatcher Server] ✅ Initialized')
    }
  }
})
