<template>
  <div class="h-full flex flex-col bg-white">
    <!-- 页面头部 -->
    <div class="border-b border-gray-200">
      <div class="px-6 py-4">
        <h1 class="text-2xl font-bold text-gray-900">{{ t('issues.title') }}</h1>
        <p class="text-sm text-gray-600 mt-1">{{ t('issues.subtitle') }}</p>
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

          <!-- 状态筛选 -->
          <select v-model="filters.status" class="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-purple-500">
            <option value="">{{ t('notifications.allStatus') }}</option>
            <option value="unresolved">{{ t('errors.unresolved') }}</option>
            <option value="resolved">{{ t('errors.resolved') }}</option>
            <option value="ignored">{{ t('issues.ignored') }}</option>
          </select>

          <!-- 级别筛选 -->
          <select v-model="filters.level" class="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-purple-500">
            <option value="">{{ t('alerts.all') }}</option>
            <option value="error">{{ t('errors.level.error') }}</option>
            <option value="warning">{{ t('errors.level.warning') }}</option>
            <option value="info">{{ t('errors.level.info') }}</option>
          </select>

          <!-- 排序 -->
          <select v-model="filters.sort" class="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-purple-500">
            <option value="-lastSeen">{{ t('issues.lastSeen') }}</option>
            <option value="-firstSeen">{{ t('issues.firstSeen') }}</option>
            <option value="-count">{{ t('issues.eventCount') }}</option>
            <option value="-userCount">{{ t('issues.affectedUsers') }}</option>
          </select>

          <div class="flex-1"></div>

          <!-- 批量操作 -->
          <button
            v-if="selectedIssues.length > 0"
            @click="showBulkActions = !showBulkActions"
            class="px-3 py-1.5 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
          >
            {{ t('issues.bulkActions') }} ({{ selectedIssues.length }})
          </button>
        </div>
      </div>
    </div>

    <!-- Issues 列表 -->
    <div class="flex-1 overflow-y-auto">
      <!-- 加载状态 -->
      <div v-if="loading" class="p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p class="mt-2 text-sm text-gray-500">{{ t('common.loading') }}</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="issues.length === 0" class="p-12 text-center">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">{{ t('issues.noIssues') }}</h3>
        <p class="text-gray-500">{{ t('dashboard.noData') }}</p>
      </div>

      <!-- Issues 列表 -->
      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="issue in issues"
          :key="issue._id"
          class="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
          @click="viewIssue(issue._id)"
        >
          <div class="flex items-start gap-4">
            <!-- 复选框 -->
            <input
              type="checkbox"
              :checked="selectedIssues.includes(issue._id)"
              @click.stop="toggleSelect(issue._id)"
              class="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />

            <!-- Issue 内容 -->
            <div class="flex-1 min-w-0">
              <!-- 标题行 -->
              <div class="flex items-center gap-2 mb-1">
                <span
                  class="px-2 py-0.5 text-xs font-medium rounded"
                  :class="{
                    'bg-red-100 text-red-800': issue.level === 'error',
                    'bg-yellow-100 text-yellow-800': issue.level === 'warning',
                    'bg-blue-100 text-blue-800': issue.level === 'info'
                  }"
                >
                  {{ issue.level.toUpperCase() }}
                </span>
                <h3 class="text-sm font-medium text-gray-900 truncate">
                  {{ issue.title }}
                </h3>
              </div>

              <!-- 详情行 -->
              <div class="text-xs text-gray-500 font-mono mb-2">
                {{ issue.culprit || issue.shortId }}
              </div>

              <!-- 统计行 -->
              <div class="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                <!-- 项目名称 -->
                <span v-if="issue.projectName" class="flex items-center gap-1 text-purple-600 font-medium">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  {{ issue.projectName }}
                </span>
                
                <!-- 项目负责人 -->
                <span v-if="issue.projectId?.owner" class="flex items-center gap-1 text-gray-600" :title="`${t('projects.owner')}: ${issue.projectId.owner.email || issue.projectId.owner.username}`">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ t('projects.owner') }}: {{ issue.projectId.owner.username }}
                </span>
                
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ formatTime(issue.lastSeen) }}
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {{ issue.userCount }} {{ t('dashboard.users') }}
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  {{ issue.count }} {{ t('dashboard.events') }}
                </span>
                <span v-if="issue.sampleEvent?.curlCommand" class="flex items-center gap-1 text-purple-600" title="cURL command available">
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
                v-if="issue.status === 'resolved'"
                class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded block"
              >
                {{ t('errors.resolved') }}
              </span>
              <span v-if="issue.status === 'resolved' && issue.resolvedBy" class="text-xs text-gray-500 mt-1 block">
                by {{ issue.resolvedBy?.username || issue.resolvedBy }}
              </span>
              <span
                v-else-if="issue.status === 'ignored'"
                class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded block"
              >
                {{ t('issues.ignored') }}
              </span>
            </div>

            <!-- 图表 -->
            <div class="flex-shrink-0 w-24 h-8">
              <svg class="w-full h-full" viewBox="0 0 100 30">
                <polyline
                  :points="generateSparkline(issue)"
                  fill="none"
                  stroke="#9333ea"
                  stroke-width="2"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="!loading && issues.length > 0" class="border-t border-gray-200 px-6 py-3 bg-gray-50">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="text-sm text-gray-700">
            {{ t('errors.showing') }} {{ (pagination.page - 1) * pagination.pageSize + 1 }} {{ t('errors.to') }} 
            {{ Math.min(pagination.page * pagination.pageSize, pagination.total) }} {{ t('errors.of') }} 
            {{ pagination.total }} {{ t('issues.issues') }}
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

import { ref, reactive, computed, onMounted, watch } from 'vue';
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
const issues = ref([]);
const projects = ref([]);
const selectedIssues = ref([]);
const showBulkActions = ref(false);

const filters = reactive({
  projectId: '',
  status: '',
  level: '',
  sort: '-lastSeen'  // 默认按最后出现时间倒序
});

const pagination = reactive({
  page: 1,
  pageSize: 25,
  total: 0
});

const fetchIssues = async () => {
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

    const { data } = await axios.get('/api/issues', { params });
    issues.value = data.issues || [];
    
    // 更新分页信息
    if (data.pagination) {
      pagination.total = data.pagination.total || 0;
      // 优先使用pageSize，其次使用limit
      pagination.pageSize = data.pagination.pageSize || data.pagination.limit || pagination.pageSize;
    } else {
      pagination.total = data.total || 0;
    }
  } catch (error) {
    console.error('Failed to fetch issues:', error);
  } finally {
    loading.value = false;
  }
};

const fetchProjects = async () => {
  try {
    const { data } = await axios.get('/api/projects');
    projects.value = data.projects || [];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
  }
};

const viewIssue = (id) => {
  router.push(`/issues/${id}`);
};

const toggleSelect = (id) => {
  const index = selectedIssues.value.indexOf(id);
  if (index > -1) {
    selectedIssues.value.splice(index, 1);
  } else {
    selectedIssues.value.push(id);
  }
};

const formatTime = (date) => {
  return dayjs(date).fromNow();
};

const generateSparkline = (issue) => {
  // 生成简单的趋势线
  const points = [];
  for (let i = 0; i < 10; i++) {
    const x = i * 10;
    const y = 15 + Math.random() * 10;
    points.push(`${x},${y}`);
  }
  return points.join(' ');
};

const prevPage = () => {
  if (pagination.page > 1) {
    pagination.page--;
    fetchIssues();
  }
};

const nextPage = () => {
  if (pagination.page * pagination.pageSize < pagination.total) {
    pagination.page++;
    fetchIssues();
  }
};

const changePageSize = () => {
  pagination.page = 1;
  fetchIssues();
};

watch(filters, () => {
  pagination.page = 1;
  fetchIssues();
});

watch(() => projectStore.currentProjectId, () => {
  pagination.page = 1;
  fetchIssues();
});

onMounted(() => {
  fetchProjects();
  fetchIssues();
});
</script>
