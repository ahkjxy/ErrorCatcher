<template>
  <div class="realtime-indicator flex items-center gap-2">
    <!-- 连接状态指示器 -->
    <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" :class="statusClass">
      <div class="relative">
        <div
          class="w-2 h-2 rounded-full"
          :class="dotClass"
        ></div>
        <div
          v-if="connected"
          class="absolute inset-0 w-2 h-2 rounded-full animate-ping"
          :class="dotClass"
        ></div>
      </div>
      <span class="text-xs font-medium">
        {{ statusText }}
      </span>
    </div>
    
    <!-- 新通知数量 -->
    <div
      v-if="notificationCount > 0"
      class="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full cursor-pointer hover:bg-red-600 transition-colors"
      @click="$emit('show-notifications')"
    >
      {{ notificationCount > 99 ? '99+' : notificationCount }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  connected: {
    type: Boolean,
    default: false
  },
  reconnecting: {
    type: Boolean,
    default: false
  },
  notificationCount: {
    type: Number,
    default: 0
  }
});

defineEmits(['show-notifications']);

const statusClass = computed(() => {
  if (props.reconnecting) {
    return 'bg-yellow-50 text-yellow-700';
  }
  if (props.connected) {
    return 'bg-green-50 text-green-700';
  }
  return 'bg-gray-100 text-gray-600';
});

const dotClass = computed(() => {
  if (props.reconnecting) {
    return 'bg-yellow-500';
  }
  if (props.connected) {
    return 'bg-green-500';
  }
  return 'bg-gray-400';
});

const statusText = computed(() => {
  if (props.reconnecting) {
    return '重连中...';
  }
  if (props.connected) {
    return '实时';
  }
  return '离线';
});
</script>

<style scoped>
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
