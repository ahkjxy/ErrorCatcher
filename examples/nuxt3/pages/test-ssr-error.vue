<template>
  <div class="container">
    <div class="hero">
      <h1 class="title">🔥 SSR 错误测试页面</h1>
      <p class="subtitle">此页面会在服务端渲染时触发错误</p>
    </div>

    <div class="error-box">
      <h2>如果你看到这个内容...</h2>
      <p>说明错误处理有问题，因为这个页面应该在服务端就抛出错误</p>
      <p>正常情况下，你应该看到 Nuxt 的错误页面</p>
    </div>

    <NuxtLink to="/" class="back-link">← 返回首页</NuxtLink>
  </div>
</template>

<script setup>
// 在服务端渲染时触发错误
if (process.server) {
  console.log('[SSR Error Test] 准备触发服务端错误...')
  
  // 使用 throw 直接抛出错误，这样会被 Nuxt 的错误处理捕获
  throw createError({
    statusCode: 500,
    statusMessage: 'SSR Test Error',
    message: 'Cannot read properties of null (reading "property") - 这是一个测试 SSR 错误',
    fatal: true
  })
}
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.hero {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-size: 48px;
  font-weight: 700;
  color: #e74c3c;
  margin-bottom: 16px;
}

.subtitle {
  font-size: 20px;
  color: #7f8c8d;
}

.error-box {
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  text-align: center;
}

.error-box h2 {
  color: #856404;
  margin-bottom: 16px;
}

.error-box p {
  color: #856404;
  margin-bottom: 8px;
}

.back-link {
  display: inline-block;
  padding: 12px 24px;
  background: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
}

.back-link:hover {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}
</style>


<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.hero {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-size: 48px;
  font-weight: 700;
  color: #e74c3c;
  margin-bottom: 16px;
}

.subtitle {
  font-size: 20px;
  color: #7f8c8d;
}

.error-box {
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  text-align: center;
}

.error-box h2 {
  color: #856404;
  margin-bottom: 16px;
}

.error-box p {
  color: #856404;
  margin-bottom: 8px;
}

.back-link {
  display: inline-block;
  padding: 12px 24px;
  background: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
}

.back-link:hover {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}
</style>
