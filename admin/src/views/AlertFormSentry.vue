<template>
  <div class="h-full flex flex-col bg-white">
    <!-- 页面头部 -->
    <div class="border-b border-gray-200">
      <div class="px-6 py-4">
        <button @click="$router.back()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          {{ t('common.back') }}
        </button>
        
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEdit ? t('alerts.editAlert') : t('alerts.createAlert') }}
        </h1>
        <p class="mt-1 text-sm text-gray-600">{{ t('alerts.subtitle') }}</p>
      </div>
    </div>

    <!-- 表单内容 -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-3xl">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- 基本信息 -->
          <div class="border border-gray-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t('alerts.basicInformation') }}</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('alerts.ruleName') }} <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
                  placeholder="e.g.: Production Critical Error Alert"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('projects.title') }} <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="form.projectId"
                  required
                  @change="onProjectChange"
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
                >
                  <option value="">{{ t('common.select') }} {{ t('projects.title') }}</option>
                  <option v-for="project in projects" :key="project._id" :value="project._id">
                    {{ project.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('common.description') }}</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
                  :placeholder="t('alerts.alertDescription')"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('alerts.priority') }}</label>
                <div class="flex gap-4">
                  <label class="flex items-center">
                    <input v-model="form.priority" type="radio" value="high" class="mr-2" />
                    <span class="text-sm">{{ t('alerts.high') }}</span>
                  </label>
                  <label class="flex items-center">
                    <input v-model="form.priority" type="radio" value="medium" class="mr-2" />
                    <span class="text-sm">{{ t('alerts.medium') }}</span>
                  </label>
                  <label class="flex items-center">
                    <input v-model="form.priority" type="radio" value="low" class="mr-2" />
                    <span class="text-sm">{{ t('alerts.low') }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- 触发条件 -->
          <div class="border border-gray-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t('alerts.triggerConditions') }}</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('errors.errorLevel') }}</label>
                <div class="flex flex-wrap gap-2">
                  <label v-for="level in errorLevels" :key="level.value" class="flex items-center">
                    <input
                      v-model="form.conditions.level"
                      type="checkbox"
                      :value="level.value"
                      class="mr-2"
                    />
                    <span class="text-sm">{{ level.label }}</span>
                  </label>
                </div>
                <p class="mt-1 text-xs text-gray-500">{{ t('alerts.notSelectingMeansAll') }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('alerts.environment') }}</label>
                <div class="flex flex-wrap gap-2">
                  <label v-for="env in environments" :key="env.value" class="flex items-center">
                    <input
                      v-model="form.conditions.environment"
                      type="checkbox"
                      :value="env.value"
                      class="mr-2"
                    />
                    <span class="text-sm">{{ env.label }}</span>
                  </label>
                </div>
                <p class="mt-1 text-xs text-gray-500">{{ t('alerts.notSelectingMeansAll') }}</p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ t('alerts.errorCountThreshold') }}
                  </label>
                  <input
                    v-model.number="form.conditions.threshold.count"
                    type="number"
                    min="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ t('alerts.timeWindowMinutes') }}
                  </label>
                  <input
                    v-model.number="form.conditions.threshold.timeWindow"
                    type="number"
                    min="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
                    placeholder="5"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('alerts.affectedUsersThresholdOptional') }}
                </label>
                <input
                  v-model.number="form.conditions.threshold.userCount"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
                  :placeholder="t('alerts.leaveEmptyForUnlimited')"
                />
              </div>
            </div>
          </div>

          <!-- 通知配置 -->
          <div class="border border-gray-200 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">{{ t('alerts.notificationConfiguration') }}</h3>
            </div>
            
            <div v-if="loadingConfigs" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>

            <div v-else-if="availableConfigs.length === 0" class="text-center py-8">
              <p class="text-gray-600 mb-4">{{ t('alerts.noNotificationConfigurationsAvailable') }}</p>
            </div>

            <div v-else class="space-y-2">
              <label
                v-for="config in availableConfigs"
                :key="config._id"
                class="flex items-center p-4 border border-gray-200 rounded hover:border-purple-500 hover:bg-purple-50 cursor-pointer transition-all"
                :class="{ 'border-purple-500 bg-purple-50': form.notificationConfigs.includes(config._id) }"
              >
                <input
                  v-model="form.notificationConfigs"
                  type="checkbox"
                  :value="config._id"
                  class="mr-3"
                />
                <div class="flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-medium text-gray-900">{{ config.name }}</span>
                    <span class="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                      {{ getTypeLabel(config.type) }}
                    </span>
                    <span v-if="config.isDefault" class="px-2 py-0.5 bg-purple-600 text-white text-xs rounded font-medium flex items-center gap-1">
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      {{ t('notifications.default') }}
                    </span>
                    <span v-if="!config.projectId" class="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded font-medium flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ t('notifications.global') }}
                    </span>
                    <span v-else class="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      {{ config.projectId?.name || config.projectId }}
                    </span>
                  </div>
                  <p v-if="config.description" class="text-sm text-gray-600 mt-1">{{ config.description }}</p>
                  <div v-if="config.templateId" class="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{{ t('notifications.template') }}: {{ config.templateId?.name || 'N/A' }}</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- 高级设置 -->
          <div class="border border-gray-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t('alerts.advancedSettings') }}</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('alerts.silencePeriodMinutes') }}
                </label>
                <input
                  v-model.number="form.settings.silencePeriod"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
                  placeholder="30"
                />
                <p class="mt-1 text-xs text-gray-500">{{ t('alerts.sameAlertWillOnlyBeSentOnceDuringSilencePeriod') }}</p>
              </div>

              <div>
                <label class="flex items-center">
                  <input
                    v-model="form.settings.workingHoursOnly"
                    type="checkbox"
                    class="mr-2"
                  />
                  <span class="text-sm">{{ t('alerts.sendOnlyDuringWorkingHours') }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-3">
            <button
              type="submit"
              :disabled="loading"
              class="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {{ loading ? t('common.loading') : t('alerts.saveAndEnable') }}
            </button>
            <button
              type="button"
              @click="$router.back()"
              class="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              {{ t('common.cancel') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { showToast } from '@/utils/toast';
import { useProjectStore } from '@/stores/project';

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();

const loading = ref(false);
const loadingConfigs = ref(false);
const projects = ref([]);
const availableConfigs = ref([]);

const isEdit = computed(() => !!route.params.id);

const form = reactive({
  projectId: route.query.projectId || '',
  name: '',
  description: '',
  priority: 'medium',
  enabled: true,
  conditions: {
    level: [],
    type: [],
    environment: [],
    threshold: {
      count: 10,
      timeWindow: 5,
      userCount: null
    }
  },
  notificationConfigs: [],
  settings: {
    silencePeriod: 30,
    workingHoursOnly: false
  }
});

const errorLevels = computed(() => [
  { value: 'fatal', label: t('errors.level.fatal') },
  { value: 'error', label: t('errors.level.error') },
  { value: 'warning', label: t('errors.level.warning') },
  { value: 'info', label: t('errors.level.info') }
]);

const environments = computed(() => [
  { value: 'production', label: t('alerts.environmentProduction') },
  { value: 'staging', label: t('alerts.environmentStaging') },
  { value: 'development', label: t('alerts.environmentDevelopment') }
]);

const getTypeLabel = (type) => {
  const labels = {
    dingtalk: 'DingTalk',
    email: t('users.email'),
    webhook: 'Webhook',
    wechat: 'WeChat Work',
    slack: 'Slack'
  };
  return labels[type] || type;
};

const fetchProjects = async () => {
  try {
    const data = await projectStore.fetchProjects();
    projects.value = data.projects || [];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    showToast(t('projects.projectCreated'), 'error');
  }
};

const fetchNotificationConfigs = async () => {
  loadingConfigs.value = true;
  try {
    // 获取配置：如果选择了项目，获取该项目的配置；否则获取全局配置
    const params = {};
    if (form.projectId) {
      params.projectId = typeof form.projectId === 'string' ? form.projectId : form.projectId._id;
    }
    const { data } = await axios.get('/api/notifications/configs', { params });
    let allConfigs = data.configs || [];
    
    // 如果选择了项目，还需要获取全局配置
    if (form.projectId) {
      try {
        const { data: globalData } = await axios.get('/api/notifications/configs', { params: {} });
        // 过滤全局配置（projectId 为 null）
        const globalConfigs = (globalData.configs || []).filter(g => !g.projectId);
        // 去重：避免显示重复的配置
        const projectConfigIds = new Set(allConfigs.map(c => c._id));
        const uniqueGlobalConfigs = globalConfigs.filter(g => !projectConfigIds.has(g._id));
        allConfigs = [...allConfigs, ...uniqueGlobalConfigs];
      } catch (error) {
        console.error('Failed to fetch global configs:', error);
      }
    }
    
    availableConfigs.value = allConfigs;
    
    // 自动选择默认配置（优先选择项目级别的默认配置，其次是全局默认配置）
    if (!isEdit.value) {
      const defaultConfigs = availableConfigs.value
        .filter(c => c.isDefault && c.enabled)
        .sort((a, b) => {
          // 项目级配置优先于全局配置
          if (a.projectId && !b.projectId) return -1;
          if (!a.projectId && b.projectId) return 1;
          return 0;
        })
        .map(c => c._id);
      
      if (defaultConfigs.length > 0) {
        form.notificationConfigs = [defaultConfigs[0]]; // 只选择第一个默认配置
      }
    }
  } catch (error) {
    console.error('Failed to fetch notification configs:', error);
    showToast(t('notifications.failedToLoadConfigurations'), 'error');
  } finally {
    loadingConfigs.value = false;
  }
};

const onProjectChange = () => {
  fetchNotificationConfigs();
};

const fetchAlert = async () => {
  if (!isEdit.value) return;
  
  try {
    const { data: alert } = await axios.get(`/api/alerts/${route.params.id}`);
    
    // 先设置 projectId
    const projectId = alert.projectId._id || alert.projectId;
    
    Object.assign(form, {
      projectId: projectId,
      name: alert.name,
      description: alert.description || '',
      priority: alert.priority,
      enabled: alert.enabled,
      conditions: alert.conditions,
      notificationConfigs: alert.notificationConfigs?.map(c => c._id || c) || [],
      settings: alert.settings
    });

    // 加载该项目的通知配置
    await fetchNotificationConfigs();
  } catch (error) {
    console.error('Failed to fetch alert details:', error);
    showToast(t('alerts.failedToLoad'), 'error');
  }
};

const handleSubmit = async () => {
  if (form.notificationConfigs.length === 0) {
    showToast(t('alerts.selectChannels'), 'error');
    return;
  }

  loading.value = true;
  
  try {
    const payload = { ...form };

    if (isEdit.value) {
      await axios.put(`/api/alerts/${route.params.id}`, payload);
      showToast(t('alerts.alertUpdated'), 'success');
    } else {
      await axios.post('/api/alerts', payload);
      showToast(t('alerts.alertCreated'), 'success');
    }
    
    router.push('/alerts');
  } catch (error) {
    console.error('Failed to save alert:', error);
    showToast(error.response?.data?.error || t('alerts.operationFailed'), 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchProjects();
  
  // 总是获取配置（如果选择了项目，获取该项目的配置；否则获取全局配置）
  if (!isEdit.value) {
    await fetchNotificationConfigs();
  }
  
  if (isEdit.value) {
    await fetchAlert();
  }
});
</script>
