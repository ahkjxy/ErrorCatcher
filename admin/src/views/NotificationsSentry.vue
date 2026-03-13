<template>
  <div class="h-full flex flex-col bg-white">
    <!-- Page Header -->
    <div class="border-b border-gray-200">
      <div class="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ t('notifications.title') }}</h1>
          <p class="text-sm text-gray-600 mt-1">{{ t('notifications.subtitle') }}</p>
        </div>
        <button @click="activeTab === 'configs' ? openCreateModal() : openTemplateModal()" class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium">
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ activeTab === 'configs' ? t('notifications.addConfiguration') : t('notifications.addTemplate') }}
        </button>
      </div>

      <!-- Tab 切换 -->
      <div class="px-6">
        <div class="flex gap-6 border-b border-gray-200">
          <button
            @click="activeTab = 'configs'"
            class="px-1 py-3 text-sm font-medium border-b-2 transition-colors"
            :class="activeTab === 'configs' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600 hover:text-gray-900'"
          >
            {{ t('notifications.configurations') }}
          </button>
          <button
            @click="activeTab = 'templates'"
            class="px-1 py-3 text-sm font-medium border-b-2 transition-colors"
            :class="activeTab === 'templates' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600 hover:text-gray-900'"
          >
            {{ t('notifications.templates') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Filters (只在 Configs tab 显示) -->
    <div v-if="activeTab === 'configs'" class="border-b border-gray-200 px-6 py-3 bg-gray-50">
      <div class="flex gap-3">
        <select v-model="filters.projectId" @change="loadConfigs" class="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-purple-500">
          <option value="">{{ t('notifications.allProjects') }}</option>
          <option v-for="project in projects" :key="project._id" :value="project._id">
            {{ project.name }}
          </option>
        </select>
        <select v-model="filters.type" @change="loadConfigs" class="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-purple-500">
          <option value="">{{ t('notifications.allTypes') }}</option>
          <option value="dingtalk">DingTalk</option>
          <option value="email">{{ t('users.email') }}</option>
          <option value="webhook">Webhook</option>
          <option value="wechat">WeChat</option>
          <option value="slack">Slack</option>
        </select>
        <select v-model="filters.enabled" @change="loadConfigs" class="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-purple-500">
          <option value="">{{ t('notifications.allStatus') }}</option>
          <option value="true">{{ t('common.enabled') }}</option>
          <option value="false">{{ t('common.disabled') }}</option>
        </select>
        <button @click="loadConfigs" class="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm">
          <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Configurations Content -->
    <div v-if="activeTab === 'configs'" class="flex-1 overflow-y-auto p-6">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p class="mt-2 text-sm text-gray-500">{{ t('common.loading') }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="configs.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">{{ t('notifications.noNotificationConfigurations') }}</h3>
        <p class="text-gray-500 mb-4">{{ t('notifications.createNotificationChannels') }}</p>
        <button @click="openCreateModal()" class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
          {{ t('notifications.createFirstConfiguration') }}
        </button>
      </div>

      <!-- Config List -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="config in configs"
          :key="config._id"
          class="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="text-2xl">{{ getTypeIcon(config.type) }}</span>
              <div>
                <h3 class="font-medium text-gray-900">{{ config.name }}</h3>
                <span class="text-xs text-gray-500">{{ getTypeLabel(config.type) }}</span>
              </div>
            </div>
            <span
              :class="['px-2 py-1 text-xs font-medium rounded', config.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800']"
            >
              {{ config.enabled ? t('common.enabled') : t('common.disabled') }}
            </span>
          </div>

          <p v-if="config.description" class="text-sm text-gray-600 mb-3">{{ config.description }}</p>

          <div v-if="config.projectId" class="text-xs text-gray-500 mb-3">
            <span class="inline-flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              {{ config.projectId.name || config.projectId }}
            </span>
          </div>
          <div v-else class="text-xs text-gray-500 mb-3">
            <span class="inline-flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ t('notifications.global') }}
            </span>
          </div>

          <div class="flex items-center justify-between pt-3 border-t border-gray-200">
            <div class="flex gap-2">
              <button @click="editConfig(config)" class="text-purple-600 hover:text-purple-800 text-sm">
                {{ t('notifications.edit') }}
              </button>
              <button @click="testConfig(config)" class="text-blue-600 hover:text-blue-800 text-sm">
                {{ t('notifications.test') }}
              </button>
              <button @click="deleteConfig(config)" class="text-red-600 hover:text-red-800 text-sm">
                {{ t('notifications.delete') }}
              </button>
            </div>
            <button
              @click="toggleConfig(config)"
              class="text-xs text-gray-600 hover:text-gray-800"
            >
              {{ config.enabled ? t('notifications.disable') : t('notifications.enable') }}
            </button>
          </div>

          <!-- 创建者信息 -->
          <div class="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span v-if="config.createdBy" :title="config.createdBy.email">
              {{ t('notifications.createdBy') }} {{ config.createdBy.username }}
            </span>
            <span v-else>
              {{ t('notifications.createdByUnknown') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Templates Content -->
    <div v-if="activeTab === 'templates'" class="flex-1 overflow-y-auto p-6">
      <!-- Loading -->
      <div v-if="loadingTemplates" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p class="mt-2 text-sm text-gray-500">{{ t('common.loading') }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="templates.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">{{ t('notifications.noNotificationTemplates') }}</h3>
        <p class="text-gray-500 mb-4">{{ t('notifications.createTemplatesToCustomize') }}</p>
        <button @click="openTemplateModal()" class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
          {{ t('notifications.createFirstTemplate') }}
        </button>
      </div>

      <!-- Template List -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="template in templates"
          :key="template._id"
          class="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="text-2xl">📝</span>
              <div>
                <h3 class="font-medium text-gray-900">{{ template.name }}</h3>
                <span class="text-xs text-gray-500">{{ template.category || 'Custom' }}</span>
              </div>
            </div>
            <span v-if="template.isDefault" class="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
              {{ t('notifications.default') }}
            </span>
          </div>

          <p v-if="template.description" class="text-sm text-gray-600 mb-3">{{ template.description }}</p>

          <div class="text-xs text-gray-500 mb-3 space-y-1">
            <div><strong>{{ t('notifications.templateTitle') }}:</strong> {{ template.title }}</div>
            <div class="line-clamp-2"><strong>{{ t('notifications.templateContent') }}:</strong> {{ template.content }}</div>
          </div>

          <div v-if="template.projectId" class="text-xs text-gray-500 mb-3">
            <span class="inline-flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              {{ template.projectId.name || template.projectId }}
            </span>
          </div>
          <div v-else class="text-xs text-gray-500 mb-3">
            <span class="inline-flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ t('notifications.global') }}
            </span>
          </div>

          <div class="flex items-center justify-between pt-3 border-t border-gray-200">
            <div class="flex gap-2">
              <button @click="editTemplate(template)" class="text-purple-600 hover:text-purple-800 text-sm">
                {{ t('notifications.edit') }}
              </button>
              <button @click="deleteTemplate(template)" class="text-red-600 hover:text-red-800 text-sm">
                {{ t('notifications.delete') }}
              </button>
            </div>
            <button
              v-if="!template.isDefault"
              @click="setDefaultTemplate(template)"
              class="text-xs text-gray-600 hover:text-gray-800"
            >
              {{ t('notifications.setDefault') }}
            </button>
          </div>

          <!-- 创建者信息 -->
          <div class="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span v-if="template.createdBy" :title="template.createdBy.email">
              {{ t('notifications.createdBy') }} {{ template.createdBy.username }}
            </span>
            <span v-else>
              {{ t('notifications.createdByUnknown') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Config Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showCreateModal = false">
      <div class="bg-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold text-gray-900 mb-4">{{ editingConfig ? t('notifications.editConfiguration') : t('notifications.addConfiguration') }}</h3>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('notifications.name') }}</label>
            <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('notifications.type') }}</label>
            <select v-model="form.type" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500" required>
              <option value="dingtalk">DingTalk</option>
              <option value="email">{{ t('users.email') }}</option>
              <option value="webhook">Webhook</option>
              <option value="wechat">WeChat</option>
              <option value="slack">Slack</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('notifications.project') }}</label>
            <select v-model="form.projectId" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500">
              <option value="">{{ t('notifications.globalAllProjects') }}</option>
              <option v-for="project in projects" :key="project._id" :value="project._id">
                {{ project.name }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">{{ t('notifications.leaveEmptyForGlobal') }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('notifications.description') }}</label>
            <textarea v-model="form.description" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500" rows="2"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('notifications.notificationTemplateOptional') }}</label>
            <select v-model="form.templateId" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500">
              <option value="">{{ t('notifications.noTemplate') }}</option>
              <option v-for="template in availableTemplates" :key="template._id" :value="template._id">
                {{ template.name }} - {{ template.title }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">{{ t('notifications.selectTemplateHelp') }}</p>
          </div>
          <div v-if="form.type === 'dingtalk'">
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('notifications.webhook') }}</label>
            <input v-model="form.config.webhook" type="url" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500" required />
          </div>
          <div v-if="form.type === 'dingtalk'">
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('notifications.secret') }}</label>
            <input v-model="form.config.secret" type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500" />
          </div>
          <div v-if="form.type === 'dingtalk'">
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('notifications.atMobiles') }}</label>
            <input v-model="dingtalkMobiles" type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500" :placeholder="t('notifications.atMobilesPlaceholder')" />
            <p class="text-xs text-gray-500 mt-1">{{ t('notifications.atMobilesHelp') }}</p>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="button" @click="showCreateModal = false" class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">{{ t('common.cancel') }}</button>
            <button type="submit" class="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">{{ editingConfig ? t('common.save') : t('common.create') }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Create/Edit Template Modal -->
    <div v-if="showTemplateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showTemplateModal = false">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-bold text-gray-900 mb-4">{{ editingTemplate ? t('notifications.editTemplate') : t('notifications.addTemplate') }}</h3>
        <form @submit.prevent="handleTemplateSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('notifications.name') }}</label>
            <input v-model="templateForm.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('notifications.project') }}</label>
            <select v-model="templateForm.projectId" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500">
              <option value="">{{ t('notifications.globalAllProjects') }}</option>
              <option v-for="project in projects" :key="project._id" :value="project._id">
                {{ project.name }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">{{ t('notifications.leaveEmptyForGlobalTemplate') }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('notifications.category') }}</label>
            <select v-model="templateForm.category" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500">
              <option value="custom">{{ t('notifications.custom') }}</option>
              <option value="error">{{ t('notifications.error') }}</option>
              <option value="alert">{{ t('notifications.alert') }}</option>
              <option value="system">{{ t('notifications.system') }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('notifications.description') }}</label>
            <textarea v-model="templateForm.description" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500" rows="2"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('notifications.templateTitle') }}</label>
            <input v-model="templateForm.title" type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500" required placeholder="【{{priority}}】{{projectName}} - {{alertName}}" />
            <div class="mt-2 flex flex-wrap gap-1">
              <button
                v-for="variable in titleVariables"
                :key="variable.key"
                type="button"
                @click="insertVariable('title', variable.key)"
                class="px-2 py-1 text-xs bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 rounded border border-gray-300 hover:border-purple-300 transition-colors"
                :title="variable.key"
              >
                {{ variable.label }}
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('notifications.templateContent') }}</label>
            <textarea ref="contentTextarea" v-model="templateForm.content" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500 font-mono text-sm" rows="8" required placeholder="{{projectName}}&#10;{{reason}}&#10;{{errorCount}}&#10;{{userCount}}&#10;{{time}}&#10;{{pageUrl}}&#10;{{method}}&#10;{{apiUrl}}&#10;{{status}}"></textarea>
            <p class="text-xs text-gray-500 mt-1">{{ t('notifications.variablesHelp') }}</p>
            <div class="mt-2 flex flex-wrap gap-1">
              <button
                v-for="variable in contentVariables"
                :key="variable.key"
                type="button"
                @click="insertVariable('content', variable.key)"
                class="px-2 py-1 text-xs bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 rounded border border-gray-300 hover:border-purple-300 transition-colors"
                :title="variable.key"
              >
                {{ variable.label }}
              </button>
            </div>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="button" @click="showTemplateModal = false" class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">{{ t('common.cancel') }}</button>
            <button type="submit" class="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">{{ editingTemplate ? t('common.save') : t('common.create') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { ref, reactive, onMounted, computed } from 'vue';
import axios from 'axios';
import { showToast } from '@/utils/toast';

const activeTab = ref('configs');
const loading = ref(false);
const loadingTemplates = ref(false);
const configs = ref([]);
const templates = ref([]);
const projects = ref([]);
const showCreateModal = ref(false);
const showTemplateModal = ref(false);
const editingConfig = ref(null);
const editingTemplate = ref(null);
const contentTextarea = ref(null);

// 可用的模板变量（带中文说明）
const titleVariables = [
  { key: '{{projectName}}', label: '项目名称' },
  { key: '{{alertName}}', label: '告警名称' },
  { key: '{{priority}}', label: '优先级' },
  { key: '{{errorCount}}', label: '错误数量' },
  { key: '{{userCount}}', label: '用户数量' },
  { key: '{{level}}', label: '错误级别' },
  { key: '{{status}}', label: '状态码' }
];

const contentVariables = [
  { key: '{{projectName}}', label: '项目名称' },
  { key: '{{alertName}}', label: '告警名称' },
  { key: '{{priority}}', label: '优先级' },
  { key: '{{reason}}', label: '触发原因' },
  { key: '{{errorCount}}', label: '错误数量' },
  { key: '{{userCount}}', label: '用户数量' },
  { key: '{{time}}', label: '时间' },
  { key: '{{pageUrl}}', label: '页面URL' },
  { key: '{{method}}', label: '请求方法' },
  { key: '{{apiUrl}}', label: '接口URL' },
  { key: '{{url}}', label: 'URL' },
  { key: '{{statusText}}', label: '状态文本' },
  { key: '{{status}}', label: '状态码' },
  { key: '{{errorType}}', label: '错误类型' },
  { key: '{{type}}', label: '类型' },
  { key: '{{level}}', label: '错误级别' },
  { key: '{{message}}', label: '错误消息' },
  { key: '{{environment}}', label: '环境' },
  { key: '{{release}}', label: '版本' },
  { key: '{{curl}}', label: 'cURL命令' },
  { key: '{{curlCommand}}', label: 'cURL命令' }
];

const filters = reactive({
  projectId: '',
  type: '',
  enabled: ''
});

const form = reactive({
  name: '',
  type: 'dingtalk',
  description: '',
  projectId: '',
  templateId: '',
  config: {
    webhook: '',
    secret: '',
    atMobiles: []
  }
});

const templateForm = reactive({
  name: '',
  title: '',
  content: '',
  description: '',
  projectId: '',
  category: 'custom'
});

const dingtalkMobiles = ref('');

// 根据当前项目过滤可用模板
const availableTemplates = computed(() => {
  if (!form.projectId) {
    // 如果没有选择项目，显示全局模板
    return templates.value.filter(t => !t.projectId);
  }
  // 显示全局模板和当前项目的模板
  return templates.value.filter(t => !t.projectId || t.projectId._id === form.projectId || t.projectId === form.projectId);
});

// 插入变量到输入框
const insertVariable = (field, variableKey) => {
  if (field === 'title') {
    const input = document.querySelector('input[placeholder*="priority"]');
    if (input) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const text = templateForm.title;
      templateForm.title = text.substring(0, start) + variableKey + text.substring(end);
      // 设置光标位置
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + variableKey.length, start + variableKey.length);
      }, 0);
    } else {
      templateForm.title += variableKey;
    }
  } else if (field === 'content') {
    const textarea = contentTextarea.value;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = templateForm.content;
      templateForm.content = text.substring(0, start) + variableKey + text.substring(end);
      // 设置光标位置
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variableKey.length, start + variableKey.length);
      }, 0);
    } else {
      templateForm.content += variableKey;
    }
  }
};

const loadConfigs = async () => {
  loading.value = true;
  try {
    const params = {};
    if (filters.projectId) params.projectId = filters.projectId;
    if (filters.type) params.type = filters.type;
    if (filters.enabled) params.enabled = filters.enabled;
    
    const { data } = await axios.get('/api/notifications/configs', { params });
    let allConfigs = data.configs || [];
    
    // 如果选择了项目，还需要获取全局配置
    if (filters.projectId) {
      try {
        const { data: globalData } = await axios.get('/api/notifications/configs', {
          params: {
            type: filters.type || undefined,
            enabled: filters.enabled || undefined
          }
        });
        // 合并项目配置和全局配置，去重
        const globalConfigs = (globalData.configs || []).filter(g => !g.projectId);
        const projectConfigIds = new Set(allConfigs.map(c => c._id));
        const uniqueGlobalConfigs = globalConfigs.filter(g => !projectConfigIds.has(g._id));
        allConfigs = [...allConfigs, ...uniqueGlobalConfigs];
      } catch (error) {
        console.error('Failed to load global configs:', error);
      }
    }
    
    configs.value = allConfigs;
  } catch (error) {
    console.error('Failed to load configs:', error);
    showToast(t('notifications.failedToLoadConfigurations'), 'error');
  } finally {
    loading.value = false;
  }
};

const loadTemplates = async () => {
  loadingTemplates.value = true;
  try {
    const { data } = await axios.get('/api/notifications/templates');
    templates.value = data.templates || [];
  } catch (error) {
    console.error('Failed to load templates:', error);
    showToast(t('notifications.failedToLoadTemplates'), 'error');
  } finally {
    loadingTemplates.value = false;
  }
};

const loadProjects = async () => {
  try {
    const { data } = await axios.get('/api/projects');
    projects.value = data.projects || [];
  } catch (error) {
    console.error('Failed to load projects:', error);
  }
};

const handleSubmit = async () => {
  try {
    const payload = {
      name: form.name,
      type: form.type,
      description: form.description,
      // 确保空字符串转换为 null
      projectId: form.projectId === '' ? null : form.projectId,
      templateId: form.templateId === '' ? null : form.templateId,
      config: { ...form.config }
    };

    // 处理 DingTalk 手机号
    if (form.type === 'dingtalk' && dingtalkMobiles.value) {
      payload.config.atMobiles = dingtalkMobiles.value.split(',').map(m => m.trim()).filter(Boolean);
    }

    if (editingConfig.value) {
      await axios.put(`/api/notifications/configs/${editingConfig.value._id}`, payload);
      showToast(t('notifications.configurationUpdated'), 'success');
    } else {
      await axios.post('/api/notifications/configs', payload);
      showToast(t('notifications.configurationCreated'), 'success');
    }
    showCreateModal.value = false;
    resetForm();
    loadConfigs();
  } catch (error) {
    showToast(error.response?.data?.error || t('notifications.operationFailed'), 'error');
  }
};

const handleTemplateSubmit = async () => {
  try {
    const payload = {
      name: templateForm.name,
      title: templateForm.title,
      content: templateForm.content,
      description: templateForm.description,
      // 确保空字符串转换为 null
      projectId: templateForm.projectId === '' ? null : templateForm.projectId,
      category: templateForm.category
    };

    if (editingTemplate.value) {
      await axios.put(`/api/notifications/templates/${editingTemplate.value._id}`, payload);
      showToast(t('notifications.templateUpdated'), 'success');
    } else {
      await axios.post('/api/notifications/templates', payload);
      showToast(t('notifications.templateCreated'), 'success');
    }
    showTemplateModal.value = false;
    resetTemplateForm();
    loadTemplates();
  } catch (error) {
    showToast(error.response?.data?.error || t('notifications.operationFailed'), 'error');
  }
};

const editConfig = (config) => {
  editingConfig.value = config;
  form.name = config.name;
  form.type = config.type;
  form.description = config.description || '';
  form.projectId = config.projectId?._id || '';
  form.templateId = config.templateId?._id || '';
  form.config = { ...config.config };
  
  // 加载 DingTalk 手机号
  if (config.type === 'dingtalk' && config.config.atMobiles) {
    dingtalkMobiles.value = config.config.atMobiles.join(',');
  }
  
  showCreateModal.value = true;
};

const editTemplate = (template) => {
  editingTemplate.value = template;
  templateForm.name = template.name;
  templateForm.title = template.title;
  templateForm.content = template.content;
  templateForm.description = template.description || '';
  // 正确处理 projectId：如果是 null 或 undefined，设置为空字符串
  templateForm.projectId = template.projectId?._id || template.projectId || '';
  templateForm.category = template.category || 'custom';
  
  showTemplateModal.value = true;
};

const deleteConfig = async (config) => {
  if (!confirm(t('notifications.confirmDeleteConfig', { name: config.name }))) return;
  
  try {
    await axios.delete(`/api/notifications/configs/${config._id}`);
    showToast(t('notifications.configurationDeleted'), 'success');
    loadConfigs();
  } catch (error) {
    showToast(t('messages.deleteFailed'), 'error');
  }
};

const deleteTemplate = async (template) => {
  if (!confirm(t('notifications.confirmDeleteTemplate', { name: template.name }))) return;
  
  try {
    await axios.delete(`/api/notifications/templates/${template._id}`);
    showToast(t('notifications.templateDeleted'), 'success');
    loadTemplates();
  } catch (error) {
    showToast(t('messages.deleteFailed'), 'error');
  }
};

const toggleConfig = async (config) => {
  try {
    // 只发送需要更新的字段
    const payload = {
      name: config.name,
      type: config.type,
      description: config.description,
      projectId: config.projectId?._id || null,
      templateId: config.templateId?._id || null,
      config: config.config,
      enabled: !config.enabled
    };
    
    await axios.put(`/api/notifications/configs/${config._id}`, payload);
    config.enabled = !config.enabled;
    showToast(config.enabled ? t('notifications.configurationEnabled') : t('notifications.configurationDisabled'), 'success');
  } catch (error) {
    showToast(t('notifications.operationFailed'), 'error');
  }
};

const setDefaultTemplate = async (template) => {
  try {
    await axios.patch(`/api/notifications/templates/${template._id}/set-default`);
    showToast(t('notifications.defaultTemplateSet'), 'success');
    loadTemplates();
  } catch (error) {
    showToast(t('notifications.operationFailed'), 'error');
  }
};

const testConfig = async (config) => {
  try {
    await axios.post(`/api/notifications/configs/${config._id}/test`);
    showToast(t('notifications.testNotificationSent'), 'success');
  } catch (error) {
    showToast(t('notifications.testFailed'), 'error');
  }
};

const resetForm = () => {
  editingConfig.value = null;
  form.name = '';
  form.type = 'dingtalk';
  form.description = '';
  form.projectId = '';
  form.templateId = '';
  form.config = { webhook: '', secret: '', atMobiles: [] };
  dingtalkMobiles.value = '';
};

const resetTemplateForm = () => {
  editingTemplate.value = null;
  templateForm.name = '';
  templateForm.title = '';
  templateForm.content = '';
  templateForm.description = '';
  templateForm.projectId = '';
  templateForm.category = 'custom';
};

const openCreateModal = () => {
  resetForm();
  showCreateModal.value = true;
};

const openTemplateModal = () => {
  resetTemplateForm();
  showTemplateModal.value = true;
};

const getTypeIcon = (type) => {
  const icons = {
    dingtalk: '📱',
    email: '📧',
    webhook: '🔗',
    wechat: '💬',
    slack: '💬'
  };
  return icons[type] || '📢';
};

const getTypeLabel = (type) => {
  const labels = {
    dingtalk: 'DingTalk',
    email: 'Email',
    webhook: 'Webhook',
    wechat: 'WeChat Work',
    slack: 'Slack'
  };
  return labels[type] || type;
};

onMounted(() => {
  loadProjects();
  loadConfigs();
  loadTemplates();
});
</script>
