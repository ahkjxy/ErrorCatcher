<template>
  <div class="flex items-center justify-center" :class="containerClass">
    <div class="text-center">
      <!-- 加载动画 -->
      <div class="inline-block">
        <div
          class="spinner"
          :class="spinnerSizeClass"
          :style="{ borderTopColor: color }"
        ></div>
      </div>

      <!-- 加载文本 -->
      <p v-if="text" class="mt-4 text-sm font-medium" :class="textColorClass">
        {{ text }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  text: {
    type: String,
    default: '加载中...'
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  color: {
    type: String,
    default: '#9333ea' // primary-600
  },
  fullscreen: {
    type: Boolean,
    default: false
  }
});

const containerClass = computed(() => {
  if (props.fullscreen) {
    return 'min-h-screen';
  }
  return 'py-12';
});

const spinnerSizeClass = computed(() => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };
  return sizes[props.size];
});

const textColorClass = computed(() => {
  return 'text-gray-600';
});
</script>
