<template>
  <div
    v-if="showIndicator"
    class="fixed top-0 right-0 z-50 px-3 py-1 text-xs font-bold text-white rounded-bl-lg shadow-lg"
    :class="envClass"
  >
    {{ envConfig.envLabel }}环境
  </div>
</template>

<script setup>
import { computed } from 'vue';
import envConfig from '@/config/env';

// 是否显示环境指示器（生产环境不显示）
const showIndicator = computed(() => !envConfig.isProd);

// 环境样式
const envClass = computed(() => {
  const classMap = {
    development: 'bg-green-600',
    test: 'bg-blue-600',
    pre: 'bg-yellow-600',
    production: 'bg-red-600'
  };
  return classMap[envConfig.env] || 'bg-gray-600';
});
</script>
