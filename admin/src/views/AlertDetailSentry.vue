<template>
  <div class="h-full flex flex-col bg-white">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p class="mt-2 text-sm text-gray-500">{{ t('alerts.loadingAlert') }}</p>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <svg class="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">{{ t('alerts.failedToLoad') }}</h3>
        <p class="text-gray-500 mb-4">{{ error }}</p>
        <button @click="$router.push('/alerts')" class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
          {{ t('alerts.backToAlerts') }}
        </button>
      </div>
    </div>

    <!-- 详情内容 -->
    <div v-else-if="alert" class="flex-1 overflow-y-auto">
      <!-- 页面头部 -->
      <div class="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div class="px-6 py-4">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <button @click="$router.push('/alerts')" class="text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 class="text-2xl font-bold text-gray-900">{{ alert.name }}</h1>
              <span
                class="px-2 py-1 text-xs font-medium rounded"
                :class="alert.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
              >
                {{ alert.enabled ? t('common.enabled') : t('common.disabled') }}
              </span>
              <span
                class="px-2 py-1 text-xs font-medium rounded"
                :class="getPriorityClass(alert.priority)"
              >
                {{ getPriorityLabel(alert.priority) }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="editAlert"
                class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium"
              >
                {{ t('common.edit') }}
              </button>
              <button
                @click="toggleAlert"
                :class="['px-4 py-2 rounded text-sm font-medium', alert.enabled ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-green-600 text-white hover:bg-green-700']"
              >
                {{ alert.enabled ? t('alerts.disable') : t('alerts.enable') }}
              </button>
              <button
                @click="deleteAlert"
                class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
              >
                {{ t('common.delete') }}
              </button>
            </div>
          </div>
          <p v-if="alert.description" class="text-sm text-gray-600">{{ alert.description }}</p>
        </div>

        <!-- Tab 切换 -->
        <div class="px-6">
          <div class="flex gap-6 border-b border-gray-200">
            <button
              @click="activeTab = 'overview'"
              class="px-1 py-3 text-sm font-medium border-b-2 transition-colors"
              :class="activeTab === 'overview' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600 hover:text-gray-900'"
            >
              {{ t('alerts.overview') }}
            </button>
            <button
              @click="activeTab = 'history'"
              class="px-1 py-3 text-sm font-medium border-b-2 transition-colors"
              :class="activeTab === 'history' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600 hover:text-gray-900'"
            >
              {{ t('alerts.history') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="p-6 space-y-6">
        <!-- 基本信息 -->
        <div class="border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t('alerts.basicInfo') }}</h3>
          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">{{ t('alerts.alertName') }}</label>
              <div class="text-sm text-gray-900">{{ alert.name }}</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">{{ t('alerts.project') }}</label>
              <div class="text-sm text-gray-900">{{ alert.projectId?.name || alert.projectId }}</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">{{ t('alerts.errorLevel') }}</label>
              <div class="text-sm text-gray-900">
                <span v-if="alert.conditions?.level && alert.conditions.level.length > 0">
                  {{ alert.conditions.level.map(l => getLevelLabel(l)).join(', ') }}
                </span>
                <span v-else class="text-gray-400">{{ t('alerts.all') }}</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">{{ t('alerts.environment') }}</label>
              <div class="text-sm text-gray-900">
                <span v-if="alert.conditions?.environment && alert.conditions.environment.length > 0">
                  {{ alert.conditions.environment.join(', ') }}
                </span>
                <span v-else class="text-gray-400">{{ t('alerts.all') }}</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">{{ t('alerts.errorThreshold') }}</label>
              <div class="text-sm text-gray-900">{{ alert.conditions?.threshold?.count || '-' }}</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">{{ t('alerts.timeWindow') }}</label>
              <div class="text-sm text-gray-900">{{ alert.conditions?.threshold?.timeWindow || '-' }} {{ t('alerts.minutes') }}</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">{{ t('alerts.affectedUsersThreshold') }}</label>
              <div class="text-sm text-gray-900">{{ alert.conditions?.threshold?.userCount || t('alerts.unlimited') }}</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">{{ t('alerts.priority') }}</label>
              <div>
                <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getPriorityClass(alert.priority)]">
                  {{ getPriorityLabel(alert.priority) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 通知配置 -->
        <div class="border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t('alerts.notificationConfig') }}</h3>
          <div v-if="alert.notificationConfigs && alert.notificationConfigs.length > 0" class="space-y-3">
            <div v-for="config in alert.notificationConfigs" :key="config._id" class="flex items-center gap-3 p-3 bg-gray-50 rounded">
              <div class="text-2xl">
                {{ config.type === 'dingtalk' ? '📱' : '📧' }}
              </div>
              <div class="flex-1">
                <div class="text-sm font-medium text-gray-900">{{ config.name }}</div>
                <div class="text-xs text-gray-500">{{ config.type }}</div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            {{ t('alerts.noChannelsConfigured') }}
          </div>
        </div>

        <!-- 高级设置 -->
        <div class="border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t('alerts.advancedSettings') }}</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">{{ t('alerts.silencePeriod') }}</label>
              <div class="text-sm text-gray-900">{{ alert.settings?.silencePeriod || 30 }} {{ t('alerts.minutes') }}</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">{{ t('alerts.workingHoursOnly') }}</label>
              <div class="text-sm text-gray-900">{{ alert.settings?.workingHoursOnly ? t('common.yes') : t('common.no') }}</div>
            </div>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t('alerts.statistics') }}</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-purple-50 rounded border border-purple-100">
              <div class="text-3xl font-bold text-purple-600">{{ history.length }}</div>
              <div class="text-sm text-gray-600 mt-2">{{ t('alerts.totalTriggers') }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ t('alerts.last7Days') }}</div>
            </div>
            <div class="text-center p-4 bg-blue-50 rounded border border-blue-100">
              <div class="text-sm font-medium text-gray-900 break-words">
                {{ alert.stats?.lastTriggered ? formatTimeShort(alert.stats.lastTriggered) : t('alerts.neverTriggered') }}
              </div>
              <div class="text-sm text-gray-600 mt-2">{{ t('alerts.lastTriggered') }}</div>
              <div v-if="alert.stats?.lastTriggered" class="text-xs text-gray-500 mt-1">
                {{ getTimeAgo(alert.stats.lastTriggered) }}
              </div>
            </div>
            <div class="text-center p-4 bg-green-50 rounded border border-green-100">
              <div class="text-sm font-medium text-gray-900 break-words">
                {{ formatTimeShort(alert.createdAt) }}
              </div>
              <div class="text-sm text-gray-600 mt-2">{{ t('alerts.created') }}</div>
              <div class="text-xs text-gray-500 mt-1">
                {{ getTimeAgo(alert.createdAt) }}
              </div>
            </div>
            <div class="text-center p-4 bg-orange-50 rounded border border-orange-100">
              <div class="text-sm font-medium text-gray-900 break-words">
                {{ formatTimeShort(alert.updatedAt) }}
              </div>
              <div class="text-sm text-gray-600 mt-2">{{ t('alerts.updated') }}</div>
              <div class="text-xs text-gray-500 mt-1">
                {{ getTimeAgo(alert.updatedAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- History Tab -->
      <div v-if="activeTab === 'history'" class="p-6">
        <div v-if="historyLoading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p class="mt-2 text-sm text-gray-500">{{ t('alerts.loadingHistory') }}</p>
        </div>

        <div v-else-if="history.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">{{ t('alerts.noTriggerRecords') }}</h3>
          <p class="text-gray-500">{{ t('alerts.notTriggeredYet') }}</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="item in history"
            :key="item._id"
            class="flex gap-4 p-4 bg-gray-50 rounded border-l-4 border-purple-500"
          >
            <div class="flex-shrink-0 w-32 text-sm text-gray-500">
              {{ formatTime(item.triggeredAt) }}
            </div>
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-900 mb-1">{{ item.reason || item.message || t('alerts.alertTriggered') }}</div>
              <div class="text-xs text-gray-500">
                {{ t('alerts.errors') }}: {{ item.data?.errorCount || item.errorCount || 0 }} | 
                {{ t('alerts.affectedUsers') }}: {{ item.data?.userCount || item.affectedUsers || 0 }}
              </div>
              <div v-if="item.data?.errors && item.data.errors.length > 0" class="mt-2 text-xs text-gray-600">
                <div class="font-medium mb-1">{{ t('alerts.relatedErrors') }}:</div>
                <div class="space-y-1">
                  <router-link 
                    v-for="(errorId, idx) in item.data.errors.slice(0, 3)" 
                    :key="idx" 
                    :to="`/errors/${errorId}`"
                    class="block text-purple-600 hover:text-purple-800 hover:underline"
                  >
                    {{ errorId }}
                  </router-link>
                  <div v-if="item.data.errors.length > 3" class="text-gray-500">
                    {{ item.data.errors.length - 3 }} {{ t('alerts.moreErrors') }}
                  </div>
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-2 items-end">
              <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getNotificationStatus(item.notifications)]">
                {{ getNotificationStatusText(item.notifications) }}
              </span>
              <div v-if="item.notifications && item.notifications.length > 0" class="text-xs text-gray-500">
                {{ item.notifications.length }} {{ t('alerts.notificationChannels') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { showToast } from '@/utils/toast';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const historyLoading = ref(false);
const error = ref(null);
const alert = ref(null);
const history = ref([]);
const activeTab = ref('overview');

const fetchAlert = async () => {
  loading.value = true;
  error.value = null;
  try {
    const { data } = await axios.get(`/api/alerts/${route.params.id}`);
    alert.value = data;
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load alert';
    console.error('Failed to fetch alert:', err);
  } finally {
    loading.value = false;
  }
};

const fetchHistory = async () => {
  historyLoading.value = true;
  try {
    const { data } = await axios.get(`/api/alerts/${route.params.id}/history`);
    history.value = data.history || [];
  } catch (err) {
    console.error('Failed to fetch history:', err);
    history.value = [];
  } finally {
    historyLoading.value = false;
  }
};

const editAlert = () => {
  router.push(`/alerts/${route.params.id}/edit`);
};

const toggleAlert = async () => {
  try {
    await axios.put(`/api/alerts/${route.params.id}`, {
      ...alert.value,
      enabled: !alert.value.enabled
    });
    alert.value.enabled = !alert.value.enabled;
    showToast(t(alert.value.enabled ? 'alerts.alertEnabled' : 'alerts.alertDisabled'), 'success');
  } catch (err) {
    showToast(t('alerts.operationFailed'), 'error');
  }
};

const deleteAlert = async () => {
  if (!confirm(t('alerts.confirmDelete', { name: alert.value.name }))) return;
  
  try {
    await axios.delete(`/api/alerts/${route.params.id}`);
    showToast(t('alerts.alertDeleted'), 'success');
    router.push('/alerts');
  } catch (err) {
    showToast(t('alerts.operationFailed'), 'error');
  }
};

const getLevelLabel = (level) => {
  const labels = {
    fatal: t('errors.level.fatal'),
    error: t('errors.level.error'),
    warning: t('errors.level.warning'),
    info: t('errors.level.info'),
    debug: t('errors.level.debug')
  };
  return labels[level?.toLowerCase()] || level || t('common.unknown');
};

const getPriorityLabel = (priority) => {
  const labels = {
    low: t('alerts.low'),
    medium: t('alerts.medium'),
    high: t('alerts.high'),
    critical: t('alerts.critical')
  };
  return labels[priority] || priority;
};

const getPriorityClass = (priority) => {
  const classes = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };
  return classes[priority] || 'bg-gray-100 text-gray-800';
};

const getNotificationStatus = (notifications) => {
  if (!notifications || notifications.length === 0) {
    return 'bg-gray-100 text-gray-800';
  }
  const hasSuccess = notifications.some(n => n.status === 'success');
  const hasFailed = notifications.some(n => n.status === 'failed');
  
  if (hasSuccess && !hasFailed) {
    return 'bg-green-100 text-green-800';
  } else if (hasFailed && !hasSuccess) {
    return 'bg-red-100 text-red-800';
  } else if (hasSuccess && hasFailed) {
    return 'bg-yellow-100 text-yellow-800';
  }
  return 'bg-gray-100 text-gray-800';
};

const getNotificationStatusText = (notifications) => {
  if (!notifications || notifications.length === 0) {
    return t('alerts.notNotified');
  }
  const successCount = notifications.filter(n => n.status === 'success').length;
  const failedCount = notifications.filter(n => n.status === 'failed').length;
  
  if (successCount > 0 && failedCount === 0) {
    return t('alerts.notified');
  } else if (failedCount > 0 && successCount === 0) {
    return t('common.failed');
  } else if (successCount > 0 && failedCount > 0) {
    return `${t('alerts.partial')} (${successCount}/${notifications.length})`;
  }
  return t('common.unknown');
};

const formatTime = (time) => {
  if (!time) return '-';
  return new Date(time).toLocaleString('zh-CN');
};

const formatTimeShort = (time) => {
  if (!time) return '-';
  const date = new Date(time);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
};

const getTimeAgo = (time) => {
  if (!time) return '';
  const now = new Date();
  const past = new Date(time);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return t('alerts.justNow');
  if (diffMins < 60) return `${diffMins} ${t('alerts.minAgo')}`;
  if (diffHours < 24) return `${diffHours} ${t('alerts.hrAgo')}`;
  if (diffDays < 30) return `${diffDays} ${t('alerts.daysAgo')}`;
  return `${Math.floor(diffDays / 30)} ${t('alerts.monthsAgo')}`;
};

onMounted(() => {
  fetchAlert();
  fetchHistory();
});
</script>
