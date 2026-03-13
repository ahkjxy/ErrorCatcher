<template>
  <div class="relative" ref="dropdownRef">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
    >
      <div class="flex-1 min-w-0">
        <div class="text-xs text-gray-500 mb-0.5">项目</div>
        <div class="text-sm font-semibold text-gray-900 truncate">
          {{ currentProject?.name || '选择项目' }}
        </div>
      </div>
      <svg
        class="w-4 h-4 text-gray-600 transition-transform flex-shrink-0"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- 下拉菜单 -->
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-sentry-lg border border-gray-200 py-1 z-50 max-h-64 overflow-y-auto scrollbar-thin"
      >
        <!-- 搜索框 -->
        <div class="px-3 py-2 border-b border-gray-200">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索项目..."
            class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            @click.stop
          />
        </div>

        <!-- 全部项目选项 -->
        <button
          @click="selectProject(null)"
          class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
          :class="{ 'bg-primary-50 text-primary-700': !currentProject }"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span class="font-medium">全部项目</span>
        </button>

        <!-- 项目列表 -->
        <button
          v-for="project in filteredProjects"
          :key="project._id"
          @click="selectProject(project)"
          class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between gap-2"
          :class="{ 'bg-primary-50 text-primary-700': currentProject?._id === project._id }"
        >
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <div class="w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0" :style="{ backgroundColor: getProjectColor(project) }">
              {{ project.name.charAt(0).toUpperCase() }}
            </div>
            <span class="truncate">{{ project.name }}</span>
          </div>
          <svg
            v-if="currentProject?._id === project._id"
            class="w-4 h-4 text-primary-600 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- 空状态 -->
        <div v-if="filteredProjects.length === 0" class="px-4 py-8 text-center text-gray-500 text-sm">
          <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>未找到项目</p>
        </div>

        <!-- 创建新项目 -->
        <div class="border-t border-gray-200 mt-1">
          <router-link
            to="/projects"
            class="w-full px-4 py-2 text-left text-sm text-primary-600 hover:bg-primary-50 transition-colors flex items-center gap-2 font-medium"
            @click="isOpen = false"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>管理项目</span>
          </router-link>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useProjectStore } from '@/stores/project';

const projectStore = useProjectStore();
const isOpen = ref(false);
const searchQuery = ref('');
const dropdownRef = ref(null);

const emit = defineEmits(['change']);

const currentProject = computed(() => projectStore.currentProject);

const filteredProjects = computed(() => {
  if (!searchQuery.value) {
    return projectStore.projects;
  }
  return projectStore.projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const selectProject = (project) => {
  projectStore.setCurrentProject(project);
  emit('change', project);
  isOpen.value = false;
  searchQuery.value = '';
};

const getProjectColor = (project) => {
  // 根据项目名称生成颜色
  const colors = [
    '#9333ea', '#d946ef', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f97316', '#f43f5e'
  ];
  const index = project.name.charCodeAt(0) % colors.length;
  return colors[index];
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  // 加载项目列表
  if (projectStore.projects.length === 0) {
    projectStore.fetchProjects();
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
