<template>
  <div v-if="project" class="h-full flex flex-col bg-white">
    <!-- 页面头部 -->
    <div class="border-b border-gray-200">
      <div class="px-6 py-4">
        <button @click="$router.back()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          {{ t('projects.backToProjects') }}
        </button>
        
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ project.name }}</h1>
            <p class="text-gray-600 mt-1">{{ project.description }}</p>
          </div>
          <button @click="editMode = !editMode" class="px-4 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
            {{ editMode ? t('common.cancel') : t('projects.editProject') }}
          </button>
        </div>
      </div>

      <!-- 标签页导航 -->
      <div class="px-6">
        <div class="flex border-b border-gray-200">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ]"
          >
            {{ tab.label.value }}
          </button>
        </div>
      </div>
    </div>

    <!-- 标签页内容 -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- Overview -->
      <div v-show="activeTab === 'overview'">
        <!-- 编辑表单 -->
        <div v-if="editMode" class="border border-gray-200 rounded-lg p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t('projects.editProject') }}</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('projects.projectName') }}</label>
              <input v-model="editForm.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('projects.description') }}</label>
              <textarea v-model="editForm.description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('projects.owner') }}</label>
              <select v-model="editForm.owner" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500">
                <option value="">{{ t('projects.notSet') }}</option>
                <option v-for="user in teamMembers" :key="user._id" :value="user._id">
                  {{ user.username }} ({{ user.email }})
                </option>
              </select>
            </div>
            <div class="flex gap-3">
              <button @click="updateProject" class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">{{ t('common.save') }}</button>
              <button @click="editMode = false" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">{{ t('common.cancel') }}</button>
            </div>
          </div>
        </div>

        <!-- 统计卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="border border-gray-200 rounded p-4">
            <div class="text-sm text-gray-600 mb-1">{{ t('projects.totalErrors') }}</div>
            <div class="text-2xl font-bold text-gray-900">{{ stats.totalErrors }}</div>
          </div>
          <div class="border border-gray-200 rounded p-4">
            <div class="text-sm text-gray-600 mb-1">{{ t('projects.unresolvedErrors') }}</div>
            <div class="text-2xl font-bold text-gray-900">{{ stats.unresolvedErrors }}</div>
          </div>
          <div class="border border-gray-200 rounded p-4">
            <div class="text-sm text-gray-600 mb-1">{{ t('projects.created') }}</div>
            <div class="text-sm font-medium text-gray-900">{{ formatDate(project.createdAt) }}</div>
          </div>
        </div>

        <!-- 项目信息 -->
        <div class="border border-gray-200 rounded-lg p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t('projects.projectInfo') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-600 mb-1">{{ t('projects.creator') }}</div>
              <div class="text-sm font-medium text-gray-900">
                {{ project.createdBy?.username || project.createdBy?.email || t('common.none') }}
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-600 mb-1">{{ t('projects.owner') }}</div>
              <div class="text-sm font-medium text-gray-900">
                {{ project.owner?.username || project.owner?.email || t('projects.notSet') }}
              </div>
            </div>
          </div>
        </div>

        <!-- 最近错误 -->
        <div class="border border-gray-200 rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ t('projects.recentErrors') }}</h3>
            <button @click="$router.push('/errors?projectId=' + project._id)" class="text-purple-600 hover:text-purple-700 text-sm font-medium">
              {{ t('projects.viewAll') }} →
            </button>
          </div>
          <div class="space-y-3">
            <div v-for="error in recentErrors" :key="error._id" 
                 class="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                 @click="$router.push(`/errors/${error._id}`)">
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-900 truncate">{{ error.message }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ formatDate(error.lastOccurred) }}</div>
              </div>
              <span :class="error.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                    class="px-2 py-1 text-xs font-medium rounded ml-4">
                {{ error.resolved ? t('projects.resolved') : t('projects.unresolved') }}
              </span>
            </div>
            <div v-if="recentErrors.length === 0" class="text-center py-8 text-gray-500">
              {{ t('projects.noErrorsYet') }}
            </div>
          </div>
        </div>
      </div>

      <!-- API Key -->
      <div v-show="activeTab === 'api'">
        <div class="border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t('projects.apiKeyTitle') }}</h3>
          <div class="bg-gray-50 rounded p-4 space-y-4">
            <div class="flex items-center justify-between">
              <code class="text-sm text-gray-900 font-mono">{{ project.apiKey }}</code>
              <div class="flex gap-2">
                <button @click="copyApiKey" class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">
                  {{ t('projects.copy') }}
                </button>
                <button @click="regenerateApiKey" class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                  {{ t('projects.regenerate') }}
                </button>
              </div>
            </div>
            <p class="text-sm text-gray-600">
              {{ t('projects.apiKeyDescription') }}
            </p>
            <div class="bg-blue-50 border border-blue-200 rounded p-3">
              <p class="text-sm text-blue-800 font-medium mb-2">{{ t('projects.usageExample') }}:</p>
              <pre class="text-xs text-blue-900 bg-white rounded p-2 overflow-x-auto"><code>import ErrorCatcher from 'error-catcher';

ErrorCatcher.init({
  apiKey: '{{ project.apiKey }}',
  projectId: '{{ project._id }}'
});</code></pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Alerts -->
      <div v-show="activeTab === 'alerts'">
        <div class="border border-gray-200 rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ t('alerts.alertRules') }}</h3>
            <div class="flex gap-2">
              <button 
                v-if="selectedAlert"
                @click="clearSelection" 
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">
                {{ t('alerts.clearSelection') }}
              </button>
              <button @click="$router.push(`/alerts/new?projectId=${project._id}`)" class="px-4 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                {{ t('alerts.createAlert') }}
              </button>
            </div>
          </div>

          <!-- 选中的告警信息 -->
          <div v-if="selectedAlert" class="mb-4 p-4 bg-purple-50 border border-purple-200 rounded">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-purple-900 font-medium">{{ t('alerts.selectedAlert') }}:</p>
                <p class="text-sm text-purple-700">{{ selectedAlert.name }}</p>
              </div>
              <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>

          <div v-if="loadingAlerts" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>

          <div v-else-if="projectAlerts.length === 0" class="text-center py-8">
            <p class="text-gray-600 mb-4">{{ t('alerts.noAlertRulesYet') }}</p>
            <button @click="$router.push(`/alerts/new?projectId=${project._id}`)" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
              {{ t('alerts.createFirstRule') }}
            </button>
          </div>

          <div v-else class="space-y-3">
            <div v-for="alert in projectAlerts" :key="alert._id" 
                 @click="selectAlert(alert)"
                 :class="[
                   'border rounded p-4 cursor-pointer transition-all',
                   selectedAlert?._id === alert._id 
                     ? 'border-purple-500 bg-purple-50' 
                     : 'border-gray-200 hover:border-purple-300'
                 ]">
              <div class="flex items-start justify-between">
                <div class="flex items-start gap-3 flex-1">
                  <!-- 单选按钮 -->
                  <div class="mt-1">
                    <div :class="[
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                      selectedAlert?._id === alert._id 
                        ? 'border-purple-600 bg-purple-600' 
                        : 'border-gray-300'
                    ]">
                      <div v-if="selectedAlert?._id === alert._id" class="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <span :class="[
                        'w-2 h-2 rounded-full',
                        alert.enabled ? 'bg-green-500' : 'bg-gray-400'
                      ]"></span>
                      <h4 class="font-medium text-gray-900">{{ alert.name }}</h4>
                      <span :class="[
                        'px-2 py-0.5 text-xs font-medium rounded',
                        alert.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      ]">
                        {{ alert.priority }}
                      </span>
                    </div>
                    <p v-if="alert.description" class="text-sm text-gray-600 mb-2">{{ alert.description }}</p>
                    
                    <!-- 告警条件 -->
                    <div class="text-xs text-gray-500 space-y-1">
                      <div v-if="alert.conditions?.errorCount">
                        <span class="font-medium">{{ t('alerts.errorCount') }}:</span> {{ alert.conditions.errorCount.operator }} {{ alert.conditions.errorCount.value }}
                      </div>
                      <div v-if="alert.conditions?.userCount">
                        <span class="font-medium">{{ t('alerts.userCount') }}:</span> {{ alert.conditions.userCount.operator }} {{ alert.conditions.userCount.value }}
                      </div>
                      <div v-if="alert.conditions?.timeWindow">
                        <span class="font-medium">{{ t('alerts.timeWindow') }}:</span> {{ alert.conditions.timeWindow }} {{ t('alerts.minutes') }}
                      </div>
                    </div>
                  </div>
                </div>
                
                <button 
                  @click.stop="toggleAlert(alert)" 
                  :class="[
                    'px-3 py-1 rounded text-xs font-medium ml-4',
                    alert.enabled 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  ]">
                  {{ alert.enabled ? t('alerts.disable') : t('alerts.enable') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="flex items-center justify-center h-full">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
      <p class="text-gray-500">{{ t('common.loading') }}</p>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import dayjs from 'dayjs';
import { showToast } from '@/utils/toast';

const route = useRoute();
const router = useRouter();

const project = ref(null);
const stats = ref({ totalErrors: 0, unresolvedErrors: 0 });
const recentErrors = ref([]);
const editMode = ref(false);
const activeTab = ref('overview');
const projectAlerts = ref([]);
const loadingAlerts = ref(false);
const teamMembers = ref([]);
const selectedAlert = ref(null);

const tabs = [
  { id: 'overview', label: computed(() => t('projects.tabs.overview')) },
  { id: 'api', label: computed(() => t('projects.tabs.api')) },
  { id: 'alerts', label: computed(() => t('projects.tabs.alerts')) }
];

const editForm = reactive({
  name: '',
  description: '',
  owner: ''
});

const fetchProject = async () => {
  try {
    const { data } = await axios.get(`/api/projects/${route.params.id}`);
    project.value = data;
    editForm.name = data.name;
    editForm.description = data.description;
    editForm.owner = data.owner?._id || data.owner || '';
    
    // 如果项目有默认告警，在加载告警列表后自动选中
    if (data.defaultAlertId) {
      // 延迟设置，等待告警列表加载完成
      setTimeout(() => {
        const defaultAlert = projectAlerts.value.find(
          alert => alert._id === (data.defaultAlertId._id || data.defaultAlertId)
        );
        if (defaultAlert) {
          selectedAlert.value = defaultAlert;
        }
      }, 500);
    }
  } catch (error) {
    showToast(t('messages.loadingFailed'), 'error');
    router.push('/projects');
  }
};

const fetchTeamMembers = async () => {
  try {
    const { data } = await axios.get('/api/users');
    teamMembers.value = data.users || [];
  } catch (error) {
    console.error('Failed to fetch team members', error);
  }
};

const fetchStats = async () => {
  try {
    const { data } = await axios.get(`/api/errors/stats`, {
      params: { projectId: route.params.id }
    });
    stats.value = data;
  } catch (error) {
    console.error('Failed to fetch stats', error);
  }
};

const fetchRecentErrors = async () => {
  try {
    const { data } = await axios.get('/api/errors', {
      params: { projectId: route.params.id, pageSize: 5 }
    });
    recentErrors.value = data.errors;
  } catch (error) {
    console.error('Failed to fetch recent errors', error);
  }
};

const fetchProjectAlerts = async () => {
  loadingAlerts.value = true;
  try {
    const { data } = await axios.get('/api/alerts', {
      params: { projectId: route.params.id }
    });
    projectAlerts.value = data.alerts || [];
  } catch (error) {
    console.error('Failed to fetch alerts', error);
  } finally {
    loadingAlerts.value = false;
  }
};

const toggleAlert = async (alert) => {
  try {
    await axios.patch(`/api/alerts/${alert._id}/toggle`);
    alert.enabled = !alert.enabled;
    showToast(alert.enabled ? t('alerts.alertEnabled') : t('alerts.alertDisabled'), 'success');
  } catch (error) {
    console.error('Failed to toggle alert', error);
    showToast(t('alerts.operationFailed'), 'error');
  }
};

const selectAlert = async (alert) => {
  if (selectedAlert.value?._id === alert._id) {
    // 取消选择
    selectedAlert.value = null;
    // 清除项目的默认告警
    try {
      await axios.patch(`/api/projects/${route.params.id}/default-alert`, { alertId: null });
      showToast(t('alerts.defaultAlertCleared'), 'success');
    } catch (error) {
      console.error('Failed to clear default alert', error);
      showToast(t('alerts.failedToClearDefaultAlert'), 'error');
    }
  } else {
    // 选择新的告警
    selectedAlert.value = alert;
    // 保存到项目的默认告警
    try {
      await axios.patch(`/api/projects/${route.params.id}/default-alert`, { alertId: alert._id });
      showToast(t('alerts.defaultAlertSet'), 'success');
    } catch (error) {
      console.error('Failed to set default alert', error);
      showToast(t('alerts.failedToSetDefaultAlert'), 'error');
      selectedAlert.value = null;
    }
  }
};

const clearSelection = async () => {
  selectedAlert.value = null;
  // 清除项目的默认告警
  try {
    await axios.patch(`/api/projects/${route.params.id}/default-alert`, { alertId: null });
    showToast(t('alerts.defaultAlertCleared'), 'success');
  } catch (error) {
    console.error('Failed to clear default alert', error);
    showToast(t('alerts.failedToClearDefaultAlert'), 'error');
  }
};

const updateProject = async () => {
  try {
    await axios.put(`/api/projects/${route.params.id}`, editForm);
    showToast(t('projects.projectUpdated'), 'success');
    editMode.value = false;
    fetchProject();
  } catch (error) {
    showToast(t('messages.saveFailed'), 'error');
  }
};

const copyApiKey = () => {
  navigator.clipboard.writeText(project.value.apiKey);
  showToast(t('projects.apiKeyCopied'), 'success');
};

const regenerateApiKey = async () => {
  if (!confirm(t('projects.regenerateConfirm'))) return;
  try {
    const { data } = await axios.post(`/api/projects/${route.params.id}/regenerate-key`);
    project.value.apiKey = data.apiKey;
    showToast(t('projects.apiKeyRegenerated'), 'success');
  } catch (error) {
    showToast(t('projects.regenerationFailed'), 'error');
  }
};

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

onMounted(() => {
  fetchProject();
  fetchStats();
  fetchRecentErrors();
  fetchProjectAlerts();
  fetchTeamMembers();
});
</script>
