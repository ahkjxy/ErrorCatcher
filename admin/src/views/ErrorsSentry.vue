<template>
  <div class="h-full flex flex-col bg-white">
    <!-- 页面头部 -->
    <div class="border-b border-gray-200">
      <div class="px-6 py-4">
        <h1 class="text-2xl font-bold text-gray-900">{{ t('errors.title') }}</h1>
        <p class="text-sm text-gray-600 mt-1">{{ t('errors.subtitle') }}</p>
      </div>

      <!-- 筛选栏 -->
      <div class="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div class="flex items-center gap-3 flex-wrap">
          <!-- 项目筛选 -->
          <select v-model="filters.projectId" class="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-purple-500">
            <option value="">{{ t('notifications.allProjects') }}</option>
            <option v-for="project in projects" :key="project._id" :value="project._id">
              {{ project.name }}
            </option>
          </select>

          <!-- 类型筛选 -->
          <select v-model="filters.type" class="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-purple-500">
            <option value="">{{ t('notifications.allTypes') }}</option>
            <option value="vue_error">Vue</option>
            <option value="global_error">JS</option>
            <option value="promise_rejection">Promise</option>
            <option value="axios_error">API (Axios)</option>
            <option value="fetch_error">API (Fetch)</option>
            <option value="xhr_error">API (XHR)</option>
            <option value="manual">Manual Report</option>
          </select>

          <!-- 级别筛选 -->
          <select v-model="filters.level" class="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-purple-500">
            <option value="">{{ t('alerts.all') }}</option>
            <option value="error">{{ t('errors.level.error') }}</option>
            <option value="warning">{{ t('errors.level.warning') }}</option>
            <option value="info">{{ t('errors.level.info') }}</option>
          </select>

          <!-- 状态筛选 -->
          <select v-model="filters.resolved" class="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-purple-500">
            <option value="">{{ t('notifications.allStatus') }}</option>
            <option value="false">{{ t('errors.unresolved') }}</option>
            <option value="true">{{ t('errors.resolved') }}</option>
          </select>

          <!-- 搜索 -->
          <input
            v-model="filters.search"
            type="text"
            :placeholder="t('common.search') + '...'"
            class="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-purple-500 w-64"
          />

          <div class="flex-1"></div>

          <!-- 刷新按钮 -->
          <button
            @click="fetchErrors"
            class="px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Errors 列表 -->
    <div class="flex-1 overflow-y-auto">
      <!-- 加载状态 -->
      <div v-if="loading" class="p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p class="mt-2 text-sm text-gray-500">{{ t('common.loading') }}</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="errors.length === 0" class="p-12 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">{{ t('errors.noErrors') }}</h3>
        <p class="text-gray-500">{{ t('dashboard.noData') }}</p>
      </div>

      <!-- Errors 列表 -->
      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="error in errors"
          :key="error._id"
          class="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
          @click="viewError(error._id)"
        >
          <div class="flex items-start gap-4">
            <!-- Error 内容 -->
            <div class="flex-1 min-w-0">
              <!-- 标题行 -->
              <div class="flex items-center gap-2 mb-1">
                <span
                  class="px-2 py-0.5 text-xs font-medium rounded"
                  :class="getTypeClass(error.type)"
                >
                  {{ getTypeIcon(error.type) }} {{ getTypeLabel(error.type) }}
                </span>
                <span
                  class="px-2 py-0.5 text-xs font-medium rounded"
                  :class="{
                    'bg-red-100 text-red-800': error.level === 'error',
                    'bg-yellow-100 text-yellow-800': error.level === 'warning',
                    'bg-blue-100 text-blue-800': error.level === 'info'
                  }"
                >
                  {{ error.level.toUpperCase() }}
                </span>
              </div>

              <!-- 错误消息 -->
              <h3 class="text-sm font-medium text-gray-900 mb-1 truncate">
                {{ error.message }}
              </h3>

              <!-- 详情行 -->
              <div class="text-xs text-gray-500 font-mono mb-2 truncate">
                {{ error.stack?.split('\n')[0] || error.filename }}
              </div>

              <!-- 统计行 -->
              <div class="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                <!-- 项目名称 -->
                <span v-if="error.projectId?.name" class="flex items-center gap-1 text-purple-600 font-medium">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  {{ error.projectId.name }}
                </span>
                
                <!-- 项目负责人 -->
                <span v-if="error.projectId?.owner" class="flex items-center gap-1 text-gray-600" :title="`${t('projects.owner')}: ${error.projectId.owner.email || error.projectId.owner.username}`">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ t('projects.owner') }}: {{ error.projectId.owner.username }}
                </span>
                
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ formatTime(error.lastOccurred) }}
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  {{ error.count }} {{ t('dashboard.events') }}
                </span>
                <span v-if="error.curlCommand" class="flex items-center gap-1 text-purple-600" title="cURL command available">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  cURL
                </span>
              </div>
            </div>

            <!-- 状态标签 -->
            <div class="flex-shrink-0 text-right">
              <span
                v-if="error.resolved"
                class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded block"
              >
                {{ t('errors.resolved') }}
              </span>
              <span v-if="error.resolved && error.resolvedBy" class="text-xs text-gray-500 mt-1 block">
                by {{ error.resolvedBy }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="!loading && errors.length > 0" class="border-t border-gray-200 px-6 py-3 bg-gray-50">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="text-sm text-gray-700">
            {{ t('errors.showing') }} {{ (pagination.page - 1) * pagination.pageSize + 1 }} {{ t('errors.to') }} 
            {{ Math.min(pagination.page * pagination.pageSize, pagination.total) }} {{ t('errors.of') }} 
            {{ pagination.total }} {{ t('errors.errors') }}
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">{{ t('errors.perPage') }}:</label>
            <select 
              v-model.number="pagination.pageSize" 
              @change="changePageSize"
              class="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-purple-500"
            >
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            @click="prevPage"
            :disabled="pagination.page === 1"
            class="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ t('errors.previous') }}
          </button>
          <button
            @click="nextPage"
            :disabled="pagination.page * pagination.pageSize >= pagination.total"
            class="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ t('errors.next') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/project';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';
import i18n from '@/i18n';

dayjs.extend(relativeTime);
dayjs.locale(i18n.global.locale.value === 'zh' ? 'zh-cn' : 'en');

// 监听语言变化
watch(() => i18n.global.locale.value, (newLocale) => {
  dayjs.locale(newLocale === 'zh' ? 'zh-cn' : 'en');
});

const router = useRouter();
const projectStore = useProjectStore();

const loading = ref(false);
const errors = ref([]);
const projects = ref([]);

const filters = reactive({
  projectId: '',
  type: '',
  level: '',
  resolved: '',
  search: ''
});

const pagination = reactive({
  page: 1,
  pageSize: 25,
  total: 0
});

const fetchErrors = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters
    };
    
    // 如果有筛选的项目ID，使用它；否则使用当前项目ID
    if (filters.projectId) {
      params.projectId = filters.projectId;
    } else if (projectStore.currentProjectId) {
      params.projectId = projectStore.currentProjectId;
    }

    const { data } = await axios.get('/api/errors', { params });
    errors.value = data.errors || [];
    
    // 更新分页信息
    if (data.pagination) {
      pagination.total = data.pagination.total || 0;
      // 优先使用pageSize，其次使用limit
      pagination.pageSize = data.pagination.pageSize || data.pagination.limit || pagination.pageSize;
    } else {
      pagination.total = data.total || 0;
    }
  } catch (error) {
    console.error('Failed to fetch errors:', error);
  } finally {
    loading.value = false;
  }
};;

const fetchProjects = async () => {
  try {
    const { data } = await axios.get('/api/projects');
    projects.value = data.projects || [];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
  }
};

const getProjectName = (projectId) => {
  const project = projects.value.find(p => p._id === projectId);
  return project?.name || 'Unknown';
};

const viewError = (id) => {
  router.push(`/errors/${id}`);
};

const formatTime = (date) => {
  return dayjs(date).fromNow();
};

const getTypeLabel = (type) => {
  return t(`errors.types.${type}`) || type;
};

const getTypeIcon = (type) => {
  const icons = {
    vue_error: '🟢',
    global_error: '⚠️',
    promise_rejection: '🔄',
    axios_error: '🌐',
    fetch_error: '🌐',
    xhr_error: '🌐',
    axios_network_error: '📡',
    fetch_network_error: '📡',
    xhr_network_error: '📡',
    jquery_ajax_error: '📘',
    manual: '✋'
  };
  return icons[type] || '❓';
};

const getTypeClass = (type) => {
  if (type?.includes('axios') || type?.includes('fetch') || type?.includes('xhr')) {
    if (type?.includes('network')) {
      return 'bg-orange-100 text-orange-800';
    }
    return 'bg-blue-100 text-blue-800';
  }
  if (type === 'vue_error') return 'bg-green-100 text-green-800';
  if (type === 'promise_rejection') return 'bg-purple-100 text-purple-800';
  if (type === 'jquery_ajax_error') return 'bg-indigo-100 text-indigo-800';
  if (type === 'manual') return 'bg-gray-100 text-gray-800';
  return 'bg-yellow-100 text-yellow-800';
};

const prevPage = () => {
  if (pagination.page > 1) {
    pagination.page--;
    fetchErrors();
  }
};

const nextPage = () => {
  if (pagination.page * pagination.pageSize < pagination.total) {
    pagination.page++;
    fetchErrors();
  }
};

const changePageSize = () => {
  pagination.page = 1;
  fetchErrors();
};

watch(filters, () => {
  pagination.page = 1;
  fetchErrors();
});

watch(() => projectStore.currentProjectId, () => {
  pagination.page = 1;
  fetchErrors();
});

onMounted(() => {
  fetchProjects();
  fetchErrors();
});
</script>
