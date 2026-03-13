<template>
  <span
    :class="[
      'badge',
      variantClass,
      sizeClass,
      { 'cursor-pointer hover:opacity-80': clickable }
    ]"
    @click="handleClick"
  >
    <span v-if="icon || $slots.icon" class="mr-1">
      <slot name="icon">{{ icon }}</slot>
    </span>
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => [
      'default', 'primary', 'success', 'warning', 'danger', 'info',
      'purple', 'pink', 'blue', 'green', 'yellow', 'red', 'gray'
    ].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  icon: {
    type: String,
    default: ''
  },
  clickable: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);

const variantClass = computed(() => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 border border-gray-200',
    primary: 'bg-primary-100 text-primary-800 border border-primary-200',
    success: 'bg-success-100 text-success-800 border border-success-200',
    warning: 'bg-warning-100 text-warning-800 border border-warning-200',
    danger: 'bg-danger-100 text-danger-800 border border-danger-200',
    info: 'bg-info-100 text-info-800 border border-info-200',
    purple: 'bg-purple-100 text-purple-800 border border-purple-200',
    pink: 'bg-pink-100 text-pink-800 border border-pink-200',
    blue: 'bg-blue-100 text-blue-800 border border-blue-200',
    green: 'bg-green-100 text-green-800 border border-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    red: 'bg-red-100 text-red-800 border border-red-200',
    gray: 'bg-gray-100 text-gray-800 border border-gray-200',
  };
  return variants[props.variant];
});

const sizeClass = computed(() => {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };
  return sizes[props.size];
});

const handleClick = () => {
  if (props.clickable) {
    emit('click');
  }
};
</script>
