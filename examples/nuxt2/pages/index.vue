<template>
  <div class="container">
    <div class="hero">
      <h1 class="title">ErrorCatcher Nuxt 2 示例</h1>
      <p class="subtitle">测试错误监控功能和所有 API 方法</p>
    </div>

    <div class="test-section">
      <h2>1. 自动捕获错误测试</h2>
      <p class="section-desc">这些错误会被 ErrorCatcher 自动拦截和上报，无需手动调用</p>
      <div class="button-grid">
        <button @click="triggerJSError" class="btn btn-danger">
          JS 运行时错误
        </button>
        <button @click="triggerPromiseError" class="btn btn-warning">
          Promise Rejection
        </button>
        <button @click="triggerNetworkError" class="btn btn-info">
          网络请求错误 (自动捕获)
        </button>
      </div>
    </div>

    <div class="test-section">
      <h2>2. 手动上报错误测试</h2>
      <p class="section-desc">使用 report() 方法手动上报错误</p>
      <div class="button-grid">
        <button @click="triggerCustomError" class="btn btn-primary">
          自定义错误上报
        </button>
        <button @click="trigger500Error" class="btn btn-danger">
          500 服务器错误 (自动捕获)
        </button>
        <button @click="triggerAsyncDataError" class="btn btn-danger">
          asyncData 错误 (SSR)
        </button>
        <button @click="triggerFetchError" class="btn btn-warning">
          fetch 错误 (SSR/Client)
        </button>
        <button @click="triggerRealAPIError" class="btn btn-info">
          真实 API 错误测试
        </button>
      </div>
    </div>

    <div class="test-section">
      <h2>3. ErrorCatcher API 方法演示</h2>
      <p class="section-desc">测试所有公开的 API 方法</p>
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
    </div>

    <div class="info-section">
      <h3>配置信息</h3>
      <div class="info-card">
        <p><strong>Project ID:</strong> <code>{{ projectId }}</code></p>
        <p><strong>API Key:</strong> <code>{{ apiKey }}</code></p>
        <p><strong>Environment:</strong> <code>{{ environment }}</code></p>
      </div>
    </div>

    <div class="info-section">
      <h3>ErrorCatcher 完整 API 说明</h3>
      <div class="info-card">
        <div class="api-method">
          <h4>init()</h4>
          <p>初始化 ErrorCatcher，开始监听错误。在 Nuxt 插件中自动调用。</p>
          <pre><code>this.$errorTracker.init()</code></pre>
        </div>

        <div class="api-method">
          <h4>report(error, context)</h4>
          <p>手动上报错误。适用于需要自定义错误信息或在 SSR 中上报的场景。</p>
          <pre><code>// 基本用法
this.$errorTracker.report(new Error('错误信息'), {
  type: 'custom',
  level: 'error',
  extra: { customData: 'value' }
})

// 上报 API 错误（从 axios 错误中提取信息）
try {
  await this.$axios.$get('/api/endpoint')
} catch (err) {
  this.$errorTracker.report(err, {
    type: 'api_error',
    url: err.config?.url,           // API URL
    method: err.config?.method,     // HTTP 方法
    status: err.response?.status,   // 状态码
    statusText: err.response?.statusText,
    pageUrl: window.location.href   // 页面 URL
  })
}</code></pre>
          <p class="note">注意：自动拦截的 fetch/XHR 错误会自动捕获所有信息。手动 report 时需要从错误对象中提取 URL 信息。</p>
        </div>

        <div class="api-method">
          <h4>setUser(user)</h4>
          <p>设置当前用户信息，后续所有错误都会关联此用户。</p>
          <pre><code>this.$errorTracker.setUser({ id: 'user_12345', username: 'john', email: 'john@example.com' })</code></pre>
        </div>

        <div class="api-method">
          <h4>setTag(key, value)</h4>
          <p>设置单个标签，用于过滤和分类错误。</p>
          <pre><code>this.$errorTracker.setTag('environment', 'production')</code></pre>
        </div>

        <div class="api-method">
          <h4>setTags(tags)</h4>
          <p>批量设置多个标签。</p>
          <pre><code>this.$errorTracker.setTags({ 
  environment: 'production',
  version: '2.0.0',
  region: 'us-west'
})</code></pre>
        </div>

        <div class="api-method">
          <h4>setContext(key, value)</h4>
          <p>设置上下文数据，可以是任何类型的数据。</p>
          <pre><code>this.$errorTracker.setContext('device', {
  type: 'mobile',
  os: 'iOS',
  version: '15.0'
})</code></pre>
        </div>

        <div class="api-method">
          <h4>setExtra(key, value)</h4>
          <p>设置额外数据，用于调试。</p>
          <pre><code>this.$errorTracker.setExtra('lastAction', 'checkout')
this.$errorTracker.setExtra('cartTotal', 99.99)</code></pre>
        </div>

        <div class="api-method">
          <h4>addBreadcrumb(breadcrumb)</h4>
          <p>添加面包屑，记录用户操作轨迹（最多保留100条）。</p>
          <pre><code>this.$errorTracker.addBreadcrumb({
  category: 'navigation',
  message: 'User navigated to checkout',
  level: 'info',
  data: { from: '/cart', to: '/checkout' }
})</code></pre>
        </div>

        <div class="api-method">
          <h4>destroy()</h4>
          <p>停止错误监控并清理资源。</p>
          <pre><code>this.$errorTracker.destroy()</code></pre>
        </div>

        <div class="api-method">
          <h4>setContext(context)</h4>
          <p>设置全局上下文，会合并到所有错误报告中。</p>
          <pre><code>this.$errorTracker.setContext({
  version: '1.0.0',
  feature: 'checkout'
})</code></pre>
        </div>

        <div class="api-method">
          <h4>enableNavigationTracking()</h4>
          <p>启用路由导航跟踪，记录页面跳转历史。</p>
          <pre><code>this.$errorTracker.enableNavigationTracking()</code></pre>
        </div>

        <div class="api-method">
          <h4>disableNavigationTracking()</h4>
          <p>禁用路由导航跟踪。</p>
          <pre><code>this.$errorTracker.disableNavigationTracking()</code></pre>
        </div>

        <div class="api-method">
          <h4>destroy()</h4>
          <p>销毁 ErrorCatcher，停止所有监听。在页面卸载时自动调用。</p>
          <pre><code>this.$errorTracker.destroy()</code></pre>
        </div>
      </div>
    </div>

    <div class="info-section">
      <h3>自动捕获的数据</h3>
      <div class="info-card">
        <p>ErrorCatcher 会自动捕获以下信息：</p>
        <ul class="auto-capture-list">
          <li><strong>自动拦截的 API 错误（fetch/XHR）：</strong>url, method, status, statusText, requestHeaders, requestBody, response, responseHeaders, duration, pageUrl</li>
          <li><strong>手动上报的错误：</strong>需要从错误对象中提取 url, method, status 等信息并传入 context</li>
          <li><strong>浏览器信息：</strong>userAgent, language, timezone, screenResolution, viewportSize</li>
          <li><strong>页面信息：</strong>pageUrl (自动拦截时), referrer</li>
          <li><strong>时间信息：</strong>timestamp</li>
          <li><strong>应用信息：</strong>environment, userId (如已设置), context (如已设置)</li>
        </ul>
        <p class="note" style="margin-top: 16px;">
          <strong>重要：</strong>如果在 try-catch 中捕获了 axios/fetch 错误并手动上报，需要从错误对象中提取 url、method、status 等信息，否则这些字段将为空。
        </p>
      </div>
    </div>

    <div class="error-log" v-if="errorLog.length > 0">
      <h3>操作日志</h3>
      <div class="log-item" v-for="(log, index) in errorLog" :key="index">
        <span class="log-time">{{ log.time }}</span>
        <span class="log-type" :class="log.type">{{ log.type }}</span>
        <span class="log-message">{{ log.message }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IndexPage',
  
  data() {
    return {
      projectId: '69a69b5a6b650638ebe3d896',
      apiKey: 'ec_af9d006b050643d3bd21b39984a4a8172557279feac2d4e95005dfc997ecdf37',
      environment: 'development',
      errorLog: [],
      currentUserId: null,
      currentTags: {},
      breadcrumbCount: 0
    }
  },

  async asyncData({ query, $axios, error, req, $errorTracker }) {
    // 模拟 asyncData 中的接口报错
    if (query.asyncError === 'true') {
      try {
        await $axios.$get('http://localhost:3001/api/test/non-existent-endpoint');
      } catch (err) {
        // SSR 环境中手动上报错误，需要提取 axios 错误信息
        // 优先使用 $errorTracker（从 context 注入），其次使用 req.errorTracker
        const tracker = $errorTracker || (req && req.errorTracker);
        
        if (tracker) {
          const errorContext = {
            type: 'asyncData_error',
            hook: 'asyncData',
            // 从 axios 错误中提取请求信息
            url: err.config?.url || err.request?.path,
            method: err.config?.method?.toUpperCase() || 'GET',
            status: err.response?.status || 0,
            statusText: err.response?.statusText || err.message,
            // 从 req 构建 pageUrl
            pageUrl: req ? `${req.headers?.['x-forwarded-proto'] || 'http'}://${req.headers?.host || 'localhost'}${req.url}` : ''
          };
          
          console.log('[asyncData] 上报错误:', errorContext);
          
          tracker.report(
            new Error(`asyncData API 请求失败: ${err.message}`),
            errorContext
          );
        } else {
          console.error('[asyncData] ErrorTracker 未找到');
        }
        
        error({
          statusCode: err.response?.status || 500,
          message: `asyncData 错误已上报到 ErrorCatcher`
        });
      }
    }
    return {}
  },

  async fetch() {
    // 模拟 fetch 中的接口报错
    if (this.$route.query.fetchError === 'true') {
      try {
        await this.$axios.$get('http://localhost:3001/api/test/fetch-error-endpoint');
      } catch (err) {
        // fetch 中手动上报错误，需要提取 axios 错误信息
        if (this.$errorTracker) {
          const errorContext = {
            type: 'fetch_error',
            hook: 'fetch',
            // 从 axios 错误中提取请求信息
            url: err.config?.url || err.request?.path,
            method: err.config?.method?.toUpperCase() || 'GET',
            status: err.response?.status || 0,
            statusText: err.response?.statusText || err.message,
            // 客户端环境可以直接获取 pageUrl
            pageUrl: typeof window !== 'undefined' ? window.location.href : ''
          };
          
          this.$errorTracker.report(
            new Error(`fetch API 请求失败: ${err.message}`),
            errorContext
          );
        }
      }
    }
  },

  mounted() {
    this.logError('info', '页面已加载，ErrorCatcher 已初始化');
    // 检查导航跟踪状态
    if (this.$errorTracker) {
      this.navigationEnabled = this.$errorTracker.navigationEnabled || false;
    }
  },

  methods: {
    // ========== 自动捕获错误测试 ==========
    
    triggerJSError() {
      this.logError('danger', '触发 JS 运行时错误 (自动捕获)');
      // 使用 setTimeout 让错误在 Vue 错误处理之外抛出
      // 这样可以被全局 error 事件监听器捕获
      setTimeout(() => {
        const obj = null;
        obj.property.value = 'test';
      }, 0);
    },

    triggerPromiseError() {
      this.logError('warning', '触发 Promise Rejection (自动捕获)');
      // 这个错误会被 ErrorCatcher 自动捕获
      Promise.reject(new Error('未处理的 Promise Rejection'));
    },

    async triggerNetworkError() {
      this.logError('info', '触发网络请求错误 (自动捕获)');
      try {
        // 这个请求失败会被 ErrorCatcher 自动拦截和上报
        // url、method、status、response 等都会自动捕获
        await this.$axios.$get('http://localhost:3001/api/test/non-existent');
      } catch (err) {
        this.logError('danger', `网络错误已被自动捕获: ${err.message}`);
      }
    },

    // ========== 手动上报错误测试 ==========
    
    triggerCustomError() {
      this.logError('primary', '手动上报自定义错误');
      if (this.$errorTracker) {
        // 使用 report() 方法手动上报
        this.$errorTracker.report(
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
        );
        this.logError('success', '✓ 已调用 report() 上报错误');
      }
    },

    async trigger500Error() {
      this.logError('danger', '触发 500 服务器错误 (自动捕获)');
      try {
        // 这个 500 错误会被 ErrorCatcher 自动拦截和上报
        // pageUrl、apiUrl、method、status 等都会自动捕获
        await this.$axios.$post('http://localhost:3001/api/test/trigger-500', {
          test: 'data'
        });
      } catch (err) {
        this.logError('danger', `500 错误已被自动捕获: ${err.message}`);
      }
    },

    triggerAsyncDataError() {
      this.logError('danger', '1秒后跳转触发 asyncData 错误...');
      setTimeout(() => {
        window.location.href = '/?asyncError=true';
      }, 1000);
    },

    triggerFetchError() {
      this.logError('warning', '1秒后跳转触发 fetch 错误...');
      setTimeout(() => {
        window.location.href = '/?fetchError=true';
      }, 1000);
    },

    async triggerRealAPIError() {
      this.logError('info', '调用真实 API 接口...');
      try {
        // 调用真实的 API 接口
        await this.$axios.$get('https://www.linkhaitao.com/api2.php', {
          params: {
            c: 'message',
            a: 'list',
            sign: '大',
            is_new: 1,
            page: 1,
            page_size: 5
          },
          headers: {
            'accept': '*/*',
            'accept-language': 'zh-CN,zh;q=0.9',
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded',
            'lh-authorization': 'U-1823622.82ebbksuiPMDTKLIZTkfW8ZuZgBu_bTlfxwg0sG28W_a1aT6ef4yKTvykj04ZlmTNOTiSb_bgkezrXNCrII_bvFQMhsSOZ6yfPnsOmeLE_bzfcYgfTirKaefvW8CpCu0Nsr_avHoSs_bSrPSgP1wnbtSlwBoxPTguIt25CU',
            'lh-lang': 'undefined',
            'pragma': 'no-cache',
            'referer': 'https://www.linkhaitao.com/dashboard',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'
          }
        });
        this.logError('success', '✓ API 调用成功');
      } catch (err) {
        this.logError('danger', `API 调用失败: ${err.message}`);
        
        // 打印完整的错误对象用于调试
        console.log('[triggerRealAPIError] 完整错误对象:', err);
        console.log('[triggerRealAPIError] err.config:', err.config);
        console.log('[triggerRealAPIError] err.request:', err.request);
        console.log('[triggerRealAPIError] err.response:', err.response);
        
        // 手动上报错误，提取完整的错误信息
        if (this.$errorTracker) {
          // 构建完整的 API URL（包含查询参数）
          let apiUrl = err.config?.url || err.request?.responseURL || '';
          
          // 如果有 params，构建完整的 URL
          if (err.config?.params && apiUrl) {
            const params = new URLSearchParams(err.config.params).toString();
            if (params) {
              apiUrl = `${apiUrl}?${params}`;
            }
          }
          
          const errorContext = {
            type: 'real_api_error',
            url: apiUrl,  // API URL（接口地址）
            method: (err.config?.method || 'GET').toUpperCase(),
            status: err.response?.status || 0,
            statusText: err.response?.statusText || err.message,
            pageUrl: typeof window !== 'undefined' ? window.location.href : '',  // 页面 URL
            duration: err.config?.metadata?.endTime ? err.config.metadata.endTime - err.config.metadata.startTime : undefined,
            // 添加额外的调试信息
            extra: {
              params: err.config?.params,
              requestHeaders: err.config?.headers,
              responseData: err.response?.data ? JSON.stringify(err.response.data).substring(0, 500) : undefined,
              baseURL: err.config?.baseURL
            }
          };
          
          console.log('[triggerRealAPIError] errorContext:', errorContext);
          
          this.$errorTracker.report(
            new Error(`真实 API 调用失败: ${err.message}`),
            errorContext
          );
          
          this.logError('success', '✓ 错误已上报到 ErrorCatcher');
        }
      }
    },

    // ========== ErrorCatcher API 方法测试 ==========
    
    testSetUser() {
      if (this.$errorTracker) {
        const userId = `user_${Date.now()}`;
        this.$errorTracker.setUser({ 
          id: userId,
          username: 'test_user',
          email: 'test@example.com'
        });
        this.currentUserId = userId;
        this.logError('success', `✓ setUser({ id: '${userId}', ... }) 已调用`);
      }
    },

    testSetTag() {
      if (this.$errorTracker) {
        this.$errorTracker.setTag('environment', 'development');
        this.$errorTracker.setTag('version', '2.0.0');
        this.currentTags = { ...this.currentTags, environment: 'development', version: '2.0.0' };
        this.logError('success', '✓ setTag() 已调用');
      }
    },

    testSetTags() {
      if (this.$errorTracker) {
        const tags = {
          feature: 'checkout',
          region: 'us-west',
          build: '12345'
        };
        this.$errorTracker.setTags(tags);
        this.currentTags = { ...this.currentTags, ...tags };
        this.logError('success', '✓ setTags() 已调用');
      }
    },

    testSetContext() {
      if (this.$errorTracker) {
        this.$errorTracker.setContext('device', {
          type: 'desktop',
          os: 'macOS',
          browser: 'Chrome'
        });
        this.logError('success', '✓ setContext() 已调用');
      }
    },

    testSetExtra() {
      if (this.$errorTracker) {
        this.$errorTracker.setExtra('lastAction', 'button_click');
        this.$errorTracker.setExtra('timestamp', Date.now());
        this.logError('success', '✓ setExtra() 已调用');
      }
    },

    testAddBreadcrumb() {
      if (this.$errorTracker) {
        this.$errorTracker.addBreadcrumb({
          category: 'user',
          message: 'User clicked test button',
          level: 'info',
          data: { button: 'addBreadcrumb', timestamp: Date.now() }
        });
        this.breadcrumbCount++;
        this.logError('info', '✓ addBreadcrumb() 已调用');
      }
    },

    testReport() {
      if (this.$errorTracker) {
        this.$errorTracker.report(new Error('手动上报的测试错误'), {
          type: 'manual_test',
          level: 'warning',
          tags: { source: 'manual' },
          extra: { action: 'test_report' }
        });
        this.logError('info', '✓ report() 已调用');
      }
    },

    // ========== 工具方法 ==========
    
    logError(type, message) {
      this.errorLog.unshift({
        time: new Date().toLocaleTimeString(),
        type,
        message
      });
      if (this.errorLog.length > 15) {
        this.errorLog.pop();
      }
    }
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

.section-desc {
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

.btn-danger {
  background: #e74c3c;
}

.btn-warning {
  background: #f39c12;
}

.btn-info {
  background: #3498db;
}

.btn-primary {
  background: #9b59b6;
}

.btn-success {
  background: #27ae60;
}

.btn-secondary {
  background: #95a5a6;
}

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

.api-method {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #ecf0f1;
}

.api-method:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.api-method h4 {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 12px;
  font-family: 'Courier New', monospace;
}

.api-method p {
  color: #555;
  margin-bottom: 12px;
  line-height: 1.6;
}

.api-method pre {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.5;
}

.api-method code {
  background: transparent;
  color: #ecf0f1;
  padding: 0;
}

.note {
  color: #f39c12;
  font-style: italic;
  font-size: 13px;
}

.auto-capture-list {
  list-style: none;
  padding: 0;
  margin: 16px 0 0 0;
}

.auto-capture-list li {
  padding: 12px;
  margin-bottom: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #27ae60;
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

.log-type.danger {
  background: #e74c3c;
}

.log-type.warning {
  background: #f39c12;
}

.log-type.info {
  background: #3498db;
}

.log-type.primary {
  background: #9b59b6;
}

.log-type.success {
  background: #27ae60;
}

.log-type.secondary {
  background: #95a5a6;
}
</style>
