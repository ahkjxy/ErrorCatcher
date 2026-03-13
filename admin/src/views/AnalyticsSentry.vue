<template>
  <div class="h-full flex flex-col bg-white">
    <!-- 页面头部 -->
    <div class="border-b border-gray-200">
      <div class="px-6 py-4">
        <h1 class="text-2xl font-bold text-gray-900">{{ t('analytics.title') }}</h1>
        <p class="text-sm text-gray-600 mt-1">{{ t('analytics.subtitle') }}</p>
      </div>
    </div>

    <!-- 增强的控制面板 -->
    <div class="border-b border-gray-200 px-6 py-4 bg-gray-50">
      <!-- 主要控制行 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-3 mb-4">
        <!-- 时间范围选择 -->
        <div class="lg:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('analytics.dateRange') }}</label>
          <select v-model="selectedRange" @change="handleRangeChange" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500">
            <option value="today">{{ t('analytics.today') }}</option>
            <option value="yesterday">{{ t('analytics.yesterday') }}</option>
            <option value="last7">{{ t('analytics.last7Days') }}</option>
            <option value="last30">{{ t('analytics.last30Days') }}</option>
            <option value="last90">{{ t('analytics.last90Days') }}</option>
            <option value="thisMonth">{{ t('analytics.thisMonth') }}</option>
            <option value="lastMonth">{{ t('analytics.lastMonth') }}</option>
            <option value="weekly">{{ t('analytics.weekly') }}</option>
            <option value="monthly">{{ t('analytics.monthly') }}</option>
            <option value="quarterly">{{ t('analytics.quarterly') }}</option>
            <option value="annual">{{ t('analytics.annual') }}</option>
            <option value="custom">{{ t('analytics.custom') }}</option>
          </select>
        </div>

        <!-- 对比选择 -->
        <div class="lg:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('analytics.compareWith') }}</label>
          <select v-model="compareRange" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500">
            <option value="">{{ t('common.none') }}</option>
            <option value="previous">{{ t('analytics.previousPeriod') }}</option>
            <option value="lastYear">{{ t('analytics.lastYear') }}</option>
            <option value="monthOverMonth">{{ t('analytics.monthOverMonth') }}</option>
            <option value="yearOverYear">{{ t('analytics.yearOverYear') }}</option>
          </select>
        </div>

        <!-- 分析视图选择 -->
        <div class="lg:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('analytics.analysisView') }}</label>
          <select v-model="currentView" @change="handleViewChange" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500">
            <option value="overview">{{ t('analytics.overview') }}</option>
            <option value="trends">{{ t('analytics.trends') }}</option>
            <option value="distribution">{{ t('analytics.distribution') }}</option>
            <option value="rootcause">{{ t('analytics.rootCause') }}</option>
          </select>
        </div>

        <!-- 操作按钮 -->
        <div class="lg:col-span-2 flex items-end gap-2">
          <button @click="fetchAnalytics" class="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium">
            {{ t('analytics.apply') }}
          </button>
          <div class="relative">
            <button @click="showExportMenu = !showExportMenu" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium">
              {{ t('analytics.export') }}
            </button>
            <!-- 导出菜单 -->
            <div v-if="showExportMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
              <div class="py-1">
                <button @click="exportReport('pdf')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  {{ t('analytics.exportPDF') }}
                </button>
                <button @click="exportReport('excel')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  {{ t('analytics.exportExcel') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 自定义日期范围 -->
      <div v-if="selectedRange === 'custom'" class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('analytics.startDate') }}</label>
          <input v-model="customStartDate" type="date" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('analytics.endDate') }}</label>
          <input v-model="customEndDate" type="date" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500" />
        </div>
        <div class="flex items-end">
          <button @click="resetFilters" class="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium">
            {{ t('analytics.reset') }}
          </button>
        </div>
      </div>

      <!-- 活动过滤器显示 -->
      <div v-if="activeFilters.length > 0" class="mt-3 flex flex-wrap gap-2">
        <span class="text-sm text-gray-600">{{ t('analytics.activeFilters') }}:</span>
        <span v-for="filter in activeFilters" :key="filter.key" 
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {{ filter.label }}
          <button @click="removeFilter(filter.key)" class="ml-1 text-purple-600 hover:text-purple-800">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </span>
      </div>
    </div>



    <!-- 内容区域 -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- 加载状态 -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p class="mt-2 text-sm text-gray-500">{{ t('analytics.loading') }}</p>
      </div>

      <!-- 导出进度 -->
      <div v-if="exportProgress.show" class="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-blue-800">{{ t('analytics.exportingReport') }}</span>
          <span class="text-sm text-blue-600">{{ exportProgress.progress }}%</span>
        </div>
        <div class="w-full bg-blue-200 rounded-full h-2">
          <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" :style="{ width: exportProgress.progress + '%' }"></div>
        </div>
      </div>

      <!-- 概览视图 -->
      <div v-if="currentView === 'overview'" v-show="!loading">
        <!-- 增强的统计卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">{{ t('analytics.totalErrors') }}</p>
                <p class="text-3xl font-bold text-gray-900 mt-2">{{ formatNumber(analytics.current.total) }}</p>
              </div>
              <svg class="w-12 h-12 text-red-100" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div v-if="analytics.compare" class="mt-3 flex items-center text-xs">
              <span :class="getChangeClass(analytics.compare.totalChange)">
                {{ formatChange(analytics.compare.totalChange) }}
              </span>
              <span class="text-gray-500 ml-1">{{ t('analytics.compared') }}</span>
              <div v-if="analytics.compare.significance" class="ml-2">
                <span class="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                  {{ analytics.compare.significance }}
                </span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">{{ t('analytics.resolvedErrors') }}</p>
                <p class="text-3xl font-bold text-gray-900 mt-2">{{ formatNumber(analytics.current.resolved) }}</p>
              </div>
              <svg class="w-12 h-12 text-green-100" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div v-if="analytics.compare" class="mt-3 flex items-center text-xs">
              <span :class="getChangeClass(analytics.compare.resolvedChange, true)">
                {{ formatChange(analytics.compare.resolvedChange) }}
              </span>
              <span class="text-gray-500 ml-1">{{ t('analytics.compared') }}</span>
            </div>
          </div>

          <div class="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">{{ t('analytics.affectedUsers') }}</p>
                <p class="text-3xl font-bold text-gray-900 mt-2">{{ formatNumber(analytics.current.affectedUsers || 0) }}</p>
              </div>
              <svg class="w-12 h-12 text-orange-100" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <div v-if="analytics.compare" class="mt-3 flex items-center text-xs">
              <span :class="getChangeClass(analytics.compare.usersChange)">
                {{ formatChange(analytics.compare.usersChange) }}
              </span>
              <span class="text-gray-500 ml-1">{{ t('analytics.compared') }}</span>
            </div>
          </div>

          <div class="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">{{ t('analytics.resolutionRate') }}</p>
                <p class="text-3xl font-bold text-gray-900 mt-2">{{ analytics.current.resolutionRate }}%</p>
              </div>
              <svg class="w-12 h-12 text-blue-100" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- 图表区域 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- 错误趋势 -->
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-semibold text-gray-900">{{ t('analytics.errorTrend') }}</h3>
              <div class="flex items-center space-x-2">
                <button @click="trendGranularity = 'day'" 
                        :class="['px-2 py-1 text-xs rounded', trendGranularity === 'day' ? 'bg-purple-100 text-purple-800' : 'text-gray-600 hover:bg-gray-100']">
                  {{ t('analytics.daily') }}
                </button>
                <button @click="trendGranularity = 'week'" 
                        :class="['px-2 py-1 text-xs rounded', trendGranularity === 'week' ? 'bg-purple-100 text-purple-800' : 'text-gray-600 hover:bg-gray-100']">
                  {{ t('analytics.weekly') }}
                </button>
              </div>
            </div>
            <div style="height: 300px">
              <canvas ref="trendChart"></canvas>
            </div>
          </div>

          <!-- 按级别分类 -->
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <h3 class="text-base font-semibold text-gray-900 mb-4">{{ t('analytics.errorsByLevel') }}</h3>
            <div style="height: 300px">
              <canvas ref="levelChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Top 错误增强版 -->
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-semibold text-gray-900">{{ t('analytics.topErrors') }}</h3>
            <div class="flex items-center space-x-2">
              <select v-model="topErrorsSort" @change="fetchAnalytics" class="text-sm border border-gray-300 rounded px-2 py-1">
                <option value="frequency">{{ t('analytics.byFrequency') }}</option>
                <option value="impact">{{ t('analytics.byImpact') }}</option>
                <option value="recent">{{ t('analytics.byRecent') }}</option>
              </select>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="border-b border-gray-200">
                <tr>
                  <th class="text-left py-2 px-3 font-medium text-gray-700">#</th>
                  <th class="text-left py-2 px-3 font-medium text-gray-700">{{ t('analytics.errorMessage') }}</th>
                  <th class="text-left py-2 px-3 font-medium text-gray-700">{{ t('common.project') }}</th>
                  <th class="text-left py-2 px-3 font-medium text-gray-700">{{ t('analytics.errorLevel') }}</th>
                  <th class="text-right py-2 px-3 font-medium text-gray-700">{{ t('analytics.occurrences') }}</th>
                  <th class="text-right py-2 px-3 font-medium text-gray-700">{{ t('analytics.affectedUsers') }}</th>
                  <th class="text-left py-2 px-3 font-medium text-gray-700">{{ t('analytics.lastOccurred') }}</th>
                  <th class="text-center py-2 px-3 font-medium text-gray-700">{{ t('analytics.actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="(error, index) in analytics.current.topErrors" :key="error._id" class="hover:bg-gray-50">
                  <td class="py-2 px-3 text-gray-600">{{ index + 1 }}</td>
                  <td class="py-2 px-3 text-gray-900">
                    <div class="truncate max-w-xs" :title="error.message || error._id">{{ error.message || error._id }}</div>
                    <div v-if="error.trend" class="text-xs text-gray-500 mt-1">
                      <span :class="error.trend > 0 ? 'text-red-600' : 'text-green-600'">
                        {{ error.trend > 0 ? '↗' : '↘' }} {{ Math.abs(error.trend) }}%
                      </span>
                    </div>
                  </td>
                  <td class="py-2 px-3 text-gray-600">{{ error.project?.name || t('common.unknown') }}</td>
                  <td class="py-2 px-3">
                    <span :class="['px-2 py-1 text-xs font-medium rounded', getLevelClass(error.level)]">
                      {{ error.level }}
                    </span>
                  </td>
                  <td class="py-2 px-3 text-right font-semibold text-gray-900">{{ formatNumber(error.count) }}</td>
                  <td class="py-2 px-3 text-right text-gray-600">{{ formatNumber(error.userCount || 0) }}</td>
                  <td class="py-2 px-3 text-gray-600">{{ formatTime(error.lastOccurred) }}</td>
                  <td class="py-2 px-3 text-center">
                    <button @click="analyzeError(error)" class="text-purple-600 hover:text-purple-800 text-xs">
                      {{ t('analytics.analyze') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 分布分析视图 -->
      <div v-if="currentView === 'distribution'" v-show="!loading">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- 增强的浏览器分布 -->
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-semibold text-gray-900">{{ t('analytics.errorsByBrowser') }}</h3>
              <button @click="showBrowserDetails = !showBrowserDetails" class="text-sm text-purple-600 hover:text-purple-800">
                {{ showBrowserDetails ? t('analytics.hideDetails') : t('analytics.showDetails') }}
              </button>
            </div>
            <div style="height: 300px">
              <canvas ref="browserChart"></canvas>
            </div>
            <div v-if="showBrowserDetails" class="mt-4 space-y-2">
              <div v-for="browser in analytics.current.byBrowser" :key="browser._id" 
                   class="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                   @click="applyFilter('browser', browser._id)">
                <span class="text-sm font-medium">{{ browser._id }}</span>
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-gray-600">{{ formatNumber(browser.count) }}</span>
                  <span class="text-xs text-gray-500">{{ ((browser.count / analytics.current.total) * 100).toFixed(1) }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 增强的操作系统分布 -->
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-semibold text-gray-900">{{ t('analytics.errorsByOS') }}</h3>
              <button @click="showOSDetails = !showOSDetails" class="text-sm text-purple-600 hover:text-purple-800">
                {{ showOSDetails ? t('analytics.hideDetails') : t('analytics.showDetails') }}
              </button>
            </div>
            <div style="height: 300px">
              <canvas ref="osChart"></canvas>
            </div>
            <div v-if="showOSDetails" class="mt-4 space-y-2">
              <div v-for="os in analytics.current.byOS" :key="os._id" 
                   class="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                   @click="applyFilter('os', os._id)">
                <span class="text-sm font-medium">{{ os._id }}</span>
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-gray-600">{{ formatNumber(os.count) }}</span>
                  <span class="text-xs text-gray-500">{{ ((os.count / analytics.current.total) * 100).toFixed(1) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 根因分析视图 -->
      <div v-if="currentView === 'rootcause'" v-show="!loading">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- 按频率排序的错误 -->
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <h3 class="text-base font-semibold text-gray-900 mb-4">{{ t('analytics.topErrorsByFrequency') }}</h3>
            <div class="space-y-3">
              <div v-for="(error, index) in analytics.current.topErrorsByFrequency" :key="error._id" 
                   class="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                   @click="analyzeError(error)">
                <div class="flex-1">
                  <div class="flex items-center space-x-2">
                    <span class="text-sm font-medium text-gray-900">#{{ index + 1 }}</span>
                    <span :class="['px-2 py-1 text-xs font-medium rounded', getLevelClass(error.level)]">
                      {{ error.level }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-700 mt-1 truncate">{{ error.message || error._id }}</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-bold text-gray-900">{{ formatNumber(error.count) }}</p>
                  <p class="text-xs text-gray-500">{{ t('analytics.occurrences') }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 按影响排序的错误 -->
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <h3 class="text-base font-semibold text-gray-900 mb-4">{{ t('analytics.topErrorsByImpact') }}</h3>
            <div class="space-y-3">
              <div v-for="(error, index) in analytics.current.topErrorsByImpact" :key="error._id" 
                   class="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                   @click="analyzeError(error)">
                <div class="flex-1">
                  <div class="flex items-center space-x-2">
                    <span class="text-sm font-medium text-gray-900">#{{ index + 1 }}</span>
                    <span :class="['px-2 py-1 text-xs font-medium rounded', getLevelClass(error.level)]">
                      {{ error.level }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-700 mt-1 truncate">{{ error.message || error._id }}</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-bold text-gray-900">{{ formatNumber(error.userCount) }}</p>
                  <p class="text-xs text-gray-500">{{ t('analytics.affectedUsers') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 错误分类和建议 -->
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <h3 class="text-base font-semibold text-gray-900 mb-4">{{ t('analytics.errorCategorization') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div v-for="category in analytics.current.errorCategories" :key="category.name" 
                 class="p-4 border border-gray-200 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-medium text-gray-900">{{ category.name }}</h4>
                <span class="text-sm text-gray-600">{{ category.count }}</span>
              </div>
              <div class="text-sm text-gray-600 mb-3">{{ category.description }}</div>
              <div v-if="category.suggestions" class="space-y-1">
                <p class="text-xs font-medium text-gray-700">{{ t('analytics.suggestions') }}:</p>
                <ul class="text-xs text-gray-600 space-y-1">
                  <li v-for="suggestion in category.suggestions" :key="suggestion" class="flex items-start">
                    <span class="text-green-600 mr-1">•</span>
                    {{ suggestion }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 趋势分析视图 -->
      <div v-if="currentView === 'trends'" v-show="!loading">
        <!-- 趋势图表区域 -->
        <div class="grid grid-cols-1 gap-6 mb-6">
          <!-- 主要趋势图 -->
          <div class="bg-white rounded-lg p-6 border border-gray-200">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-900">{{ t('analytics.errorTrend') }}</h3>
              <div class="flex items-center space-x-3">
                <div class="flex items-center space-x-2">
                  <label class="text-sm text-gray-600">{{ t('analytics.granularity') }}:</label>
                  <select v-model="trendGranularity" @change="fetchAnalytics" class="text-sm border border-gray-300 rounded px-2 py-1">
                    <option value="hour">{{ t('analytics.hourly') }}</option>
                    <option value="day">{{ t('analytics.daily') }}</option>
                    <option value="week">{{ t('analytics.weekly') }}</option>
                    <option value="month">{{ t('analytics.monthly') }}</option>
                  </select>
                </div>
                <div class="flex items-center space-x-2">
                  <button @click="trendChartType = 'line'" 
                          :class="['px-3 py-1 text-sm rounded', trendChartType === 'line' ? 'bg-purple-100 text-purple-800' : 'text-gray-600 hover:bg-gray-100']">
                    {{ t('analytics.lineChart') }}
                  </button>
                  <button @click="trendChartType = 'bar'" 
                          :class="['px-3 py-1 text-sm rounded', trendChartType === 'bar' ? 'bg-purple-100 text-purple-800' : 'text-gray-600 hover:bg-gray-100']">
                    {{ t('analytics.barChart') }}
                  </button>
                </div>
              </div>
            </div>
            <div style="height: 400px">
              <canvas ref="mainTrendChart"></canvas>
            </div>
          </div>
        </div>

        <!-- 趋势统计卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">{{ t('analytics.peakErrors') }}</p>
                <p class="text-2xl font-bold text-red-600 mt-1">{{ formatNumber(trendStats.peak) }}</p>
              </div>
              <svg class="w-8 h-8 text-red-100" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </div>
            <p class="text-xs text-gray-500 mt-2">{{ trendStats.peakDate }}</p>
          </div>

          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">{{ t('analytics.averageErrors') }}</p>
                <p class="text-2xl font-bold text-blue-600 mt-1">{{ formatNumber(trendStats.average) }}</p>
              </div>
              <svg class="w-8 h-8 text-blue-100" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <p class="text-xs text-gray-500 mt-2">{{ t('analytics.perPeriod') }}</p>
          </div>

          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">{{ t('analytics.trendDirection') }}</p>
                <p class="text-2xl font-bold mt-1" :class="trendStats.direction === 'up' ? 'text-red-600' : trendStats.direction === 'down' ? 'text-green-600' : 'text-gray-600'">
                  {{ trendStats.direction === 'up' ? '↗' : trendStats.direction === 'down' ? '↘' : '→' }}
                </p>
              </div>
              <svg class="w-8 h-8 text-gray-100" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd" />
              </svg>
            </div>
            <p class="text-xs text-gray-500 mt-2">{{ trendStats.changePercent }}%</p>
          </div>

          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">{{ t('analytics.volatility') }}</p>
                <p class="text-2xl font-bold text-orange-600 mt-1">{{ trendStats.volatility }}%</p>
              </div>
              <svg class="w-8 h-8 text-orange-100" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <p class="text-xs text-gray-500 mt-2">{{ t('analytics.standardDeviation') }}</p>
          </div>
        </div>

        <!-- 趋势对比分析 -->
        <div v-if="analytics.compare" class="bg-white rounded-lg p-6 border border-gray-200 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t('analytics.trendComparison') }}</h3>
          <div style="height: 300px">
            <canvas ref="comparisonChart"></canvas>
          </div>
        </div>

        <!-- 趋势数据表格 -->
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-semibold text-gray-900">{{ t('analytics.trendData') }}</h3>
            <button @click="exportTrendData" class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
              {{ t('analytics.exportData') }}
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="border-b border-gray-200">
                <tr>
                  <th class="text-left py-2 px-3 font-medium text-gray-700">{{ t('analytics.period') }}</th>
                  <th class="text-right py-2 px-3 font-medium text-gray-700">{{ t('analytics.totalErrors') }}</th>
                  <th class="text-right py-2 px-3 font-medium text-gray-700">{{ t('analytics.resolvedErrors') }}</th>
                  <th class="text-right py-2 px-3 font-medium text-gray-700">{{ t('analytics.resolutionRate') }}</th>
                  <th class="text-right py-2 px-3 font-medium text-gray-700">{{ t('analytics.change') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="(item, index) in analytics.current.trend" :key="item._id" class="hover:bg-gray-50">
                  <td class="py-2 px-3 font-medium text-gray-900">{{ formatPeriod(item._id) }}</td>
                  <td class="py-2 px-3 text-right text-gray-900">{{ formatNumber(item.count) }}</td>
                  <td class="py-2 px-3 text-right text-gray-600">{{ formatNumber(item.resolved || 0) }}</td>
                  <td class="py-2 px-3 text-right text-gray-600">{{ item.count > 0 ? ((item.resolved || 0) / item.count * 100).toFixed(1) : 0 }}%</td>
                  <td class="py-2 px-3 text-right">
                    <span v-if="index > 0" :class="getChangeClass(calculateChange(analytics.current.trend[index-1].count, item.count))">
                      {{ formatChange(calculateChange(analytics.current.trend[index-1].count, item.count)) }}
                    </span>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { ref, reactive, onMounted } from 'vue';
import { useProjectStore } from '@/stores/project';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';
import i18n from '@/i18n';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);
dayjs.extend(relativeTime);
dayjs.locale(i18n.global.locale.value === 'zh' ? 'zh-cn' : 'en');

const projectStore = useProjectStore();
const loading = ref(false);
const selectedRange = ref('last7');
const customStartDate = ref('');
const customEndDate = ref('');
const compareRange = ref('');

// 新增的响应式变量
const currentView = ref('overview');
const showExportMenu = ref(false);
const showBrowserDetails = ref(false);
const showOSDetails = ref(false);
const trendGranularity = ref('day');
const topErrorsSort = ref('frequency');

// 趋势视图相关变量
const trendChartType = ref('line');
const mainTrendChart = ref(null);
const comparisonChart = ref(null);

let mainTrendChartInstance = null;
let comparisonChartInstance = null;

// 导出进度
const exportProgress = reactive({
  show: false,
  progress: 0,
  type: ''
});

// 活动过滤器
const activeFilters = ref([]);

const trendChart = ref(null);
const levelChart = ref(null);
const browserChart = ref(null);
const osChart = ref(null);

let trendChartInstance = null;
let levelChartInstance = null;
let browserChartInstance = null;
let osChartInstance = null;

const analytics = reactive({
  current: {
    total: 0,
    resolved: 0,
    unresolved: 0,
    resolutionRate: 0,
    affectedUsers: 0,
    byLevel: {},
    byBrowser: [],
    byOS: [],
    trend: [],
    topErrors: [],
    topErrorsByFrequency: [],
    topErrorsByImpact: [],
    errorCategories: []
  },
  compare: null
});

// 趋势统计数据
const trendStats = reactive({
  peak: 0,
  peakDate: '',
  average: 0,
  direction: 'stable',
  changePercent: 0,
  volatility: 0
});

const getDateRange = () => {
  const end = new Date();
  let start = new Date();

  switch (selectedRange.value) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'yesterday':
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'last7':
      start.setDate(start.getDate() - 7);
      break;
    case 'last30':
      start.setDate(start.getDate() - 30);
      break;
    case 'last90':
      start.setDate(start.getDate() - 90);
      break;
    case 'thisMonth':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'lastMonth':
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'weekly':
      // 获取本周开始
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      // 获取本月开始
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'quarterly':
      // 获取本季度开始
      const quarter = Math.floor(start.getMonth() / 3);
      start.setMonth(quarter * 3, 1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'annual':
      // 获取本年开始
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'custom':
      start = new Date(customStartDate.value);
      end = new Date(customEndDate.value);
      break;
  }

  return { start, end };
};

const getCompareRange = () => {
  if (!compareRange.value) return null;

  const { start, end } = getDateRange();
  const duration = end - start;

  switch (compareRange.value) {
    case 'previous':
      return {
        start: new Date(start - duration),
        end: new Date(start)
      };
    case 'lastYear':
      return {
        start: new Date(start.getFullYear() - 1, start.getMonth(), start.getDate()),
        end: new Date(end.getFullYear() - 1, end.getMonth(), end.getDate())
      };
    case 'monthOverMonth':
      const prevMonth = new Date(start);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      return {
        start: prevMonth,
        end: new Date(prevMonth.getTime() + duration)
      };
    case 'yearOverYear':
      return {
        start: new Date(start.getFullYear() - 1, start.getMonth(), start.getDate()),
        end: new Date(end.getFullYear() - 1, end.getMonth(), end.getDate())
      };
    default:
      return null;
  }
};

const fetchAnalytics = async () => {
  loading.value = true;
  try {
    const { start, end } = getDateRange();
    const compareRange = getCompareRange();

    const params = {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      view: currentView.value,
      sort: topErrorsSort.value,
      granularity: trendGranularity.value
    };

    if (projectStore.currentProjectId) {
      params.projectId = projectStore.currentProjectId;
    }

    if (compareRange) {
      params.compareStartDate = compareRange.start.toISOString();
      params.compareEndDate = compareRange.end.toISOString();
      params.compareType = compareRange.value;
    }

    // 添加活动过滤器
    activeFilters.value.forEach(filter => {
      params[filter.key] = filter.value;
    });

    const { data } = await axios.get('/api/analytics/overview', { params });

    analytics.current = data.current;
    analytics.compare = data.compare;

    await initCharts();
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
  } finally {
    loading.value = false;
  }
};

// 新增方法
const handleViewChange = () => {
  fetchAnalytics();
};

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const formatChange = (change) => {
  if (change === 'Infinity' || change === '-Infinity' || isNaN(change)) {
    return 'N/A';
  }
  return (change >= 0 ? '+' : '') + change + '%';
};

const getChangeClass = (change, isPositiveGood = false) => {
  if (change === 'Infinity' || change === '-Infinity' || isNaN(change)) {
    return 'text-gray-500';
  }
  
  const isPositive = change >= 0;
  if (isPositiveGood) {
    return isPositive ? 'text-green-600' : 'text-red-600';
  } else {
    return isPositive ? 'text-red-600' : 'text-green-600';
  }
};

const applyFilter = (type, value) => {
  const existingFilter = activeFilters.value.find(f => f.key === type);
  if (existingFilter) {
    existingFilter.value = value;
    existingFilter.label = `${type}: ${value}`;
  } else {
    activeFilters.value.push({
      key: type,
      value: value,
      label: `${type}: ${value}`
    });
  }
  fetchAnalytics();
};

const removeFilter = (key) => {
  const index = activeFilters.value.findIndex(f => f.key === key);
  if (index > -1) {
    activeFilters.value.splice(index, 1);
    fetchAnalytics();
  }
};

const analyzeError = (error) => {
  // 跳转到错误详情页面或显示分析模态框
  console.log('Analyzing error:', error);
};

const exportReport = async (type) => {
  showExportMenu.value = false;
  exportProgress.show = true;
  exportProgress.progress = 0;
  exportProgress.type = type;

  try {
    const { start, end } = getDateRange();
    const params = {
      type,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      view: currentView.value,
      projectId: projectStore.currentProjectId
    };

    // 模拟导出进度
    const progressInterval = setInterval(() => {
      exportProgress.progress += 10;
      if (exportProgress.progress >= 90) {
        clearInterval(progressInterval);
      }
    }, 200);

    const { data } = await axios.post('/api/analytics/export', params);
    
    clearInterval(progressInterval);
    exportProgress.progress = 100;
    
    // 下载文件
    const link = document.createElement('a');
    link.href = data.downloadUrl;
    link.download = data.filename;
    link.click();
    
    setTimeout(() => {
      exportProgress.show = false;
      exportProgress.progress = 0;
    }, 1000);
  } catch (error) {
    console.error('Export failed:', error);
    exportProgress.show = false;
  }
};

const initCharts = async () => {
  // 趋势图
  if (trendChart.value && analytics.current.trend.length > 0) {
    if (trendChartInstance) trendChartInstance.destroy();

    const labels = analytics.current.trend.map(item => item._id);
    const data = analytics.current.trend.map(item => item.count);

    trendChartInstance = new Chart(trendChart.value, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: t('analytics.errorTrend'),
          data,
          borderColor: 'rgb(147, 51, 234)',
          backgroundColor: 'rgba(147, 51, 234, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // 级别分布图
  if (levelChart.value) {
    if (levelChartInstance) levelChartInstance.destroy();

    const levels = ['fatal', 'error', 'warning', 'info', 'debug'];
    const data = levels.map(level => analytics.current.byLevel[level] || 0);

    levelChartInstance = new Chart(levelChart.value, {
      type: 'doughnut',
      data: {
        labels: levels.map(l => l.toUpperCase()),
        datasets: [{
          data,
          backgroundColor: [
            'rgb(239, 68, 68)',
            'rgb(239, 68, 68)',
            'rgb(251, 191, 36)',
            'rgb(59, 130, 246)',
            'rgb(156, 163, 175)'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  // 浏览器分布图
  if (browserChart.value && analytics.current.byBrowser.length > 0) {
    if (browserChartInstance) browserChartInstance.destroy();

    const labels = analytics.current.byBrowser.map(item => item._id);
    const data = analytics.current.byBrowser.map(item => item.count);

    browserChartInstance = new Chart(browserChart.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: t('analytics.errorsByBrowser'),
          data,
          backgroundColor: 'rgba(147, 51, 234, 0.8)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // 操作系统分布图
  if (osChart.value && analytics.current.byOS.length > 0) {
    if (osChartInstance) osChartInstance.destroy();

    const labels = analytics.current.byOS.map(item => item._id);
    const data = analytics.current.byOS.map(item => item.count);

    osChartInstance = new Chart(osChart.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: t('analytics.errorsByOS'),
          data,
          backgroundColor: 'rgba(59, 130, 246, 0.8)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // 趋势视图 - 主要趋势图
  if (mainTrendChart.value && analytics.current.trend.length > 0 && currentView.value === 'trends') {
    if (mainTrendChartInstance) mainTrendChartInstance.destroy();

    const labels = analytics.current.trend.map(item => formatPeriod(item._id));
    const data = analytics.current.trend.map(item => item.count);

    mainTrendChartInstance = new Chart(mainTrendChart.value, {
      type: trendChartType.value,
      data: {
        labels,
        datasets: [{
          label: t('analytics.errorTrend'),
          data,
          borderColor: 'rgb(147, 51, 234)',
          backgroundColor: trendChartType.value === 'line' ? 'rgba(147, 51, 234, 0.1)' : 'rgba(147, 51, 234, 0.8)',
          tension: 0.4,
          fill: trendChartType.value === 'line'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${t('analytics.errors')}: ${formatNumber(context.parsed.y)}`;
              }
            }
          }
        },
        scales: { 
          y: { 
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return formatNumber(value);
              }
            }
          }
        }
      }
    });

    // 计算趋势统计
    calculateTrendStats();
  }

  // 趋势视图 - 对比图表
  if (comparisonChart.value && analytics.compare && currentView.value === 'trends') {
    if (comparisonChartInstance) comparisonChartInstance.destroy();

    const labels = analytics.current.trend.map(item => formatPeriod(item._id));
    const currentData = analytics.current.trend.map(item => item.count);
    const compareData = analytics.compare.trend.map(item => item.count);

    comparisonChartInstance = new Chart(comparisonChart.value, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: t('analytics.currentPeriod'),
          data: currentData,
          borderColor: 'rgb(147, 51, 234)',
          backgroundColor: 'rgba(147, 51, 234, 0.1)',
          tension: 0.4,
          fill: false
        }, {
          label: t('analytics.comparePeriod'),
          data: compareData,
          borderColor: 'rgb(156, 163, 175)',
          backgroundColor: 'rgba(156, 163, 175, 0.1)',
          tension: 0.4,
          fill: false,
          borderDash: [5, 5]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { 
            display: true,
            position: 'top'
          }
        },
        scales: { 
          y: { 
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return formatNumber(value);
              }
            }
          }
        }
      }
    });
  }
};

const handleRangeChange = () => {
  if (selectedRange.value !== 'custom') {
    customStartDate.value = '';
    customEndDate.value = '';
  }
};

const resetFilters = () => {
  selectedRange.value = 'last7';
  customStartDate.value = '';
  customEndDate.value = '';
  compareRange.value = '';
  activeFilters.value = [];
  currentView.value = 'overview';
  fetchAnalytics();
};

const getLevelClass = (level) => {
  const classes = {
    fatal: 'bg-red-100 text-red-800',
    error: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    debug: 'bg-gray-100 text-gray-800'
  };
  return classes[level] || 'bg-gray-100 text-gray-800';
};

const formatTime = (date) => {
  return dayjs(date).fromNow();
};

// 趋势视图相关函数
const formatPeriod = (period) => {
  if (trendGranularity.value === 'hour') {
    return dayjs(period).format('MM-DD HH:mm');
  } else if (trendGranularity.value === 'day') {
    return dayjs(period).format('MM-DD');
  } else if (trendGranularity.value === 'week') {
    return `Week ${period}`;
  } else if (trendGranularity.value === 'month') {
    return dayjs(period).format('YYYY-MM');
  }
  return period;
};

const calculateChange = (prev, current) => {
  if (prev === 0) return current > 0 ? 100 : 0;
  return ((current - prev) / prev * 100).toFixed(1);
};

const calculateTrendStats = () => {
  if (!analytics.current.trend.length) return;

  const values = analytics.current.trend.map(item => item.count);
  
  // 峰值
  trendStats.peak = Math.max(...values);
  const peakIndex = values.indexOf(trendStats.peak);
  trendStats.peakDate = formatPeriod(analytics.current.trend[peakIndex]._id);
  
  // 平均值
  trendStats.average = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  
  // 趋势方向
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  if (secondAvg > firstAvg * 1.1) {
    trendStats.direction = 'up';
  } else if (secondAvg < firstAvg * 0.9) {
    trendStats.direction = 'down';
  } else {
    trendStats.direction = 'stable';
  }
  
  trendStats.changePercent = ((secondAvg - firstAvg) / firstAvg * 100).toFixed(1);
  
  // 波动性（标准差）
  const mean = trendStats.average;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  trendStats.volatility = Math.sqrt(variance).toFixed(1);
};

const exportTrendData = () => {
  const csvContent = [
    ['Period', 'Total Errors', 'Resolved Errors', 'Resolution Rate', 'Change'].join(','),
    ...analytics.current.trend.map((item, index) => [
      formatPeriod(item._id),
      item.count,
      item.resolved || 0,
      item.count > 0 ? ((item.resolved || 0) / item.count * 100).toFixed(1) + '%' : '0%',
      index > 0 ? calculateChange(analytics.current.trend[index-1].count, item.count) + '%' : '-'
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `trend-data-${dayjs().format('YYYY-MM-DD')}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};

onMounted(() => {
  fetchAnalytics();
});
</script>