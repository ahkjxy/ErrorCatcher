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
    <div v-if="activeTab === 'chat'" class="flex-1 flex min-h-0">

      <!-- 左侧会话列表 -->
      <div class="w-56 flex-shrink-0 flex flex-col border-r border-gray-200 bg-gray-50">
        <div class="p-3 border-b border-gray-200">
          <button
            @click="newSession"
            class="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            新建对话
          </button>
        </div>
        <div class="flex-1 overflow-y-auto py-1">
          <div
            v-for="s in sessions"
            :key="s._id"
            @click="loadSession(s._id)"
            :class="[
              'group flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors text-xs',
              currentSessionId === s._id
                ? 'bg-purple-50 text-purple-700'
                : 'text-gray-600 hover:bg-gray-100'
            ]"
          >
            <svg class="w-3.5 h-3.5 flex-shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <span class="flex-1 truncate">{{ s.title }}</span>
            <button
              @click.stop="deleteSession(s._id)"
              class="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-500 transition-all"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div v-if="sessions.length === 0" class="px-3 py-6 text-center text-xs text-gray-400">
            暂无对话记录
          </div>
        </div>
      </div>

      <!-- 右侧对话区 -->
      <div class="flex-1 flex flex-col min-h-0 min-w-0 bg-gray-50">
        <!-- 顶栏 -->
        <div class="px-4 py-2.5 border-b border-gray-200 flex items-center gap-3 bg-white">
          <svg class="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
          </svg>
          <select
            v-model="chatConfigId"
            class="px-2.5 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 bg-white text-gray-700 font-medium"
          >
            <option v-for="c in configs" :key="c._id" :value="c._id">
              {{ c.name }} · {{ c.model }}{{ c.isDefault ? ' ✦' : '' }}
            </option>
          </select>
          <!-- 当前会话标题 -->
          <span v-if="currentSessionId" class="text-xs text-gray-400 truncate max-w-[120px]">
            {{ sessions.find(s => s._id === currentSessionId)?.title || '新对话' }}
          </span>
        </div>

        <!-- 消息列表 -->
        <div ref="chatContainer" class="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          <!-- 空状态 -->
          <div v-if="chatMessages.length === 0 && !chatStreaming" class="flex flex-col items-center justify-center h-full gap-3 select-none">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
              </svg>
            </div>
            <div class="text-center">
              <p class="text-gray-700 font-medium text-sm">AI 助手</p>
              <p class="text-gray-400 text-xs mt-1">可以问我代码、错误分析、技术方案等问题</p>
            </div>
            <div class="flex flex-wrap gap-2 justify-center mt-2 max-w-md">
              <button
                v-for="q in quickQuestions"
                :key="q"
                @click="chatInput = q; sendChat()"
                class="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-full text-gray-600 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-colors shadow-sm"
              >{{ q }}</button>
            </div>
          </div>

          <!-- 消息 -->
          <template v-for="(msg, idx) in chatMessages" :key="idx">
            <div v-if="msg.role === 'user'" class="flex justify-end">
              <div class="max-w-[75%] bg-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm">
                {{ msg.content }}
              </div>
            </div>
            <div v-else class="flex items-start gap-2.5">
              <div class="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                </svg>
              </div>
              <div class="flex-1 min-w-0 max-w-[85%]">
                <div class="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div class="chat-md text-sm text-gray-800 leading-relaxed" v-html="renderMd(msg.content)"></div>
                </div>
              </div>
            </div>
          </template>

          <!-- 流式消息 -->
          <div v-if="chatStreaming" class="flex items-start gap-2.5">
            <div class="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
              </svg>
            </div>
            <div class="flex-1 min-w-0 max-w-[85%]">
              <div v-if="!streamingContent" class="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm inline-flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style="animation-delay:0ms"></span>
                <span class="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style="animation-delay:150ms"></span>
                <span class="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style="animation-delay:300ms"></span>
              </div>
              <div v-else class="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div class="chat-md text-sm text-gray-800 leading-relaxed" v-html="renderMdStream(streamingContent)"></div>
              </div>
            </div>
          </div>
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
const chatMessages = ref([]);   // 已完成的消息
const streamingContent = ref(''); // 当前流式内容，独立 ref
const chatInput = ref('');
const chatStreaming = ref(false);
const chatContainer = ref(null);
const chatInputRef = ref(null);

// 会话管理
const sessions = ref([]);
const currentSessionId = ref(null);

const fetchSessions = async () => {
  try {
    const { data } = await axios.get('/api/chat-sessions');
    sessions.value = data.sessions || [];
  } catch {}
};

const newSession = () => {
  currentSessionId.value = null;
  chatMessages.value = [];
  streamingContent.value = '';
};

const loadSession = async (id) => {
  if (currentSessionId.value === id) return;
  try {
    const { data } = await axios.get(`/api/chat-sessions/${id}`);
    currentSessionId.value = id;
    chatMessages.value = data.session.messages || [];
    streamingContent.value = '';
    scrollToBottom();
  } catch {
    showToast('加载会话失败', 'error');
  }
};

const deleteSession = async (id) => {
  try {
    await axios.delete(`/api/chat-sessions/${id}`);
    sessions.value = sessions.value.filter(s => s._id !== id);
    if (currentSessionId.value === id) newSession();
  } catch {
    showToast('删除失败', 'error');
  }
};

// 对话结束后保存到后端
const saveSession = async (userMsg, assistantMsg) => {
  try {
    const selectedConfig = configs.value.find(c => c._id === chatConfigId.value);
    const snapshot = selectedConfig ? `${selectedConfig.name} · ${selectedConfig.model}` : '';

    if (!currentSessionId.value) {
      // 新建会话
      const { data } = await axios.post('/api/chat-sessions', {
        configId: chatConfigId.value,
        configSnapshot: snapshot
      });
      currentSessionId.value = data.session._id;
    }

    const { data } = await axios.post(`/api/chat-sessions/${currentSessionId.value}/messages`, {
      messages: [userMsg, assistantMsg]
    });

    // 更新列表标题
    await fetchSessions();
    // 同步当前会话标题
    if (data.title) {
      const s = sessions.value.find(s => s._id === currentSessionId.value);
      if (s) s.title = data.title;
    }
  } catch (e) {
    console.warn('保存会话失败', e);
  }
};

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

const renderMd = (text) => {
  if (!text) return '';
  return marked.parse(text);
};

// 流式渲染：在末尾插入光标后再解析 markdown
const renderMdStream = (text) => {
  if (!text) return '';
  // 在末尾加一个不可见占位，避免末尾未闭合 markdown 语法影响光标位置
  const html = marked.parse(text);
  // 把光标插入最后一个块级元素内部末尾
  return html.replace(/(<\/(?:p|li|h[1-6]|td)>)(?![\s\S]*<\/(?:p|li|h[1-6]|td)>)/, '<span class="chat-cursor"></span>$1');
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
};

const clearChat = () => {
  newSession();
};

const sendChat = async () => {
  const text = chatInput.value.trim();
  if (!text || chatStreaming.value) return;

  // push 用户消息
  chatMessages.value.push({ role: 'user', content: text });
  chatInput.value = '';
  if (chatInputRef.value) chatInputRef.value.style.height = 'auto';
  scrollToBottom();

  // 开始流式
  streamingContent.value = '';
  chatStreaming.value = true;

  const history = chatMessages.value
    .slice(0, -1)
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

    // 用宏任务逐字符渲染，实现真正的打字机效果
    const typeQueue = [];
    let typing = false;

    const flushType = () => {
      if (typing || typeQueue.length === 0) return;
      typing = true;
      const tick = () => {
        if (typeQueue.length === 0) { typing = false; scrollToBottom(); return; }
        // 每次取一小段（最多4个字符）渲染，速度快但有打字机感
        const chunk = typeQueue.splice(0, 4).join('');
        streamingContent.value += chunk;
        setTimeout(tick, 16); // ~60fps
      };
      tick();
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let nl;
      while ((nl = buf.indexOf('\n')) !== -1) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (data === '[DONE]') break;
        try {
          const json = JSON.parse(data);
          if (json.type === 'delta' && json.content) {
            // 把每个字符推入队列
            typeQueue.push(...json.content.split(''));
            flushType();
          } else if (json.type === 'error') {
            typeQueue.push(...(`\n\n> ⚠️ ${json.message}`).split(''));
            flushType();
          }
        } catch {}
      }
    }

    // 等待打字队列清空
    await new Promise(resolve => {
      const wait = () => typeQueue.length === 0 && !typing ? resolve() : setTimeout(wait, 50);
      wait();
    });
  } catch (err) {
    streamingContent.value = streamingContent.value || `> ⚠️ 请求失败: ${err.message}`;
  } finally {
    // 流结束，固化进历史
    if (streamingContent.value) {
      const userMsg = { role: 'user', content: text };
      const assistantMsg = { role: 'assistant', content: streamingContent.value };
      chatMessages.value.push(assistantMsg);
      // 异步保存，不阻塞 UI
      saveSession(userMsg, assistantMsg);
    }
    streamingContent.value = '';
    chatStreaming.value = false;
    scrollToBottom();
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
  fetchSessions();
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
