<template>
  <div v-if="error" class="h-full flex flex-col bg-white">
    <!-- 页面头部 -->
    <div class="border-b border-gray-200">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between mb-4">
          <button @click="$router.back()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            {{ t('errors.backToErrors') }}
          </button>
          <div class="flex gap-2">
            <button
              v-if="!error.resolved"
              @click="resolveError"
              class="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              {{ t('errors.resolve') }}
            </button>
            <button
              @click="deleteError"
              class="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              {{ t('common.delete') }}
            </button>
          </div>
        </div>

        <!-- 错误标题 -->
        <div class="flex items-center gap-2 mb-2">
          <span :class="getTypeClass(error.type)" class="px-2 py-0.5 text-xs font-medium rounded">
            {{ getTypeIcon(error.type) }} {{ getTypeLabel(error.type) }}
          </span>
          <span
            :class="{
              'bg-red-100 text-red-800': error.level === 'error',
              'bg-yellow-100 text-yellow-800': error.level === 'warning',
              'bg-blue-100 text-blue-800': error.level === 'info'
            }"
            class="px-2 py-0.5 text-xs font-medium rounded"
          >
            {{ error.level.toUpperCase() }}
          </span>
          <span
            v-if="error.resolved"
            class="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded"
          >
            {{ t('errors.resolved') }}
          </span>
          <span v-if="error.resolved && error.resolvedBy" class="text-xs text-gray-500">
            by {{ error.resolvedBy }}
            <span v-if="error.resolvedAt"> · {{ formatDate(error.resolvedAt) }}</span>
          </span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ error.message }}</h1>
        
        <!-- 项目和统计信息 -->
        <div class="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
          <!-- 项目信息 -->
          <span v-if="error.projectId?.name" class="flex items-center gap-1 text-purple-600 font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            {{ error.projectId.name }}
          </span>
          
          <!-- 项目负责人 -->
          <span v-if="error.projectId?.owner" class="flex items-center gap-1 text-gray-600" :title="`${t('projects.owner')}: ${error.projectId.owner.email || error.projectId.owner.username}`">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ t('projects.owner') }}: {{ error.projectId.owner.username }}
          </span>
          
          <span>{{ error.count }} {{ t('dashboard.events') }}</span>
          <span>{{ t('errors.lastSeen') }} {{ formatTime(error.lastOccurred) }}</span>
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
            {{ tab.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- 标签页内容 -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- Overview -->
      <div v-show="activeTab === 'overview'" class="space-y-6">
        <!-- 统计卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="border border-gray-200 rounded p-4">
            <div class="text-sm text-gray-600 mb-1">{{ t('dashboard.events') }}</div>
            <div class="text-2xl font-bold text-gray-900">{{ error.count }}</div>
          </div>
          <div class="border border-gray-200 rounded p-4">
            <div class="text-sm text-gray-600 mb-1">{{ t('errors.errorLevel') }}</div>
            <div class="text-lg font-bold text-gray-900 capitalize">{{ error.level }}</div>
          </div>
          <div class="border border-gray-200 rounded p-4">
            <div class="text-sm text-gray-600 mb-1">{{ t('errors.firstSeen') }}</div>
            <div class="text-sm font-medium text-gray-900">{{ formatDate(error.firstOccurred) }}</div>
          </div>
          <div class="border border-gray-200 rounded p-4">
            <div class="text-sm text-gray-600 mb-1">{{ t('errors.lastSeen') }}</div>
            <div class="text-sm font-medium text-gray-900">{{ formatDate(error.lastOccurred) }}</div>
          </div>
        </div>

        <!-- Resolved by info -->
        <div v-if="error.resolved && error.resolvedBy" class="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ t('errors.resolved') }} by {{ error.resolvedBy }}
          <span v-if="error.resolvedAt" class="text-green-600">· {{ formatDate(error.resolvedAt) }}</span>
        </div>

        <!-- Stack Trace -->
        <div>
          <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ t('errors.stackTrace') }}</h3>
          <pre class="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">{{ error.stack || t('errors.noStackTrace') }}</pre>
        </div>

        <!-- cURL Command (for API errors) -->
        <div v-if="error.curlCommand">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-gray-900">{{ t('errors.curlCommand') }}</h3>
            <button
              @click="copyCurl"
              class="flex items-center gap-1 px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {{ t('projects.copy') }}
            </button>
          </div>
          <pre class="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto font-mono">{{ error.curlCommand }}</pre>
          <p class="text-xs text-gray-500 mt-2">{{ t('errors.curlHelp') }}</p>
        </div>

        <!-- 环境信息 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ t('errors.environment') }}</h3>
            <div class="space-y-2">
              <div v-if="error.pageUrl" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.pageUrl') }}</span>
                <a :href="error.pageUrl" target="_blank" class="text-purple-600 hover:text-purple-700 truncate ml-4">
                  {{ error.pageUrl }}
                </a>
              </div>
              <div v-if="error.url && error.url !== error.pageUrl" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ error.method ? t('errors.apiUrl') : 'URL' }}</span>
                <span class="text-gray-900 truncate ml-4 font-mono">{{ error.url }}</span>
              </div>
              <div v-if="error.method" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.method') }}</span>
                <span class="font-semibold" :class="{
                  'text-green-600': error.method === 'GET',
                  'text-blue-600': error.method === 'POST',
                  'text-yellow-600': error.method === 'PUT',
                  'text-red-600': error.method === 'DELETE'
                }">{{ error.method }}</span>
              </div>
              <div v-if="error.status" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.status') }}</span>
                <span class="font-semibold" :class="{
                  'text-green-600': error.status >= 200 && error.status < 300,
                  'text-red-600': error.status >= 400
                }">{{ error.status }}</span>
              </div>
              <div v-if="error.duration" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.duration') }}</span>
                <span class="text-gray-900">{{ error.duration }}ms</span>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ t('errors.browser') }}</h3>
            <div class="space-y-2">
              <div v-if="error.userAgent" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.userAgent') }}</span>
                <span class="text-gray-900 text-right ml-4 text-xs break-all">{{ error.userAgent }}</span>
              </div>
              <div v-if="error.screenResolution" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.screenResolution') }}</span>
                <span class="text-gray-900">{{ error.screenResolution }}</span>
              </div>
              <div v-if="error.viewportSize" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.viewportSize') }}</span>
                <span class="text-gray-900">{{ error.viewportSize }}</span>
              </div>
              <div v-if="error.browserLanguage" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.language') }}</span>
                <span class="text-gray-900">{{ error.browserLanguage }}</span>
              </div>
              <div v-if="error.timezone" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.timezone') }}</span>
                <span class="text-gray-900">{{ error.timezone }}</span>
              </div>
              <div v-if="error.referrer" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.referrer') }}</span>
                <a :href="error.referrer" target="_blank" class="text-purple-600 hover:text-purple-700 truncate ml-4">
                  {{ error.referrer }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Analysis -->
      <div v-show="activeTab === 'ai-analysis'">
        <AIAnalysis
          :analysis="aiAnalysis"
          :analyzing="analyzing"
          @analyze="analyzeError"
          @feedback="submitAnalysisFeedback"
          @view-related="viewRelatedError"
        />
      </div>

      <!-- Breadcrumbs -->
      <div v-show="activeTab === 'breadcrumbs'">
        <div v-if="error.breadcrumbs && error.breadcrumbs.length > 0" class="space-y-3">
          <div
            v-for="(crumb, index) in error.breadcrumbs"
            :key="index"
            class="flex gap-4 p-3 bg-gray-50 rounded border-l-2"
            :class="{
              'border-blue-500': crumb.level === 'info',
              'border-yellow-500': crumb.level === 'warning',
              'border-red-500': crumb.level === 'error',
              'border-gray-300': !crumb.level
            }"
          >
            <div class="flex-shrink-0 w-24 text-xs text-gray-500">
              {{ formatTimestamp(crumb.timestamp) }}
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm font-medium text-gray-900">{{ crumb.category || 'Uncategorized' }}</span>
                <span v-if="crumb.level" :class="[
                  'px-2 py-0.5 text-xs rounded',
                  crumb.level === 'error' ? 'bg-red-100 text-red-800' :
                  crumb.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                ]">{{ crumb.level }}</span>
              </div>
              <div class="text-sm text-gray-700">{{ crumb.message }}</div>
              <div v-if="crumb.data" class="mt-2">
                <pre class="text-xs bg-white p-2 rounded border border-gray-200 overflow-x-auto">{{ JSON.stringify(crumb.data, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-12 text-gray-500">
          <p>{{ t('errors.noBreadcrumbs') }}</p>
        </div>
      </div>

      <!-- Tags -->
      <div v-show="activeTab === 'tags'">
        <div v-if="error.tags && Object.keys(error.tags).length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="(value, key) in error.tags" :key="key" class="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span class="text-sm font-medium text-gray-700">{{ key }}</span>
            <span class="text-sm text-gray-900 font-mono">{{ value }}</span>
          </div>
        </div>
        <div v-else class="text-center py-12 text-gray-500">
          <p>{{ t('errors.noTags') }}</p>
        </div>
      </div>

      <!-- Context -->
      <div v-show="activeTab === 'context'">
        <div class="space-y-6">
          <div v-if="error.contexts && Object.keys(error.contexts).length > 0">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ t('errors.contexts') }}</h3>
            <div class="space-y-4">
              <div v-for="(value, key) in error.contexts" :key="key" class="bg-gray-50 rounded p-4">
                <div class="text-sm font-medium text-gray-700 mb-2">{{ key }}</div>
                <pre class="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">{{ JSON.stringify(value, null, 2) }}</pre>
              </div>
            </div>
          </div>

          <div v-if="error.extra && Object.keys(error.extra).length > 0">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ t('errors.extraData') }}</h3>
            <pre class="bg-gray-50 p-4 rounded text-sm overflow-x-auto">{{ JSON.stringify(error.extra, null, 2) }}</pre>
          </div>

          <div v-if="!error.contexts && !error.extra" class="text-center py-12 text-gray-500">
            <p>{{ t('errors.noContext') }}</p>
          </div>
        </div>
      </div>

      <!-- User Info -->
      <div v-show="activeTab === 'user'">
        <div class="space-y-4">
          <div v-if="error.user" class="bg-gray-50 rounded p-4">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ t('errors.userInfo') }}</h3>
            <div class="space-y-2">
              <div v-if="error.user.id" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.userId') }}</span>
                <span class="text-gray-900 font-mono">{{ error.user.id }}</span>
              </div>
              <div v-if="error.user.username" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.username') }}</span>
                <span class="text-gray-900">{{ error.user.username }}</span>
              </div>
              <div v-if="error.user.email" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.email') }}</span>
                <span class="text-gray-900">{{ error.user.email }}</span>
              </div>
              <div v-if="error.user.ip" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.ipAddress') }}</span>
                <span class="text-gray-900 font-mono">{{ error.user.ip }}</span>
              </div>
            </div>
          </div>

          <div v-if="error.fingerprint" class="bg-gray-50 rounded p-4">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ t('errors.fingerprint') }}</h3>
            <div v-if="Array.isArray(error.fingerprint) && error.fingerprint.length > 0" class="space-y-2">
              <div v-for="(fp, index) in error.fingerprint" :key="index" class="flex items-start gap-2">
                <span class="text-xs text-gray-500 flex-shrink-0 mt-1">{{ index + 1 }}.</span>
                <span class="text-xs bg-white p-2 rounded border border-gray-200 font-mono break-all flex-1">{{ fp }}</span>
              </div>
            </div>
            <div v-else class="text-xs bg-white p-3 rounded border border-gray-200 font-mono break-all">
              {{ Array.isArray(error.fingerprint) ? error.fingerprint.join(', ') : error.fingerprint }}
            </div>
          </div>

          <div v-if="!error.user && !error.fingerprint" class="text-center py-12 text-gray-500">
            <p>{{ t('errors.noUserInfo') }}</p>
          </div>
        </div>
      </div>

      <!-- Device Info -->
      <div v-show="activeTab === 'device'">
        <div class="space-y-6">
          <!-- Browser Information -->
          <div v-if="error.browser" class="bg-gray-50 rounded p-4">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ t('errors.browser') }}</h3>
            <div class="space-y-2">
              <div v-if="error.browser.language" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.language') }}</span>
                <span class="text-gray-900">{{ error.browser.language }}</span>
              </div>
              <div v-if="error.browser.platform" class="flex justify-between text-sm">
                <span class="text-gray-600">Platform</span>
                <span class="text-gray-900">{{ error.browser.platform }}</span>
              </div>
              <div v-if="error.browser.hardwareConcurrency" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.hardwareConcurrency') }}</span>
                <span class="text-gray-900">{{ error.browser.hardwareConcurrency }}</span>
              </div>
              <div v-if="error.browser.deviceMemory" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.deviceMemory') }}</span>
                <span class="text-gray-900">{{ error.browser.deviceMemory }} GB</span>
              </div>
              <div v-if="error.browser.maxTouchPoints" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.maxTouchPoints') }}</span>
                <span class="text-gray-900">{{ error.browser.maxTouchPoints }}</span>
              </div>
              <div v-if="error.browser.vendor" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.vendor') }}</span>
                <span class="text-gray-900">{{ error.browser.vendor }}</span>
              </div>
              <div v-if="error.browser.cookieEnabled !== undefined" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.cookieEnabled') }}</span>
                <span class="text-gray-900">{{ error.browser.cookieEnabled ? 'Yes' : 'No' }}</span>
              </div>
              <div v-if="error.browser.doNotTrack" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.doNotTrack') }}</span>
                <span class="text-gray-900">{{ error.browser.doNotTrack }}</span>
              </div>
              <div v-if="error.browser.onLine !== undefined" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.onLine') }}</span>
                <span class="text-gray-900">{{ error.browser.onLine ? 'Online' : 'Offline' }}</span>
              </div>
            </div>
          </div>

          <!-- Memory Information -->
          <div v-if="error.browser && error.browser.memory" class="bg-gray-50 rounded p-4">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ t('errors.memory') }}</h3>
            <div class="space-y-2">
              <div v-if="error.browser.memory.usedJSHeapSize" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.usedJSHeapSize') }}</span>
                <span class="text-gray-900">{{ (error.browser.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) }} MB</span>
              </div>
              <div v-if="error.browser.memory.totalJSHeapSize" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.totalJSHeapSize') }}</span>
                <span class="text-gray-900">{{ (error.browser.memory.totalJSHeapSize / 1024 / 1024).toFixed(2) }} MB</span>
              </div>
              <div v-if="error.browser.memory.jsHeapSizeLimit" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.jsHeapSizeLimit') }}</span>
                <span class="text-gray-900">{{ (error.browser.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2) }} MB</span>
              </div>
            </div>
          </div>

          <!-- Performance Information -->
          <div v-if="error.browser && error.browser.performance" class="bg-gray-50 rounded p-4">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ t('errors.performance') }}</h3>
            <div class="space-y-2">
              <div v-if="error.browser.performance.domContentLoadedEventEnd" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.domContentLoadedEventEnd') }}</span>
                <span class="text-gray-900">{{ error.browser.performance.domContentLoadedEventEnd }}ms</span>
              </div>
              <div v-if="error.browser.performance.loadEventEnd" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.loadEventEnd') }}</span>
                <span class="text-gray-900">{{ error.browser.performance.loadEventEnd }}ms</span>
              </div>
              <div v-if="error.browser.performance.duration" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.duration') }}</span>
                <span class="text-gray-900">{{ error.browser.performance.duration }}ms</span>
              </div>
            </div>
          </div>

          <!-- Detailed Performance Metrics -->
          <div v-if="error.browser && error.browser.performance && hasDetailedPerformance(error.browser.performance)" class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded p-4 border border-blue-200">
            <h3 class="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {{ t('errors.performanceDetails') }}
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div v-if="error.browser.performance.dns" class="bg-white rounded p-2 text-center">
                <div class="text-xs text-gray-500">{{ t('errors.dnsLookup') }}</div>
                <div class="text-sm font-semibold" :class="error.browser.performance.dns > 100 ? 'text-red-600' : 'text-green-600'">
                  {{ error.browser.performance.dns }}ms
                </div>
              </div>
              <div v-if="error.browser.performance.tcp" class="bg-white rounded p-2 text-center">
                <div class="text-xs text-gray-500">{{ t('errors.tcpConnect') }}</div>
                <div class="text-sm font-semibold" :class="error.browser.performance.tcp > 200 ? 'text-red-600' : 'text-green-600'">
                  {{ error.browser.performance.tcp }}ms
                </div>
              </div>
              <div v-if="error.browser.performance.request" class="bg-white rounded p-2 text-center">
                <div class="text-xs text-gray-500">{{ t('errors.requestTime') }}</div>
                <div class="text-sm font-semibold" :class="error.browser.performance.request > 500 ? 'text-red-600' : 'text-green-600'">
                  {{ error.browser.performance.request }}ms
                </div>
              </div>
              <div v-if="error.browser.performance.response" class="bg-white rounded p-2 text-center">
                <div class="text-xs text-gray-500">{{ t('errors.responseTime') }}</div>
                <div class="text-sm font-semibold" :class="error.browser.performance.response > 500 ? 'text-red-600' : 'text-green-600'">
                  {{ error.browser.performance.response }}ms
                </div>
              </div>
              <div v-if="error.browser.performance.dom" class="bg-white rounded p-2 text-center">
                <div class="text-xs text-gray-500">{{ t('errors.domParse') }}</div>
                <div class="text-sm font-semibold" :class="error.browser.performance.dom > 500 ? 'text-red-600' : 'text-green-600'">
                  {{ error.browser.performance.dom }}ms
                </div>
              </div>
              <div v-if="error.browser.performance.redirect" class="bg-white rounded p-2 text-center">
                <div class="text-xs text-gray-500">{{ t('errors.redirectTime') }}</div>
                <div class="text-sm font-semibold" :class="error.browser.performance.redirect > 0 ? 'text-yellow-600' : 'text-green-600'">
                  {{ error.browser.performance.redirect }}ms
                </div>
              </div>
              <div v-if="error.browser.performance.navigationType !== undefined" class="bg-white rounded p-2 text-center col-span-2">
                <div class="text-xs text-gray-500">{{ t('errors.navigationType') }}</div>
                <div class="text-sm font-semibold text-gray-900 capitalize">
                  {{ getNavigationTypeLabel(error.browser.performance.navigationType) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Slow Resources -->
          <div v-if="error.browser && error.browser.performance && error.browser.performance.slowResources && error.browser.performance.slowResources.length > 0" class="bg-orange-50 rounded p-4 border border-orange-200">
            <h3 class="text-sm font-semibold text-orange-900 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ t('errors.slowResources') }} ({{ error.browser.performance.slowResources.length }})
            </h3>
            <div class="space-y-2">
              <div v-for="(resource, index) in error.browser.performance.slowResources" :key="index" class="bg-white rounded p-3 border border-orange-100">
                <div class="flex justify-between items-start gap-2">
                  <div class="flex-1 min-w-0">
                    <div class="text-xs text-gray-500">{{ t('errors.resourceName') }}</div>
                    <div class="text-sm text-gray-900 truncate font-mono">{{ resource.name }}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-xs text-gray-500">{{ t('errors.duration') }}</div>
                    <div class="text-sm font-bold text-red-600">{{ resource.duration }}ms</div>
                  </div>
                </div>
                <div class="flex gap-4 mt-2">
                  <div v-if="resource.initiatorType">
                    <span class="text-xs text-gray-500">{{ t('errors.resourceType') }}:</span>
                    <span class="text-xs text-gray-700 capitalize">{{ resource.initiatorType }}</span>
                  </div>
                  <div v-if="resource.transferSize">
                    <span class="text-xs text-gray-500">{{ t('errors.transferSize') }}:</span>
                    <span class="text-xs text-gray-700">{{ formatBytes(resource.transferSize) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Offline & Deduplication Status -->
          <div class="flex gap-2 flex-wrap">
            <div v-if="error.offlineCached" class="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              {{ t('errors.offlineCached') }}
              <span class="text-blue-600" :title="t('errors.offlineCachedDesc')">?</span>
            </div>
            <div v-if="error.deduplicated" class="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              {{ t('errors.deduplicated') }}
              <span class="text-purple-600" :title="t('errors.deduplicatedDesc')">?</span>
            </div>
          </div>

          <!-- Connection Information -->
          <div v-if="error.browser && error.browser.connection" class="bg-gray-50 rounded p-4">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ t('errors.connection') }}</h3>
            <div class="space-y-2">
              <div v-if="error.browser.connection.effectiveType" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.effectiveType') }}</span>
                <span class="text-gray-900">{{ error.browser.connection.effectiveType }}</span>
              </div>
              <div v-if="error.browser.connection.downlink" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.downlink') }}</span>
                <span class="text-gray-900">{{ error.browser.connection.downlink }} Mbps</span>
              </div>
              <div v-if="error.browser.connection.rtt" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.rtt') }}</span>
                <span class="text-gray-900">{{ error.browser.connection.rtt }}ms</span>
              </div>
              <div v-if="error.browser.connection.saveData !== undefined" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.saveData') }}</span>
                <span class="text-gray-900">{{ error.browser.connection.saveData ? 'Yes' : 'No' }}</span>
              </div>
            </div>
          </div>

          <!-- Storage Information -->
          <div v-if="error.browser && error.browser.storage" class="bg-gray-50 rounded p-4">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ t('errors.storage') }}</h3>
            <div class="space-y-2">
              <div v-if="error.browser.storage.localStorage" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.localStorage') }}</span>
                <span class="text-gray-900">{{ error.browser.storage.localStorage.itemCount }} items, {{ (error.browser.storage.localStorage.size / 1024).toFixed(2) }} KB</span>
              </div>
              <div v-if="error.browser.storage.sessionStorage" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.sessionStorage') }}</span>
                <span class="text-gray-900">{{ error.browser.storage.sessionStorage.itemCount }} items, {{ (error.browser.storage.sessionStorage.size / 1024).toFixed(2) }} KB</span>
              </div>
            </div>
          </div>

          <!-- DOM State -->
          <div v-if="error.dom" class="bg-gray-50 rounded p-4">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ t('errors.domState') }}</h3>
            <div class="space-y-2">
              <div v-if="error.dom.documentReady" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.documentReady') }}</span>
                <span class="text-gray-900">{{ error.dom.documentReady }}</span>
              </div>
              <div v-if="error.dom.activeElement" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.activeElement') }}</span>
                <span class="text-gray-900">{{ error.dom.activeElement }}</span>
              </div>
              <div v-if="error.dom.visibilityState" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.visibilityState') }}</span>
                <span class="text-gray-900">{{ error.dom.visibilityState }}</span>
              </div>
              <div v-if="error.dom.documentHeight" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.documentHeight') }}</span>
                <span class="text-gray-900">{{ error.dom.documentHeight }}px</span>
              </div>
              <div v-if="error.dom.documentWidth" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.documentWidth') }}</span>
                <span class="text-gray-900">{{ error.dom.documentWidth }}px</span>
              </div>
              <div v-if="error.dom.scrollPosition" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.scrollPosition') }}</span>
                <span class="text-gray-900">X: {{ error.dom.scrollPosition.x }}, Y: {{ error.dom.scrollPosition.y }}</span>
              </div>
              <div v-if="error.dom.viewport" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.viewport') }}</span>
                <span class="text-gray-900">{{ error.dom.viewport.width }}x{{ error.dom.viewport.height }}</span>
              </div>
            </div>
          </div>

          <!-- Network Information -->
          <div v-if="error.network" class="bg-gray-50 rounded p-4">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ t('errors.networkInfo') }}</h3>
            <div class="space-y-2">
              <div v-if="error.network.online !== undefined" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.onLine') }}</span>
                <span class="text-gray-900">{{ error.network.online ? 'Online' : 'Offline' }}</span>
              </div>
              <div v-if="error.network.type" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.type') }}</span>
                <span class="text-gray-900">{{ error.network.type }}</span>
              </div>
              <div v-if="error.network.effectiveType" class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('errors.effectiveType') }}</span>
                <span class="text-gray-900">{{ error.network.effectiveType }}</span>
              </div>
            </div>
          </div>

          <div v-if="!error.browser && !error.dom && !error.network" class="text-center py-12 text-gray-500">
            <p>No device information available</p>
          </div>
        </div>
      </div>

      <!-- Request Info -->
      <div v-show="activeTab === 'request'">
        <div class="space-y-6">
          <!-- 基本信息 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div v-if="error.url" class="bg-gray-50 rounded p-4">
              <div class="text-xs text-gray-600 font-medium mb-2">{{ t('errors.url') }}</div>
              <div class="text-xs text-gray-900 font-mono break-all" :title="error.url">{{ error.url }}</div>
            </div>
            <div v-if="error.method" class="bg-gray-50 rounded p-4">
              <div class="text-xs text-gray-600 font-medium mb-2">{{ t('errors.method') }}</div>
              <div class="text-xs font-bold px-2 py-1 rounded inline-block" :class="{
                'bg-green-100 text-green-800': error.method === 'GET',
                'bg-blue-100 text-blue-800': error.method === 'POST',
                'bg-yellow-100 text-yellow-800': error.method === 'PUT',
                'bg-red-100 text-red-800': error.method === 'DELETE',
                'bg-purple-100 text-purple-800': error.method === 'PATCH'
              }">{{ error.method }}</div>
            </div>
            <div v-if="error.status" class="bg-gray-50 rounded p-4">
              <div class="text-xs text-gray-600 font-medium mb-2">{{ t('errors.status') }}</div>
              <div class="text-xs font-bold px-2 py-1 rounded inline-block" :class="{
                'bg-green-100 text-green-800': error.status >= 200 && error.status < 300,
                'bg-yellow-100 text-yellow-800': error.status >= 300 && error.status < 400,
                'bg-red-100 text-red-800': error.status >= 400
              }">{{ error.status }}</div>
            </div>
          </div>

          <!-- Request Headers -->
          <div v-if="error.requestHeaders && Object.keys(error.requestHeaders).length > 0">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ t('errors.requestHeaders') }}</h3>
            <div class="bg-gray-50 rounded overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-gray-200 bg-gray-100">
                      <th class="text-left py-2 px-4 text-gray-700 font-medium">{{ t('errors.header') }}</th>
                      <th class="text-left py-2 px-4 text-gray-700 font-medium">{{ t('errors.value') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(value, key) in error.requestHeaders" :key="key" class="border-b border-gray-200 hover:bg-gray-100">
                      <td class="py-2 px-4 text-gray-600 font-mono text-xs">{{ key }}</td>
                      <td class="py-2 px-4 text-gray-900 break-all text-xs">{{ value }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Request Body -->
          <div v-if="error.requestBody">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ t('errors.requestBody') }}</h3>
            <div class="bg-gray-900 rounded p-4 overflow-auto max-h-64">
              <pre class="text-gray-100 text-xs font-mono whitespace-pre-wrap break-words">{{ typeof error.requestBody === 'string' ? error.requestBody : JSON.stringify(error.requestBody, null, 2) }}</pre>
            </div>
          </div>

          <!-- Response Headers -->
          <div v-if="error.responseHeaders && Object.keys(error.responseHeaders).length > 0">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ t('errors.responseHeaders') }}</h3>
            <div class="bg-gray-50 rounded overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-gray-200 bg-gray-100">
                      <th class="text-left py-2 px-4 text-gray-700 font-medium">{{ t('errors.header') }}</th>
                      <th class="text-left py-2 px-4 text-gray-700 font-medium">{{ t('errors.value') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(value, key) in error.responseHeaders" :key="key" class="border-b border-gray-200 hover:bg-gray-100">
                      <td class="py-2 px-4 text-gray-600 font-mono text-xs">{{ key }}</td>
                      <td class="py-2 px-4 text-gray-900 break-all text-xs">{{ value }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Response Body -->
          <div v-if="error.response">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ t('errors.response') }}</h3>
            <div class="bg-gray-900 rounded p-4 overflow-auto max-h-64">
              <pre class="text-gray-100 text-xs font-mono whitespace-pre-wrap break-words">{{ typeof error.response === 'string' ? error.response : JSON.stringify(error.response, null, 2) }}</pre>
            </div>
          </div>

          <div v-if="!error.requestHeaders && !error.requestBody && !error.response && !error.responseHeaders" class="text-center py-12 text-gray-500">
            <p>{{ t('errors.noRequestInfo') }}</p>
          </div>
        </div>
      </div>

      <!-- Raw Data -->
      <div v-show="activeTab === 'raw'">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900">{{ t('errors.rawErrorData') }}</h3>
            <button
              @click="copyRawData"
              class="flex items-center gap-1 px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {{ t('projects.copy') }}
            </button>
          </div>
          <div class="bg-gray-900 rounded p-4 overflow-auto max-h-96">
            <pre class="text-gray-100 text-xs font-mono whitespace-pre-wrap break-words">{{ JSON.stringify(error, null, 2) }}</pre>
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
import AIAnalysis from '@/components/AIAnalysis.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';
import i18n from '@/i18n';
import { showToast } from '@/utils/toast';

dayjs.extend(relativeTime);
dayjs.locale(i18n.global.locale.value === 'zh' ? 'zh-cn' : 'en');

// 监听语言变化
watch(() => i18n.global.locale.value, (newLocale) => {
  dayjs.locale(newLocale === 'zh' ? 'zh-cn' : 'en');
});

const route = useRoute();
const router = useRouter();

const error = ref(null);
const activeTab = ref('overview');
const aiAnalysis = ref(null);
const analyzing = ref(false);

const tabs = ref([
  { id: 'overview', label: t('errors.overview') },
  { id: 'ai-analysis', label: t('ai.analysis') },
  { id: 'breadcrumbs', label: t('errors.breadcrumbs') },
  { id: 'tags', label: t('errors.tags') },
  { id: 'context', label: t('errors.context') },
  { id: 'user', label: t('errors.userInfo') },
  { id: 'device', label: t('errors.deviceInfo') },
  { id: 'request', label: t('errors.requestInfo') },
  { id: 'raw', label: t('errors.rawData') }
]);

const fetchError = async () => {
  try {
    const { data } = await axios.get(`/api/errors/${route.params.id}`);
    error.value = data;
  } catch (err) {
    showToast(t('errors.failedToFetch'), 'error');
    router.push('/errors');
  }
};

const resolveError = async () => {
  try {
    const { data } = await axios.patch(`/api/errors/${route.params.id}`, { resolved: true });
    showToast(t('errors.errorResolved'), 'success');
    // Update local state with full response including resolvedBy
    error.value = { ...error.value, ...data };
  } catch (err) {
    showToast(t('errors.failedToResolve'), 'error');
  }
};

const deleteError = async () => {
  if (!confirm(t('errors.confirmDelete'))) return;
  try {
    await axios.delete(`/api/errors/${route.params.id}`);
    showToast(t('errors.errorDeleted'), 'success');
    router.push('/errors');
  } catch (err) {
    showToast(t('errors.failedToDelete'), 'error');
  }
};

// AI 分析相关方法
const fetchAIAnalysis = async () => {
  try {
    const { data } = await axios.get(`/api/ai/errors/${route.params.id}/analysis`);
    aiAnalysis.value = data.analysis;
    if (data.analysis) {
      console.log('AI Analysis loaded:', data.analysis);
    } else {
      console.log('No AI analysis found for this error');
    }
  } catch (err) {
    console.error('Failed to fetch AI analysis:', err);
    aiAnalysis.value = null;
  }
};

const analyzeError = async (force = false) => {
  analyzing.value = true;
  try {
    const { data } = await axios.post(`/api/ai/errors/${route.params.id}/analyze`, { force });
    aiAnalysis.value = data.analysis;
    showToast(data.message || t('ai.analyzeButton') + ' ' + t('common.success'), 'success');
    // 自动切换到 AI 分析标签
    activeTab.value = 'ai-analysis';
  } catch (err) {
    showToast(err.response?.data?.error || t('ai.testFailed'), 'error');
  } finally {
    analyzing.value = false;
  }
};

const submitAnalysisFeedback = async (feedback) => {
  if (!aiAnalysis.value?._id) return;
  try {
    await axios.post(`/api/ai/analysis/${aiAnalysis.value._id}/feedback`, feedback);
    showToast('反馈提交成功', 'success');
  } catch (err) {
    console.error('Failed to submit feedback:', err);
  }
};

const viewRelatedError = (errorId) => {
  router.push(`/errors/${errorId}`);
};

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const formatTime = (date) => {
  return dayjs(date).fromNow();
};

const formatTimestamp = (timestamp) => {
  return dayjs(timestamp).format('HH:mm:ss.SSS');
};

const getTypeLabel = (type) => {
  const typeMap = {
    vue_error: 'errors.types.vue_error',
    global_error: 'errors.types.global_error',
    promise_rejection: 'errors.types.promise_rejection',
    axios_error: 'errors.types.axios_error',
    fetch_error: 'errors.types.fetch_error',
    xhr_error: 'errors.types.xhr_error',
    axios_network_error: 'errors.types.axios_network_error',
    fetch_network_error: 'errors.types.fetch_network_error',
    xhr_network_error: 'errors.types.xhr_network_error',
    jquery_ajax_error: 'errors.types.jquery_ajax_error',
    manual: 'errors.types.manual'
  };
  const key = typeMap[type];
  return key ? t(key) : type;
};

const getTypeIcon = (type) => {
  const icons = {
    vue_error: '🟢',
    global_error: '⚠️',
    promise_rejection: '🔄',
    axios_error: '🌐',
    fetch_error: '🌐',
    xhr_error: '🌐',
    axios_network_error: '📡',
    fetch_network_error: '📡',
    xhr_network_error: '📡',
    jquery_ajax_error: '📘',
    manual: '✋'
  };
  return icons[type] || '❓';
};

const getTypeClass = (type) => {
  if (type?.includes('axios') || type?.includes('fetch') || type?.includes('xhr')) {
    if (type?.includes('network')) {
      return 'bg-orange-100 text-orange-800';
    }
    return 'bg-blue-100 text-blue-800';
  }
  if (type === 'vue_error') return 'bg-green-100 text-green-800';
  if (type === 'promise_rejection') return 'bg-purple-100 text-purple-800';
  if (type === 'jquery_ajax_error') return 'bg-indigo-100 text-indigo-800';
  if (type === 'manual') return 'bg-gray-100 text-gray-800';
  return 'bg-yellow-100 text-yellow-800';
};

const copyCurl = async () => {
  try {
    await navigator.clipboard.writeText(error.value.curlCommand);
    showToast(t('errors.curlCopied'), 'success');
  } catch (err) {
    showToast(t('errors.copyFailed'), 'error');
  }
};

const copyRawData = async () => {
  try {
    const rawData = JSON.stringify(error.value, null, 2);
    await navigator.clipboard.writeText(rawData);
    showToast(t('common.success'), 'success');
  } catch (err) {
    showToast(t('errors.copyFailed'), 'error');
  }
};

const hasDetailedPerformance = (performance) => {
  return performance.dns || performance.tcp || performance.request || 
         performance.response || performance.dom || performance.redirect !== undefined;
};

const getNavigationTypeLabel = (type) => {
  const labels = {
    0: 'Navigate',
    1: 'Reload',
    2: 'Back Forward',
    255: 'Reserved'
  };
  return labels[type] || type;
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

onMounted(() => {
  fetchError();
  fetchAIAnalysis();
});

// 监听路由参数变化，重新加载数据
watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    // 重置数据
    error.value = null;
    aiAnalysis.value = null;
    activeTab.value = 'overview';
    
    // 重新加载
    fetchError();
    fetchAIAnalysis();
  }
});
</script>
