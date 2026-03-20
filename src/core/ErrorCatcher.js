/**
 * ErrorCatcher - 通用错误监控库
 * 支持所有主流 JS 框架：Vue 2/3, React, Nuxt 2/3, Next.js, jQuery, 原生 JS
 * 支持客户端和服务端（SSR）
 * 零依赖，单文件，自动集成
 */
class ErrorCatcher {
  constructor(config = {}) {
    this.config = {
      // 基础配置
      reportUrl: config.reportUrl || config.dsn,
      projectId: config.projectId,
      apiKey: config.apiKey,
      environment: config.environment || 'production',
      release: config.release || null,
      
      // 采样和性能
      sampleRate: config.sampleRate || 1,
      maxBatchSize: config.maxBatchSize || 10,
      delay: config.delay || 1000,
      maxRetries: config.maxRetries || 3,
      
      // 功能开关
      debug: config.debug || false,
      autoStart: config.autoStart !== false,
      autoIntegrate: config.autoIntegrate !== false,
      
      // 框架集成（手动传入）
      vue: config.vue || null,
      react: config.react || false,
      axios: config.axios || null,
      jquery: config.jquery || false,
      router: config.router || null,
      
      // 高级配置
      ignoreUrls: config.ignoreUrls || [
        /\.(jpg|jpeg|png|gif|svg|css|woff|woff2|ttf|eot)$/i,
        '/favicon.ico'
      ],
      beforeSend: config.beforeSend || null,
      onError: config.onError || null,
      fetch: config.fetch || null,  // SSR 环境的 fetch 实现
      
      // 新增配置
      enablePerformanceMonitoring: config.enablePerformanceMonitoring !== false,
      enableOfflineStorage: config.enableOfflineStorage !== false,
      enableDeduplication: config.enableDeduplication !== false,
      deduplicationTimeout: config.deduplicationTimeout || 5000,
      sensitiveKeys: config.sensitiveKeys || [
        'password', 'token', 'secret', 'authorization', 
        'cookie', 'passwd', 'api_key', 'apikey', 'credit_card'
      ],
      maxResponseSize: config.maxResponseSize || 1024 * 1024, // 1MB
      maxBreadcrumbs: config.maxBreadcrumbs || 100
    };

    // 环境检测
    this.isServer = typeof window === 'undefined';
    this.isBrowser = !this.isServer;
    
    // 状态
    this.initialized = false;
    this.errorQueue = [];
    this.isSending = false;
    this.retryCount = 0;
    this.batchSenderInterval = null;
    this.lastErrors = new Map(); // 用于错误去重
    this.offlineStorage = null;
    
    // 框架检测结果
    this.detectedFrameworks = {
      vue: null,
      react: false,
      jquery: false,
      nuxt: false,
      nextjs: false,
      axios: null
    };
    
    // 绑定事件处理器
    this.globalErrorHandler = this.handleGlobalError.bind(this);
    this.promiseRejectionHandler = this.handlePromiseRejection.bind(this);
    
    // 原始方法保存
    if (this.isBrowser) {
      this.originalMethods = {
        fetch: window.fetch,
        xhrOpen: XMLHttpRequest.prototype.open,
        xhrSend: XMLHttpRequest.prototype.send,
        pushState: history.pushState,
        replaceState: history.replaceState
      };
    }
    
    // 自动启动
    if (this.config.autoStart && this.isBrowser) {
      // 延迟初始化，等待框架加载
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init());
      } else {
        this.init();
      }
    }
  }

  /**
   * 初始化
   */
  async init() {
    if (this.initialized) {
      console.warn('[ErrorCatcher] Already initialized');
      return;
    }

    if (!this.config.reportUrl) {
      console.error('[ErrorCatcher] reportUrl is required');
      return;
    }

    if (this.config.debug) {
      console.log('[ErrorCatcher] Initializing...');
    }

    try {
      // 1. 检测框架
      if (this.config.autoIntegrate) {
        this.detectFrameworks();
      }

      // 2. 安装基础拦截器
      if (this.isBrowser) {
        this.installGlobalHandlers();
        this.interceptFetch();
        this.interceptXHR();
        this.startBatchSender();
        
        // 3. 启动性能监控
        if (this.config.enablePerformanceMonitoring) {
          this.startPerformanceMonitoring();
        }
        
        // 4. 初始化离线存储
        if (this.config.enableOfflineStorage) {
          await this.initOfflineStorage();
          await this.sendPendingErrors();
        }
      }

      // 5. 集成框架
      this.integrateFrameworks();

      this.initialized = true;

      if (this.config.debug) {
        console.log('[ErrorCatcher] ✅ Initialized');
        console.log('[ErrorCatcher] Detected frameworks:', this.detectedFrameworks);
      }
    } catch (error) {
      console.error('[ErrorCatcher] Initialization failed:', error);
    }
  }

  /**
   * 检测框架
   */
  detectFrameworks() {
    if (!this.isBrowser) return;

    // 检测 Vue
    if (!this.config.vue) {
      if (window.Vue) {
        this.detectedFrameworks.vue = window.Vue;
        this.config.vue = window.Vue;
      } else if (window.__VUE__) {
        this.detectedFrameworks.vue = 'vue3';
        this.config.vue = window.__VUE__;
      }
    } else {
      this.detectedFrameworks.vue = this.config.vue;
    }

    // 检测 React
    if (!this.config.react && (window.React || window.__REACT_DEVTOOLS_GLOBAL_HOOK__)) {
      this.detectedFrameworks.react = true;
      this.config.react = true;
    }

    // 检测 jQuery
    if (!this.config.jquery && (window.jQuery || window.$)) {
      this.detectedFrameworks.jquery = true;
      this.config.jquery = true;
    }

    // 检测 axios
    if (!this.config.axios && window.axios) {
      this.detectedFrameworks.axios = window.axios;
      this.config.axios = window.axios;
    }

    // 检测 Nuxt
    if (window.$nuxt || window.__NUXT__) {
      this.detectedFrameworks.nuxt = true;
    }

    // 检测 Next.js
    if (window.__NEXT_DATA__) {
      this.detectedFrameworks.nextjs = true;
    }

    if (this.config.debug) {
      console.log('[ErrorCatcher] Framework detection complete:', this.detectedFrameworks);
    }
  }

  /**
   * 安装全局错误处理器
   */
  installGlobalHandlers() {
    // 全局错误
    window.addEventListener('error', this.globalErrorHandler);
    // Promise rejection
    window.addEventListener('unhandledrejection', this.promiseRejectionHandler);

    if (this.config.debug) {
      console.log('[ErrorCatcher] ✅ Global handlers installed');
    }
  }

  /**
   * 处理全局错误
   */
  handleGlobalError(event) {
    // 区分脚本错误和资源加载错误
    if (event.target && (event.target.tagName === 'LINK' || 
        event.target.tagName === 'SCRIPT' || 
        event.target.tagName === 'IMG')) {
      // 资源加载错误，上报但标记为资源错误
      this.captureError({
        type: 'resource_error',
        message: `Failed to load ${event.target.tagName}: ${event.target.src || event.target.href}`,
        tagName: event.target.tagName,
        src: event.target.src || event.target.href,
        timestamp: new Date().toISOString(),
        pageUrl: window.location.href
      });
      return;
    }

    // 脚本错误
    this.captureError({
      type: 'global_error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      timestamp: new Date().toISOString(),
      pageUrl: window.location.href
    });
  }

  /**
   * 处理 Promise rejection
   */
  handlePromiseRejection(event) {
    let message, stack, reason;
    
    if (event.reason instanceof Error) {
      message = event.reason.message;
      stack = event.reason.stack;
      reason = event.reason;
    } else if (typeof event.reason === 'string') {
      message = event.reason;
      stack = new Error(message).stack;
      reason = event.reason;
    } else {
      try {
        message = JSON.stringify(event.reason);
      } catch (e) {
        message = 'Unhandled Promise Rejection';
      }
      stack = null;
      reason = event.reason;
    }

    this.captureError({
      type: 'promise_rejection',
      message: message,
      stack: stack,
      reason: reason,
      timestamp: new Date().toISOString(),
      pageUrl: window.location.href
    });
  }

  /**
   * 拦截 fetch
   */
  interceptFetch() {
    const self = this;
    const originalFetch = this.originalMethods.fetch;

    window.fetch = function(...args) {
      const [resource, init = {}] = args;
      let url = typeof resource === 'string' ? resource : resource.url;
      const method = init.method || 'GET';
      const startTime = Date.now();

      // 处理相对路径
      if (url && !url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('//')) {
        try {
          url = new URL(url, window.location.href).href;
        } catch (e) {
          // URL 解析失败，使用原值
        }
      }

      if (self.shouldIgnore(url)) {
        return originalFetch.apply(this, args);
      }

      return originalFetch.apply(this, args)
        .then(async (response) => {
          const duration = Date.now() - startTime;

          if (!response.ok) {
            const clonedResponse = response.clone();
            let responseText = '';
            let responseSize = 0;
            
            try {
              responseText = await clonedResponse.text();
              responseSize = new Blob([responseText]).size;
              
              // 限制响应体大小
              if (responseSize > self.config.maxResponseSize) {
                responseText = self.truncate(responseText, 5000);
              }
            } catch (e) {
              responseText = 'Unable to read response';
            }

            // 收集响应头
            const responseHeaders = {};
            response.headers.forEach((value, key) => {
              responseHeaders[key] = value;
            });

            // 敏感信息过滤
            const sanitizedHeaders = self.sanitizeData(init.headers);
            const sanitizedBody = self.sanitizeData(init.body);

            self.captureError({
              type: 'fetch_error',
              url: url,
              method: method.toUpperCase(),
              status: response.status,
              statusText: response.statusText,
              requestHeaders: sanitizedHeaders,
              requestBody: sanitizedBody,
              response: self.truncate(responseText, 2000),
              responseHeaders: responseHeaders,
              responseSize: responseSize,
              duration: duration,
              timing: {
                startTime: startTime,
                endTime: Date.now(),
                duration: duration
              },
              curlCommand: self.generateCurlCommand(url, method.toUpperCase(), sanitizedHeaders, sanitizedBody),
              timestamp: new Date().toISOString(),
              pageUrl: window.location.href
            });
          }

          return response;
        })
        .catch((error) => {
          const duration = Date.now() - startTime;

          self.captureError({
            type: 'fetch_network_error',
            url: url,
            method: method.toUpperCase(),
            message: error.message,
            stack: error.stack,
            requestHeaders: self.sanitizeData(init.headers),
            requestBody: self.sanitizeData(init.body),
            duration: duration,
            timing: {
              startTime: startTime,
              endTime: Date.now(),
              duration: duration
            },
            curlCommand: self.generateCurlCommand(url, method.toUpperCase(), self.sanitizeData(init.headers), self.sanitizeData(init.body)),
            timestamp: new Date().toISOString(),
            pageUrl: window.location.href
          });

          throw error;
        });
    };

    if (this.config.debug) {
      console.log('[ErrorCatcher] ✅ Fetch interceptor installed');
    }
  }

  /**
   * 拦截 XMLHttpRequest
   */
  interceptXHR() {
    const self = this;
    const requestMap = new WeakMap();

    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      let fullUrl = url;
      // 处理相对路径
      if (fullUrl && !fullUrl.startsWith('http://') && !fullUrl.startsWith('https://') && !fullUrl.startsWith('//')) {
        try {
          fullUrl = new URL(fullUrl, window.location.href).href;
        } catch (e) {
          // URL 解析失败，使用原值
        }
      }
      
      if (!self.shouldIgnore(fullUrl)) {
        requestMap.set(this, {
          method: method.toUpperCase(),
          url: fullUrl,
          startTime: Date.now(),
          headers: {}
        });
      }
      return self.originalMethods.xhrOpen.apply(this, [method, url, ...args]);
    };

    // 拦截 setRequestHeader 以收集请求头
    const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
      const info = requestMap.get(this);
      if (info) {
        info.headers[header] = value;
      }
      return originalSetRequestHeader.apply(this, [header, value]);
    };

    XMLHttpRequest.prototype.send = function(body) {
      const info = requestMap.get(this);
      
      if (info) {
        info.body = body;
        
        this.addEventListener('load', function() {
          const duration = Date.now() - info.startTime;

          if (this.status >= 400) {
            // 收集响应头
            const responseHeaders = {};
            const headerLines = this.getAllResponseHeaders().split('\r\n');
            headerLines.forEach(line => {
              const [key, value] = line.split(': ');
              if (key && value) {
                responseHeaders[key] = value;
              }
            });

            let responseText = this.responseText;
            let responseSize = responseText ? new Blob([responseText]).size : 0;
            
            // 限制响应体大小
            if (responseSize > self.config.maxResponseSize) {
              responseText = self.truncate(responseText, 5000);
            }

            self.captureError({
              type: 'xhr_error',
              url: info.url,
              method: info.method,
              status: this.status,
              statusText: this.statusText,
              requestHeaders: self.sanitizeData(info.headers),
              requestBody: self.sanitizeData(info.body),
              response: self.truncate(responseText, 2000),
              responseHeaders: responseHeaders,
              responseSize: responseSize,
              duration: duration,
              timing: {
                startTime: info.startTime,
                endTime: Date.now(),
                duration: duration
              },
              curlCommand: self.generateCurlCommand(info.url, info.method, self.sanitizeData(info.headers), self.sanitizeData(info.body)),
              timestamp: new Date().toISOString(),
              pageUrl: window.location.href
            });
          }
        });

        this.addEventListener('error', function() {
          const duration = Date.now() - info.startTime;

          self.captureError({
            type: 'xhr_network_error',
            url: info.url,
            method: info.method,
            message: 'Network Error',
            requestHeaders: self.sanitizeData(info.headers),
            requestBody: self.sanitizeData(info.body),
            duration: duration,
            timing: {
              startTime: info.startTime,
              endTime: Date.now(),
              duration: duration
            },
            curlCommand: self.generateCurlCommand(info.url, info.method, self.sanitizeData(info.headers), self.sanitizeData(info.body)),
            timestamp: new Date().toISOString(),
            pageUrl: window.location.href
          });
        });
      }

      return self.originalMethods.xhrSend.apply(this, [body]);
    };

    if (this.config.debug) {
      console.log('[ErrorCatcher] ✅ XHR interceptor installed');
    }
  }

  /**
   * 集成所有检测到的框架
   */
  integrateFrameworks() {
    if (this.config.vue) {
      this.integrateVue();
    }

    if (this.config.react) {
      this.integrateReact();
    }

    if (this.config.axios) {
      this.integrateAxios();
    }

    if (this.config.jquery) {
      this.integrateJQuery();
    }

    if (this.config.router) {
      this.integrateRouter();
    }
  }

  /**
   * 集成 Vue (支持 Vue 2 和 Vue 3)
   */
  integrateVue() {
    const vue = this.config.vue;
    if (!vue) return;

    const self = this;
    
    // 检测 Vue 版本
    const isVue3 = vue.version && vue.version.startsWith('3');
    const isVue2 = vue.version && vue.version.startsWith('2');

    if (isVue3 && vue.config) {
      // Vue 3 错误处理
      const originalErrorHandler = vue.config.errorHandler;
      
      vue.config.errorHandler = (err, instance, info) => {
        let vueContext = {};
        
        try {
          vueContext = {
            componentName: instance?.type?.name || instance?.$.type?.name || 'Anonymous',
            lifecycle: info,
            componentPath: instance?.type?.__file,
            props: self.sanitizeData(instance?.props),
            data: self.sanitizeData(instance?.data),
            setupState: instance?.setupState ? Object.keys(instance.setupState) : [],
            attrs: instance?.attrs,
            slots: instance?.slots ? Object.keys(instance.slots) : []
          };
          
          // 获取路由信息
          if (instance?.$router && instance?.$route) {
            vueContext.route = {
              path: instance.$route.path,
              name: instance.$route.name,
              params: instance.$route.params,
              query: instance.$route.query
            };
          }
        } catch (e) {
          vueContext = { error: 'Failed to extract Vue context' };
        }

        self.captureError({
          type: 'vue3_error',
          message: err.message,
          stack: err.stack,
          vueContext: vueContext,
          vueVersion: vue.version,
          timestamp: new Date().toISOString(),
          pageUrl: typeof window !== 'undefined' ? window.location.href : ''
        });

        if (originalErrorHandler) {
          originalErrorHandler.call(this, err, instance, info);
        }
      };
      
      if (this.config.debug) {
        console.log('[ErrorCatcher] ✅ Vue 3 error handler integrated');
      }
    } else if (isVue2 && vue.config) {
      // Vue 2 错误处理
      const originalErrorHandler = vue.config.errorHandler;
      
      vue.config.errorHandler = function(err, vm, info) {
        const vueContext = {
          componentName: vm?.$options?.name || 'Anonymous',
          lifecycle: info,
          componentPath: vm?.$options?.__file,
          props: self.sanitizeData(vm?.$props),
          data: self.sanitizeData(vm?.$data),
          computed: vm?.$options?.computed ? Object.keys(vm.$options.computed) : [],
          methods: vm?.$options?.methods ? Object.keys(vm.$options.methods) : [],
          parentComponent: vm?.$parent?.$options?.name,
          route: vm?.$route ? {
            path: vm.$route.path,
            name: vm.$route.name,
            params: vm.$route.params,
            query: vm.$route.query
          } : null
        };

        self.captureError({
          type: 'vue2_error',
          message: err.message,
          stack: err.stack,
          vueContext: vueContext,
          vueVersion: vue.version,
          timestamp: new Date().toISOString(),
          pageUrl: typeof window !== 'undefined' ? window.location.href : ''
        });

        if (originalErrorHandler) {
          originalErrorHandler.call(this, err, vm, info);
        }
      };
      
      if (this.config.debug) {
        console.log('[ErrorCatcher] ✅ Vue 2 error handler integrated');
      }
    }
  }

  /**
   * 集成 React (提供错误边界组件)
   */
  integrateReact() {
    // 提供 React 错误边界组件
    if (typeof window !== 'undefined' && window.React) {
      const React = window.React;
      
      // 创建错误边界组件
      class ErrorBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false };
        }

        static getDerivedStateFromError(error) {
          return { hasError: true };
        }

        componentDidCatch(error, errorInfo) {
          this.props.onError?.(error, errorInfo);
        }

        render() {
          if (this.state.hasError) {
            return this.props.fallback || null;
          }
          return this.props.children;
        }
      }
      
      // 挂载到全局
      window.ReactErrorBoundary = ErrorBoundary;
      
      if (this.config.debug) {
        console.log('[ErrorCatcher] ✅ React error boundary component created');
      }
    }
    
    if (this.config.debug) {
      console.log('[ErrorCatcher] ✅ React integration ready (use ErrorBoundary component)');
    }
  }

  /**
   * 集成 axios
   */
  integrateAxios() {
    const axios = this.config.axios;
    if (!axios || !axios.interceptors) return;

    const self = this;

    // 请求拦截器
    axios.interceptors.request.use(
      config => {
        config.metadata = { startTime: Date.now() };
        return config;
      },
      error => Promise.reject(error)
    );

    // 响应拦截器
    axios.interceptors.response.use(
      response => response,
      error => {
        const config = error.config || {};
        const response = error.response;
        const duration = config.metadata?.startTime 
          ? Date.now() - config.metadata.startTime 
          : undefined;

        // 构建完整 URL
        let fullUrl = config.url || '';
        if (config.params) {
          const params = new URLSearchParams(config.params).toString();
          if (params) {
            fullUrl += (fullUrl.includes('?') ? '&' : '?') + params;
          }
        }
        if (config.baseURL && !fullUrl.startsWith('http')) {
          fullUrl = config.baseURL + fullUrl;
        }

        // 收集响应头
        const responseHeaders = response?.headers ? Object.assign({}, response.headers) : {};

        let responseData = response?.data;
        let responseSize = 0;
        
        if (responseData) {
          try {
            const responseStr = typeof responseData === 'string' ? responseData : JSON.stringify(responseData);
            responseSize = new Blob([responseStr]).size;
            if (responseSize > self.config.maxResponseSize) {
              responseData = self.truncate(responseStr, 5000);
            }
          } catch (e) {
            responseData = '[Unable to stringify response]';
          }
        }

        self.captureError({
          type: response ? 'axios_error' : 'axios_network_error',
          url: fullUrl,
          method: (config.method || 'GET').toUpperCase(),
          status: response?.status || 0,
          statusText: response?.statusText || error.message,
          message: error.message,
          requestHeaders: self.sanitizeData(config.headers),
          requestBody: self.sanitizeData(config.data),
          responseHeaders: responseHeaders,
          response: responseData ? self.truncate(self.safeStringify(responseData), 2000) : undefined,
          responseSize: responseSize,
          duration: duration,
          timing: {
            startTime: config.metadata?.startTime,
            endTime: Date.now(),
            duration: duration
          },
          curlCommand: self.generateCurlCommand(fullUrl, (config.method || 'GET').toUpperCase(), 
            self.sanitizeData(config.headers), self.sanitizeData(config.data)),
          timestamp: new Date().toISOString(),
          pageUrl: typeof window !== 'undefined' ? window.location.href : ''
        });

        return Promise.reject(error);
      }
    );

    if (this.config.debug) {
      console.log('[ErrorCatcher] ✅ Axios interceptors integrated');
    }
  }

  /**
   * 集成 jQuery
   */
  integrateJQuery() {
    const $ = window.jQuery || window.$;
    if (!$) return;

    const self = this;

    // 拦截 $.ajax 错误
    $(document).ajaxError(function(event, jqXHR, settings, thrownError) {
      self.captureError({
        type: 'jquery_ajax_error',
        url: settings.url,
        method: (settings.type || 'GET').toUpperCase(),
        status: jqXHR.status,
        statusText: jqXHR.statusText,
        message: thrownError || jqXHR.statusText || `HTTP ${jqXHR.status} Error`,
        requestHeaders: self.sanitizeData(settings.headers),
        requestBody: self.sanitizeData(settings.data),
        response: self.truncate(jqXHR.responseText, 2000),
        curlCommand: self.generateCurlCommand(settings.url, (settings.type || 'GET').toUpperCase(), 
          self.sanitizeData(settings.headers), self.sanitizeData(settings.data)),
        timestamp: new Date().toISOString(),
        pageUrl: window.location.href
      });
    });

    if (this.config.debug) {
      console.log('[ErrorCatcher] ✅ jQuery ajax error handler integrated');
    }
  }

  /**
   * 集成路由
   */
  integrateRouter() {
    const router = this.config.router;
    if (!router) return;

    const self = this;

    // Vue Router
    if (router.afterEach) {
      router.afterEach((to, from) => {
        this.addBreadcrumb({
          category: 'navigation',
          message: `Route changed: ${from?.path || 'unknown'} -> ${to?.path || 'unknown'}`,
          data: { from, to }
        });
      });
    }

    // React Router 可以通过监听 history 变化
    if (this.isBrowser && window.history) {
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      history.pushState = function(...args) {
        self.addBreadcrumb({
          category: 'navigation',
          message: `History push state`,
          data: { arguments: args }
        });
        return originalPushState.apply(this, args);
      };
      
      history.replaceState = function(...args) {
        self.addBreadcrumb({
          category: 'navigation',
          message: `History replace state`,
          data: { arguments: args }
        });
        return originalReplaceState.apply(this, args);
      };
    }

    if (this.config.debug) {
      console.log('[ErrorCatcher] ✅ Router integration enabled');
    }
  }

  /**
   * 启动性能监控
   */
  startPerformanceMonitoring() {
    if (!this.isBrowser) return;

    // 监控页面加载性能
    if (window.performance && window.performance.timing) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const timing = window.performance.timing;
          const navigation = window.performance.navigation;
          
          if (timing.navigationStart) {
            const metrics = {
              type: 'performance_page_load',
              dns: timing.domainLookupEnd - timing.domainLookupStart,
              tcp: timing.connectEnd - timing.connectStart,
              request: timing.responseStart - timing.requestStart,
              response: timing.responseEnd - timing.responseStart,
              dom: timing.domInteractive - timing.responseEnd,
              domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
              load: timing.loadEventEnd - timing.navigationStart,
              redirect: timing.redirectEnd - timing.redirectStart,
              navigationType: navigation.type
            };
            
            this.capturePerformance(metrics);
          }
        }, 0);
      });
    }
    
    // 监控资源加载性能
    if (window.PerformanceObserver) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              // 只记录慢资源
              if (entry.duration > 1000) {
                this.capturePerformance({
                  type: 'performance_slow_resource',
                  name: entry.name,
                  duration: entry.duration,
                  transferSize: entry.transferSize,
                  initiatorType: entry.initiatorType
                });
              }
            }
          }
        });
        observer.observe({ entryTypes: ['resource'] });
      } catch (e) {
        // PerformanceObserver 不支持
      }
    }
    
    if (this.config.debug) {
      console.log('[ErrorCatcher] ✅ Performance monitoring started');
    }
  }

  /**
   * 初始化离线存储 (IndexedDB)
   */
  async initOfflineStorage() {
    if (!this.isBrowser || !window.indexedDB) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ErrorCatcherDB', 1);
      
      request.onerror = () => {
        if (this.config.debug) {
          console.warn('[ErrorCatcher] Failed to open IndexedDB');
        }
        reject();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('errors')) {
          const store = db.createObjectStore('errors', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          store.createIndex('timestamp', 'timestamp');
        }
      };
      
      request.onsuccess = (event) => {
        this.offlineStorage = event.target.result;
        if (this.config.debug) {
          console.log('[ErrorCatcher] ✅ Offline storage initialized');
        }
        resolve();
      };
    });
  }

  /**
   * 发送待处理的错误
   */
  async sendPendingErrors() {
    if (!this.offlineStorage) return;
    
    const transaction = this.offlineStorage.transaction(['errors'], 'readonly');
    const store = transaction.objectStore('errors');
    const request = store.getAll();
    
    request.onsuccess = async () => {
      const pendingErrors = request.result;
      if (pendingErrors.length > 0) {
        if (this.config.debug) {
          console.log(`[ErrorCatcher] Found ${pendingErrors.length} pending errors`);
        }
        
        try {
          await this.sendToServer(pendingErrors);
          
          // 发送成功，清除缓存
          const clearTransaction = this.offlineStorage.transaction(['errors'], 'readwrite');
          const clearStore = clearTransaction.objectStore('errors');
          clearStore.clear();
        } catch (error) {
          if (this.config.debug) {
            console.warn('[ErrorCatcher] Failed to send pending errors');
          }
        }
      }
    };
  }

  /**
   * 存储错误到 IndexedDB
   */
  async storeErrorsToIndexedDB(errors) {
    if (!this.offlineStorage) return;
    
    const transaction = this.offlineStorage.transaction(['errors'], 'readwrite');
    const store = transaction.objectStore('errors');
    
    for (const error of errors) {
      store.add({
        ...error,
        timestamp: new Date().toISOString(),
        storedAt: Date.now()
      });
    }
    
    if (this.config.debug) {
      console.log(`[ErrorCatcher] Stored ${errors.length} errors to offline storage`);
    }
  }

  /**
   * 捕获错误
   */
  captureError(errorData) {
    // 采样
    if (Math.random() > this.config.sampleRate) {
      return;
    }

    // 错误去重
    if (this.config.enableDeduplication) {
      const fingerprint = this.generateFingerprint(errorData);
      const now = Date.now();
      const lastError = this.lastErrors.get(fingerprint);
      
      if (lastError && (now - lastError) < this.config.deduplicationTimeout) {
        if (this.config.debug) {
          console.log('[ErrorCatcher] Duplicate error suppressed:', fingerprint);
        }
        return;
      }
      
      this.lastErrors.set(fingerprint, now);
      
      // 清理过期的指纹
      if (this.lastErrors.size > 100) {
        const cutoff = now - 60000;
        for (const [key, time] of this.lastErrors.entries()) {
          if (time < cutoff) {
            this.lastErrors.delete(key);
          }
        }
      }
    }

    // 敏感信息过滤
    const sanitizedError = this.sanitizeData(errorData);

    // beforeSend 钩子
    if (this.config.beforeSend) {
      const modified = this.config.beforeSend(sanitizedError);
      if (modified === false) return;
      if (modified) sanitizedError = modified;
    }

    // 添加浏览器信息和用户设置的数据
    const enrichedError = {
      ...sanitizedError,
      projectId: this.config.projectId,
      apiKey: this.config.apiKey,
      environment: this.config.environment,
      release: this.config.release,
      ...(this.isBrowser && !sanitizedError.userAgent ? { userAgent: navigator.userAgent } : {}),
      ...(this.isBrowser && !sanitizedError.pageUrl ? { pageUrl: window.location.href } : {}),
      ...(this.isBrowser ? { 
        dom: this.captureDOMState(),
        browser: this.collectBrowserInfo(),
        network: this.collectNetworkInfo()
      } : {}),
      ...(this.config.user ? { user: this.config.user } : {}),
      ...(this.config.tags ? { tags: { ...this.config.tags, ...sanitizedError.tags } } : {}),
      ...(this.config.contexts ? { contexts: { ...this.config.contexts, ...sanitizedError.contexts } } : {}),
      ...(this.config.extra ? { extra: { ...this.config.extra, ...sanitizedError.extra } } : {}),
      ...(this.config.breadcrumbs && this.config.breadcrumbs.length > 0 ? { breadcrumbs: [...this.config.breadcrumbs] } : {})
    };

    this.errorQueue.push(enrichedError);

    if (this.config.onError) {
      this.config.onError(enrichedError);
    }

    if (this.config.debug) {
      console.log('[ErrorCatcher] Error captured:', enrichedError);
    }

    // 立即发送或批量发送
    if (this.errorQueue.length >= this.config.maxBatchSize) {
      this.sendBatch();
    }
  }

  /**
   * 捕获性能数据
   */
  capturePerformance(metrics) {
    this.captureError({
      type: 'performance',
      ...metrics,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 生成错误指纹
   */
  generateFingerprint(errorData) {
    const str = `${errorData.type}|${errorData.message}|${errorData.url || ''}|${errorData.lineno || ''}|${errorData.colno || ''}|${errorData.status || ''}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString();
  }

  /**
   * 敏感信息过滤
   */
  sanitizeData(data) {
    if (!data || typeof data !== 'object') return data;
    
    try {
      const sanitized = JSON.parse(JSON.stringify(data));
      const sanitize = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        
        for (const key of Object.keys(obj)) {
          const lowerKey = key.toLowerCase();
          if (this.config.sensitiveKeys.some(sk => lowerKey.includes(sk))) {
            obj[key] = '[REDACTED]';
          } else if (typeof obj[key] === 'object') {
            sanitize(obj[key]);
          }
        }
      };
      
      sanitize(sanitized);
      return sanitized;
    } catch (e) {
      return data;
    }
  }

  /**
   * 捕获 DOM 状态
   */
  captureDOMState() {
    if (!this.isBrowser) return null;

    try {
      return {
        documentReady: document.readyState,
        activeElement: document.activeElement?.tagName,
        activeElementId: document.activeElement?.id,
        activeElementClass: document.activeElement?.className,
        visibilityState: document.visibilityState,
        documentHeight: document.documentElement.scrollHeight,
        documentWidth: document.documentElement.scrollWidth,
        scrollPosition: {
          x: window.scrollX,
          y: window.scrollY
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * 收集浏览器信息
   */
  collectBrowserInfo() {
    if (!this.isBrowser) return null;

    try {
      const info = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages,
        platform: navigator.platform,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory,
        maxTouchPoints: navigator.maxTouchPoints,
        vendor: navigator.vendor,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        onLine: navigator.onLine
      };

      // 内存信息
      if (performance.memory) {
        info.memory = {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
      }

      // 性能信息
      try {
        const navTiming = performance.getEntriesByType('navigation')[0];
        if (navTiming) {
          info.performance = {
            navigationStart: navTiming.navigationStart,
            domContentLoadedEventEnd: navTiming.domContentLoadedEventEnd,
            loadEventEnd: navTiming.loadEventEnd,
            duration: navTiming.duration
          };
        }
      } catch (e) {
        // 忽略性能 API 错误
      }

      // 连接信息
      if (navigator.connection) {
        info.connection = {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt,
          saveData: navigator.connection.saveData,
          type: navigator.connection.type
        };
      }

      // 存储信息
      try {
        info.storage = {
          localStorage: this.getStorageSize('localStorage'),
          sessionStorage: this.getStorageSize('sessionStorage')
        };
      } catch (e) {
        // 忽略存储 API 错误
      }

      return info;
    } catch (e) {
      return null;
    }
  }

  /**
   * 收集网络信息
   */
  collectNetworkInfo() {
    if (!this.isBrowser) return null;

    try {
      return {
        online: navigator.onLine,
        type: navigator.connection?.type,
        effectiveType: navigator.connection?.effectiveType,
        downlink: navigator.connection?.downlink,
        rtt: navigator.connection?.rtt,
        saveData: navigator.connection?.saveData
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * 获取存储大小
   */
  getStorageSize(type) {
    try {
      const storage = window[type];
      let size = 0;
      let itemCount = 0;
      for (let key in storage) {
        if (storage.hasOwnProperty(key)) {
          size += (storage[key]?.length || 0) + (key?.length || 0);
          itemCount++;
        }
      }
      return { size, itemCount };
    } catch (e) {
      return null;
    }
  }

  /**
   * 手动上报错误
   */
  report(error, context = {}) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    this.captureError({
      type: context.type || 'manual',
      message: errorObj.message,
      stack: errorObj.stack,
      status: context.status || 0,
      statusText: context.statusText || 'Manual Error',
      url: context.url,
      method: context.method || 'MANUAL',
      pageUrl: context.pageUrl || (this.isBrowser ? window.location.href : ''),
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  /**
   * 批量发送
   */
  async sendBatch() {
    if (this.errorQueue.length === 0 || this.isSending) {
      return;
    }

    this.isSending = true;
    const batch = [...this.errorQueue];
    this.errorQueue = [];

    try {
      await this.sendToServer(batch);
      this.retryCount = 0;
      
      if (this.config.debug) {
        console.log('[ErrorCatcher] ✅ Batch sent:', batch.length, 'errors');
      }
    } catch (error) {
      console.error('[ErrorCatcher] Failed to send batch:', error);
      
      // 重试
      this.errorQueue.unshift(...batch);
      this.retryCount++;
      
      if (this.retryCount < this.config.maxRetries) {
        setTimeout(() => {
          this.isSending = false;
          this.sendBatch();
        }, 1000 * this.retryCount);
      } else if (this.config.enableOfflineStorage && this.offlineStorage) {
        // 重试失败，存储到离线存储
        await this.storeErrorsToIndexedDB(batch);
      }
    } finally {
      this.isSending = false;
    }
  }

  /**
   * 发送到服务器
   */
  async sendToServer(errors) {
    const payload = {
      errors: errors,
      batchSize: errors.length,
      sentAt: new Date().toISOString(),
      sdk: {
        name: 'ErrorCatcher',
        version: '2.0.0'
      }
    };

    if (this.config.debug) {
      console.log('[ErrorCatcher] Sending to server:', {
        url: this.config.reportUrl,
        errorCount: errors.length
      });
    }

    const headers = {
      'Content-Type': 'application/json',
      'X-Error-Report': 'true'
    };

    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }

    // 浏览器环境
    if (this.isBrowser) {
      const response = await fetch(this.config.reportUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
        keepalive: true
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    }
    
    // Node.js 环境
    else {
      if (this.config.fetch) {
        const response = await this.config.fetch(this.config.reportUrl, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      }
      
      throw new Error('No fetch implementation available for Node.js');
    }
  }

  /**
   * 启动批量发送定时器
   */
  startBatchSender() {
    this.batchSenderInterval = setInterval(() => {
      if (this.errorQueue.length > 0 && !this.isSending) {
        this.sendBatch();
      }
    }, this.config.delay);
  }

  /**
   * 判断是否应该忽略
   */
  shouldIgnore(url) {
    if (!url) return false;
    if (url.includes(this.config.reportUrl)) return true;
    
    return this.config.ignoreUrls.some(pattern => {
      if (typeof pattern === 'string') {
        return url.includes(pattern);
      }
      if (pattern instanceof RegExp) {
        return pattern.test(url);
      }
      return false;
    });
  }

  /**
   * 安全的 JSON 字符串化（防止循环引用）
   */
  safeStringify(obj, maxDepth = 2, currentDepth = 0) {
    if (currentDepth >= maxDepth) return '[Object]';
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;

    try {
      const seen = new WeakSet();
      return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        return value;
      });
    } catch (e) {
      return '[Stringify Error]';
    }
  }

  /**
   * 截断字符串
   */
  truncate(str, maxLength) {
    if (typeof str !== 'string') return str;
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '... [truncated]';
  }

  /**
   * 生成 curl 命令
   */
  generateCurlCommand(url, method, headers, body) {
    let curl = `curl -X ${method} '${url}'`;
    
    // 添加请求头
    if (headers && typeof headers === 'object') {
      for (const [key, value] of Object.entries(headers)) {
        // 跳过一些不必要的头和敏感信息
        if (['host', 'connection', 'content-length', 'authorization', 'cookie'].includes(key.toLowerCase())) {
          continue;
        }
        curl += ` \\\n  -H '${key}: ${value}'`;
      }
    }
    
    // 添加请求体
    if (body) {
      let bodyStr = body;
      if (typeof body === 'object') {
        try {
          bodyStr = JSON.stringify(body);
        } catch (e) {
          bodyStr = String(body);
        }
      }
      // 转义单引号
      bodyStr = bodyStr.replace(/'/g, "'\\''");
      curl += ` \\\n  -d '${bodyStr}'`;
    }
    
    return curl;
  }

  /**
   * 设置用户信息
   */
  setUser(user) {
    this.config.user = user;
    
    if (this.config.debug) {
      console.log('[ErrorCatcher] User set:', user);
    }
  }

  /**
   * 设置单个标签
   */
  setTag(key, value) {
    if (!this.config.tags) this.config.tags = {};
    this.config.tags[key] = value;
    
    if (this.config.debug) {
      console.log('[ErrorCatcher] Tag set:', key, value);
    }
  }

  /**
   * 批量设置标签
   */
  setTags(tags) {
    if (!this.config.tags) this.config.tags = {};
    Object.assign(this.config.tags, tags);
    
    if (this.config.debug) {
      console.log('[ErrorCatcher] Tags set:', tags);
    }
  }

  /**
   * 设置上下文
   */
  setContext(key, value) {
    if (!this.config.contexts) this.config.contexts = {};
    this.config.contexts[key] = value;
    
    if (this.config.debug) {
      console.log('[ErrorCatcher] Context set:', key, value);
    }
  }

  /**
   * 设置额外数据
   */
  setExtra(key, value) {
    if (!this.config.extra) this.config.extra = {};
    this.config.extra[key] = value;
    
    if (this.config.debug) {
      console.log('[ErrorCatcher] Extra set:', key, value);
    }
  }

  /**
   * 添加面包屑
   */
  addBreadcrumb(breadcrumb) {
    if (!this.config.breadcrumbs) this.config.breadcrumbs = [];
    
    const crumb = {
      timestamp: Date.now(),
      category: breadcrumb.category || 'default',
      message: breadcrumb.message || '',
      level: breadcrumb.level || 'info',
      data: this.sanitizeData(breadcrumb.data || {})
    };
    
    // 限制面包屑数量
    this.config.breadcrumbs.push(crumb);
    if (this.config.breadcrumbs.length > this.config.maxBreadcrumbs) {
      this.config.breadcrumbs.shift();
    }
    
    if (this.config.debug) {
      console.log('[ErrorCatcher] Breadcrumb added:', crumb);
    }
  }

  /**
   * 获取配置
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * 获取队列状态
   */
  getQueueStatus() {
    return {
      queueLength: this.errorQueue.length,
      isSending: this.isSending,
      retryCount: this.retryCount,
      lastErrorsSize: this.lastErrors.size
    };
  }

  /**
   * 清空队列
   */
  clearQueue() {
    this.errorQueue = [];
    this.lastErrors.clear();
    
    if (this.config.debug) {
      console.log('[ErrorCatcher] Queue cleared');
    }
  }

  /**
   * 销毁
   */
  destroy() {
    if (!this.isBrowser) return;

    // 清理定时器
    if (this.batchSenderInterval) {
      clearInterval(this.batchSenderInterval);
      this.batchSenderInterval = null;
    }
    
    // 清理事件监听
    window.removeEventListener('error', this.globalErrorHandler);
    window.removeEventListener('unhandledrejection', this.promiseRejectionHandler);

    // 恢复原始方法
    if (this.originalMethods) {
      window.fetch = this.originalMethods.fetch;
      XMLHttpRequest.prototype.open = this.originalMethods.xhrOpen;
      XMLHttpRequest.prototype.send = this.originalMethods.xhrSend;
    }

    // 关闭 IndexedDB 连接
    if (this.offlineStorage) {
      this.offlineStorage.close();
      this.offlineStorage = null;
    }

    this.initialized = false;

    if (this.config.debug) {
      console.log('[ErrorCatcher] Destroyed');
    }
  }
}

// UMD (Universal Module Definition) 导出
// 支持 CommonJS, AMD, ES6 Module 和浏览器全局变量
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS
    module.exports = factory();
  } else {
    // 浏览器全局变量
    root.ErrorCatcher = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  return ErrorCatcher;
}));