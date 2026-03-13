<template>
  <div class="container">
    <div class="hero">
      <h1 class="title">🚨 ErrorCatcher Nuxt 3 示例</h1>
      <p class="subtitle">完整功能演示 - 测试错误监控和所有 API 方法</p>
      <div class="test-links">
        <NuxtLink to="/test-ssr-error" class="test-link">
          🔥 测试 SSR 错误页面
        </NuxtLink>
      </div>
    </div>

    <!-- 服务端错误测试 -->
    <section class="test-section">
      <h2>1. 服务端错误测试 (SSR)</h2>
      <p class="desc">这些错误会在服务端触发，测试 SSR 环境下的错误捕获</p>
      <div class="button-grid">
        <button @click="triggerServerError" class="btn btn-danger">
          🔥 触发服务端错误
        </button>
        <button @click="triggerAsyncDataError" class="btn btn-warning">
          ⚡ useAsyncData 错误
        </button>
        <button @click="triggerServerAPIError" class="btn btn-info">
          🌐 服务端 API 调用错误
        </button>
      </div>
    </section>

    <!-- 客户端自动捕获错误测试 -->
    <section class="test-section">
      <h2>2. 客户端自动捕获错误测试</h2>
      <p class="desc">这些错误会被 ErrorCatcher 自动拦截和上报，无需手动调用</p>
      <div class="button-grid">
        <button @click="triggerJSError" class="btn btn-danger">
          JS 运行时错误
        </button>
        <button @click="triggerPromiseError" class="btn btn-warning">
          Promise Rejection
        </button>
        <button @click="triggerFetchError" class="btn btn-info">
          Fetch 错误 (自动捕获)
        </button>
      </div>
    </section>

    <!-- 手动上报错误测试 -->
    <section class="test-section">
      <h2>3. 手动上报错误测试</h2>
      <p class="desc">使用 report() 方法手动上报错误</p>
      <div class="button-grid">
        <button @click="triggerCustomError" class="btn btn-primary">
          自定义错误上报
        </button>
        <button @click="trigger500Error" class="btn btn-danger">
          500 服务器错误
        </button>
        <button @click="triggerRealAPIError" class="btn btn-info">
          真实 API 错误测试
        </button>
      </div>
    </section>

    <!-- API 方法演示 -->
    <section class="test-section">
      <h2>4. ErrorCatcher API 方法演示</h2>
      <p class="desc">测试所有公开的 API 方法</p>
      <div class="button-grid">
        <button @click="testSetUser" class="btn btn-success">
          setUser() - 设置用户信息
        </button>
        <button @click="testSetTag" class="btn btn-success">
          setTag() - 设置单个标签
        </button>
        <button @click="testSetTags" class="btn btn-success">
          setTags() - 批量设置标签
        </button>
        <button @click="testSetContext" class="btn btn-success">
          setContext() - 设置上下文
        </button>
        <button @click="testSetExtra" class="btn btn-success">
          setExtra() - 设置额外数据
        </button>
        <button @click="testAddBreadcrumb" class="btn btn-info">
          addBreadcrumb() - 添加面包屑
        </button>
        <button @click="testReport" class="btn btn-info">
          report() - 手动上报错误
        </button>
      </div>
      <div class="api-status">
        <p><strong>当前用户ID:</strong> <code>{{ currentUserId || '未设置' }}</code></p>
        <p><strong>标签:</strong> <code>{{ JSON.stringify(currentTags) }}</code></p>
        <p><strong>面包屑数量:</strong> <code>{{ breadcrumbCount }}</code></p>
      </div>
    </section>

    <!-- 配置信息 -->
    <section class="info-section">
      <h3>配置信息</h3>
      <div class="info-card">
        <p><strong>Project ID:</strong> <code>{{ projectId }}</code></p>
        <p><strong>API Key:</strong> <code>{{ apiKey }}</code></p>
        <p><strong>Environment:</strong> <code>{{ environment }}</code></p>
      </div>
    </section>

    <!-- 操作日志 -->
    <section v-if="errorLog.length > 0" class="error-log">
      <h3>操作日志</h3>
      <div v-for="(log, index) in errorLog" :key="index" class="log-item">
        <span class="log-time">{{ log.time }}</span>
        <span class="log-type" :class="log.type">{{ log.type }}</span>
        <span class="log-message">{{ log.message }}</span>
      </div>
    </section>
  </div>
</template>

<script setup>
const { $errorTracker } = useNuxtApp()
const config = useRuntimeConfig()

// 状态
const errorLog = ref([])
const currentUserId = ref(null)
const currentTags = ref({})
const breadcrumbCount = ref(0)

// 配置信息
const projectId = config.public.errorCatcher.projectId
const apiKey = config.public.errorCatcher.apiKey
const environment = config.public.errorCatcher.environment

// 页面加载完成
onMounted(() => {
  logError('info', '页面已加载，ErrorCatcher 已初始化')
  
  // 自动触发一个 500 错误测试
  setTimeout(() => {
    logError('info', '自动触发 500 错误测试...')
    $fetch('http://localhost:3001/api/test/trigger-500', {
      method: 'POST',
      body: { test: 'auto-trigger' }
    }).catch(err => {
      logError('danger', `500 错误已被自动捕获: ${err.message}`)
    })
  }, 1000)
})

// ========== 服务端错误测试 ==========

const triggerServerError = () => {
  logError('danger', '跳转到 SSR 错误页面...')
  navigateTo('/test-ssr-error')
}

const triggerAsyncDataError = async () => {
  logError('warning', '触发 useAsyncData 错误')
  try {
    const { data, error } = await useAsyncData('test-error', async () => {
      // 模拟服务端数据获取错误
      throw new Error('useAsyncData 中的服务端错误')
    })
    if (error.value) {
      logError('danger', `useAsyncData 错误: ${error.value.message}`)
    }
  } catch (err) {
    logError('danger', `捕获到错误: ${err.message}`)
  }
}

const triggerServerAPIError = async () => {
  logError('info', '触发服务端 API 调用错误')
  try {
    // 调用会抛出错误的服务端 API
    await $fetch('/api/test-server-error')
  } catch (err) {
    logError('danger', `服务端 API 错误: ${err.message}`)
  }
}

// ========== 客户端自动捕获错误测试 ==========

const triggerJSError = () => {
  logError('danger', '触发 JS 运行时错误 (自动捕获)')
  setTimeout(() => {
    const obj = null
    obj.property.value = 'test'
  }, 0)
}

const triggerPromiseError = () => {
  logError('warning', '触发 Promise Rejection (自动捕获)')
  Promise.reject(new Error('未处理的 Promise Rejection'))
}

const triggerFetchError = async () => {
  logError('info', '触发 Fetch 错误 (自动捕获)')
  try {
    await $fetch('http://localhost:3001/api/test/non-existent')
  } catch (err) {
    logError('danger', `Fetch 错误已被自动捕获: ${err.message}`)
  }
}

// ========== 手动上报错误测试 ==========

const triggerCustomError = () => {
  if (!$errorTracker) {
    logError('danger', 'ErrorCatcher 未初始化')
    return
  }
  logError('primary', '手动上报自定义错误')
  $errorTracker.report(
    new Error('这是一个自定义业务错误'),
    {
      errorType: 'business_logic_error',
      severity: 'warning',
      feature: 'user_action',
      customData: {
        action: 'button_click',
        component: 'IndexPage'
      }
    }
  )
  logError('success', '✓ 已调用 report() 上报错误')
}

const trigger500Error = async () => {
  logError('danger', '触发 500 服务器错误')
  try {
    await $fetch('http://localhost:3001/api/test/trigger-500', {
      method: 'POST',
      body: { test: 'data' }
    })
  } catch (err) {
    logError('danger', `500 错误: ${err.message}`)
  }
}

const triggerRealAPIError = async () => {
  logError('info', '调用真实 API 接口...')
  try {
    await $fetch('https://www.linkhaitao.com/api2.php', {
      params: {
        c: 'message',
        a: 'list',
        sign: '大',
        is_new: 1,
        page: 1,
        page_size: 5
      }
    })
    logError('success', '✓ API 调用成功')
  } catch (err) {
    logError('danger', `API 调用失败: ${err.message}`)
  }
}

// ========== API 方法测试 ==========

const testSetUser = () => {
  if (!$errorTracker) {
    logError('danger', 'ErrorCatcher 未初始化')
    return
  }
  const userId = `user_${Date.now()}`
  $errorTracker.setUser({ 
    id: userId,
    username: 'test_user',
    email: 'test@example.com'
  })
  currentUserId.value = userId
  logError('success', `✓ setUser({ id: '${userId}', ... }) 已调用`)
}

const testSetTag = () => {
  if (!$errorTracker) {
    logError('danger', 'ErrorCatcher 未初始化')
    return
  }
  $errorTracker.setTag('version', '1.0.0')
  currentTags.value = { ...currentTags.value, version: '1.0.0' }
  logError('success', '✓ setTag("version", "1.0.0") 已调用')
}

const testSetTags = () => {
  if (!$errorTracker) {
    logError('danger', 'ErrorCatcher 未初始化')
    return
  }
  const tags = { feature: 'checkout', page: 'home' }
  $errorTracker.setTags(tags)
  currentTags.value = { ...currentTags.value, ...tags }
  logError('success', '✓ setTags({ feature: "checkout", page: "home" }) 已调用')
}

const testSetContext = () => {
  if (!$errorTracker) {
    logError('danger', 'ErrorCatcher 未初始化')
    return
  }
  $errorTracker.setContext('device', {
    type: 'desktop',
    os: 'macOS',
    browser: 'Chrome'
  })
  logError('success', '✓ setContext("device", {...}) 已调用')
}

const testSetExtra = () => {
  if (!$errorTracker) {
    logError('danger', 'ErrorCatcher 未初始化')
    return
  }
  $errorTracker.setExtra('customData', { foo: 'bar', timestamp: Date.now() })
  logError('success', '✓ setExtra("customData", {...}) 已调用')
}

const testAddBreadcrumb = () => {
  if (!$errorTracker) {
    logError('danger', 'ErrorCatcher 未初始化')
    return
  }
  $errorTracker.addBreadcrumb({
    category: 'user_action',
    message: '用户点击了测试按钮',
    level: 'info',
    data: { button: 'addBreadcrumb', timestamp: Date.now() }
  })
  breadcrumbCount.value++
  logError('success', '✓ addBreadcrumb({...}) 已调用')
}

const testReport = () => {
  if (!$errorTracker) {
    logError('danger', 'ErrorCatcher 未初始化')
    return
  }
  $errorTracker.report(
    new Error('测试 report() 方法'),
    {
      type: 'manual',
      level: 'warning',
      extra: { testData: 'from report button' }
    }
  )
  logError('success', '✓ report(error, context) 已调用')
}

// ========== 工具方法 ==========

const logError = (type, message) => {
  errorLog.value.unshift({
    time: new Date().toLocaleTimeString(),
    type,
    message
  })
  if (errorLog.value.length > 15) {
    errorLog.value.pop()
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.hero {
  text-align: center;
  margin-bottom: 60px;
}

.title {
  font-size: 48px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 16px;
}

.subtitle {
  font-size: 20px;
  color: #7f8c8d;
}

.test-links {
  margin-top: 24px;
}

.test-link {
  display: inline-block;
  padding: 12px 24px;
  background: #e74c3c;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
}

.test-link:hover {
  background: #c0392b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.test-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.test-section h2 {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 12px;
}

.desc {
  color: #7f8c8d;
  margin-bottom: 24px;
  font-size: 14px;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.btn {
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  color: white;
  transition: all 0.3s;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-danger { background: #e74c3c; }
.btn-warning { background: #f39c12; }
.btn-info { background: #3498db; }
.btn-primary { background: #9b59b6; }
.btn-success { background: #27ae60; }

.api-status {
  margin-top: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.api-status p {
  margin: 8px 0;
  font-size: 14px;
}

.api-status code {
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  color: #e74c3c;
}

.info-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
}

.info-section h3 {
  font-size: 20px;
  color: #2c3e50;
  margin-bottom: 20px;
}

.info-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
}

.info-card code {
  background: #ecf0f1;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  color: #e74c3c;
}

.error-log {
  background: #2c3e50;
  border-radius: 12px;
  padding: 24px;
  color: white;
}

.error-log h3 {
  margin-bottom: 16px;
}

.log-item {
  display: flex;
  gap: 12px;
  padding: 10px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  font-size: 14px;
  align-items: center;
}

.log-time {
  color: #95a5a6;
  min-width: 80px;
  font-size: 12px;
}

.log-type {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  min-width: 80px;
  text-align: center;
}

.log-message {
  flex: 1;
  color: #ecf0f1;
}

.log-type.danger { background: #e74c3c; }
.log-type.warning { background: #f39c12; }
.log-type.info { background: #3498db; }
.log-type.primary { background: #9b59b6; }
.log-type.success { background: #27ae60; }
</style>
