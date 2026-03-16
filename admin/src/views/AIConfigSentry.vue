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
    <div v-if="activeTab === 'chat'" class="flex-1 flex flex-col min-h-0">
      <!-- 模型选择栏 -->
      <div class="px-6 py-3 border-b border-gray-200 flex items-center gap-3 bg-gray-50">
        <span class="text-sm text-gray-600 whitespace-nowrap">使用模型：</span>
        <select
          v-model="chatConfigId"
          class="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-purple-500 bg-white"
        >
          <option v-for="c in configs" :key="c._id" :value="c._id">
            {{ c.name }} · {{ c.model }}{{ c.isDefault ? ' (默认)' : '' }}
          </option>
        </select>
        <button
          @click="clearChat"
          class="ml-auto px-3 py-1.5 text-xs text-gray-500 border border-gray-300 rounded hover:bg-gray-100"
        >
          清空对话
        </button>
      </div>

      <!-- 消息列表 -->
      <div ref="chatContainer" class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <div v-if="chatMessages.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400">
          <svg class="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p class="text-sm">向 AI 提问任何技术问题</p>
        </div>

        <div v-for="(msg, idx) in chatMessages" :key="idx" :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">
          <!-- AI 消息 -->
          <div v-if="msg.role === 'assistant'" class="flex items-start gap-3 max-w-[80%]">
            <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
              </svg>
            </div>
            <div class="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
              <span>{{ msg.content }}</span>
              <span v-if="msg.streaming" class="inline-block w-1.5 h-4 bg-purple-500 ml-0.5 animate-pulse align-middle"></span>
            </div>
          </div>
          <!-- 用户消息 -->
          <div v-else class="max-w-[80%] bg-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words">
            {{ msg.content }}
          </div>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="px-6 py-4 border-t border-gray-200 bg-white">
        <div class="flex gap-3 items-end">
          <textarea
            v-model="chatInput"
            @keydown.enter.exact.prevent="sendChat"
            @keydown.enter.shift.exact="chatInput += '\n'"
            rows="1"
            :disabled="chatStreaming"
            placeholder="输入问题，Enter 发送，Shift+Enter 换行..."
            class="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl resize-none focus:outline-none focus:border-purple-500 text-sm leading-relaxed disabled:opacity-50"
            style="max-height: 120px; overflow-y: auto;"
          ></textarea>
          <button
            @click="sendChat"
            :disabled="!chatInput.trim() || chatStreaming"
            class="px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm font-medium flex-shrink-0"
          >
            <svg v-if="!chatStreaming" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ chatStreaming ? '生成中' : '发送' }}
          </button>
        </div>
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
import { showToast } from '@/utils/toast';

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

  const assistantMsg = reactive({ role: 'assistant', content: '', streaming: true });
  chatMessages.value.push(assistantMsg);
  chatStreaming.value = true;

  // 构建历史（不含当前这条 assistant 占位）
  const history = chatMessages.value
    .slice(0, -1)
    .filter(m => m.role !== 'assistant' || m.content)
    .map(m => ({ role: m.role, content: m.content }));

  try {
    const response = await fetch('/api/ai/config/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ configId: chatConfigId.value || undefined, message: text, history: history.slice(0, -1) })
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
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        try {
          const json = JSON.parse(line.slice(5));
          if (json.type === 'delta') {
            assistantMsg.content += json.content;
            await scrollToBottom();
          } else if (json.type === 'done') {
            assistantMsg.streaming = false;
          } else if (json.type === 'error') {
            assistantMsg.content += `\n[错误: ${json.message}]`;
            assistantMsg.streaming = false;
          }
        } catch {}
      }
    }
  } catch (err) {
    assistantMsg.content = `请求失败: ${err.message}`;
  } finally {
    assistantMsg.streaming = false;
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
