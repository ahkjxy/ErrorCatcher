<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-icon">
        <span v-if="error.statusCode === 404">🔍</span>
        <span v-else>🚨</span>
      </div>
      
      <h1 class="error-title">
        {{ error.statusCode === 404 ? '页面未找到' : '服务器错误' }}
      </h1>
      
      <p class="error-code">错误代码: {{ error.statusCode || 500 }}</p>
      
      <div class="error-message">
        <p><strong>错误信息:</strong></p>
        <p class="message-text">{{ error.message || '发生了一个未知错误' }}</p>
      </div>
      
      <div v-if="error.statusMessage" class="error-status">
        <p><strong>状态:</strong> {{ error.statusMessage }}</p>
      </div>
      
      <div class="error-info">
        <p class="info-text">
          <span v-if="error.statusCode === 404">
            您访问的页面不存在，可能已被删除或移动。
          </span>
          <span v-else>
            ✅ 此错误已被 ErrorCatcher 自动捕获并上报到后端。
          </span>
        </p>
        <p class="info-text">
          您可以查看后端管理界面来查看错误详情。
        </p>
      </div>
      
      <div class="error-actions">
        <button @click="handleError" class="btn btn-primary">
          返回首页
        </button>
        <button @click="goBack" class="btn btn-secondary">
          返回上一页
        </button>
      </div>
      
      <div v-if="showDetails" class="error-details">
        <h3>技术详情</h3>
        <pre>{{ JSON.stringify(error, null, 2) }}</pre>
      </div>
      
      <button @click="showDetails = !showDetails" class="toggle-details">
        {{ showDetails ? '隐藏' : '显示' }}技术详情
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: Object
})

const showDetails = ref(false)

const handleError = () => {
  clearError({ redirect: '/' })
}

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    handleError()
  }
}

// 在客户端记录错误（不再手动上报，因为服务端已经上报）
onMounted(() => {
  console.error('[Error Page] 捕获到错误:', props.error)
  console.log('[Error Page] 此错误已在服务端通过 ErrorCatcher 上报')
})
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.error-container {
  max-width: 600px;
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.error-icon {
  font-size: 80px;
  margin-bottom: 24px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.error-title {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 16px;
}

.error-code {
  font-size: 18px;
  color: #e74c3c;
  font-weight: 600;
  margin-bottom: 24px;
}

.error-message {
  background: #f8f9fa;
  border-left: 4px solid #e74c3c;
  padding: 16px;
  margin-bottom: 24px;
  text-align: left;
  border-radius: 4px;
}

.error-message p {
  margin: 8px 0;
}

.message-text {
  color: #555;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  word-break: break-word;
}

.error-status {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 12px;
  margin-bottom: 24px;
  text-align: left;
  border-radius: 4px;
}

.error-info {
  background: #d1ecf1;
  border-left: 4px solid #17a2b8;
  padding: 16px;
  margin-bottom: 32px;
  text-align: left;
  border-radius: 4px;
}

.info-text {
  color: #0c5460;
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 24px;
}

.btn {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.toggle-details {
  background: transparent;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.toggle-details:hover {
  background: #f8f9fa;
  border-color: #999;
}

.error-details {
  margin-top: 24px;
  text-align: left;
  background: #2c3e50;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
}

.error-details h3 {
  color: white;
  margin-bottom: 12px;
  font-size: 16px;
}

.error-details pre {
  color: #ecf0f1;
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
