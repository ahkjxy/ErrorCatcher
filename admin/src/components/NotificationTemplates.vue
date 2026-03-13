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
        <select v-model="filters.category" class="input w-32">
          <option value="">全部分类</option>
          <option value="error">错误</option>
          <option value="warning">警告</option>
          <option value="info">信息</option>
          <option value="custom">自定义</option>
        </select>
        <button @click="loadTemplates" class="btn btn-secondary">
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
        新建模板
      </button>
    </div>

    <!-- 可用变量提示 -->
    <div class="card p-4 bg-blue-50 border-blue-200">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="flex-1">
          <h4 class="font-medium text-blue-900 mb-2">可用变量</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-2 text-xs">
            <div v-for="variable in availableVariables" :key="variable.key" class="flex items-start gap-1.5">
              <code class="px-1.5 py-0.5 bg-white rounded text-blue-700 font-mono text-xs whitespace-nowrap">
                {{ formatVariable(variable.key) }}
              </code>
              <span class="text-gray-600 leading-5">{{ variable.description }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模板列表 -->
    <div v-if="loading" class="card p-12 text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p class="mt-4 text-gray-600">加载中...</p>
    </div>

    <div v-else-if="templates.length === 0" class="card p-12 text-center">
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="text-lg font-bold text-gray-900 mb-2">暂无消息模板</h3>
      <p class="text-gray-600 mb-4">创建消息模板，在通知配置中复用</p>
      <button @click="showCreateModal = true" class="btn btn-primary">创建第一个模板</button>
    </div>

    <div v-else class="grid grid-cols-1 gap-4">
      <div v-for="template in templates" :key="template._id" 
           :class="[
             'card p-6 hover:shadow-xl transition-all',
             template.isDefault ? 'ring-2 ring-purple-500 bg-purple-50' : ''
           ]">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <h3 class="text-lg font-bold text-gray-900">{{ template.name }}</h3>
              <span v-if="template.isDefault" class="px-2 py-1 bg-purple-600 text-white text-xs rounded-lg font-medium flex items-center gap-1">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                默认模板
              </span>
              <span :class="categoryClass(template.category)" class="px-2 py-1 text-xs rounded-lg font-medium">
                {{ categoryLabel(template.category) }}
              </span>
              <span class="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                {{ template.projectId?.name || '全局' }}
              </span>
            </div>
            <p v-if="template.description" class="text-sm text-gray-600 mb-3">{{ template.description }}</p>
            
            <div class="space-y-2 text-sm">
              <div class="bg-gray-50 p-3 rounded">
                <div class="text-xs text-gray-500 mb-1">标题模板</div>
                <code class="text-gray-800">{{ template.title }}</code>
              </div>
              <div class="bg-gray-50 p-3 rounded">
                <div class="text-xs text-gray-500 mb-1">内容模板</div>
                <code class="text-gray-800 whitespace-pre-wrap">{{ template.content }}</code>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <button @click="editTemplate(template)" class="btn btn-secondary flex-1">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            编辑
          </button>
          <button @click="deleteTemplate(template)" class="text-red-600 hover:text-red-800 p-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 创建/编辑模态框 -->
    <TemplateModal
      v-if="showCreateModal || showEditModal"
      :is-edit="showEditModal"
      :template="currentTemplate"
      :projects="projects"
      :variables="availableVariables"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import { showToast } from '../utils/toast';
import TemplateModal from './TemplateModal.vue';

export default {
  name: 'NotificationTemplates',
  components: {
    TemplateModal
  },
  setup() {
    const { t } = useI18n();
    const loading = ref(false);
    const templates = ref([]);
    const projects = ref([]);
    const availableVariables = ref([]);
    const showCreateModal = ref(false);
    const showEditModal = ref(false);
    const currentTemplate = ref(null);

    const filters = reactive({
      projectId: '',
      category: ''
    });

    const categoryLabel = (category) => {
      const labels = {
        error: '错误',
        warning: '警告',
        info: '信息',
        custom: '自定义'
      };
      return labels[category] || category;
    };

    const categoryClass = (category) => {
      const classes = {
        error: 'bg-red-100 text-red-800',
        warning: 'bg-yellow-100 text-yellow-800',
        info: 'bg-blue-100 text-blue-800',
        custom: 'bg-gray-100 text-gray-800'
      };
      return classes[category] || 'bg-gray-100 text-gray-800';
    };

    const fetchProjects = async () => {
      try {
        const { data } = await axios.get('/api/projects');
        projects.value = data.projects || [];
      } catch (error) {
        console.error('获取项目列表失败:', error);
      }
    };

    const fetchVariables = async () => {
      try {
        const { data } = await axios.get('/api/templates/variables');
        availableVariables.value = data.variables || [];
      } catch (error) {
        console.error('获取变量列表失败:', error);
      }
    };

    const loadTemplates = async () => {
      loading.value = true;
      try {
        const params = {};
        // 如果选择了特定项目或全局模板，传递 projectId
        if (filters.projectId) {
          params.projectId = filters.projectId;
        }
        // 如果没有选择，不传递 projectId，后端会返回所有模板
        if (filters.category) params.category = filters.category;

        const { data } = await axios.get('/api/templates', { params });
        templates.value = data.templates || [];
      } catch (error) {
        console.error('获取模板列表失败:', error);
        showToast(t('notifications.failedToLoadTemplates'), 'error');
      } finally {
        loading.value = false;
      }
    };

    const closeModal = () => {
      showCreateModal.value = false;
      showEditModal.value = false;
      currentTemplate.value = null;
    };

    const editTemplate = (template) => {
      currentTemplate.value = template;
      showEditModal.value = true;
    };

    const handleSaved = () => {
      closeModal();
      loadTemplates();
    };

    const deleteTemplate = async (template) => {
      if (!confirm(t('notifications.confirmDeleteTemplate', { name: template.name }))) return;

      try {
        await axios.delete(`/api/templates/${template._id}`);
        showToast(t('notifications.templateDeleted'), 'success');
        loadTemplates();
      } catch (error) {
        console.error('删除模板失败:', error);
        showToast(t('notifications.operationFailed'), 'error');
      }
    };

    const formatVariable = (key) => {
      return `{{${key}}}`;
    };

    onMounted(() => {
      fetchProjects();
      fetchVariables();
      loadTemplates();
    });

    return {
      loading,
      templates,
      projects,
      availableVariables,
      filters,
      showCreateModal,
      showEditModal,
      currentTemplate,
      categoryLabel,
      categoryClass,
      loadTemplates,
      editTemplate,
      deleteTemplate,
      formatVariable,
      closeModal,
      handleSaved
    };
  }
};
</script>
