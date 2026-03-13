<template>
  <div id="app">
    <h1>Vue 3 ErrorCatcher Example</h1>
    
    <div class="info">
      <p>这个示例展示了如何在 Vue 3 项目中使用 ErrorCatcher。</p>
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
</template>

<script setup>
import { ref, inject } from 'vue';

const errorTracker = inject('errorTracker');
const errorCount = ref(0);

const triggerJsError = () => {
  throw new Error('这是一个测试 JS 错误');
};

const triggerPromiseError = () => {
  Promise.reject(new Error('这是一个测试 Promise 错误'));
};

const triggerApiError = async () => {
  try {
    await fetch('http://localhost:3001/api/not-found');
  } catch (error) {
    console.error('API Error:', error);
  }
};

const manualReport = () => {
  errorTracker.report(new Error('手动上报的错误'), {
    component: 'App',
    action: 'manualReport',
    timestamp: new Date().toISOString()
  });
  errorCount.value++;
  alert('错误已手动上报！');
};
</script>

<style scoped>
#app {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
}

.info {
  background: #e3f2fd;
  padding: 15px;
  border-radius: 4px;
  margin: 20px 0;
}

.buttons {
  margin: 20px 0;
}

button {
  margin: 10px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
}

button:hover {
  background: #1565c0;
}

.status {
  margin-top: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
}
</style>
