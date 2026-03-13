<template>
  <div class="breadcrumb-timeline">
    <div v-if="breadcrumbs.length === 0" class="text-center py-12 text-gray-500">
      暂无面包屑数据
    </div>
    
    <div v-else class="relative">
      <!-- 时间轴线 -->
      <div class="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
      
      <!-- 面包屑项 -->
      <div
        v-for="(crumb, index) in breadcrumbs"
        :key="index"
        class="relative pl-16 pb-8 last:pb-0"
      >
        <!-- 时间轴节点 -->
        <div
          class="absolute left-4 w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
          :class="getMarkerClass(crumb.level)"
        >
          <component :is="getIcon(crumb.category)" class="w-3 h-3 text-white" />
        </div>
        
        <!-- 内容卡片 -->
        <div
          class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
          @click="toggleExpand(index)"
        >
          <!-- 头部 -->
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-medium text-gray-500 uppercase">
                  {{ crumb.category }}
                </span>
                <span
                  :class="getLevelBadgeClass(crumb.level)"
                  class="text-xs px-2 py-0.5 rounded"
                >
                  {{ crumb.level }}
                </span>
              </div>
              <div class="text-sm font-medium text-gray-900">
                {{ crumb.message }}
              </div>
            </div>
            <div class="text-xs text-gray-500 whitespace-nowrap ml-4">
              {{ formatTime(crumb.timestamp) }}
            </div>
          </div>
          
          <!-- 展开的详细数据 -->
          <div
            v-if="expandedItems.includes(index) && crumb.data && Object.keys(crumb.data).length > 0"
            class="mt-3 pt-3 border-t border-gray-100"
          >
            <div class="text-xs text-gray-600 space-y-1">
              <div v-for="(value, key) in crumb.data" :key="key" class="flex">
                <span class="font-medium text-gray-700 min-w-24">{{ key }}:</span>
                <span class="text-gray-600 break-all">{{ formatValue(value) }}</span>
              </div>
            </div>
          </div>
          
          <!-- 展开指示器 -->
          <div
            v-if="crumb.data && Object.keys(crumb.data).length > 0"
            class="mt-2 text-xs text-primary-600 hover:text-primary-700"
          >
            {{ expandedItems.includes(index) ? '收起详情' : '查看详情' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import dayjs from 'dayjs';

const props = defineProps({
  breadcrumbs: {
    type: Array,
    default: () => []
  }
});

const expandedItems = ref([]);

const toggleExpand = (index) => {
  const idx = expandedItems.value.indexOf(index);
  if (idx > -1) {
    expandedItems.value.splice(idx, 1);
  } else {
    expandedItems.value.push(index);
  }
};

const getIcon = (category) => {
  const icons = {
    'ui.click': {
      template: `
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      `
    },
    'navigation': {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      `
    },
    'console': {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      `
    },
    'http': {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      `
    },
    'default': {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `
    }
  };
  
  return icons[category] || icons.default;
};

const getMarkerClass = (level) => {
  const classes = {
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
    debug: 'bg-gray-400'
  };
  return classes[level] || classes.info;
};

const getLevelBadgeClass = (level) => {
  const classes = {
    error: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    debug: 'bg-gray-100 text-gray-800'
  };
  return classes[level] || classes.info;
};

const formatTime = (timestamp) => {
  return dayjs(timestamp).format('HH:mm:ss.SSS');
};

const formatValue = (value) => {
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
};
</script>

<style scoped>
.breadcrumb-timeline {
  @apply py-4;
}
</style>
