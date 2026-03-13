<template>
  <div class="h-full flex flex-col bg-gray-50">
    <!-- 页面头部 -->
    <div class="border-b border-gray-200">
      <div class="px-6 py-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t('dashboard.title') }}</h1>
        <p class="text-sm text-gray-600">{{ t('dashboard.subtitle') }}</p>
      </div>
    </div>

    <!-- 页面内容 -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm text-gray-600 font-medium">{{ t('dashboard.totalIssues') }}</span>
            <svg class="w-6 h-6 text-purple-600 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="text-4xl font-bold text-gray-900 mb-2">{{ stats.totalIssues }}</div>
          <div class="flex items-center gap-2 text-xs">
            <span class="font-semibold" :class="stats.issuesTrend >= 0 ? 'text-red-600' : 'text-green-600'">
              {{ stats.issuesTrend >= 0 ? '+' : '' }}{{ stats.issuesTrend }}%
            </span>
            <span class="text-gray-500">{{ t('dashboard.fromLastWeek') }}</span>
          </div>
        </div>

        <div class="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm text-gray-600 font-medium">{{ t('dashboard.totalErrors') }}</span>
            <svg class="w-6 h-6 text-purple-600 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="text-4xl font-bold text-gray-900 mb-2">{{ stats.totalErrors }}</div>
          <div class="flex items-center gap-2 text-xs">
            <span class="font-semibold" :class="stats.errorsTrend >= 0 ? 'text-red-600' : 'text-green-600'">
              {{ stats.errorsTrend >= 0 ? '+' : '' }}{{ stats.errorsTrend }}%
            </span>
            <span class="text-gray-500">{{ t('dashboard.fromLastWeek') }}</span>
          </div>
        </div>

        <div class="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm text-gray-600 font-medium">{{ t('dashboard.affectedUsers') }}</span>
            <svg class="w-6 h-6 text-purple-600 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div class="text-4xl font-bold text-gray-900 mb-2">{{ stats.affectedUsers }}</div>
          <div class="flex items-center gap-2 text-xs">
            <span class="font-semibold" :class="stats.usersTrend >= 0 ? 'text-red-600' : 'text-green-600'">
              {{ stats.usersTrend >= 0 ? '+' : '' }}{{ stats.usersTrend }}%
            </span>
            <span class="text-gray-500">{{ t('dashboard.fromLastWeek') }}</span>
          </div>
        </div>

        <div class="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm text-gray-600 font-medium">{{ t('dashboard.activeAlerts') }}</span>
            <svg class="w-6 h-6 text-purple-600 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div class="text-4xl font-bold text-gray-900 mb-2">{{ stats.activeAlerts }}</div>
          <div class="text-xs text-gray-500">{{ stats.triggeredToday }} {{ t('dashboard.triggeredToday') }}</div>
        </div>
      </div>

      <!-- 快速导航 -->
      <div class="mb-6">
        <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ t('dashboard.quickAccess') }}</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <!-- Issues -->
          <router-link
            to="/issues"
            class="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer group"
          >
            <div class="flex flex-col items-center text-center">
              <svg class="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm font-medium text-gray-900">{{ t('nav.issues') }}</span>
              <span class="text-xs text-gray-500 mt-1">{{ stats.totalIssues }}</span>
            </div>
          </router-link>

          <!-- Errors -->
          <router-link
            to="/errors"
            class="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer group"
          >
            <div class="flex flex-col items-center text-center">
              <svg class="w-8 h-8 text-red-600 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm font-medium text-gray-900">{{ t('nav.errors') }}</span>
              <span class="text-xs text-gray-500 mt-1">{{ stats.totalErrors }}</span>
            </div>
          </router-link>

          <!-- Projects -->
          <router-link
            to="/projects"
            class="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer group"
          >
            <div class="flex flex-col items-center text-center">
              <svg class="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span class="text-sm font-medium text-gray-900">{{ t('nav.projects') }}</span>
              <span class="text-xs text-gray-500 mt-1">{{ projectsList.length }}</span>
            </div>
          </router-link>

          <!-- Alerts -->
          <router-link
            to="/alerts"
            class="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer group"
          >
            <div class="flex flex-col items-center text-center">
              <svg class="w-8 h-8 text-yellow-600 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span class="text-sm font-medium text-gray-900">{{ t('nav.alerts') }}</span>
              <span class="text-xs text-gray-500 mt-1">{{ stats.activeAlerts }}</span>
            </div>
          </router-link>

          <!-- Notifications -->
          <router-link
            to="/notifications"
            class="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer group"
          >
            <div class="flex flex-col items-center text-center">
              <svg class="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span class="text-sm font-medium text-gray-900">{{ t('nav.notifications') }}</span>
            </div>
          </router-link>
        </div>
      </div>

      <!-- AI 分析功能卡片 -->
      <div class="mb-6">
        <div class="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border-2 border-purple-200">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 class="text-lg font-semibold text-gray-900">AI 智能错误分析</h3>
                <span class="px-2 py-0.5 text-xs font-medium bg-purple-600 text-white rounded">NEW</span>
              </div>
              <p class="text-sm text-gray-600 mb-4">
                使用 AI 自动分析错误根因，提供修复建议和预防措施。在错误详情页面的 "AI 分析" 标签中使用。
              </p>
              <div class="flex items-center gap-3">
                <router-link
                  to="/errors"
                  class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  查看错误列表
                </router-link>
                <router-link
                  to="/documentation?section=ai-analysis"
                  class="px-4 py-2 bg-white text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
                >
                  查看文档
                </router-link>
              </div>
            </div>
            <div class="hidden lg:block ml-6">
              <svg class="w-32 h-32 text-purple-300 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <h3 class="text-base font-semibold text-gray-900 mb-4">{{ t('dashboard.errorTrends') }}</h3>
          <div class="relative" style="height: 256px">
            <canvas ref="errorTrendChart"></canvas>
          </div>
        </div>

        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <h3 class="text-base font-semibold text-gray-900 mb-4">{{ t('dashboard.issuesByLevel') }}</h3>
          <div class="relative" style="height: 256px">
            <canvas ref="issueLevelChart"></canvas>
          </div>
        </div>
      </div>

      <!-- 项目列表 -->
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900">{{ t('dashboard.myProjects') }}</h3>
          <router-link to="/projects" class="text-sm text-purple-600 hover:text-purple-700">
            {{ t('dashboard.viewAll') }} →
          </router-link>
        </div>
        <div class="divide-y divide-gray-200">
          <div
            v-for="project in projectsList"
            :key="project._id"
            class="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
            @click="viewProject(project._id)"
          >
            <div class="flex items-center gap-2 mb-2">
              <svg class="w-5 h-5 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span class="text-sm font-semibold text-gray-900 flex-1 truncate">{{ project.name }}</span>
              <span v-if="project.environment" class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded flex-shrink-0">
                {{ project.environment }}
              </span>
            </div>
            <div class="grid grid-cols-4 gap-4 text-xs">
              <div>
                <span class="text-gray-500">{{ t('dashboard.issues') }}:</span>
                <span class="font-semibold text-gray-900" :class="project.stats.issues > 0 ? 'text-red-600' : ''">{{ project.stats.issues }}</span>
              </div>
              <div>
                <span class="text-gray-500">{{ t('dashboard.errors') }}:</span>
                <span class="font-semibold text-gray-900" :class="project.stats.errors > 0 ? 'text-yellow-600' : ''">{{ project.stats.errors }}</span>
              </div>
              <div>
                <span class="text-gray-500">{{ t('dashboard.users') }}:</span>
                <span class="font-semibold text-gray-900">{{ project.stats.users }}</span>
              </div>
              <div>
                <span class="text-gray-500">{{ t('dashboard.lastError') }}:</span>
                <span class="font-semibold text-gray-900">{{ project.stats.lastError ? formatTime(project.stats.lastError) : t('dashboard.none') }}</span>
              </div>
            </div>
          </div>
          <div v-if="projectsList.length === 0" class="px-4 py-8 text-center text-gray-500 text-sm">
            {{ t('dashboard.noProjectsAvailable') }}
          </div>
        </div>
      </div>

      <!-- 最近的 Issues -->
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900">{{ t('dashboard.recentIssues') }}</h3>
          <router-link to="/issues" class="text-sm text-purple-600 hover:text-purple-700">
            {{ t('dashboard.viewAll') }} →
          </router-link>
        </div>
        <div class="divide-y divide-gray-200">
          <div
            v-for="issue in recentIssues"
            :key="issue._id"
            class="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
            @click="viewIssue(issue._id)"
          >
            <div class="flex items-center gap-2 mb-1">
              <span
                class="px-2 py-1 text-xs font-semibold rounded flex-shrink-0"
                :class="{
                  'bg-red-100 text-red-800': issue.level === 'error',
                  'bg-yellow-100 text-yellow-800': issue.level === 'warning',
                  'bg-blue-100 text-blue-800': issue.level === 'info'
                }"
              >
                {{ issue.level.toUpperCase() }}
              </span>
              <span class="text-sm font-semibold text-gray-900 flex-1 truncate">{{ issue.title }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <span>{{ issue.count }} {{ t('dashboard.events') }}</span>
              <span>•</span>
              <span>{{ issue.userCount }} {{ t('dashboard.users') }}</span>
              <span>•</span>
              <span>{{ formatTime(issue.lastSeen) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { ref, reactive, onMounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
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

watch(() => i18n.global.locale.value, (newLocale) => {
  dayjs.locale(newLocale === 'zh' ? 'zh-cn' : 'en');
});

const router = useRouter();
const projectStore = useProjectStore();

const stats = reactive({
  totalIssues: 0,
  totalErrors: 0,
  affectedUsers: 0,
  activeAlerts: 0,
  issuesTrend: 0,
  errorsTrend: 0,
  usersTrend: 0,
  triggeredToday: 0
});

const recentIssues = ref([]);
const projectsList = ref([]);
const errorTrendChart = ref(null);
const issueLevelChart = ref(null);
let errorTrendChartInstance = null;
let issueLevelChartInstance = null;

const initErrorTrendChart = (trendData) => {
  if (!errorTrendChart.value || !trendData) return;
  try {
    const { labels, data } = trendData;

    if (errorTrendChartInstance) {
      errorTrendChartInstance.destroy();
    }

    errorTrendChartInstance = new Chart(errorTrendChart.value, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: t('dashboard.errors'),
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
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Failed to init error trend chart:', error);
  }
};

const initIssueLevelChart = (levelData) => {
  if (!issueLevelChart.value || !levelData) return;
  try {
    if (issueLevelChartInstance) {
      issueLevelChartInstance.destroy();
    }

    issueLevelChartInstance = new Chart(issueLevelChart.value, {
      type: 'doughnut',
      data: {
        labels: [
          t('errors.level.error'),
          t('errors.level.warning'),
          t('errors.level.info'),
          t('errors.level.debug')
        ],
        datasets: [{
          data: [
            levelData.error || 0,
            levelData.warning || 0,
            levelData.info || 0,
            levelData.debug || 0
          ],
          backgroundColor: [
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
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  } catch (error) {
    console.error('Failed to init issue level chart:', error);
  }
};

const fetchStats = async () => {
  try {
    // 方案 1：使用单一 dashboard API 端点
    const { data } = await axios.get('/api/dashboard/stats', {
      params: projectStore.currentProjectId ? { projectId: projectStore.currentProjectId } : {}
    });

    stats.totalIssues = data.stats.totalIssues;
    stats.totalErrors = data.stats.totalErrors;
    stats.affectedUsers = data.stats.affectedUsers;
    stats.activeAlerts = data.stats.activeAlerts;
    stats.issuesTrend = data.stats.issuesTrend;
    stats.errorsTrend = data.stats.errorsTrend;
    stats.usersTrend = data.stats.usersTrend;
    stats.triggeredToday = data.stats.triggeredToday;

    // 返回完整数据用于图表初始化
    return data;
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return null;
  }
};

const fetchRecentIssues = async () => {
  try {
    // 方案 1：从 dashboard API 获取最近 issues
    const { data } = await axios.get('/api/dashboard/stats', {
      params: projectStore.currentProjectId ? { projectId: projectStore.currentProjectId } : {}
    });

    recentIssues.value = data.recentIssues || [];
    return data;
  } catch (error) {
    console.error('Failed to fetch recent issues:', error);
    return null;
  }
};

const fetchProjectsList = async () => {
  try {
    // 方案 1 + 3：从 dashboard API 获取项目列表（已包含统计数据）
    const { data } = await axios.get('/api/dashboard/stats', {
      params: projectStore.currentProjectId ? { projectId: projectStore.currentProjectId } : {}
    });

    projectsList.value = data.projects || [];
    return data;
  } catch (error) {
    console.error('Failed to fetch projects list:', error);
    return null;
  }
};

const viewProject = (id) => {
  router.push(`/projects/${id}`);
};

const viewIssue = (id) => {
  router.push(`/issues/${id}`);
};

const formatTime = (date) => {
  return dayjs(date).fromNow();
};

onMounted(async () => {
  // 方案 1：所有数据从单一 dashboard API 获取
  const dashboardData = await fetchStats();
  
  if (dashboardData) {
    // 同时更新其他数据
    recentIssues.value = dashboardData.recentIssues || [];
    projectsList.value = dashboardData.projects || [];
    
    await nextTick();
    
    // 使用获取的数据初始化图表
    initErrorTrendChart(dashboardData.errorTrend);
    initIssueLevelChart(dashboardData.issueLevels);
  }
});
</script>
