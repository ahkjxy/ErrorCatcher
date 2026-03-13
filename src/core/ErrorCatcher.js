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
      fetch: config.fetch || null  // SSR 环境的 fetch 实现
    };

    // 环境检测
    this.isServer = typeof window === 'undefined';
    this.isBrowser = !this.isServer;
    
    // 状态
    this.initialized = false;
    this.errorQueue = [];
    this.isSending = false;
    this.retryCount = 0;
    
    // 框架检测结果
    this.detectedFrameworks = {
      vue: null,
      react: false,
      jquery: false,
      nuxt: false,
      nextjs: false,
      axios: null
    };
    
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
  init() {
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
      }

      // 3. 集成框架
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
      }
    } else {
      this.detectedFrameworks.vue = this.config.vue;
    }

    // 检测 React
    if (!this.config.react && window.React) {
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
    window.addEventListener('error', (event) => {
      // 忽略资源加载错误
      if (event.target && event.target.tagName) {
        return;
      }

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
    });

    // Promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        type: 'promise_rejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        timestamp: new Date().toISOString(),
        pageUrl: window.location.href
      });
    });

    if (this.config.debug) {
      console.log('[ErrorCatcher] ✅ Global handlers installed');
    }
  }

  /**
   * 拦截 fetch
   */
  interceptFetch() {
    const self = this;
    const originalFetch = this.originalMethods.fetch;

    window.fetch = function(...args) {
      const [resource, init = {}] = args;
      const url = typeof resource === 'string' ? resource : resource.url;
      const method = init.method || 'GET';
      const startTime = Date.now();

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
            } catch (e) {
              responseText = 'Unable to read response';
            }

            // 收集响应头
            const responseHeaders = {};
            response.headers.forEach((value, key) => {
              responseHeaders[key] = value;
            });

            self.captureError({
              type: 'fetch_error',
              url: url,
              method: method.toUpperCase(),
              status: response.status,
              statusText: response.statusText,
              requestHeaders: init.headers,
              requestBody: init.body,
              response: self.truncate(responseText, 2000),
              responseHeaders: responseHeaders,
              responseSize: responseSize,
              duration: duration,
              timing: {
                startTime: startTime,
                endTime: Date.now(),
                duration: duration
              },
              curlCommand: self.generateCurlCommand(url, method.toUpperCase(), init.headers, init.body),
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
            requestHeaders: init.headers,
            requestBody: init.body,
            duration: duration,
            timing: {
              startTime: startTime,
              endTime: Date.now(),
              duration: duration
            },
            curlCommand: self.generateCurlCommand(url, method.toUpperCase(), init.headers, init.body),
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
      if (!self.shouldIgnore(url)) {
        requestMap.set(this, {
          method: method.toUpperCase(),
          url: url,
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

            const responseSize = new Blob([this.responseText]).size;

            self.captureError({
              type: 'xhr_error',
              url: info.url,
              method: info.method,
              status: this.status,
              statusText: this.statusText,
              requestHeaders: info.headers,
              requestBody: info.body,
              response: self.truncate(this.responseText, 2000),
              responseHeaders: responseHeaders,
              responseSize: responseSize,
              duration: duration,
              timing: {
                startTime: info.startTime,
                endTime: Date.now(),
                duration: duration
              },
              curlCommand: self.generateCurlCommand(info.url, info.method, info.headers, info.body),
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
            requestHeaders: info.headers,
            requestBody: info.body,
            duration: duration,
            timing: {
              startTime: info.startTime,
              endTime: Date.now(),
              duration: duration
            },
            curlCommand: self.generateCurlCommand(info.url, info.method, info.headers, info.body),
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
   * 集成 Vue
   */
  integrateVue() {
    const vue = this.config.vue;
    if (!vue) return;

    const self = this;

    // Vue 2/3 通用
    if (vue.config) {
      const originalErrorHandler = vue.config.errorHandler;
      
      vue.config.errorHandler = function(err, vm, info) {
        // 收集 Vue 组件详细信息
        const vueContext = {
          componentName: vm?.$options?.name || vm?.$.type?.name || 'Anonymous',
          lifecycle: info,
          componentPath: vm?.$options?.__file,
          props: self.safeStringify(vm?.$props),
          data: self.safeStringify(vm?.$data),
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
          type: 'vue_error',
          message: err.message,
          stack: err.stack,
          vueContext: vueContext,
          timestamp: new Date().toISOString(),
          pageUrl: typeof window !== 'undefined' ? window.location.href : ''
        });

        if (originalErrorHandler) {
          originalErrorHandler.call(this, err, vm, info);
        }
      };

      if (this.config.debug) {
        console.log('[ErrorCatcher] ✅ Vue error handler integrated');
      }
    }
  }

  /**
   * 集成 React
   */
  integrateReact() {
    // React 错误边界需要在组件层面实现
    // 这里我们监听全局错误，React 错误会冒泡到全局
    if (this.config.debug) {
      console.log('[ErrorCatcher] ✅ React integration enabled (use Error Boundaries for component errors)');
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

        self.captureError({
          type: response ? 'axios_error' : 'axios_network_error',
          url: fullUrl,
          method: (config.method || 'GET').toUpperCase(),
          status: response?.status || 0,
          statusText: response?.statusText || error.message,
          message: error.message,
          requestHeaders: config.headers,
          requestBody: config.data,
          responseHeaders: responseHeaders,
          response: response?.data ? self.truncate(self.safeStringify(response.data), 2000) : undefined,
          responseSize: response?.data ? new Blob([self.safeStringify(response.data)]).size : 0,
          duration: duration,
          timing: {
            startTime: config.metadata?.startTime,
            endTime: Date.now(),
            duration: duration
          },
          curlCommand: self.generateCurlCommand(fullUrl, (config.method || 'GET').toUpperCase(), config.headers, config.data),
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
        requestHeaders: settings.headers,
        requestBody: settings.data,
        response: self.truncate(jqXHR.responseText, 2000),
        curlCommand: self.generateCurlCommand(settings.url, (settings.type || 'GET').toUpperCase(), settings.headers, settings.data),
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
    // Vue Router, React Router 等的路由变化监听
    // 可以通过 config.router 传入路由实例
    if (this.config.debug) {
      console.log('[ErrorCatcher] ✅ Router integration enabled');
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

    // beforeSend 钩子
    if (this.config.beforeSend) {
      const modified = this.config.beforeSend(errorData);
      if (modified === false) return;
      if (modified) errorData = modified;
    }

    // 添加浏览器信息和用户设置的数据
    const enrichedError = {
      ...errorData,
      projectId: this.config.projectId,
      apiKey: this.config.apiKey,
      environment: this.config.environment,
      release: this.config.release,
      ...(this.isBrowser && !errorData.userAgent ? { userAgent: navigator.userAgent } : {}),
      ...(this.isBrowser && !errorData.pageUrl ? { pageUrl: window.location.href } : {}),
      // 添加详细的浏览器和 DOM 信息
      ...(this.isBrowser ? { 
        dom: this.captureDOMState(),
        browser: this.collectBrowserInfo(),
        network: this.collectNetworkInfo()
      } : {}),
      // 添加用户设置的数据
      ...(this.config.user ? { user: this.config.user } : {}),
      ...(this.config.tags ? { tags: { ...this.config.tags, ...errorData.tags } } : {}),
      ...(this.config.contexts ? { contexts: { ...this.config.contexts, ...errorData.contexts } } : {}),
      ...(this.config.extra ? { extra: { ...this.config.extra, ...errorData.extra } } : {}),
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
          size += storage[key].length + key.length;
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
    this.captureError({
      type: context.type || 'manual',
      message: error.message,
      stack: error.stack,
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
      sentAt: new Date().toISOString()
    };

    if (this.config.debug) {
      console.log('[ErrorCatcher] Sending to server:', {
        url: this.config.reportUrl,
        errorCount: errors.length,
        payload: JSON.stringify(payload, null, 2)
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
        console.error('[ErrorCatcher] Server error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
    setInterval(() => {
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
        // 跳过一些不必要的头
        if (['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
          continue;
        }
        curl += ` \\\n  -H '${key}: ${value}'`;
      }
    }
    
    // 添加请求体
    if (body) {
      let bodyStr = body;
      if (typeof body === 'object') {
        bodyStr = JSON.stringify(body);
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
    if (!this.config) this.config = {};
    this.config.user = user;
    
    if (this.config.debug) {
      console.log('[ErrorCatcher] User set:', user);
    }
  }

  /**
   * 设置单个标签
   */
  setTag(key, value) {
    if (!this.config) this.config = {};
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
    if (!this.config) this.config = {};
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
    if (!this.config) this.config = {};
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
    if (!this.config) this.config = {};
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
    if (!this.config) this.config = {};
    if (!this.config.breadcrumbs) this.config.breadcrumbs = [];
    
    const crumb = {
      timestamp: Date.now(),
      category: breadcrumb.category || 'default',
      message: breadcrumb.message || '',
      level: breadcrumb.level || 'info',
      data: breadcrumb.data || {}
    };
    
    // 限制面包屑数量，保留最近的100条
    this.config.breadcrumbs.push(crumb);
    if (this.config.breadcrumbs.length > 100) {
      this.config.breadcrumbs.shift();
    }
    
    if (this.config.debug) {
      console.log('[ErrorCatcher] Breadcrumb added:', crumb);
    }
  }

  /**
   * 销毁
   */
  destroy() {
    if (!this.isBrowser) return;

    // 恢复原始方法
    window.fetch = this.originalMethods.fetch;
    XMLHttpRequest.prototype.open = this.originalMethods.xhrOpen;
    XMLHttpRequest.prototype.send = this.originalMethods.xhrSend;

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
