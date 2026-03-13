const ErrorCatcherPlugin = require('../../adapters/vue2');

Vue.use(ErrorCatcherPlugin, {
  reportUrl: 'http://localhost:3001/api/errors/report',
  projectId: '69a69b5a6b650638ebe3d896',
  apiKey: 'ec_af9d006b050643d3bd21b39984a4a8172557279feac2d4e95005dfc997ecdf37',
  environment: 'development',
  debug: true
});

new Vue({
  el: '#app',
  data: {
    errorCount: 0
  },
  template: `
    <div id="app">
      <h1>Vue 2 ErrorCatcher Example</h1>
      
      <div class="info">
        <p>这个示例展示了如何在 Vue 2 项目中使用 ErrorCatcher。</p>
        <p>打开浏览器控制台查看错误捕获日志。</p>
      </div>

      <div class="buttons">
        <button @click="triggerJsError">触发 JS 错误</button>
        <button @click="triggerPromiseError">触发 Promise 错误</button>
        <button @click="triggerApiError">触发 API 错误</button>
        <button @click="manualReport">手动上报</button>
      </div>

      <div class="status">
        <p>错误已捕获: {{ errorCount }}</p>
      </div>
    </div>
  `,
  methods: {
    triggerJsError() {
      throw new Error('这是一个测试 JS 错误');
    },
    
    triggerPromiseError() {
      Promise.reject(new Error('这是一个测试 Promise 错误'));
    },
    
    async triggerApiError() {
      try {
        await fetch('http://localhost:3001/api/not-found');
      } catch (error) {
        console.error('API Error:', error);
      }
    },
    
    manualReport() {
      this.$errorTracker.report(new Error('手动上报的错误'), {
        component: 'App',
        action: 'manualReport'
      });
      this.errorCount++;
      alert('错误已手动上报！');
    }
  }
});
