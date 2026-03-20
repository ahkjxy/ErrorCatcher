<template>
  <div class="h-full flex bg-white">
    <!-- 侧边栏目录 -->
    <aside class="w-64 border-r border-gray-200 overflow-y-auto">
      <div class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          <span v-if="locale === 'zh'">文档</span>
          <span v-else>Documentation</span>
        </h2>
        <nav class="space-y-1">
          <button
            v-for="section in sections"
            :key="section.id"
            @click="activeSection = section.id"
            :class="[
              'w-full text-left px-3 py-2 rounded text-sm transition-colors',
              activeSection === section.id
                ? 'bg-purple-50 text-purple-600 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            ]"
          >
            <span v-if="locale === 'zh'">{{ section.titleZh }}</span>
            <span v-else>{{ section.title }}</span>
          </button>
        </nav>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="flex-1 overflow-y-auto">
      <div class="max-w-4xl mx-auto p-8">
        <!-- Getting Started -->
        <div v-if="activeSection === 'getting-started'">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">Getting Started</h1>
          <p class="text-gray-600 mb-6">Welcome to ErrorCatcher! This guide will help you get started with monitoring your applications.</p>

          <div class="space-y-6">
            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">What is ErrorCatcher?</h2>
              <p class="text-gray-700 mb-4">
                ErrorCatcher is a comprehensive error tracking and monitoring platform that helps you identify, track, and resolve errors in your applications. 
                It provides real-time error reporting, intelligent grouping, and powerful alerting capabilities.
              </p>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">Quick Start</h2>
              <ol class="list-decimal list-inside space-y-2 text-gray-700">
                <li>Create a new project in the Projects section</li>
                <li>Copy your project's API key</li>
                <li>Install the ErrorCatcher SDK in your application</li>
                <li>Initialize the SDK with your API key</li>
                <li>Start monitoring errors!</li>
              </ol>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">Installation</h2>
              <div class="bg-gray-900 text-gray-100 p-4 rounded mb-4 overflow-x-auto">
                <pre><code>npm install error-catcher
# or
yarn add error-catcher</code></pre>
              </div>
              <p class="text-gray-700">Initialize in your application:</p>
              <div class="bg-gray-900 text-gray-100 p-4 rounded mt-2 overflow-x-auto">
                <pre><code>import ErrorCatcher from 'error-catcher';

const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/errors/report',
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  environment: 'production'
});</code></pre>
              </div>
              <p class="text-sm text-gray-500 mt-2">
                <span v-if="locale === 'zh'">自动启动，无需手动调用 init()。可通过 autoStart: false 禁用。</span>
                <span v-else>Auto-initializes, no need to call init(). Disable with autoStart: false.</span>
              </p>
            </section>
          </div>
        </div>

        <!-- Projects -->
        <div v-if="activeSection === 'projects'">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ t('projects.title') }}</h1>
          <p class="text-gray-600 mb-6">Learn how to manage your projects and configure error tracking.</p>

          <div class="space-y-6">
            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">Creating a Project</h2>
              <p class="text-gray-700 mb-4">
                Projects are the foundation of ErrorCatcher. Each project represents an application or service you want to monitor.
              </p>
              <ol class="list-decimal list-inside space-y-2 text-gray-700">
                <li>Navigate to the Projects page</li>
                <li>Click "Create Project"</li>
                <li>Enter project name, platform, and description</li>
                <li>Click "Create" to generate your API key</li>
              </ol>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">Project Settings</h2>
              <p class="text-gray-700 mb-4">
                Each project has its own API key, configuration, and team members. You can manage these settings from the project detail page.
              </p>
              <ul class="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>API Key:</strong> Used to authenticate your application</li>
                <li><strong>Owner:</strong> The user responsible for the project</li>
                <li><strong>Members:</strong> Team members with access to the project</li>
                <li><strong>Status:</strong> Active or inactive</li>
              </ul>
            </section>
          </div>
        </div>

        <!-- Issues & Errors -->
        <div v-if="activeSection === 'issues-errors'">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">Issues & Errors</h1>
          <p class="text-gray-600 mb-6">Understand how errors are captured, grouped, and managed.</p>

          <div class="space-y-6">
            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">What's the Difference?</h2>
              <div class="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
                <p class="text-blue-900"><strong>Errors:</strong> Individual error events captured from your application</p>
              </div>
              <div class="bg-purple-50 border border-purple-200 rounded p-4">
                <p class="text-purple-900"><strong>Issues:</strong> Grouped errors with the same fingerprint (similar stack traces)</p>
              </div>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">Error Levels</h2>
              <ul class="space-y-2">
                <li class="flex items-center gap-2">
                  <span class="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">ERROR</span>
                  <span class="text-gray-700">Critical errors that need immediate attention</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">WARNING</span>
                  <span class="text-gray-700">Potential issues that should be reviewed</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">INFO</span>
                  <span class="text-gray-700">Informational messages for debugging</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">Managing Issues</h2>
              <p class="text-gray-700 mb-4">You can manage issues with the following actions:</p>
              <ul class="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Resolve:</strong> Mark the issue as fixed</li>
                <li><strong>Ignore:</strong> Hide the issue from your dashboard</li>
                <li><strong>Delete:</strong> Permanently remove the issue</li>
              </ul>
            </section>
          </div>
        </div>

        <!-- Alerts -->
        <div v-if="activeSection === 'alerts'">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ t('alerts.title') }}</h1>
          <p class="text-gray-600 mb-6">Configure alert rules to get notified about critical issues.</p>

          <div class="space-y-6">
            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">Creating Alert Rules</h2>
              <p class="text-gray-700 mb-4">
                Alert rules allow you to automatically receive notifications when specific conditions are met.
              </p>
              <ol class="list-decimal list-inside space-y-2 text-gray-700">
                <li>Navigate to the Alerts page</li>
                <li>Click "Create Alert Rule"</li>
                <li>Configure trigger conditions (error count, time window, etc.)</li>
                <li>Select notification channels</li>
                <li>Save and enable the alert</li>
              </ol>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">Alert Conditions</h2>
              <ul class="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Error Count:</strong> Trigger when error count exceeds threshold</li>
                <li><strong>Time Window:</strong> Time period to evaluate the condition</li>
                <li><strong>Error Level:</strong> Filter by error severity</li>
                <li><strong>Environment:</strong> Filter by deployment environment</li>
                <li><strong>Affected Users:</strong> Trigger based on user impact</li>
              </ul>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">Priority Levels</h2>
              <ul class="space-y-2">
                <li class="flex items-center gap-2">
                  <span class="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">CRITICAL</span>
                  <span class="text-gray-700">Requires immediate action</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">HIGH</span>
                  <span class="text-gray-700">Should be addressed soon</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">MEDIUM</span>
                  <span class="text-gray-700">Normal priority</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">LOW</span>
                  <span class="text-gray-700">Can be addressed later</span>
                </li>
              </ul>
            </section>
          </div>
        </div>

        <!-- Notifications -->
        <div v-if="activeSection === 'notifications'">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ t('notifications.title') }}</h1>
          <p class="text-gray-600 mb-6">Set up notification channels to receive alerts.</p>

          <div class="space-y-6">
            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">Supported Channels</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="border border-gray-200 rounded p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">📱</span>
                    <h3 class="font-semibold text-gray-900">DingTalk</h3>
                  </div>
                  <p class="text-sm text-gray-600">Send notifications to DingTalk groups via webhook</p>
                </div>
                <div class="border border-gray-200 rounded p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">📧</span>
                    <h3 class="font-semibold text-gray-900">{{ t('users.email') }}</h3>
                  </div>
                  <p class="text-sm text-gray-600">Send email notifications to team members</p>
                </div>
                <div class="border border-gray-200 rounded p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">🔗</span>
                    <h3 class="font-semibold text-gray-900">Webhook</h3>
                  </div>
                  <p class="text-sm text-gray-600">Send HTTP requests to custom endpoints</p>
                </div>
                <div class="border border-gray-200 rounded p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">💬</span>
                    <h3 class="font-semibold text-gray-900">WeChat Work</h3>
                  </div>
                  <p class="text-sm text-gray-600">Send notifications to WeChat Work groups</p>
                </div>
              </div>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">Configuration</h2>
              <p class="text-gray-700 mb-4">
                Each notification channel requires specific configuration:
              </p>
              <ul class="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Name:</strong> Identifier for the configuration</li>
                <li><strong>Type:</strong> Channel type (DingTalk, Email, etc.)</li>
                <li><strong>Project:</strong> Scope to specific project or global</li>
                <li><strong>Credentials:</strong> Webhook URL, API keys, etc.</li>
              </ul>
            </section>
          </div>
        </div>

        <!-- AI Error Analysis -->
        <div v-if="activeSection === 'ai-analysis'">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">
            <span v-if="locale === 'zh'">AI 智能错误分析</span>
            <span v-else>AI Error Analysis</span>
          </h1>
          <p class="text-gray-600 mb-6">
            <span v-if="locale === 'zh'">使用 AI 自动分析错误的根本原因，提供修复建议和预防措施。</span>
            <span v-else>Use AI to automatically analyze error root causes and provide fix suggestions and prevention tips.</span>
          </p>

          <div class="space-y-6">
            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">
                <span v-if="locale === 'zh'">功能特性</span>
                <span v-else>Features</span>
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="border border-blue-200 bg-blue-50 rounded p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">🔍</span>
                    <h3 class="font-semibold text-blue-900">
                      <span v-if="locale === 'zh'">智能诊断</span>
                      <span v-else>Smart Diagnosis</span>
                    </h3>
                  </div>
                  <ul class="text-sm text-blue-800 space-y-1">
                    <li v-if="locale === 'zh'">• 自动识别错误根本原因</li>
                    <li v-else>• Auto identify root causes</li>
                    <li v-if="locale === 'zh'">• 分析错误类别</li>
                    <li v-else>• Analyze error categories</li>
                    <li v-if="locale === 'zh'">• 提供置信度评分</li>
                    <li v-else>• Provide confidence scores</li>
                  </ul>
                </div>
                
                <div class="border border-purple-200 bg-purple-50 rounded p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">💡</span>
                    <h3 class="font-semibold text-purple-900">
                      <span v-if="locale === 'zh'">修复建议</span>
                      <span v-else>Fix Suggestions</span>
                    </h3>
                  </div>
                  <ul class="text-sm text-purple-800 space-y-1">
                    <li v-if="locale === 'zh'">• 具体的修复方案</li>
                    <li v-else>• Specific fix solutions</li>
                    <li v-if="locale === 'zh'">• 按优先级排序</li>
                    <li v-else>• Prioritized suggestions</li>
                    <li v-if="locale === 'zh'">• 详细实施步骤</li>
                    <li v-else>• Detailed implementation steps</li>
                  </ul>
                </div>
                
                <div class="border border-green-200 bg-green-50 rounded p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">🛡️</span>
                    <h3 class="font-semibold text-green-900">
                      <span v-if="locale === 'zh'">预防建议</span>
                      <span v-else>Prevention Tips</span>
                    </h3>
                  </div>
                  <ul class="text-sm text-green-800 space-y-1">
                    <li v-if="locale === 'zh'">• 最佳实践建议</li>
                    <li v-else>• Best practice recommendations</li>
                    <li v-if="locale === 'zh'">• 避免类似错误</li>
                    <li v-else>• Avoid similar errors</li>
                    <li v-if="locale === 'zh'">• 代码质量提升</li>
                    <li v-else>• Code quality improvement</li>
                  </ul>
                </div>
                
                <div class="border border-orange-200 bg-orange-50 rounded p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-2xl">🔗</span>
                    <h3 class="font-semibold text-orange-900">
                      <span v-if="locale === 'zh'">关联分析</span>
                      <span v-else>Related Analysis</span>
                    </h3>
                  </div>
                  <ul class="text-sm text-orange-800 space-y-1">
                    <li v-if="locale === 'zh'">• 查找相似错误</li>
                    <li v-else>• Find similar errors</li>
                    <li v-if="locale === 'zh'">• 识别系统性问题</li>
                    <li v-else>• Identify systemic issues</li>
                    <li v-if="locale === 'zh'">• 模式识别</li>
                    <li v-else>• Pattern recognition</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">
                <span v-if="locale === 'zh'">支持的 AI 服务提供商</span>
                <span v-else>Supported AI Providers</span>
              </h2>
              <p class="text-gray-700 mb-4">
                <span v-if="locale === 'zh'">ErrorCatcher 支持多个主流 AI 服务提供商，您可以根据需求选择：</span>
                <span v-else>ErrorCatcher supports multiple mainstream AI providers. Choose based on your needs:</span>
              </p>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div class="border border-gray-200 rounded p-3">
                  <p class="font-semibold text-gray-900">OpenAI</p>
                  <p class="text-xs text-gray-600 mt-1">GPT-5.4 - <span v-if="locale === 'zh'">最新旗舰模型</span><span v-else>Latest flagship</span></p>
                </div>
                <div class="border border-gray-200 rounded p-3">
                  <p class="font-semibold text-gray-900">Google Gemini</p>
                  <p class="text-xs text-gray-600 mt-1">Gemini 3.1 Pro - <span v-if="locale === 'zh'">多模态能力强</span><span v-else>Strong multimodal</span></p>
                </div>
                <div class="border border-gray-200 rounded p-3">
                  <p class="font-semibold text-gray-900">Anthropic Claude</p>
                  <p class="text-xs text-gray-600 mt-1">Claude Opus 4.6 - <span v-if="locale === 'zh'">编程领先</span><span v-else>Coding leader</span></p>
                </div>
                <div class="border border-gray-200 rounded p-3">
                  <p class="font-semibold text-gray-900">DeepSeek</p>
                  <p class="text-xs text-gray-600 mt-1"><span v-if="locale === 'zh'">深度推理能力强</span><span v-else>Strong reasoning</span></p>
                </div>
                <div class="border border-gray-200 rounded p-3">
                  <p class="font-semibold text-gray-900"><span v-if="locale === 'zh'">通义千问</span><span v-else>Qwen</span></p>
                  <p class="text-xs text-gray-600 mt-1">Qwen 3.5 - <span v-if="locale === 'zh'">中文理解优秀</span><span v-else>Excellent Chinese</span></p>
                </div>
                <div class="border border-gray-200 rounded p-3">
                  <p class="font-semibold text-gray-900">Moonshot AI</p>
                  <p class="text-xs text-gray-600 mt-1">Kimi K2.5 - <span v-if="locale === 'zh'">长上下文</span><span v-else>Long context</span></p>
                </div>
                <div class="border border-gray-200 rounded p-3">
                  <p class="font-semibold text-gray-900">MiniMax</p>
                  <p class="text-xs text-gray-600 mt-1"><span v-if="locale === 'zh'">高性价比</span><span v-else>Cost-effective</span></p>
                </div>
                <div class="border border-gray-200 rounded p-3">
                  <p class="font-semibold text-gray-900"><span v-if="locale === 'zh'">阶跃星辰</span><span v-else>Stepfun</span></p>
                  <p class="text-xs text-gray-600 mt-1">Step 3.5 - <span v-if="locale === 'zh'">推理速度快</span><span v-else>Fast inference</span></p>
                </div>
                <div class="border border-gray-200 rounded p-3">
                  <p class="font-semibold text-gray-900">NVIDIA</p>
                  <p class="text-xs text-gray-600 mt-1">Nemotron 3 - <span v-if="locale === 'zh'">企业级</span><span v-else>Enterprise</span></p>
                </div>
              </div>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">
                <span v-if="locale === 'zh'">配置 AI 服务</span>
                <span v-else>Configure AI Service</span>
              </h2>
              <p class="text-gray-700 mb-4">
                <span v-if="locale === 'zh'">通过管理界面配置 AI 服务（推荐方式）：</span>
                <span v-else>Configure AI service through admin interface (recommended):</span>
              </p>
              <ol class="list-decimal list-inside space-y-2 text-gray-700">
                <li v-if="locale === 'zh'">以管理员身份登录后台</li>
                <li v-else>Login as administrator</li>
                <li v-if="locale === 'zh'">点击左侧导航栏的 "设置"</li>
                <li v-else>Click "Settings" in sidebar</li>
                <li v-if="locale === 'zh'">选择 "AI 分析配置"</li>
                <li v-else>Select "AI Analysis Config"</li>
                <li v-if="locale === 'zh'">选择 AI 提供商和模型</li>
                <li v-else>Choose AI provider and model</li>
                <li v-if="locale === 'zh'">填写 API Key 和 API URL</li>
                <li v-else>Fill in API Key and API URL</li>
                <li v-if="locale === 'zh'">点击 "测试连接" 验证配置</li>
                <li v-else>Click "Test Connection" to verify</li>
                <li v-if="locale === 'zh'">保存配置并启用</li>
                <li v-else>Save and enable configuration</li>
              </ol>
              <div class="bg-blue-50 border border-blue-200 rounded p-4 mt-4">
                <p class="text-blue-900">
                  <strong>💡 <span v-if="locale === 'zh'">提示</span><span v-else>Tip</span>:</strong>
                  <span v-if="locale === 'zh'">配置保存在数据库中，不需要修改环境变量。测试连接会使用表单中的当前配置，无需先保存。</span>
                  <span v-else>Configuration is saved in database, no need to modify environment variables. Test connection uses current form values without saving first.</span>
                </p>
              </div>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">
                <span v-if="locale === 'zh'">使用 AI 分析</span>
                <span v-else>Using AI Analysis</span>
              </h2>
              <p class="text-gray-700 mb-4">
                <span v-if="locale === 'zh'">在错误详情页面使用 AI 分析：</span>
                <span v-else>Use AI analysis in error detail page:</span>
              </p>
              <ol class="list-decimal list-inside space-y-2 text-gray-700">
                <li v-if="locale === 'zh'">打开任意错误详情页面</li>
                <li v-else>Open any error detail page</li>
                <li v-if="locale === 'zh'">点击 "AI 分析" 标签</li>
                <li v-else>Click "AI Analysis" tab</li>
                <li v-if="locale === 'zh'">点击 "开始 AI 分析" 按钮</li>
                <li v-else>Click "Start AI Analysis" button</li>
                <li v-if="locale === 'zh'">等待几秒钟，查看分析结果</li>
                <li v-else>Wait a few seconds for results</li>
              </ol>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">
                <span v-if="locale === 'zh'">分析结果示例</span>
                <span v-else>Analysis Result Example</span>
              </h2>
              <div class="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                <pre><code>{
  "rootCause": "<span v-if="locale === 'zh'">API 请求超时导致的网络错误</span><span v-else>Network error caused by API timeout</span>",
  "category": "<span v-if="locale === 'zh'">网络错误</span><span v-else>Network Error</span>",
  "confidence": 0.85,
  "analysis": "<span v-if="locale === 'zh'">根据错误堆栈和状态码分析...</span><span v-else>Based on error stack and status code...</span>",
  "possibleReasons": [
    "<span v-if="locale === 'zh'">后端服务响应缓慢</span><span v-else>Backend service slow response</span>",
    "<span v-if="locale === 'zh'">网络连接不稳定</span><span v-else>Unstable network connection</span>"
  ],
  "suggestedFixes": [
    {
      "title": "<span v-if="locale === 'zh'">增加请求超时时间</span><span v-else>Increase timeout</span>",
      "priority": "high"
    }
  ]
}</code></pre>
              </div>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">
                <span v-if="locale === 'zh'">错误类别</span>
                <span v-else>Error Categories</span>
              </h2>
              <p class="text-gray-700 mb-4">
                <span v-if="locale === 'zh'">AI 会将错误分类到以下类别：</span>
                <span v-else>AI categorizes errors into:</span>
              </p>
              <ul class="space-y-2">
                <li class="flex items-center gap-2">
                  <span class="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded"><span v-if="locale === 'zh'">网络错误</span><span v-else>Network Error</span></span>
                  <span class="text-gray-700 text-sm"><span v-if="locale === 'zh'">API 请求失败、超时等</span><span v-else>API failures, timeouts</span></span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded"><span v-if="locale === 'zh'">代码错误</span><span v-else>Code Error</span></span>
                  <span class="text-gray-700 text-sm"><span v-if="locale === 'zh'">语法错误、逻辑错误等</span><span v-else>Syntax, logic errors</span></span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded"><span v-if="locale === 'zh'">配置错误</span><span v-else>Config Error</span></span>
                  <span class="text-gray-700 text-sm"><span v-if="locale === 'zh'">环境变量、配置文件错误</span><span v-else>Environment, config issues</span></span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded"><span v-if="locale === 'zh'">数据错误</span><span v-else>Data Error</span></span>
                  <span class="text-gray-700 text-sm"><span v-if="locale === 'zh'">数据格式、验证错误</span><span v-else>Data format, validation</span></span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded"><span v-if="locale === 'zh'">权限错误</span><span v-else>Permission Error</span></span>
                  <span class="text-gray-700 text-sm"><span v-if="locale === 'zh'">认证、授权失败</span><span v-else>Auth, authorization failures</span></span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded"><span v-if="locale === 'zh'">性能问题</span><span v-else>Performance Issue</span></span>
                  <span class="text-gray-700 text-sm"><span v-if="locale === 'zh'">响应慢、内存泄漏等</span><span v-else>Slow response, memory leaks</span></span>
                </li>
              </ul>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">
                <span v-if="locale === 'zh'">故障排查</span>
                <span v-else>Troubleshooting</span>
              </h2>
              <div class="space-y-3">
                <div class="border border-gray-200 rounded p-3">
                  <p class="font-semibold text-gray-900 mb-1">
                    <span v-if="locale === 'zh'">问题：AI 分析不可用</span>
                    <span v-else>Issue: AI analysis unavailable</span>
                  </p>
                  <p class="text-sm text-gray-700">
                    <span v-if="locale === 'zh'">解决：检查 AI 配置是否正确，API Key 是否有效，使用测试连接功能验证。</span>
                    <span v-else>Solution: Check AI config, verify API Key validity, use test connection feature.</span>
                  </p>
                </div>
                <div class="border border-gray-200 rounded p-3">
                  <p class="font-semibold text-gray-900 mb-1">
                    <span v-if="locale === 'zh'">问题：分析失败</span>
                    <span v-else>Issue: Analysis failed</span>
                  </p>
                  <p class="text-sm text-gray-700">
                    <span v-if="locale === 'zh'">解决：查看错误详情中的 errorDetails 字段，包含 AI 服务返回的具体错误信息。</span>
                    <span v-else>Solution: Check errorDetails field in error response for specific AI service error messages.</span>
                  </p>
                </div>
                <div class="border border-gray-200 rounded p-3">
                  <p class="font-semibold text-gray-900 mb-1">
                    <span v-if="locale === 'zh'">问题：测试连接返回错误</span>
                    <span v-else>Issue: Test connection returns error</span>
                  </p>
                  <p class="text-sm text-gray-700">
                    <span v-if="locale === 'zh'">解决：测试连接 API 返回 200 状态码，在响应体的 success 字段标识成功或失败，message 字段包含详细错误信息。</span>
                    <span v-else>Solution: Test API returns 200 status, check success field in response body, message field contains detailed error info.</span>
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">
                <span v-if="locale === 'zh'">最佳实践</span>
                <span v-else>Best Practices</span>
              </h2>
              <ul class="list-disc list-inside space-y-2 text-gray-700">
                <li v-if="locale === 'zh'">选择性分析：优先分析新出现的、高频的、影响用户多的错误</li>
                <li v-else>Selective analysis: Prioritize new, frequent, high-impact errors</li>
                <li v-if="locale === 'zh'">使用缓存：系统自动缓存分析结果，避免重复分析</li>
                <li v-else>Use cache: System auto-caches results to avoid duplicate analysis</li>
                <li v-if="locale === 'zh'">提供反馈：对 AI 分析提供反馈，帮助改进分析质量</li>
                <li v-else>Provide feedback: Give feedback on AI analysis to improve quality</li>
                <li v-if="locale === 'zh'">成本控制：使用性价比高的模型（如 MiniMax M2.5、DeepSeek）</li>
                <li v-else>Cost control: Use cost-effective models (MiniMax M2.5, DeepSeek)</li>
              </ul>
            </section>
          </div>
        </div>

        <!-- Detailed Error Capture -->
        <div v-if="activeSection === 'detailed-errors'">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">Detailed Error Capture</h1>
          <p class="text-gray-600 mb-6">ErrorCatcher automatically captures comprehensive error information to help you debug issues faster.</p>

          <div class="space-y-6">
            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">What Gets Captured?</h2>
              <p class="text-gray-700 mb-4">Every error includes detailed information across multiple categories:</p>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="border border-blue-200 bg-blue-50 rounded p-4">
                  <h3 class="font-semibold text-blue-900 mb-2">🖥️ DOM State</h3>
                  <ul class="text-sm text-blue-800 space-y-1">
                    <li>• Active element</li>
                    <li>• Scroll position</li>
                    <li>• Viewport size</li>
                    <li>• Document state</li>
                  </ul>
                </div>
                
                <div class="border border-purple-200 bg-purple-50 rounded p-4">
                  <h3 class="font-semibold text-purple-900 mb-2">🌐 Browser Info</h3>
                  <ul class="text-sm text-purple-800 space-y-1">
                    <li>• Memory usage</li>
                    <li>• Performance metrics</li>
                    <li>• Connection info</li>
                    <li>• Storage size</li>
                  </ul>
                </div>
                
                <div class="border border-green-200 bg-green-50 rounded p-4">
                  <h3 class="font-semibold text-green-900 mb-2">📡 Network Info</h3>
                  <ul class="text-sm text-green-800 space-y-1">
                    <li>• Online status</li>
                    <li>• Connection type</li>
                    <li>• Download speed</li>
                    <li>• Round trip time</li>
                  </ul>
                </div>
                
                <div class="border border-orange-200 bg-orange-50 rounded p-4">
                  <h3 class="font-semibold text-orange-900 mb-2">🔗 HTTP Details</h3>
                  <ul class="text-sm text-orange-800 space-y-1">
                    <li>• Request/response</li>
                    <li>• Headers & body</li>
                    <li>• Response size</li>
                    <li>• cURL command</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">DOM State Information</h2>
              <p class="text-gray-700 mb-4">Understand the page state when the error occurred:</p>
              <div class="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                <pre><code>{
  documentReady: 'complete',
  activeElement: 'BUTTON',
  scrollPosition: { x: 0, y: 500 },
  viewport: { width: 1920, height: 1080 }
}</code></pre>
              </div>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">Browser Information</h2>
              <p class="text-gray-700 mb-4">Detailed browser and device information:</p>
              <div class="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                <pre><code>{
  memory: {
    usedJSHeapSize: 45000000,
    totalJSHeapSize: 50000000
  },
  connection: {
    effectiveType: '4g',
    downlink: 10,
    rtt: 50
  }
}</code></pre>
              </div>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">HTTP Request Details</h2>
              <p class="text-gray-700 mb-4">For API errors, complete request/response information:</p>
              <div class="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                <pre><code>{
  url: 'https://api.example.com/orders',
  method: 'POST',
  status: 500,
  requestHeaders: {...},
  responseHeaders: {...},
  duration: 234,
  curlCommand: 'curl -X POST ...'
}</code></pre>
              </div>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">Vue Component Context</h2>
              <p class="text-gray-700 mb-4">For Vue errors, component and route information:</p>
              <div class="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                <pre><code>{
  componentName: 'CheckoutForm',
  lifecycle: 'mounted',
  props: { orderId: '12345' },
  route: {
    path: '/checkout',
    name: 'checkout'
  }
}</code></pre>
              </div>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">Viewing Detailed Information</h2>
              <p class="text-gray-700 mb-4">In the error detail page, you can see:</p>
              <ol class="list-decimal list-inside space-y-2 text-gray-700">
                <li><strong>Basic Info:</strong> Error type, message, stack trace</li>
                <li><strong>HTTP Info:</strong> Request/response, cURL command</li>
                <li><strong>Browser Info:</strong> Memory, performance, connection</li>
                <li><strong>DOM State:</strong> Active element, scroll position</li>
                <li><strong>User Info:</strong> User ID, email, username</li>
                <li><strong>Tags & Context:</strong> Custom data</li>
                <li><strong>Breadcrumbs:</strong> User action history</li>
              </ol>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">Privacy & Security</h2>
              <p class="text-gray-700 mb-4">ErrorCatcher respects user privacy:</p>
              <ul class="list-disc list-inside space-y-2 text-gray-700">
                <li>Sensitive data can be filtered using beforeSend hook</li>
                <li>Passwords and tokens are never captured</li>
                <li>Use sampling to reduce data collection</li>
                <li>Configure what information to capture</li>
              </ul>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">Performance Tips</h2>
              <ul class="list-disc list-inside space-y-2 text-gray-700">
                <li>Use sampling (e.g., 10%) in high-traffic environments</li>
                <li>Limit breadcrumbs to critical actions</li>
                <li>Filter unnecessary data in beforeSend</li>
                <li>Increase batch delay to reduce requests</li>
              </ul>
            </section>
          </div>
        </div>

        <!-- Internationalization -->
        <div v-if="activeSection === 'i18n'">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">
            <span v-if="locale === 'zh'">国际化 (i18n)</span>
            <span v-else>Internationalization (i18n)</span>
          </h1>
          <p class="text-gray-600 mb-6">
            <span v-if="locale === 'zh'">ErrorCatcher 管理后台支持中英文双语切换。</span>
            <span v-else>ErrorCatcher admin panel supports Chinese and English language switching.</span>
          </p>

          <div class="space-y-6">
            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">
                <span v-if="locale === 'zh'">语言切换</span>
                <span v-else>Language Switching</span>
              </h2>
              <p class="text-gray-700 mb-4">
                <span v-if="locale === 'zh'">
                  您可以通过右上角的语言切换器在中文和英文之间切换。语言偏好会自动保存到浏览器本地存储中。
                </span>
                <span v-else>
                  You can switch between Chinese and English using the language switcher in the top right corner. 
                  Your language preference is automatically saved to browser local storage.
                </span>
              </p>
              <div class="bg-blue-50 border border-blue-200 rounded p-4">
                <p class="text-blue-900">
                  <strong v-if="locale === 'zh'">💡 提示：</strong>
                  <strong v-else>💡 Tip:</strong>
                  <span v-if="locale === 'zh'">
                    默认语言为中文。首次访问时，系统会使用中文界面。
                  </span>
                  <span v-else>
                    The default language is Chinese. On first visit, the system will use the Chinese interface.
                  </span>
                </p>
              </div>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">
                <span v-if="locale === 'zh'">支持的语言</span>
                <span v-else>Supported Languages</span>
              </h2>
              <ul class="space-y-2">
                <li class="flex items-center gap-2">
                  <span class="text-2xl">🇨🇳</span>
                  <span class="text-gray-700">
                    <strong v-if="locale === 'zh'">简体中文</strong>
                    <strong v-else>Simplified Chinese</strong>
                    <span class="text-gray-500 ml-2">(zh)</span>
                  </span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-2xl">🇺🇸</span>
                  <span class="text-gray-700">
                    <strong v-if="locale === 'zh'">英语</strong>
                    <strong v-else>English</strong>
                    <span class="text-gray-500 ml-2">(en)</span>
                  </span>
                </li>
              </ul>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">
                <span v-if="locale === 'zh'">国际化范围</span>
                <span v-else>i18n Coverage</span>
              </h2>
              <p class="text-gray-700 mb-4">
                <span v-if="locale === 'zh'">以下内容已完全国际化：</span>
                <span v-else>The following content is fully internationalized:</span>
              </p>
              <ul class="list-disc list-inside space-y-2 text-gray-700">
                <li v-if="locale === 'zh'">所有页面标题和副标题</li>
                <li v-else>All page titles and subtitles</li>
                
                <li v-if="locale === 'zh'">导航菜单和侧边栏</li>
                <li v-else>Navigation menus and sidebar</li>
                
                <li v-if="locale === 'zh'">按钮、标签和表单字段</li>
                <li v-else>Buttons, labels, and form fields</li>
                
                <li v-if="locale === 'zh'">提示消息和确认对话框</li>
                <li v-else>Toast messages and confirmation dialogs</li>
                
                <li v-if="locale === 'zh'">错误和成功消息</li>
                <li v-else>Error and success messages</li>
                
                <li v-if="locale === 'zh'">时间显示（相对时间）</li>
                <li v-else>Time display (relative time)</li>
                
                <li v-if="locale === 'zh'">数据表格和列表</li>
                <li v-else>Data tables and lists</li>
                
                <li v-if="locale === 'zh'">模态框和弹出窗口</li>
                <li v-else>Modals and popups</li>
              </ul>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">
                <span v-if="locale === 'zh'">技术实现</span>
                <span v-else>Technical Implementation</span>
              </h2>
              <p class="text-gray-700 mb-4">
                <span v-if="locale === 'zh'">
                  ErrorCatcher 使用 Vue I18n 实现国际化功能。所有用户界面文本都通过翻译键进行管理。
                </span>
                <span v-else>
                  ErrorCatcher uses Vue I18n for internationalization. All UI text is managed through translation keys.
                </span>
              </p>
              <div class="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
                <pre><code>// {{ locale === 'zh' ? '在组件中使用翻译' : 'Using translations in components' }}
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

// {{ locale === 'zh' ? '在模板中' : 'In template' }}
&lt;h1&gt;&#123;&#123; t('projects.title') &#125;&#125;&lt;/h1&gt;

// {{ locale === 'zh' ? '带参数的翻译' : 'Translation with parameters' }}
&#123;&#123; t('projects.confirmDelete', { name: projectName }) &#125;&#125;</code></pre>
              </div>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">
                <span v-if="locale === 'zh'">时间本地化</span>
                <span v-else>Time Localization</span>
              </h2>
              <p class="text-gray-700 mb-4">
                <span v-if="locale === 'zh'">
                  相对时间显示（如 "2 小时前"）会根据当前语言自动调整。系统使用 Day.js 库实现时间本地化。
                </span>
                <span v-else>
                  Relative time displays (like "2 hours ago") automatically adjust based on the current language. 
                  The system uses Day.js library for time localization.
                </span>
              </p>
              <div class="grid grid-cols-2 gap-4">
                <div class="border border-gray-200 rounded p-3">
                  <div class="text-sm font-medium text-gray-700 mb-2">🇨🇳 {{ locale === 'zh' ? '中文' : 'Chinese' }}</div>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• 几秒前</li>
                    <li>• 2 分钟前</li>
                    <li>• 3 小时前</li>
                    <li>• 5 天前</li>
                  </ul>
                </div>
                <div class="border border-gray-200 rounded p-3">
                  <div class="text-sm font-medium text-gray-700 mb-2">🇺🇸 {{ locale === 'zh' ? '英文' : 'English' }}</div>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• a few seconds ago</li>
                    <li>• 2 minutes ago</li>
                    <li>• 3 hours ago</li>
                    <li>• 5 days ago</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">
                <span v-if="locale === 'zh'">最佳实践</span>
                <span v-else>Best Practices</span>
              </h2>
              <ul class="list-disc list-inside space-y-2 text-gray-700">
                <li v-if="locale === 'zh'">
                  <strong>保持一致：</strong>在整个应用中使用相同的语言
                </li>
                <li v-else>
                  <strong>Stay Consistent:</strong> Use the same language throughout the application
                </li>
                
                <li v-if="locale === 'zh'">
                  <strong>及时切换：</strong>语言切换会立即生效，无需刷新页面
                </li>
                <li v-else>
                  <strong>Instant Switching:</strong> Language changes take effect immediately without page refresh
                </li>
                
                <li v-if="locale === 'zh'">
                  <strong>团队协作：</strong>团队成员可以使用各自偏好的语言
                </li>
                <li v-else>
                  <strong>Team Collaboration:</strong> Team members can use their preferred language
                </li>
              </ul>
            </section>
          </div>
        </div>

        <!-- Best Practices -->
        <div v-if="activeSection === 'best-practices'">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">Best Practices</h1>
          <p class="text-gray-600 mb-6">Tips and recommendations for effective error monitoring.</p>

          <div class="space-y-6">
            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">Error Handling</h2>
              <ul class="list-disc list-inside space-y-2 text-gray-700">
                <li>Always include meaningful error messages</li>
                <li>Add context data to help with debugging</li>
                <li>Use appropriate error levels</li>
                <li>Set up breadcrumbs to track user actions</li>
                <li>Include user information when available</li>
              </ul>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">Alert Configuration</h2>
              <ul class="list-disc list-inside space-y-2 text-gray-700">
                <li>Start with conservative thresholds and adjust based on data</li>
                <li>Use silence periods to avoid alert fatigue</li>
                <li>Configure different alerts for different environments</li>
                <li>Set up escalation rules for critical issues</li>
                <li>Regularly review and update alert rules</li>
              </ul>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">Team Collaboration</h2>
              <ul class="list-disc list-inside space-y-2 text-gray-700">
                <li>Assign issues to team members</li>
                <li>Use comments to discuss solutions</li>
                <li>Mark issues as resolved when fixed</li>
                <li>Document recurring issues and their solutions</li>
                <li>Share project access with relevant team members</li>
              </ul>
            </section>
          </div>
        </div>

        <!-- API Reference -->
        <div v-if="activeSection === 'api-reference'">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">API Reference</h1>
          <p class="text-gray-600 mb-6">SDK methods and configuration options.</p>

          <div class="space-y-6">
            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">Initialization</h2>
              <div class="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
                <pre><code>import ErrorCatcher from 'error-catcher';

const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/errors/report',  // Required
  projectId: 'your-project-id',                    // Required
  apiKey: 'your-api-key',                          // Optional
  environment: 'production',                       // Optional
  debug: false,                                    // Optional
  sampleRate: 1.0                                  // Optional (0.0 - 1.0)
});

tracker.init();</code></pre>
              </div>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">Core Methods</h2>
              <div class="space-y-4">
                <div class="border border-gray-200 rounded p-4">
                  <h3 class="font-semibold text-gray-900 mb-2">init()</h3>
                  <p class="text-gray-700 mb-2">Initialize ErrorCatcher and start monitoring.</p>
                  <div class="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                    <pre><code>const tracker = new ErrorCatcher(config);
tracker.init();</code></pre>
                  </div>
                </div>

                <div class="border border-gray-200 rounded p-4">
                  <h3 class="font-semibold text-gray-900 mb-2">destroy()</h3>
                  <p class="text-gray-700 mb-2">Stop monitoring and restore original methods.</p>
                  <div class="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                    <pre><code>tracker.destroy();</code></pre>
                  </div>
                </div>

                <div class="border border-gray-200 rounded p-4">
                  <h3 class="font-semibold text-gray-900 mb-2">report(error, context)</h3>
                  <p class="text-gray-700 mb-2">Manually report an error with optional context.</p>
                  <div class="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                    <pre><code>tracker.report(error, {
  type: 'manual',
  level: 'error',
  tags: { section: 'payment' }
});</code></pre>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">User & Context Methods</h2>
              <div class="space-y-4">
                <div class="border border-gray-200 rounded p-4">
                  <h3 class="font-semibold text-gray-900 mb-2">setUser(user)</h3>
                  <p class="text-gray-700 mb-2">Set user information for all subsequent errors.</p>
                  <div class="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                    <pre><code>tracker.setUser({
  id: 'user-123',
  email: 'user@example.com',
  username: 'john_doe'
});</code></pre>
                  </div>
                </div>

                <div class="border border-gray-200 rounded p-4">
                  <h3 class="font-semibold text-gray-900 mb-2">setTag(key, value) / setTags(tags)</h3>
                  <p class="text-gray-700 mb-2">Set tags for categorization and filtering.</p>
                  <div class="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                    <pre><code>// Single tag
tracker.setTag('version', '1.0.0');

// Multiple tags
tracker.setTags({
  version: '1.0.0',
  environment: 'production'
});</code></pre>
                  </div>
                </div>

                <div class="border border-gray-200 rounded p-4">
                  <h3 class="font-semibold text-gray-900 mb-2">setContext(key, value)</h3>
                  <p class="text-gray-700 mb-2">Set context data for debugging.</p>
                  <div class="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                    <pre><code>tracker.setContext('device', {
  type: 'mobile',
  os: 'iOS'
});</code></pre>
                  </div>
                </div>

                <div class="border border-gray-200 rounded p-4">
                  <h3 class="font-semibold text-gray-900 mb-2">setExtra(key, value)</h3>
                  <p class="text-gray-700 mb-2">Set extra data for all subsequent errors.</p>
                  <div class="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                    <pre><code>tracker.setExtra('action', 'checkout');
tracker.setExtra('cartTotal', 99.99);</code></pre>
                  </div>
                </div>

                <div class="border border-gray-200 rounded p-4">
                  <h3 class="font-semibold text-gray-900 mb-2">addBreadcrumb(breadcrumb)</h3>
                  <p class="text-gray-700 mb-2">Add breadcrumb to track user actions.</p>
                  <div class="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                    <pre><code>tracker.addBreadcrumb({
  category: 'user-action',
  message: 'User clicked checkout',
  level: 'info',
  data: { button: 'checkout-btn' }
});</code></pre>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">Advanced Methods (Detailed Error Capture)</h2>
              <div class="space-y-4">
                <div class="border border-blue-200 bg-blue-50 rounded p-4">
                  <h3 class="font-semibold text-blue-900 mb-2">captureDOMState()</h3>
                  <p class="text-blue-800 mb-2">Get current DOM state information.</p>
                  <div class="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                    <pre><code>const domState = tracker.captureDOMState();
// Returns: {
//   documentReady, activeElement, scrollPosition,
//   viewport, visibilityState, ...
// }</code></pre>
                  </div>
                </div>

                <div class="border border-purple-200 bg-purple-50 rounded p-4">
                  <h3 class="font-semibold text-purple-900 mb-2">collectBrowserInfo()</h3>
                  <p class="text-purple-800 mb-2">Get comprehensive browser information.</p>
                  <div class="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                    <pre><code>const browserInfo = tracker.collectBrowserInfo();
// Returns: {
//   memory, performance, connection,
//   storage, userAgent, language, ...
// }</code></pre>
                  </div>
                </div>

                <div class="border border-green-200 bg-green-50 rounded p-4">
                  <h3 class="font-semibold text-green-900 mb-2">collectNetworkInfo()</h3>
                  <p class="text-green-800 mb-2">Get current network information.</p>
                  <div class="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                    <pre><code>const networkInfo = tracker.collectNetworkInfo();
// Returns: {
//   online, type, effectiveType,
//   downlink, rtt, saveData
// }</code></pre>
                  </div>
                </div>

                <div class="border border-orange-200 bg-orange-50 rounded p-4">
                  <h3 class="font-semibold text-orange-900 mb-2">safeStringify(obj, maxDepth)</h3>
                  <p class="text-orange-800 mb-2">Safe JSON stringify with circular reference protection.</p>
                  <div class="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
                    <pre><code>const result = tracker.safeStringify(obj, 2);
// Prevents circular reference errors</code></pre>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">Automatic Error Capture</h2>
              <p class="text-gray-700 mb-4">ErrorCatcher automatically captures and reports:</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="border border-gray-200 rounded p-3">
                  <p class="text-sm font-medium text-gray-900">✅ Global JavaScript Errors</p>
                  <p class="text-xs text-gray-600">Uncaught exceptions and runtime errors</p>
                </div>
                <div class="border border-gray-200 rounded p-3">
                  <p class="text-sm font-medium text-gray-900">✅ Promise Rejections</p>
                  <p class="text-xs text-gray-600">Unhandled promise rejections</p>
                </div>
                <div class="border border-gray-200 rounded p-3">
                  <p class="text-sm font-medium text-gray-900">✅ Fetch API Errors</p>
                  <p class="text-xs text-gray-600">Network and HTTP errors</p>
                </div>
                <div class="border border-gray-200 rounded p-3">
                  <p class="text-sm font-medium text-gray-900">✅ XMLHttpRequest Errors</p>
                  <p class="text-xs text-gray-600">XHR network and HTTP errors</p>
                </div>
                <div class="border border-gray-200 rounded p-3">
                  <p class="text-sm font-medium text-gray-900">✅ Axios Errors</p>
                  <p class="text-xs text-gray-600">Request and response errors</p>
                </div>
                <div class="border border-gray-200 rounded p-3">
                  <p class="text-sm font-medium text-gray-900">✅ Vue Errors</p>
                  <p class="text-xs text-gray-600">Component and lifecycle errors</p>
                </div>
                <div class="border border-gray-200 rounded p-3">
                  <p class="text-sm font-medium text-gray-900">✅ jQuery AJAX Errors</p>
                  <p class="text-xs text-gray-600">jQuery AJAX request failures</p>
                </div>
                <div class="border border-gray-200 rounded p-3">
                  <p class="text-sm font-medium text-gray-900">✅ React Errors</p>
                  <p class="text-xs text-gray-600">Component render errors</p>
                </div>
              </div>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">Complete Example</h2>
              <div class="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
                <pre><code>import ErrorCatcher from 'error-catcher';

// Initialize
const tracker = new ErrorCatcher({
  reportUrl: 'http://your-api.com/errors/report',
  projectId: 'your-project-id',
  environment: 'production'
});

tracker.init();

// Set user
tracker.setUser({
  id: 'user-123',
  email: 'user@example.com'
});

// Set tags
tracker.setTags({
  version: '1.0.0',
  feature: 'checkout'
});

// Add breadcrumb
tracker.addBreadcrumb({
  category: 'user-action',
  message: 'User started checkout',
  level: 'info'
});

// Manual error reporting
try {
  processPayment();
} catch (error) {
  tracker.report(error, {
    type: 'payment_error',
    extra: { amount: 99.99 }
  });
}</code></pre>
              </div>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">Configuration Options</h2>
              <div class="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                <pre><code>{
  // Required
  reportUrl: 'http://your-api.com/errors',
  projectId: 'your-project-id',
  
  // Optional
  apiKey: 'your-api-key',
  environment: 'production',
  release: '1.0.0',
  
  // Sampling & Performance
  sampleRate: 1,           // 0-1, default: 1
  maxBatchSize: 10,        // Errors per batch
  delay: 1000,             // Batch send delay (ms)
  maxRetries: 3,           // Retry attempts
  
  // Features
  debug: false,            // Debug logging
  autoStart: true,         // Auto-initialize
  autoIntegrate: true,     // Auto-detect frameworks
  
  // Framework Integration
  vue: null,               // Vue instance
  react: false,            // Enable React
  axios: null,             // Axios instance
  jquery: false,           // Enable jQuery
  
  // Advanced
  ignoreUrls: [],          // URLs to ignore
  beforeSend: (error) => error,  // Modify error
  onError: (error) => {},   // Error callback
  
  // Performance & Monitoring
  enablePerformanceMonitoring: true,  // Enable performance tracking
  maxBreadcrumbs: 100,                 // Max breadcrumbs to capture
  
  // Offline Storage
  enableOfflineStorage: true,           // Cache errors offline
  
  // Deduplication
  enableDeduplication: true,           // Prevent duplicate reports
  deduplicationTimeout: 5000,           // Deduplication window (ms)
  
  // Security
  sensitiveKeys: ['password', 'token', 'api_key'],  // Auto-mask sensitive data
  maxResponseSize: 1048576               // Max response size (1MB)
}</code></pre>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">
                <span v-if="locale === 'zh'">高级功能</span>
                <span v-else>Advanced Features</span>
              </h2>
              <div class="space-y-4">
                <div class="border border-green-200 bg-green-50 rounded p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-xl">📊</span>
                    <h3 class="font-semibold text-green-900">
                      <span v-if="locale === 'zh'">性能监控</span>
                      <span v-else>Performance Monitoring</span>
                    </h3>
                  </div>
                  <p class="text-sm text-green-800">
                    <span v-if="locale === 'zh'">自动追踪页面加载时间、资源加载性能，支持 Performance Observer API。</span>
                    <span v-else>Auto-track page load time, resource loading performance with Performance Observer API.</span>
                  </p>
                </div>
                
                <div class="border border-blue-200 bg-blue-50 rounded p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-xl">💾</span>
                    <h3 class="font-semibold text-blue-900">
                      <span v-if="locale === 'zh'">离线存储</span>
                      <span v-else>Offline Storage</span>
                    </h3>
                  </div>
                  <p class="text-sm text-blue-800">
                    <span v-if="locale === 'zh'">基于 IndexedDB 实现网络离线时自动缓存错误，网络恢复后自动上报。</span>
                    <span v-else>Cache errors offline with IndexedDB, auto-retry when network recovers.</span>
                  </p>
                </div>
                
                <div class="border border-purple-200 bg-purple-50 rounded p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-xl">🔁</span>
                    <h3 class="font-semibold text-purple-900">
                      <span v-if="locale === 'zh'">错误去重</span>
                      <span v-else>Error Deduplication</span>
                    </h3>
                  </div>
                  <p class="text-sm text-purple-800">
                    <span v-if="locale === 'zh'">短时间内相同错误自动合并，避免重复告警。可配置去重时间窗口。</span>
                    <span v-else>Automatically merge duplicate errors within a time window to avoid alert fatigue.</span>
                  </p>
                </div>
                
                <div class="border border-orange-200 bg-orange-50 rounded p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-xl">🔒</span>
                    <h3 class="font-semibold text-orange-900">
                      <span v-if="locale === 'zh'">敏感信息过滤</span>
                      <span v-else> Sensitive Data Masking</span>
                    </h3>
                  </div>
                  <p class="text-sm text-orange-800">
                    <span v-if="locale === 'zh'">自动过滤密码、Token、API Key 等敏感信息，支持自定义关键词。</span>
                    <span v-else>Auto-mask passwords, tokens, API keys with customizable keywords.</span>
                  </p>
                </div>
                
                <div class="border border-gray-200 bg-gray-50 rounded p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-xl">🍞</span>
                    <h3 class="font-semibold text-gray-900">
                      <span v-if="locale === 'zh'">面包屑导航</span>
                      <span v-else>Breadcrumbs</span>
                    </h3>
                  </div>
                  <p class="text-sm text-gray-800">
                    <span v-if="locale === 'zh'">自动记录用户操作轨迹，包括点击、输入、路由变化等信息。</span>
                    <span v-else>Auto-capture user journey including clicks, inputs, route changes.</span>
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-gray-900 mb-3">Framework Integration</h2>
              <p class="text-gray-700 mb-4">ErrorCatcher supports various frameworks:</p>
              <ul class="list-disc list-inside space-y-2 text-gray-700">
                <li>Vue.js 2 & 3 (including Composition API)</li>
                <li>React</li>
                <li>Next.js</li>
                <li>Nuxt.js 2 & 3</li>
                <li>jQuery</li>
                <li>Vanilla JavaScript</li>
                <li>SSR / Node.js</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const { t, locale } = useI18n();
const route = useRoute();

const activeSection = ref('getting-started');

// 从 URL 参数中读取 section
onMounted(() => {
  const section = route.query.section;
  if (section) {
    activeSection.value = section;
  }
});

const sections = [
  { id: 'getting-started', title: 'Getting Started', titleZh: '快速开始' },
  { id: 'projects', title: 'Projects', titleZh: '项目管理' },
  { id: 'issues-errors', title: 'Issues & Errors', titleZh: '问题与错误' },
  { id: 'alerts', title: 'Alerts', titleZh: '告警规则' },
  { id: 'notifications', title: 'Notifications', titleZh: '通知配置' },
  { id: 'ai-analysis', title: 'AI Error Analysis', titleZh: 'AI 错误分析' },
  { id: 'detailed-errors', title: 'Detailed Error Capture', titleZh: '详细错误捕获' },
  { id: 'i18n', title: 'Internationalization', titleZh: '国际化' },
  { id: 'best-practices', title: 'Best Practices', titleZh: '最佳实践' },
  { id: 'api-reference', title: 'API Reference', titleZh: 'API 参考' }
];
</script>
