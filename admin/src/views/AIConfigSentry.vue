<template>
  <div class="h-full flex flex-col bg-white">
    <!-- 页面头部 -->
    <div class="border-b border-gray-200">
      <div class="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ t('ai.configTitle') }}</h1>
          <p class="text-sm text-gray-600 mt-1">{{ t('ai.configSubtitle') }}</p>
        </div>
        <div class="flex items-center gap-3">
          <span 
            :class="[
              'px-3 py-1 text-xs font-medium rounded-full',
              defaultConfig?.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            ]"
          >
            {{ defaultConfig?.enabled ? t('ai.enabled') : t('ai.disabled') }}
          </span>
          <button
            v-if="activeTab === 'config'"
            @click="openCreateModal"
            class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium"
          >
            {{ t('ai.createConfig') }}
          </button>
        </div>
      </div>
      <!-- Tab 切换 -->
      <div class="px-6 flex gap-0 border-t border-gray-100">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'px-5 py-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === tab.key
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- 配置管理 Tab -->
    <div v-if="activeTab === 'config'" class="flex-1 overflow-y-auto p-6">
      <div class="max-w-6xl space-y-6">
        <!-- 当前默认配置状态 -->
        <div v-if="defaultConfig" class="border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t('ai.currentStatus') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-gray-50 rounded p-4">
              <div class="text-sm text-gray-600 mb-1">{{ t('ai.configName') }}</div>
              <div class="text-lg font-semibold text-gray-900">{{ defaultConfig.name }}</div>
            </div>
            <div class="bg-gray-50 rounded p-4">
              <div class="text-sm text-gray-600 mb-1">{{ t('ai.provider') }}</div>
              <div class="text-lg font-semibold text-gray-900">{{ getProviderName(defaultConfig.provider) || t('ai.notConfigured') }}</div>
            </div>
            <div class="bg-gray-50 rounded p-4">
              <div class="text-sm text-gray-600 mb-1">{{ t('ai.currentModel') }}</div>
              <div class="text-lg font-semibold text-gray-900">{{ defaultConfig.model || t('ai.notConfigured') }}</div>
            </div>
            <div class="bg-gray-50 rounded p-4">
              <div class="text-sm text-gray-600 mb-1">{{ t('ai.apiKeyStatus') }}</div>
              <div class="text-lg font-semibold text-gray-900">{{ defaultConfig.apiKeyPreview ? t('ai.configured') : t('ai.notConfigured') }}</div>
            </div>
          </div>
        </div>

        <!-- 配置列表 -->
        <div class="border border-gray-200 rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">{{ t('ai.tabs.list') }}</h3>
          </div>
          <div v-if="configs.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">{{ t('ai.noConfigs') }}</h3>
            <p class="mt-1 text-sm text-gray-500">{{ t('ai.createFirstConfig') }}</p>
          </div>
          <div v-else class="divide-y divide-gray-200">
            <div v-for="config in configs" :key="config._id" class="p-6 hover:bg-gray-50 transition-colors">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h4 class="text-lg font-semibold text-gray-900">{{ config.name }}</h4>
                    <span v-if="config.isDefault" class="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded">{{ t('ai.isDefault') }}</span>
                    <span :class="['px-2 py-0.5 text-xs font-medium rounded', config.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800']">
                      {{ config.enabled ? t('ai.enabled') : t('ai.disabled') }}
                    </span>
                  </div>
                  <p v-if="config.description" class="text-sm text-gray-600 mb-3">{{ config.description }}</p>
                  <div class="grid grid-cols-3 gap-4">
                    <div>
                      <div class="text-xs text-gray-500">{{ t('ai.provider') }}</div>
                      <div class="text-sm font-medium text-gray-900">{{ getProviderName(config.provider) }}</div>
                    </div>
                    <div>
                      <div class="text-xs text-gray-500">{{ t('ai.model') }}</div>
                      <div class="text-sm font-medium text-gray-900">{{ config.model }}</div>
                    </div>
                    <div>
                      <div class="text-xs text-gray-500">{{ t('ai.apiKey') }}</div>
                      <div class="text-sm font-medium text-gray-900 font-mono">{{ config.apiKeyPreview || t('ai.notConfigured') }}</div>
                    </div>
                  </div>
                </div>
                <div class="flex flex-col gap-2 ml-4">
                  <div class="flex gap-2">
                    <button v-if="!config.isDefault" @click="setDefaultConfig(config._id)" class="px-3 py-1 text-xs border border-purple-600 text-purple-600 rounded hover:bg-purple-50">{{ t('ai.setAsDefault') }}</button>
                    <button @click="editConfig(config)" class="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">{{ t('ai.editConfig') }}</button>
                    <button v-if="!config.isDefault" @click="deleteConfig(config)" class="px-3 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50">{{ t('ai.deleteConfig') }}</button>
                  </div>
                  <button @click="testConfigById(config._id)" :disabled="testingConfigId === config._id" class="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                    {{ testingConfigId === config._id ? t('ai.testing') : t('ai.testConnection') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 使用说明 -->
        <div class="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <div class="flex gap-3">
            <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-sm text-blue-800">
              <p class="font-medium mb-2">{{ t('ai.usageGuide') }}</p>
              <ul class="list-disc list-inside space-y-1">
                <li>{{ t('ai.guideProviders') }}</li>
                <li>{{ t('ai.guideAutoEnable') }}</li>
                <li>{{ t('ai.guideLocation') }}</li>
                <li>{{ t('ai.guideFeatures') }}</li>
                <li>{{ t('ai.guideRecommend') }}</li>
              </ul>
              <p class="mt-3 font-medium">{{ t('ai.getApiKey') }}</p>
              <div class="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                <div>• OpenAI: <a href="https://platform.openai.com/api-keys" target="_blank" class="text-blue-600 hover:text-blue-700 underline">platform.openai.com</a></div>
                <div>• DeepSeek: <a href="https://platform.deepseek.com/api_keys" target="_blank" class="text-blue-600 hover:text-blue-700 underline">platform.deepseek.com</a></div>
                <div>• Claude: <a href="https://console.anthropic.com/" target="_blank" class="text-blue-600 hover:text-blue-700 underline">console.anthropic.com</a></div>
                <div>• Gemini: <a href="https://aistudio.google.com/apikey" target="_blank" class="text-blue-600 hover:text-blue-700 underline">aistudio.google.com</a></div>
                <div>• 文心一言: <a href="https://console.bce.baidu.com/qianfan/" target="_blank" class="text-blue-600 hover:text-blue-700 underline">百度智能云</a></div>
                <div>• 通义千问: <a href="https://dashscope.console.aliyun.com/apiKey" target="_blank" class="text-blue-600 hover:text-blue-700 underline">阿里云控制台</a></div>
                <div>• 智谱 AI: <a href="https://open.bigmodel.cn/usercenter/apikeys" target="_blank" class="text-blue-600 hover:text-blue-700 underline">open.bigmodel.cn</a></div>
                <div>• Moonshot: <a href="https://platform.moonshot.cn/console/api-keys" target="_blank" class="text-blue-600 hover:text-blue-700 underline">platform.moonshot.cn</a></div>
                <div>• MiniMax: <a href="https://platform.minimaxi.com/user-center/basic-information/interface-key" target="_blank" class="text-blue-600 hover:text-blue-700 underline">platform.minimaxi.com</a></div>
                <div>• 豆包: <a href="https://console.volcengine.com/ark" target="_blank" class="text-blue-600 hover:text-blue-700 underline">火山引擎</a></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI 问答 Tab -->
    <div v-if="activeTab === 'chat'" class="flex-1 flex flex-col min-h-0 bg-gray-50">
      <!-- 顶栏 -->
      <div class="px-5 py-2.5 border-b border-gray-200 flex items-center gap-3 bg-white">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
          </svg>
          <span class="text-gray-400">模型</span>
        </div>
        <select
          v-model="chatConfigId"
          class="px-2.5 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white text-gray-700 font-medium"
        >
          <option v-for="c in configs" :key="c._id" :value="c._id">
            {{ c.name }} · {{ c.model }}{{ c.isDefault ? ' ✦' : '' }}
          </option>
        </select>
        <button
          v-if="chatMessages.length > 0"
          @click="clearChat"
          class="ml-auto flex items-center gap-1.5 px-3 py-1 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          清空
        </button>
      </div>

      <!-- 消息列表 -->
      <div ref="chatContainer" class="flex-1 overflow-y-auto px-4 py-5 space-y-4">

        <!-- 空状态 -->
        <div v-if="chatMessages.length === 0" class="flex flex-col items-center justify-center h-full gap-3 select-none">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
            </svg>
          </div>
          <div class="text-center">
            <p class="text-gray-700 font-medium text-sm">AI 助手</p>
            <p class="text-gray-400 text-xs mt-1">可以问我代码、错误分析、技术方案等问题</p>
          </div>
          <!-- 快捷提问 -->
          <div class="flex flex-wrap gap-2 justify-center mt-2 max-w-md">
            <button
              v-for="q in quickQuestions"
              :key="q"
              @click="chatInput = q; sendChat()"
              class="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-full text-gray-600 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-colors shadow-sm"
            >
              {{ q }}
            </button>
          </div>
        </div>

        <!-- 消息 -->
        <template v-for="(msg, idx) in chatMessages" :key="idx">
          <!-- 用户消息 -->
          <div v-if="msg.role === 'user'" class="flex justify-end">
            <div class="max-w-[75%] bg-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm">
              {{ msg.content }}
            </div>
          </div>

          <!-- AI 消息 -->
          <div v-else class="flex items-start gap-2.5">
            <div class="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
              </svg>
            </div>
            <div class="flex-1 min-w-0 max-w-[85%]">
              <!-- 等待中（空内容 + streaming） -->
              <div v-if="msg.streaming && !msg.content" class="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm inline-flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style="animation-delay: 0ms"></span>
                <span class="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style="animation-delay: 150ms"></span>
                <span class="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style="animation-delay: 300ms"></span>
              </div>
              <!-- 有内容时 -->
              <div v-else class="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div v-if="msg.streaming" class="chat-md text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">{{ msg.content }}<span class="chat-cursor"></span></div>
                <div v-else class="chat-md text-sm text-gray-800 leading-relaxed" v-html="renderMd(msg.content)"></div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 输入区 -->
      <div class="px-4 pb-4 pt-2 bg-white border-t border-gray-100">
        <div class="flex gap-2 items-end bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 focus-within:border-purple-400 focus-within:bg-white transition-colors">
          <textarea
            v-model="chatInput"
            ref="chatInputRef"
            @keydown.enter.exact.prevent="sendChat"
            @keydown.enter.shift.exact="chatInput += '\n'"
            @input="autoResize"
            rows="1"
            :disabled="chatStreaming"
            placeholder="有什么想问的？"
            class="flex-1 bg-transparent resize-none focus:outline-none text-sm text-gray-800 placeholder-gray-400 leading-relaxed disabled:opacity-50 py-1"
            style="max-height: 120px; overflow-y: auto;"
          ></textarea>
          <button
            @click="sendChat"
            :disabled="!chatInput.trim() || chatStreaming"
            :class="[
              'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all mb-0.5',
              chatInput.trim() && !chatStreaming
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            ]"
          >
            <svg v-if="!chatStreaming" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
            <svg v-else class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </button>
        </div>
        <p class="text-center text-xs text-gray-300 mt-1.5">Enter 发送 · Shift+Enter 换行</p>
      </div>
    </div>

    <!-- 配置编辑弹窗 -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeModal">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">{{ editingConfig ? t('ai.editConfig') : t('ai.createConfig') }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="saveConfig" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('ai.configName') }} <span class="text-red-500">*</span></label>
            <input v-model="configForm.name" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500" :placeholder="t('ai.configNamePlaceholder')" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('ai.configDescription') }}</label>
            <input v-model="configForm.description" type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500" :placeholder="t('ai.configDescriptionPlaceholder')" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('ai.selectProvider') }} <span class="text-red-500">*</span></label>
            <select v-model="configForm.provider" @change="onProviderChange" required class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500">
              <option v-for="provider in aiProviders" :key="provider.value" :value="provider.value">{{ provider.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('ai.apiKey') }} <span class="text-red-500">*</span></label>
            <input v-model="configForm.apiKey" type="password" :required="!editingConfig" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500" :placeholder="editingConfig && configForm.hasApiKey ? t('ai.apiKeyConfigured') : t('ai.apiKeyPlaceholder')" />
            <p v-if="editingConfig && configForm.apiKeyPreview" class="mt-1 text-xs text-gray-500">{{ t('ai.apiKeyPreview') }}: {{ configForm.apiKeyPreview }}</p>
          </div>
          <div v-if="configForm.provider === 'wenxin'">
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('ai.secretKey') }} <span class="text-red-500">*</span></label>
            <input v-model="configForm.secretKey" type="password" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500" :placeholder="t('ai.secretKeyPlaceholder')" />
          </div>
          <div v-if="configForm.provider === 'minimax'">
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('ai.groupId') }} <span class="text-red-500">*</span></label>
            <input v-model="configForm.groupId" type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500" :placeholder="t('ai.groupIdPlaceholder')" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('ai.model') }} <span class="text-red-500">*</span></label>
            <select v-model="configForm.model" required class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500">
              <option v-for="model in currentProviderConfig?.models || []" :key="model.value" :value="model.value">{{ model.label }}</option>
            </select>
            <p v-if="currentProviderConfig?.models?.find(m => m.value === configForm.model)" class="mt-1 text-xs text-gray-500">{{ getModelDescription(configForm.model) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('ai.apiUrl') }} <span class="text-red-500">*</span></label>
            <input v-model="configForm.apiUrl" type="url" required class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500" placeholder="API 端点地址" />
          </div>
          <div class="flex gap-3 pt-4 border-t border-gray-200">
            <button type="submit" :disabled="savingConfig" class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium">
              {{ savingConfig ? t('ai.saving') : t('ai.saveConfig') }}
            </button>
            <button type="button" @click="testConfig" :disabled="testingConfig || (!configForm.apiKey && !configForm.hasApiKey && !editingConfig)" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium">
              {{ testingConfig ? t('ai.testing') : t('ai.testConnection') }}
            </button>
            <button type="button" @click="closeModal" class="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">{{ t('common.cancel') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { marked } from 'marked';
import { showToast } from '@/utils/toast';

// 配置 marked
marked.setOptions({ breaks: true, gfm: true });

const { t } = useI18n();

// Tab
const activeTab = ref('config');
const tabs = [
  { key: 'config', label: 'AI 配置' },
  { key: 'chat', label: 'AI 问答' }
];

// 弹窗状态
const showModal = ref(false);

// 配置列表
const configs = ref([]);
const defaultConfig = computed(() => configs.value.find(c => c.isDefault));

// 编辑状态
const editingConfig = ref(null);

// 配置表单
const configForm = reactive({
  name: '',
  description: '',
  provider: 'openai',
  apiKey: '',
  secretKey: '',
  groupId: '',
  model: '',
  apiUrl: '',
  hasApiKey: false,
  apiKeyPreview: null
});

const aiProviders = ref([]);
const currentProviderConfig = computed(() => {
  return aiProviders.value.find(p => p.value === configForm.provider);
});

const savingConfig = ref(false);
const testingConfig = ref(false);
const testingConfigId = ref(null);

// ---- Chat ----
const chatConfigId = ref('');
const chatMessages = ref([]);
const chatInput = ref('');
const chatStreaming = ref(false);
const chatContainer = ref(null);
const chatInputRef = ref(null);

const quickQuestions = [
  '如何排查 Network Error？',
  '解释一下 CORS 跨域问题',
  '常见的 JS 内存泄漏原因',
  'Vue 响应式原理是什么？',
];

const autoResize = () => {
  const el = chatInputRef.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
};

// markdown 渲染
const renderMd = (text) => {
  if (!text) return '';
  return marked.parse(text);
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const clearChat = () => {
  chatMessages.value = [];
};

const sendChat = async () => {
  const text = chatInput.value.trim();
  if (!text || chatStreaming.value) return;

  chatMessages.value.push({ role: 'user', content: text });
  chatInput.value = '';
  await scrollToBottom();

  // 直接 push 普通对象，通过索引修改确保响应式追踪
  chatMessages.value.push({ role: 'assistant', content: '', streaming: true });
  const msgIdx = chatMessages.value.length - 1;
  chatStreaming.value = true;

  const history = chatMessages.value
    .slice(0, -2)
    .filter(m => m.content)
    .map(m => ({ role: m.role, content: m.content }));

  try {
    const apiBase = import.meta.env.VITE_API_URL || '';
    const response = await fetch(`${apiBase}/api/ai/config/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no'
      },
      body: JSON.stringify({
        configId: chatConfigId.value || undefined,
        message: text,
        history
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || '请求失败');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let newlineIdx;
      while ((newlineIdx = buf.indexOf('\n')) !== -1) {
        const line = buf.slice(0, newlineIdx).trim();
        buf = buf.slice(newlineIdx + 1);
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (data === '[DONE]') {
          chatMessages.value[msgIdx].streaming = false;
          return;
        }
        try {
          const json = JSON.parse(data);
          if (json.type === 'delta' && json.content) {
            // 用数组索引赋值触发 Vue 响应式
            chatMessages.value[msgIdx] = {
              ...chatMessages.value[msgIdx],
              content: chatMessages.value[msgIdx].content + json.content
            };
            scrollToBottom();
          } else if (json.type === 'done') {
            chatMessages.value[msgIdx].streaming = false;
            return;
          } else if (json.type === 'error') {
            chatMessages.value[msgIdx] = {
              ...chatMessages.value[msgIdx],
              content: chatMessages.value[msgIdx].content + `\n\n> ⚠️ ${json.message}`,
              streaming: false
            };
            return;
          }
        } catch {}
      }
    }
  } catch (err) {
    chatMessages.value[msgIdx] = {
      ...chatMessages.value[msgIdx],
      content: `> ⚠️ 请求失败: ${err.message}`,
      streaming: false
    };
  } finally {
    chatMessages.value[msgIdx].streaming = false;
    chatStreaming.value = false;
    await scrollToBottom();
  }
};

// 获取提供商名称
const getProviderName = (value) => {
  const provider = aiProviders.value.find(p => p.value === value);
  return provider?.label || value;
};

const getModelDescription = (modelValue) => {
  const key = `ai.modelDescriptions.${modelValue}`;
  const translated = t(key);
  if (translated === key) {
    const model = currentProviderConfig.value?.models?.find(m => m.value === modelValue);
    return model?.description || '';
  }
  return translated;
};

const fetchAIProviders = async () => {
  try {
    const { data } = await axios.get('/api/ai/config/providers');
    aiProviders.value = data.providers;
  } catch (error) {
    console.error('Failed to fetch AI providers', error);
  }
};

const fetchConfigs = async () => {
  try {
    const { data } = await axios.get('/api/ai/config');
    configs.value = data.configs || [];
    // 默认选中默认配置
    if (!chatConfigId.value && configs.value.length > 0) {
      const def = configs.value.find(c => c.isDefault) || configs.value[0];
      chatConfigId.value = def._id;
    }
  } catch (error) {
    console.error('Failed to fetch AI configs', error);
    showToast(t('common.loadFailed'), 'error');
  }
};

const onProviderChange = () => {
  const provider = currentProviderConfig.value;
  if (provider) {
    configForm.apiUrl = provider.defaultUrl;
    configForm.model = provider.models[0]?.value || '';
  }
};

const openCreateModal = () => {
  resetForm();
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingConfig.value = null;
  resetForm();
};

const saveConfig = async () => {
  savingConfig.value = true;
  try {
    const payload = {
      name: configForm.name,
      description: configForm.description,
      provider: configForm.provider,
      model: configForm.model,
      apiUrl: configForm.apiUrl,
      extraConfig: {}
    };
    if (configForm.apiKey) payload.apiKey = configForm.apiKey;
    if (configForm.provider === 'wenxin' && configForm.secretKey) payload.extraConfig.secretKey = configForm.secretKey;
    if (configForm.provider === 'minimax' && configForm.groupId) payload.extraConfig.groupId = configForm.groupId;
    
    if (editingConfig.value) {
      await axios.put(`/api/ai/config/${editingConfig.value._id}`, payload);
      showToast(t('ai.configUpdated'), 'success');
    } else {
      await axios.post('/api/ai/config', payload);
      showToast(t('ai.configCreated'), 'success');
    }
    await fetchConfigs();
    closeModal();
  } catch (error) {
    showToast(error.response?.data?.error || t('ai.configSaveFailed'), 'error');
  } finally {
    savingConfig.value = false;
  }
};

const testConfig = async () => {
  testingConfig.value = true;
  try {
    let testPayload = {};
    if (editingConfig.value && !configForm.apiKey) {
      testPayload = { configId: editingConfig.value._id };
    } else {
      if (!configForm.apiKey) { showToast(t('ai.pleaseEnterApiKey'), 'warning'); return; }
      testPayload = { provider: configForm.provider, model: configForm.model, apiUrl: configForm.apiUrl, apiKey: configForm.apiKey, extraConfig: {} };
      if (configForm.provider === 'wenxin') {
        if (!configForm.secretKey) { showToast(t('ai.wenxinNeedsSecretKey'), 'warning'); return; }
        testPayload.extraConfig.secretKey = configForm.secretKey;
      }
      if (configForm.provider === 'minimax') {
        if (!configForm.groupId) { showToast(t('ai.minimaxNeedsGroupId'), 'warning'); return; }
        testPayload.extraConfig.groupId = configForm.groupId;
      }
    }
    const { data } = await axios.post('/api/ai/config/test', testPayload);
    if (data.success) { showToast(data.message || t('ai.testSuccess'), 'success'); }
    else { showToast(data.message || t('ai.testFailed'), 'error'); }
  } catch (error) {
    showToast(error.response?.data?.message || error.response?.data?.error || t('ai.testFailed'), 'error');
  } finally {
    testingConfig.value = false;
  }
};

const testConfigById = async (configId) => {
  testingConfigId.value = configId;
  try {
    const { data } = await axios.post('/api/ai/config/test', { configId });
    if (data.success) { showToast(data.message || t('ai.testSuccess'), 'success'); }
    else { showToast(data.message || t('ai.testFailed'), 'error'); }
  } catch (error) {
    showToast(error.response?.data?.message || error.response?.data?.error || t('ai.testFailed'), 'error');
  } finally {
    testingConfigId.value = null;
  }
};

const editConfig = (config) => {
  editingConfig.value = config;
  configForm.name = config.name;
  configForm.description = config.description || '';
  configForm.provider = config.provider;
  configForm.model = config.model;
  configForm.apiUrl = config.apiUrl;
  configForm.apiKey = '';
  configForm.secretKey = '';
  configForm.groupId = config.extraConfig?.groupId || '';
  configForm.hasApiKey = !!config.apiKeyPreview;
  configForm.apiKeyPreview = config.apiKeyPreview;
  showModal.value = true;
};

const deleteConfig = async (config) => {
  if (!confirm(t('ai.confirmDeleteConfig', { name: config.name }))) return;
  try {
    await axios.delete(`/api/ai/config/${config._id}`);
    showToast(t('ai.configDeleted'), 'success');
    await fetchConfigs();
  } catch (error) {
    showToast(error.response?.data?.error || t('common.deleteFailed'), 'error');
  }
};

const setDefaultConfig = async (configId) => {
  try {
    await axios.post(`/api/ai/config/${configId}/set-default`);
    showToast(t('ai.defaultConfigSet'), 'success');
    await fetchConfigs();
  } catch (error) {
    showToast(error.response?.data?.error || error.response?.data?.message || t('common.operationFailed'), 'error');
  }
};

const resetForm = () => {
  editingConfig.value = null;
  configForm.name = '';
  configForm.description = '';
  configForm.provider = 'openai';
  configForm.apiKey = '';
  configForm.secretKey = '';
  configForm.groupId = '';
  configForm.model = '';
  configForm.apiUrl = '';
  configForm.hasApiKey = false;
  configForm.apiKeyPreview = null;
  onProviderChange();
};

onMounted(() => {
  fetchAIProviders();
  fetchConfigs();
});
</script>

<style scoped>
/* markdown 渲染样式 */
.chat-md :deep(p) { margin: 0 0 0.6em; }
.chat-md :deep(p:last-child) { margin-bottom: 0; }
.chat-md :deep(h1), .chat-md :deep(h2), .chat-md :deep(h3),
.chat-md :deep(h4), .chat-md :deep(h5), .chat-md :deep(h6) {
  font-weight: 600;
  margin: 0.8em 0 0.4em;
  line-height: 1.4;
  color: #111827;
}
.chat-md :deep(h1) { font-size: 1.1em; }
.chat-md :deep(h2) { font-size: 1.05em; }
.chat-md :deep(h3) { font-size: 1em; }
.chat-md :deep(ul), .chat-md :deep(ol) {
  margin: 0.4em 0 0.6em;
  padding-left: 1.4em;
}
.chat-md :deep(li) { margin: 0.2em 0; }
.chat-md :deep(code) {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 0.1em 0.4em;
  font-size: 0.85em;
  font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
  color: #7c3aed;
}
.chat-md :deep(pre) {
  background: #1e1e2e;
  border-radius: 8px;
  padding: 1em;
  margin: 0.6em 0;
  overflow-x: auto;
}
.chat-md :deep(pre code) {
  background: none;
  border: none;
  padding: 0;
  color: #cdd6f4;
  font-size: 0.82em;
  line-height: 1.6;
}
.chat-md :deep(blockquote) {
  border-left: 3px solid #7c3aed;
  margin: 0.6em 0;
  padding: 0.3em 0.8em;
  background: #f5f3ff;
  border-radius: 0 6px 6px 0;
  color: #4b5563;
}
.chat-md :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 0.6em 0;
  font-size: 0.85em;
}
.chat-md :deep(th), .chat-md :deep(td) {
  border: 1px solid #e5e7eb;
  padding: 0.4em 0.7em;
  text-align: left;
}
.chat-md :deep(th) { background: #f9fafb; font-weight: 600; }
.chat-md :deep(tr:nth-child(even)) { background: #f9fafb; }
.chat-md :deep(a) { color: #7c3aed; text-decoration: underline; }
.chat-md :deep(hr) { border: none; border-top: 1px solid #e5e7eb; margin: 0.8em 0; }
.chat-md :deep(strong) { font-weight: 600; color: #111827; }

/* 光标闪烁 */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.chat-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: #7c3aed;
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: blink 0.8s step-end infinite;
}

/* bounce 延迟 */
.animate-bounce:nth-child(1) { animation-delay: 0ms; }
.animate-bounce:nth-child(2) { animation-delay: 150ms; }
.animate-bounce:nth-child(3) { animation-delay: 300ms; }
</style>
