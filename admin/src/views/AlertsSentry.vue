<template>
  <div class="h-full flex flex-col bg-white">
    <!-- 页面头部 -->
    <div class="border-b border-gray-200">
      <div class="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ t('alerts.title') }}</h1>
          <p class="text-sm text-gray-600 mt-1">{{ t('alerts.subtitle') }}</p>
        </div>
        <button
          @click="createAlert"
          class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium"
        >
          {{ t('alerts.createAlert') }}
        </button>
      </div>

      <!-- Tab 切换 -->
      <div class="px-6">
        <div class="flex gap-6 border-b border-gray-200">
          <button
            @click="activeTab = 'rules'"
            class="px-1 py-3 text-sm font-medium border-b-2 transition-colors"
            :class="activeTab === 'rules' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600 hover:text-gray-900'"
          >
            {{ t('alerts.alertRules') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Alert Rules -->
    <div v-if="activeTab === 'rules'" class="flex-1 overflow-y-auto p-6">
      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p class="mt-2 text-sm text-gray-500">{{ t('common.loading') }}</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="alerts.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">{{ t('alerts.noAlerts') }}</h3>
        <p class="text-gray-500 mb-4">{{ t('alerts.createFirstAlert') }}</p>
        <button
          @click="createAlert"
          class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium"
        >
          {{ t('alerts.createAlert') }}
        </button>
      </div>

      <!-- Alerts 网格 -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="alert in alerts"
          :key="alert._id"
          class="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
          @click="viewAlert(alert._id)"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="text-2xl">🔔</span>
              <div>
                <h3 class="font-medium text-gray-900">{{ alert.name }}</h3>
                <span class="text-xs text-gray-500">{{ getPriorityLabel(alert.priority) }} Priority</span>
              </div>
            </div>
            <span
              :class="['px-2 py-1 text-xs font-medium rounded', alert.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800']"
            >
              {{ alert.enabled ? t('common.enabled') : t('common.disabled') }}
            </span>
          </div>

          <p v-if="alert.description" class="text-sm text-gray-600 mb-3">{{ alert.description }}</p>

          <div class="text-xs text-gray-500 mb-3 space-y-1">
            <div class="flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span>{{ alert.projectId?.name || t('alerts.unknownProject') }}</span>
            </div>
            <div class="flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span>{{ alert.notificationConfigs?.length || 0 }} {{ t('alerts.notificationChannels') }}</span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-3 border-t border-gray-200">
            <div class="flex gap-2">
              <button @click.stop="editAlert(alert._id)" class="text-purple-600 hover:text-purple-800 text-sm">
                {{ t('common.edit') }}
              </button>
              <button @click.stop="deleteAlert(alert)" class="text-red-600 hover:text-red-800 text-sm">
                {{ t('common.delete') }}
              </button>
            </div>
            <button
              @click.stop="toggleAlert(alert)"
              class="text-xs text-gray-600 hover:text-gray-800"
            >
              {{ alert.enabled ? t('alerts.disable') : t('alerts.enable') }}
            </button>
          </div>

          <!-- 创建者信息 -->
          <div class="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span v-if="alert.createdBy" :title="alert.createdBy.email">
              {{ t('notifications.createdBy') }} {{ alert.createdBy.username }}
            </span>
            <span v-else>
              {{ t('notifications.createdByUnknown') }}
            </span>
          </div>
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
import { showToast } from '@/utils/toast';

dayjs.extend(relativeTime);
dayjs.locale(i18n.global.locale.value === 'zh' ? 'zh-cn' : 'en');

// 监听语言变化
watch(() => i18n.global.locale.value, (newLocale) => {
  dayjs.locale(newLocale === 'zh' ? 'zh-cn' : 'en');
});

const router = useRouter();
const projectStore = useProjectStore();

const loading = ref(false);
const activeTab = ref('rules');
const alerts = ref([]);

const fetchAlerts = async () => {
  loading.value = true;
  try {
    const params = {};
    if (projectStore.currentProjectId) {
      params.projectId = projectStore.currentProjectId;
    }

    const { data } = await axios.get('/api/alerts', { params });
    alerts.value = data.alerts || [];
  } catch (error) {
    console.error('Failed to fetch alerts:', error);
  } finally {
    loading.value = false;
  }
};

const fetchHistory = async () => {
  try {
    const params = {};
    if (projectStore.currentProjectId) {
      params.projectId = projectStore.currentProjectId;
    }

    // 暂时禁用 history API 调用，因为可能导致 500 错误
    // const { data } = await axios.get('/api/alerts/history', { params });
    // alertHistory.value = data.history || [];
    alertHistory.value = [];
  } catch (error) {
    console.error('Failed to fetch alert history:', error);
    alertHistory.value = [];
  }
};

const createAlert = () => {
  router.push('/alerts/new');
};

const viewAlert = (id) => {
  router.push(`/alerts/${id}`);
};

const editAlert = (id) => {
  router.push(`/alerts/${id}/edit`);
};

const toggleAlert = async (alert) => {
  try {
    await axios.put(`/api/alerts/${alert._id}`, {
      ...alert,
      enabled: !alert.enabled
    });
    alert.enabled = !alert.enabled;
    showToast(alert.enabled ? t('alerts.alertEnabled') : t('alerts.alertDisabled'), 'success');
  } catch (error) {
    console.error('Failed to toggle alert:', error);
    showToast(t('alerts.operationFailed'), 'error');
  }
};

const deleteAlert = async (alert) => {
  if (!confirm(t('alerts.confirmDelete', { name: alert.name }))) return;
  
  try {
    await axios.delete(`/api/alerts/${alert._id}`);
    alerts.value = alerts.value.filter(a => a._id !== alert._id);
    showToast(t('alerts.alertDeleted'), 'success');
  } catch (error) {
    console.error('Failed to delete alert:', error);
    showToast(t('messages.deleteFailed'), 'error');
  }
};

const getPriorityLabel = (priority) => {
  const labels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical'
  };
  return labels[priority] || priority;
};

const formatTime = (date) => {
  return dayjs(date).fromNow();
};

onMounted(() => {
  fetchAlerts();
});
</script>
