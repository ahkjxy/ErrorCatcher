<template>
  <div class="h-full flex flex-col bg-white">
    <!-- 页面头部 -->
    <div class="border-b border-gray-200">
      <div class="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ t('projects.title') }}</h1>
          <p class="text-sm text-gray-600 mt-1">{{ t('projects.subtitle') }}</p>
        </div>
        <button
          @click="showCreateModal = true"
          class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium"
        >
          {{ t('projects.createProject') }}
        </button>
      </div>
    </div>

    <!-- Projects 列表 -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p class="mt-2 text-sm text-gray-500">{{ t('common.loading') }}</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="projects.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">{{ t('projects.noProjects') }}</h3>
        <p class="text-gray-500 mb-4">{{ t('projects.createFirstProject') }}</p>
        <button
          @click="showCreateModal = true"
          class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium"
        >
          {{ t('projects.createProject') }}
        </button>
      </div>

      <!-- Projects 网格 -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="project in projects"
          :key="project._id"
          class="border border-gray-200 rounded-lg p-4 hover:border-purple-500 hover:shadow-md transition-all"
        >
          <!-- 项目头部 -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3 flex-1" @click="viewProject(project._id)">
              <div class="w-10 h-10 bg-purple-600 rounded flex items-center justify-center">
                <span class="text-white font-bold">
                  {{ project.name.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">{{ project.name }}</h3>
                <p class="text-xs text-gray-500">{{ project.platform }}</p>
              </div>
            </div>
            <button
              @click.stop="deleteProject(project)"
              class="text-gray-400 hover:text-red-600 p-1"
              :title="t('projects.deleteProject')"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <!-- 项目描述 -->
          <p class="text-sm text-gray-600 mb-4 line-clamp-2 cursor-pointer" @click="viewProject(project._id)">
            {{ project.description || t('projects.noDescription') }}
          </p>

          <!-- 项目统计 -->
          <div class="grid grid-cols-3 gap-2 text-center cursor-pointer" @click="viewProject(project._id)">
            <div class="bg-gray-50 rounded p-2">
              <div class="text-lg font-bold text-gray-900">{{ project.errorCount || 0 }}</div>
              <div class="text-xs text-gray-500">{{ t('errors.title') }}</div>
            </div>
            <div class="bg-gray-50 rounded p-2">
              <div class="text-lg font-bold text-gray-900">{{ project.issueCount || 0 }}</div>
              <div class="text-xs text-gray-500">{{ t('issues.title') }}</div>
            </div>
            <div class="bg-gray-50 rounded p-2">
              <div class="text-lg font-bold text-gray-900">{{ project.alertCount || 0 }}</div>
              <div class="text-xs text-gray-500">{{ t('alerts.title') }}</div>
            </div>
          </div>

          <!-- 项目状态 -->
          <div class="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between cursor-pointer" @click="viewProject(project._id)">
            <span
              class="px-2 py-1 text-xs font-medium rounded"
              :class="{
                'bg-green-100 text-green-800': project.status === 'active',
                'bg-gray-100 text-gray-800': project.status !== 'active'
              }"
            >
              {{ project.status === 'active' ? t('projects.active') : t('projects.inactive') }}
            </span>
            <span class="text-xs text-gray-500">
              {{ formatDate(project.createdAt) }}
            </span>
          </div>

          <!-- 创建者信息 -->
          <div class="mt-2 flex items-center gap-2 text-xs text-gray-500 cursor-pointer" @click="viewProject(project._id)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span v-if="project.createdBy" :title="project.createdBy.email">
              {{ t('projects.createdBy') }}: {{ project.createdBy.username }}
            </span>
            <span v-else>
              {{ t('projects.createdByUnknown') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建项目模态框 -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click="showCreateModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md" @click.stop>
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">{{ t('projects.createProject') }}</h2>
        </div>
        <div class="px-6 py-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('projects.projectName') }}</label>
            <input
              v-model="newProject.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
              placeholder="my-project"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('projects.platform') }}</label>
            <select
              v-model="newProject.platform"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
            >
              <option value="web">Web</option>
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
              <option value="server">Server</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('projects.description') }}</label>
            <textarea
              v-model="newProject.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
              :placeholder="t('projects.projectDescription')"
            ></textarea>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            @click="showCreateModal = false"
            class="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            @click="createProject"
            class="px-4 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
          >
            {{ t('projects.createProject') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/project';
import axios from 'axios';
import dayjs from 'dayjs';
import { showToast } from '@/utils/toast';

const router = useRouter();
const projectStore = useProjectStore();

const loading = ref(false);
const projects = ref([]);
const showCreateModal = ref(false);

const newProject = reactive({
  name: '',
  platform: 'web',
  description: ''
});

const fetchProjects = async () => {
  loading.value = true;
  try {
    const { data } = await axios.get('/api/projects');
    projects.value = data.projects || [];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
  } finally {
    loading.value = false;
  }
};

const createProject = async () => {
  try {
    const { data } = await axios.post('/api/projects', newProject);
    projects.value.unshift(data);
    showCreateModal.value = false;
    newProject.name = '';
    newProject.platform = 'web';
    newProject.description = '';
    showToast(t('projects.projectCreated'), 'success');
  } catch (error) {
    console.error('Failed to create project:', error);
    showToast(t('messages.operationFailed'), 'error');
  }
};

const viewProject = (id) => {
  router.push(`/projects/${id}`);
};

const deleteProject = async (project) => {
  if (!confirm(t('projects.confirmDeleteWithWarning', { name: project.name }))) {
    return;
  }
  
  try {
    await axios.delete(`/api/projects/${project._id}`);
    projects.value = projects.value.filter(p => p._id !== project._id);
    showToast(t('projects.projectDeleted'), 'success');
  } catch (error) {
    console.error('Failed to delete project:', error);
    showToast(t('messages.deleteFailed') + ': ' + (error.response?.data?.error || error.message), 'error');
  }
};

const showProjectMenu = (project) => {
  // 暂时不实现菜单功能
  console.log('Project menu:', project);
};

const formatDate = (date) => {
  return dayjs(date).format('MMM D, YYYY');
};

onMounted(() => {
  fetchProjects();
});
</script>
