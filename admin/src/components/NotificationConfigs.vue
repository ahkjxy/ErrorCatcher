<template>
  <div class="space-y-6">
    <!-- 操作栏 -->
    <div class="flex items-center justify-between">
      <div class="flex gap-4">
        <select v-model="filters.projectId" class="input w-48">
          <option value="">全部项目</option>
          <option v-for="project in projects" :key="project._id" :value="project._id">
            {{ project.name }}
          </option>
        </select>
        <select v-model="filters.type" class="input w-32">
          <option value="">全部类型</option>
          <option value="dingtalk">钉钉</option>
          <option value="email">邮件</option>
          <option value="webhook">Webhook</option>
          <option value="wechat">企业微信</option>
          <option value="slack">Slack</option>
        </select>
        <button @click="loadConfigs" class="btn btn-secondary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          刷新
        </button>
      </div>
      <button @click="showCreateModal = true" class="btn btn-primary">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        新建配置
      </button>
    </div>

    <!-- 配置列表 -->
    <div v-if="loading" class="card p-12 text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p class="mt-4 text-gray-600">加载中...</p>
    </div>

    <div v-else-if="configs.length === 0" class="card p-12 text-center">
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <h3 class="text-lg font-bold text-gray-900 mb-2">暂无通知配置</h3>
      <p class="text-gray-600 mb-4">创建通知配置，在告警规则中快速复用</p>
      <button @click="showCreateModal = true" class="btn btn-primary">创建第一个配置</button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="config in configs" :key="config._id" 
           :class="[
             'card p-6 hover:shadow-xl transition-all',
             config.isDefault ? 'ring-2 ring-purple-500 bg-purple-50' : ''
           ]">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <span :class="typeIconClass(config.type)">
                {{ typeIcon(config.type) }}
              </span>
              <h3 class="text-lg font-bold text-gray-900">{{ config.name }}</h3>
              <span v-if="config.isDefault" class="px-2 py-1 bg-purple-600 text-white text-xs rounded-lg font-medium flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                默认配置
              </span>
              <span class="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                {{ config.projectId?.name || '全局' }}
              </span>
            </div>
            <p v-if="config.description" class="text-sm text-gray-600 mb-2">{{ config.description }}</p>
            <div v-if="config.templateId" class="flex items-center gap-1 text-xs text-gray-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>模板: {{ config.templateId.name }}</span>
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <button @click="testConfig(config)" class="btn btn-secondary flex-1">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            测试
          </button>
          <button @click="editConfig(config)" class="btn btn-secondary">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button @click="deleteConfig(config)" class="text-red-600 hover:text-red-800 p-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 创建/编辑模态框 -->
    <ConfigModal
      v-if="showCreateModal || showEditModal"
      :is-edit="showEditModal"
      :config="currentConfig"
      :projects="projects"
      :templates="templates"
      @close="closeModal"
      @saved="handleSaved"
    />

    <!-- 测试模态框 -->
    <TestModal
      v-if="showTestModal"
      :config="currentConfig"
      @close="showTestModal = false"
    />
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import { ref, reactive, onMounted, watch } from 'vue';
import axios from 'axios';
import { showToast } from '../utils/toast';
import ConfigModal from './ConfigModal.vue';
import TestModal from './TestModal.vue';

export default {
  name: 'NotificationConfigs',
  components: {
    ConfigModal,
    TestModal
  },
  setup() {
    const { t } = useI18n();
    const loading = ref(false);
    const configs = ref([]);
    const projects = ref([]);
    const templates = ref([]);
    const showCreateModal = ref(false);
    const showEditModal = ref(false);
    const showTestModal = ref(false);
    const currentConfig = ref(null);

    const filters = reactive({
      projectId: '',
      type: ''
    });

    const typeIcon = (type) => {
      const icons = {
        dingtalk: '💬',
        email: '📧',
        webhook: '🔗',
        wechat: '💼',
        slack: '💬'
      };
      return icons[type] || '📢';
    };

    const typeIconClass = () => 'text-2xl';

    const fetchProjects = async () => {
      try {
        const { data } = await axios.get('/api/projects');
        projects.value = data.projects || [];
      } catch (error) {
        console.error('获取项目列表失败:', error);
      }
    };

    const fetchTemplates = async () => {
      try {
        const { data } = await axios.get('/api/templates');
        templates.value = data.templates || [];
      } catch (error) {
        console.error('获取模板列表失败:', error);
      }
    };

    const loadConfigs = async () => {
      loading.value = true;
      try {
        const params = {};
        // 如果选择了特定项目或全局配置，传递 projectId
        if (filters.projectId) {
          params.projectId = filters.projectId;
        }
        // 如果没有选择，不传递 projectId，后端会返回所有配置
        if (filters.type) params.type = filters.type;

        const { data } = await axios.get('/api/notifications/configs', { params });
        configs.value = data.configs || [];
      } catch (error) {
        console.error('获取通知配置失败:', error);
        showToast(t('notifications.failedToLoadConfigurations'), 'error');
      } finally {
        loading.value = false;
      }
    };

    const closeModal = () => {
      showCreateModal.value = false;
      showEditModal.value = false;
      currentConfig.value = null;
    };

    const editConfig = (config) => {
      currentConfig.value = config;
      showEditModal.value = true;
    };

    const handleSaved = () => {
      closeModal();
      loadConfigs();
    };

    const testConfig = (config) => {
      currentConfig.value = config;
      showTestModal.value = true;
    };

    const deleteConfig = async (config) => {
      if (!confirm(t('notifications.confirmDeleteConfig', { name: config.name }))) return;

      try {
        await axios.delete(`/api/notifications/configs/${config._id}`);
        showToast(t('notifications.configurationDeleted'), 'success');
        loadConfigs();
      } catch (error) {
        console.error('删除配置失败:', error);
        showToast(t('notifications.operationFailed'), 'error');
      }
    };

    // 监听筛选条件变化
    watch(filters, () => {
      loadConfigs();
    });

    onMounted(() => {
      fetchProjects();
      fetchTemplates();
      loadConfigs();
    });

    return {
      loading,
      configs,
      projects,
      templates,
      filters,
      showCreateModal,
      showEditModal,
      showTestModal,
      currentConfig,
      typeIcon,
      typeIconClass,
      loadConfigs,
      editConfig,
      testConfig,
      deleteConfig,
      closeModal,
      handleSaved
    };
  }
};
</script>
