<template>
  <div class="tag-cloud">
    <div v-if="tags.length === 0" class="text-center py-12 text-gray-500">
      暂无标签数据
    </div>
    
    <div v-else class="flex flex-wrap gap-3 items-center justify-center p-6">
      <button
        v-for="tag in sortedTags"
        :key="tag._id.key + tag._id.value"
        :style="getTagStyle(tag.count)"
        class="tag-item px-4 py-2 rounded-full transition-all duration-200 hover:shadow-lg transform hover:scale-110"
        :class="getTagClass(tag.count)"
        @click="$emit('tag-click', tag)"
      >
        <span class="font-medium">{{ tag._id.key }}</span>
        <span class="opacity-75">: {{ tag._id.value }}</span>
        <span class="ml-2 text-xs opacity-60">({{ tag.count }})</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  tags: {
    type: Array,
    default: () => []
  },
  maxSize: {
    type: Number,
    default: 24
  },
  minSize: {
    type: Number,
    default: 12
  }
});

defineEmits(['tag-click']);

const sortedTags = computed(() => {
  return [...props.tags].sort((a, b) => b.count - a.count);
});

const maxCount = computed(() => {
  if (props.tags.length === 0) return 1;
  return Math.max(...props.tags.map(t => t.count));
});

const minCount = computed(() => {
  if (props.tags.length === 0) return 1;
  return Math.min(...props.tags.map(t => t.count));
});

const getTagStyle = (count) => {
  const range = maxCount.value - minCount.value || 1;
  const normalized = (count - minCount.value) / range;
  const size = props.minSize + normalized * (props.maxSize - props.minSize);
  
  return {
    fontSize: `${size}px`,
    opacity: 0.7 + normalized * 0.3
  };
};

const getTagClass = (count) => {
  const range = maxCount.value - minCount.value || 1;
  const normalized = (count - minCount.value) / range;
  
  if (normalized > 0.75) {
    return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
  } else if (normalized > 0.5) {
    return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
  } else if (normalized > 0.25) {
    return 'bg-green-100 text-green-800 hover:bg-green-200';
  } else {
    return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};
</script>

<style scoped>
.tag-cloud {
  @apply min-h-48;
}

.tag-item {
  @apply cursor-pointer select-none;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
