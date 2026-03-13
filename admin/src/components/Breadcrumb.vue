<template>
  <nav class="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
    <router-link
      v-for="(item, index) in items"
      :key="index"
      :to="item.to"
      :class="[
        'flex items-center transition-colors',
        index === items.length - 1
          ? 'text-gray-900 font-medium'
          : 'text-gray-500 hover:text-gray-700'
      ]"
    >
      <svg
        v-if="index > 0"
        class="w-4 h-4 mx-2 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span>{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
    // items: [{ label: 'Home', to: '/' }, { label: 'Projects', to: '/projects' }]
  }
});
</script>
