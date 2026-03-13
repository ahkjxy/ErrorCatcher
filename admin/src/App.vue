<template>
  <div>
    <!-- 环境指示器 -->
    <EnvIndicator />
    
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import EnvIndicator from '@/components/EnvIndicator.vue';
import { usePageTitle } from '@/composables/usePageTitle';

// 初始化页面标题i18n
onMounted(() => {
  usePageTitle();
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  height: 100vh;
}
</style>
