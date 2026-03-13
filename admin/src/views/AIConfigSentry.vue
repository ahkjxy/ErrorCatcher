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
            @click="openCreateModal"
            class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium"
          >
            {{ t('ai.createConfig') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-6xl space-y-6">
        <!-- 当前默认配置状态 -->
        <div v-if="defaultConfig" class="border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t('ai.currentStatus') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-gray-50 rounded p-4">
              <div class="text-sm text-gray-600 mb-1">{{ t('ai.configName') }}</div>
              <div class="text-lg font-semibold text-gray-900">
                {{ defaultConfig.name }}
              </div>
            </div>
            <div class="bg-gray-50 rounded p-4">
              <div class="text-sm text-gray-600 mb-1">{{ t('ai.provider') }}</div>
              <div class="text-lg font-semibold text-gray-900">
                {{ getProviderName(defaultConfig.provider) || t('ai.notConfigured') }}
              </div>
            </div>
            <div class="bg-gray-50 rounded p-4">
              <div class="text-sm text-gray-600 mb-1">{{ t('ai.currentModel') }}</div>
              <div class="text-lg font-semibold text-gray-900">
                {{ defaultConfig.model || t('ai.notConfigured') }}
              </div>
            </div>
            <div class="bg-gray-50 rounded p-4">
              <div class="text-sm text-gray-600 mb-1">{{ t('ai.apiKeyStatus') }}</div>
              <div class="text-lg font-semibold text-gray-900">
                {{ defaultConfig.apiKeyPreview ? t('ai.configured') : t('ai.notConfigured') }}
              </div>
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
            <div
              v-for="config in configs"
              :key="config._id"
              class="p-6 hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h4 class="text-lg font-semibold text-gray-900">{{ config.name }}</h4>
                    <span
                      v-if="config.isDefault"
                      class="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded"
                    >
                      {{ t('ai.isDefault') }}
                    </span>
                    <span
                      :class="[
                        'px-2 py-0.5 text-xs font-medium rounded',
                        config.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      ]"
                    >
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
                    <button
                      v-if="!config.isDefault"
                      @click="setDefaultConfig(config._id)"
                      class="px-3 py-1 text-xs border border-purple-600 text-purple-600 rounded hover:bg-purple-50"
                    >
                      {{ t('ai.setAsDefault') }}
                    </button>
                    <button
                      @click="editConfig(config)"
                      class="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                    >
                      {{ t('ai.editConfig') }}
                    </button>
                    <button
                      v-if="!config.isDefault"
                      @click="deleteConfig(config)"
                      class="px-3 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50"
                    >
                      {{ t('ai.deleteConfig') }}
                    </button>
                  </div>
                  <button
                    @click="testConfigById(config._id)"
                    :disabled="testingConfigId === config._id"
                    class="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
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

    <!-- 配置编辑弹窗 -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ editingConfig ? t('ai.editConfig') : t('ai.createConfig') }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveConfig" class="p-6 space-y-4">
          <!-- 配置名称 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('ai.configName') }}
              <span class="text-red-500">*</span>
            </label>
            <input
              v-model="configForm.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
              :placeholder="t('ai.configNamePlaceholder')"
            />
          </div>

          <!-- 配置描述 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('ai.configDescription') }}
            </label>
            <input
              v-model="configForm.description"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
              :placeholder="t('ai.configDescriptionPlaceholder')"
            />
          </div>

          <!-- AI 提供商选择 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('ai.selectProvider') }}
              <span class="text-red-500">*</span>
            </label>
            <select
              v-model="configForm.provider"
              @change="onProviderChange"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
            >
              <option v-for="provider in aiProviders" :key="provider.value" :value="provider.value">
                {{ provider.label }}
              </option>
            </select>
          </div>

          <!-- API Key -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('ai.apiKey') }}
              <span class="text-red-500">*</span>
            </label>
            <input
              v-model="configForm.apiKey"
              type="password"
              :required="!editingConfig"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
              :placeholder="editingConfig && configForm.hasApiKey ? t('ai.apiKeyConfigured') : t('ai.apiKeyPlaceholder')"
            />
            <p v-if="editingConfig && configForm.apiKeyPreview" class="mt-1 text-xs text-gray-500">
              {{ t('ai.apiKeyPreview') }}: {{ configForm.apiKeyPreview }}
            </p>
          </div>

          <!-- Secret Key (仅文心一言) -->
          <div v-if="configForm.provider === 'wenxin'">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('ai.secretKey') }}
              <span class="text-red-500">*</span>
            </label>
            <input
              v-model="configForm.secretKey"
              type="password"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
              :placeholder="t('ai.secretKeyPlaceholder')"
            />
          </div>

          <!-- Group ID (仅 MiniMax) -->
          <div v-if="configForm.provider === 'minimax'">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('ai.groupId') }}
              <span class="text-red-500">*</span>
            </label>
            <input
              v-model="configForm.groupId"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
              :placeholder="t('ai.groupIdPlaceholder')"
            />
          </div>

          <!-- 模型选择 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('ai.model') }}
              <span class="text-red-500">*</span>
            </label>
            <select
              v-model="configForm.model"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
            >
              <option 
                v-for="model in currentProviderConfig?.models || []" 
                :key="model.value" 
                :value="model.value"
              >
                {{ model.label }}
              </option>
            </select>
            <p v-if="currentProviderConfig?.models?.find(m => m.value === configForm.model)" class="mt-1 text-xs text-gray-500">
              {{ getModelDescription(configForm.model) }}
            </p>
          </div>

          <!-- API URL -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('ai.apiUrl') }}
              <span class="text-red-500">*</span>
            </label>
            <input
              v-model="configForm.apiUrl"
              type="url"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
              placeholder="API 端点地址"
            />
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              :disabled="savingConfig"
              class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {{ savingConfig ? t('ai.saving') : t('ai.saveConfig') }}
            </button>
            <button
              type="button"
              @click="testConfig"
              :disabled="testingConfig || (!configForm.apiKey && !configForm.hasApiKey)"
              class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {{ testingConfig ? t('ai.testing') : t('ai.testConnection') }}
            </button>
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
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
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { showToast } from '@/utils/toast';

const { t } = useI18n();

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

// 获取提供商名称
const getProviderName = (value) => {
  const provider = aiProviders.value.find(p => p.value === value);
  return provider?.label || value;
};

// 获取模型描述（国际化）
const getModelDescription = (modelValue) => {
  const key = `ai.modelDescriptions.${modelValue}`;
  const translated = t(key);
  if (translated === key) {
    const model = currentProviderConfig.value?.models?.find(m => m.value === modelValue);
    return model?.description || '';
  }
  return translated;
};

// 获取 AI 提供商列表
const fetchAIProviders = async () => {
  try {
    const { data } = await axios.get('/api/ai/config/providers');
    aiProviders.value = data.providers;
  } catch (error) {
    console.error('Failed to fetch AI providers', error);
  }
};

// 获取配置列表
const fetchConfigs = async () => {
  try {
    const { data } = await axios.get('/api/ai/config');
    configs.value = data.configs || [];
  } catch (error) {
    console.error('Failed to fetch AI configs', error);
    showToast(t('common.loadFailed'), 'error');
  }
};

// 提供商变更
const onProviderChange = () => {
  const provider = currentProviderConfig.value;
  if (provider) {
    configForm.apiUrl = provider.defaultUrl;
    configForm.model = provider.models[0]?.value || '';
  }
};

// 打开创建弹窗
const openCreateModal = () => {
  resetForm();
  showModal.value = true;
};

// 关闭弹窗
const closeModal = () => {
  showModal.value = false;
  editingConfig.value = null;
  resetForm();
};

// 保存配置
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
    
    // 只有在输入了新的 API Key 时才发送
    if (configForm.apiKey) {
      payload.apiKey = configForm.apiKey;
    }
    
    // 文心一言需要 Secret Key
    if (configForm.provider === 'wenxin' && configForm.secretKey) {
      payload.extraConfig.secretKey = configForm.secretKey;
    }
    
    // MiniMax 需要 Group ID
    if (configForm.provider === 'minimax' && configForm.groupId) {
      payload.extraConfig.groupId = configForm.groupId;
    }
    
    if (editingConfig.value) {
      // 更新配置
      await axios.put(`/api/ai/config/${editingConfig.value._id}`, payload);
      showToast(t('ai.configUpdated'), 'success');
    } else {
      // 创建配置
      await axios.post('/api/ai/config', payload);
      showToast(t('ai.configCreated'), 'success');
    }
    
    // 重新获取配置列表
    await fetchConfigs();
    
    // 关闭弹窗
    closeModal();
  } catch (error) {
    showToast(error.response?.data?.error || t('ai.configSaveFailed'), 'error');
  } finally {
    savingConfig.value = false;
  }
};

// 测试配置
const testConfig = async () => {
  testingConfig.value = true;
  try {
    const testPayload = {
      provider: configForm.provider,
      model: configForm.model,
      apiUrl: configForm.apiUrl,
      extraConfig: {}
    };
    
    // 如果表单中有新的 API Key，使用新的；否则使用已保存的
    if (configForm.apiKey) {
      testPayload.apiKey = configForm.apiKey;
    } else if (!configForm.hasApiKey) {
      showToast(t('ai.pleaseEnterApiKey'), 'warning');
      return;
    }
    
    // 文心一言需要 Secret Key
    if (configForm.provider === 'wenxin') {
      if (configForm.secretKey) {
        testPayload.extraConfig.secretKey = configForm.secretKey;
      } else if (!editingConfig.value?.extraConfig?.secretKey) {
        showToast(t('ai.wenxinNeedsSecretKey'), 'warning');
        return;
      }
    }
    
    // MiniMax 需要 Group ID
    if (configForm.provider === 'minimax') {
      if (configForm.groupId) {
        testPayload.extraConfig.groupId = configForm.groupId;
      } else if (!editingConfig.value?.extraConfig?.groupId) {
        showToast(t('ai.minimaxNeedsGroupId'), 'warning');
        return;
      }
    }
    
    const { data } = await axios.post('/api/ai/config/test', testPayload);
    
    if (data.success) {
      showToast(data.message || t('ai.testSuccess'), 'success');
    } else {
      showToast(data.message || t('ai.testFailed'), 'error');
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.response?.data?.error || t('ai.testFailed');
    showToast(errorMsg, 'error');
    
    if (error.response?.data?.details) {
      console.error('Test failed details:', error.response.data.details);
    }
  } finally {
    testingConfig.value = false;
  }
};

// 测试配置（通过 ID）
const testConfigById = async (configId) => {
  testingConfigId.value = configId;
  try {
    const { data } = await axios.post('/api/ai/config/test', { configId });
    
    if (data.success) {
      showToast(data.message || t('ai.testSuccess'), 'success');
    } else {
      showToast(data.message || t('ai.testFailed'), 'error');
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.response?.data?.error || t('ai.testFailed');
    showToast(errorMsg, 'error');
    
    if (error.response?.data?.details) {
      console.error('Test failed details:', error.response.data.details);
    }
  } finally {
    testingConfigId.value = null;
  }
};

// 编辑配置
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

// 删除配置
const deleteConfig = async (config) => {
  if (!confirm(t('ai.confirmDeleteConfig', { name: config.name }))) {
    return;
  }
  
  try {
    await axios.delete(`/api/ai/config/${config._id}`);
    showToast(t('ai.configDeleted'), 'success');
    await fetchConfigs();
  } catch (error) {
    showToast(error.response?.data?.error || t('common.deleteFailed'), 'error');
  }
};

// 设置默认配置
const setDefaultConfig = async (configId) => {
  try {
    await axios.post(`/api/ai/config/${configId}/set-default`);
    showToast(t('ai.defaultConfigSet'), 'success');
    await fetchConfigs();
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.response?.data?.message || t('common.operationFailed');
    showToast(errorMsg, 'error');
  }
};

// 重置表单
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
  
  // 重新设置默认值
  onProviderChange();
};

onMounted(() => {
  fetchAIProviders();
  fetchConfigs();
});
</script>
