<template>
  <div v-if="issue" class="h-full flex flex-col bg-white">
    <!-- 页面头部 -->
    <div class="border-b border-gray-200">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between mb-4">
          <button @click="$router.back()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            {{ t('issues.backToIssues') }}
          </button>
          <div class="flex gap-2">
            <button
              v-if="issue.status !== 'resolved'"
              @click="updateStatus('resolved')"
              class="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              {{ t('issues.resolve') }}
            </button>
            <button
              v-if="issue.status !== 'ignored'"
              @click="updateStatus('ignored')"
              class="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
            >
              {{ t('issues.ignore') }}
            </button>
            <button
              @click="deleteIssue"
              class="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              {{ t('common.delete') }}
            </button>
          </div>
        </div>

        <!-- Issue 标题 -->
        <div class="flex items-center gap-2 mb-2">
          <span :class="getTypeClass(issue.type)" class="px-2 py-0.5 text-xs font-medium rounded">
            {{ getTypeIcon(issue.type) }} {{ getTypeLabel(issue.type) }}
          </span>
          <span
            :class="{
              'bg-red-100 text-red-800': issue.level === 'error',
              'bg-yellow-100 text-yellow-800': issue.level === 'warning',
              'bg-blue-100 text-blue-800': issue.level === 'info'
            }"
            class="px-2 py-0.5 text-xs font-medium rounded"
          >
            {{ issue.level.toUpperCase() }}
          </span>
          <span
            :class="{
              'bg-green-100 text-green-800': issue.status === 'resolved',
              'bg-gray-100 text-gray-800': issue.status === 'ignored',
              'bg-red-100 text-red-800': issue.status === 'unresolved'
            }"
            class="px-2 py-0.5 text-xs font-medium rounded"
          >
            {{ t(`issues.status.${issue.status}`) }}
          </span>
          <span v-if="issue.status === 'resolved' && issue.resolvedBy" class="text-xs text-gray-500">
            by {{ issue.resolvedBy?.username || issue.resolvedBy }}
            <span v-if="issue.resolvedAt"> · {{ formatDate(issue.resolvedAt) }}</span>
          </span>
          <span class="text-xs text-gray-500">{{ issue.shortId }}</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ issue.title }}</h1>
        <div class="text-sm text-gray-500 font-mono mb-3">{{ issue.culprit }}</div>
        
        <!-- 项目和统计信息 -->
        <div class="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
          <!-- 项目信息 -->
          <span v-if="issue.projectId?.name" class="flex items-center gap-1 text-purple-600 font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            {{ issue.projectId.name }}
          </span>
          
          <!-- 项目负责人 -->
          <span v-if="issue.projectId?.owner" class="flex items-center gap-1 text-gray-600" :title="`${t('projects.owner')}: ${issue.projectId.owner.email || issue.projectId.owner.username}`">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ t('projects.owner') }}: {{ issue.projectId.owner.username }}
          </span>
          
          <span>{{ issue.count }} {{ t('dashboard.events') }}</span>
          <span>{{ issue.userCount }} {{ t('issues.users') }}</span>
          <span>{{ t('errors.lastSeen') }} {{ formatTime(issue.lastSeen) }}</span>
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
            {{ tab.name }}
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
            <div class="text-2xl font-bold text-gray-900">{{ issue.count }}</div>
          </div>
          <div class="border border-gray-200 rounded p-4">
            <div class="text-sm text-gray-600 mb-1">{{ t('issues.users') }}</div>
            <div class="text-2xl font-bold text-gray-900">{{ issue.userCount }}</div>
          </div>
          <div class="border border-gray-200 rounded p-4">
            <div class="text-sm text-gray-600 mb-1">{{ t('errors.firstSeen') }}</div>
            <div class="text-sm font-medium text-gray-900">{{ formatDate(issue.firstSeen) }}</div>
          </div>
          <div class="border border-gray-200 rounded p-4">
            <div class="text-sm text-gray-600 mb-1">{{ t('errors.lastSeen') }}</div>
            <div class="text-sm font-medium text-gray-900">{{ formatDate(issue.lastSeen) }}</div>
          </div>
        </div>

        <!-- Resolved by info -->
        <div v-if="issue.status === 'resolved' && issue.resolvedBy" class="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ t('errors.resolved') }} by {{ issue.resolvedBy?.username || issue.resolvedBy }}
          <span v-if="issue.resolvedAt" class="text-green-600">· {{ formatDate(issue.resolvedAt) }}</span>
        </div>

        <!-- Stack Trace -->
        <div v-if="issue.sampleEvent || (events.length > 0 && events[0].stack)">
          <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ t('errors.stackTrace') }}</h3>
          <pre class="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">{{ issue.sampleEvent?.stack || events[0]?.stack || t('errors.noStackTrace') }}</pre>
        </div>

        <!-- cURL Command (for API errors) -->
        <div v-if="(issue.sampleEvent?.curlCommand || (events.length > 0 && events[0].curlCommand))">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-gray-900">{{ t('errors.curlCommand') }}</h3>
            <button
              @click="copyCurl"
              class="flex items-center gap-1 px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {{ t('issues.copyCurl') }}
            </button>
          </div>
          <pre class="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto font-mono">{{ issue.sampleEvent?.curlCommand || events[0]?.curlCommand }}</pre>
          <p class="text-xs text-gray-500 mt-2">{{ t('issues.curlHelp') }}</p>
        </div>

        <!-- Tags -->
        <div v-if="issue.tags && Object.keys(issue.tags).length > 0">
          <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ t('issues.tags') }}</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(value, key) in issue.tags"
              :key="key"
              class="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm"
            >
              {{ key }}: {{ value }}
            </span>
          </div>
        </div>
      </div>

      <!-- Events -->
      <div v-show="activeTab === 'events'">
        <div v-if="events.length > 0" class="space-y-4">
          <div
            v-for="event in events"
            :key="event._id"
            class="border border-gray-200 rounded-lg p-4 hover:border-purple-400 hover:shadow-md cursor-pointer transition-all bg-white"
            @click="viewEvent(event._id)"
          >
            <!-- 头部信息 -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2 flex-wrap">
                  <span :class="{
                    'bg-red-100 text-red-800': event.level === 'error',
                    'bg-yellow-100 text-yellow-800': event.level === 'warning',
                    'bg-blue-100 text-blue-800': event.level === 'info'
                  }" class="px-2 py-0.5 text-xs font-medium rounded">
                    {{ event.level?.toUpperCase() }}
                  </span>
                  <span class="text-xs text-gray-500 font-mono">{{ event._id }}</span>
                </div>
                <div class="text-sm font-semibold text-gray-900 mb-1 break-words">{{ event.message }}</div>
                <div class="text-xs text-gray-600 mb-2">{{ getTypeLabel(event.type) }}</div>
              </div>
              <div class="text-right ml-4 flex-shrink-0">
                <div class="text-xs text-gray-500">{{ formatDate(event.timestamp) }}</div>
                <div class="text-xs text-gray-400 mt-1">{{ formatTime(event.timestamp) }}</div>
              </div>
            </div>

            <!-- 请求信息 - 完整显示 -->
            <div class="pt-3 border-t border-gray-100 space-y-3">
              <!-- 第一行：URL 和 Method -->
              <div v-if="event.url || event.pageUrl" class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div v-if="event.url">
                  <div class="text-xs text-gray-500 font-medium mb-1">{{ t('issues.url') }}</div>
                  <div class="text-xs text-gray-900 font-mono break-all bg-gray-50 p-2 rounded" :title="event.url">
                    {{ event.url }}
                  </div>
                </div>
                <div v-if="event.pageUrl">
                  <div class="text-xs text-gray-500 font-medium mb-1">{{ t('issues.page') }}</div>
                  <div class="text-xs text-gray-900 font-mono break-all bg-gray-50 p-2 rounded" :title="event.pageUrl">
                    {{ event.pageUrl }}
                  </div>
                </div>
              </div>

              <!-- 第二行：Method, Status, Duration -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div v-if="event.method">
                  <div class="text-xs text-gray-500 font-medium mb-1">{{ t('issues.method') }}</div>
                  <div class="text-xs font-bold px-2 py-1 rounded inline-block" :class="{
                    'bg-green-100 text-green-800': event.method === 'GET',
                    'bg-blue-100 text-blue-800': event.method === 'POST',
                    'bg-yellow-100 text-yellow-800': event.method === 'PUT',
                    'bg-red-100 text-red-800': event.method === 'DELETE',
                    'bg-purple-100 text-purple-800': event.method === 'PATCH'
                  }">{{ event.method }}</div>
                </div>
                <div v-if="event.status">
                  <div class="text-xs text-gray-500 font-medium mb-1">{{ t('issues.status') }}</div>
                  <div class="text-xs font-bold px-2 py-1 rounded inline-block" :class="{
                    'bg-green-100 text-green-800': event.status >= 200 && event.status < 300,
                    'bg-yellow-100 text-yellow-800': event.status >= 300 && event.status < 400,
                    'bg-red-100 text-red-800': event.status >= 400
                  }">{{ event.status }} {{ getStatusText(event.status) }}</div>
                </div>
                <div v-if="event.duration">
                  <div class="text-xs text-gray-500 font-medium mb-1">{{ t('issues.duration') }}</div>
                  <div class="text-xs text-gray-900 font-mono">{{ event.duration }}ms</div>
                </div>
                <div v-if="event.responseSize">
                  <div class="text-xs text-gray-500 font-medium mb-1">{{ t('issues.responseSize') }}</div>
                  <div class="text-xs text-gray-900 font-mono">{{ formatBytes(event.responseSize) }}</div>
                </div>
              </div>

              <!-- 第三行：Headers 和 Response -->
              <div v-if="event.requestHeaders || event.response" class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div v-if="event.requestHeaders">
                  <div class="text-xs text-gray-500 font-medium mb-1">{{ t('issues.requestHeaders') }}</div>
                  <div class="text-xs text-gray-900 font-mono bg-gray-50 p-2 rounded max-h-24 overflow-y-auto">
                    <div v-for="(value, key) in event.requestHeaders" :key="key" class="break-all">
                      <span class="text-blue-600">{{ key }}:</span> {{ value }}
                    </div>
                  </div>
                </div>
                <div v-if="event.response">
                  <div class="text-xs text-gray-500 font-medium mb-1">{{ t('issues.response') }}</div>
                  <div class="text-xs text-gray-900 font-mono bg-gray-50 p-2 rounded max-h-24 overflow-y-auto break-all">
                    {{ typeof event.response === 'string' ? event.response : JSON.stringify(event.response, null, 2) }}
                  </div>
                </div>
              </div>

              <!-- 第四行：User 信息 -->
              <div v-if="event.user && (event.user.id || event.user.email || event.user.username)" class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div v-if="event.user.username">
                  <div class="text-xs text-gray-500 font-medium mb-1">{{ t('issues.username') }}</div>
                  <div class="text-xs text-gray-900 truncate">{{ event.user.username }}</div>
                </div>
                <div v-if="event.user.email">
                  <div class="text-xs text-gray-500 font-medium mb-1">{{ t('issues.email') }}</div>
                  <div class="text-xs text-gray-900 truncate">{{ event.user.email }}</div>
                </div>
                <div v-if="event.user.id">
                  <div class="text-xs text-gray-500 font-medium mb-1">{{ t('issues.userId') }}</div>
                  <div class="text-xs text-gray-900 font-mono truncate">{{ event.user.id }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-12 text-gray-500">
          {{ t('issues.noEvents') }}
        </div>
      </div>

      <!-- Tags -->
      <div v-show="activeTab === 'tags'">
        <div v-if="tagStats.length > 0" class="space-y-4">
          <div v-for="tag in tagStats" :key="`${tag._id.key}-${tag._id.value}`" class="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <span class="text-sm font-medium text-gray-700">{{ tag._id.key }}</span>
              <span class="text-sm text-gray-500 mx-2">:</span>
              <span class="text-sm text-gray-900">{{ tag._id.value }}</span>
            </div>
            <span class="text-sm text-gray-600">{{ tag.count }} {{ t('dashboard.events') }}</span>
          </div>
        </div>
        <div v-else class="text-center py-12 text-gray-500">
          {{ t('issues.noTags') }}
        </div>
      </div>

      <!-- Users -->
      <div v-show="activeTab === 'users'">
        <div v-if="users.length > 0" class="space-y-3">
          <div
            v-for="user in users"
            :key="user._id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded"
          >
            <div>
              <div class="font-medium text-gray-900">
                {{ getUserDisplay(user) }}
              </div>
              <div class="text-sm text-gray-500">{{ t('errors.lastSeen') }}: {{ formatDate(user.lastSeen) }}</div>
            </div>
            <span class="text-sm text-gray-600">{{ user.count }} {{ t('dashboard.events') }}</span>
          </div>
        </div>
        <div v-else class="text-center py-12 text-gray-500">
          {{ t('issues.noUsers') }}
        </div>
      </div>

      <!-- Raw Data -->
      <div v-show="activeTab === 'rawData'">
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
            <pre class="text-gray-100 text-xs font-mono whitespace-pre-wrap break-words">{{ JSON.stringify(sampleEvent || issue, null, 2) }}</pre>
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

const issue = ref(null);
const events = ref([]);
const tagStats = ref([]);
const users = ref([]);
const sampleEvent = ref(null);
const activeTab = ref('overview');

const tabs = ref([
  { id: 'overview', name: t('issues.overview') },
  { id: 'events', name: t('issues.events') },
  { id: 'tags', name: t('issues.tags') },
  { id: 'users', name: t('issues.users') },
  { id: 'rawData', name: t('errors.rawData') }
]);

const fetchIssueDetail = async () => {
  try {
    const { data } = await axios.get(`/api/issues/${route.params.id}`);
    issue.value = data.issue;
    events.value = data.events || [];
    tagStats.value = data.tags || [];
    users.value = data.users || [];
    // Set sampleEvent to the first event or sampleEvent from issue
    sampleEvent.value = data.issue?.sampleEvent || (events.value.length > 0 ? events.value[0] : null);
  } catch (error) {
    console.error('Failed to fetch issue details:', error);
    showToast(t('issues.failedToFetch'), 'error');
    router.push('/issues');
  }
};

const updateStatus = async (status) => {
  try {
    await axios.put(`/api/issues/${route.params.id}`, { status });
    showToast(t(`issues.issue${status.charAt(0).toUpperCase() + status.slice(1)}`), 'success');
    // Re-fetch to get updated resolvedBy info
    fetchIssueDetail();
  } catch (error) {
    console.error('Failed to update status:', error);
    showToast(t('issues.failedToUpdate'), 'error');
  }
};

const deleteIssue = async () => {
  if (!confirm(t('issues.confirmDelete'))) return;

  try {
    await axios.put('/api/issues/bulk', {
      ids: [route.params.id],
      action: 'delete'
    });
    showToast(t('issues.issueDeleted'), 'success');
    router.push('/issues');
  } catch (error) {
    console.error('Failed to delete issue:', error);
    showToast(t('issues.failedToDelete'), 'error');
  }
};

const viewEvent = (eventId) => {
  router.push(`/errors/${eventId}`);
};

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const formatTime = (date) => {
  return dayjs(date).fromNow();
};

const getPagePath = (url) => {
  if (!url) return '-';
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
};

const getTypeLabel = (type) => {
  return t(`errors.types.${type}`) || type;
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
    const curlCommand = issue.value.sampleEvent?.curlCommand || (events.value.length > 0 && events.value[0].curlCommand);
    if (curlCommand) {
      await navigator.clipboard.writeText(curlCommand);
      showToast(t('issues.curlCopied'), 'success');
    }
  } catch (err) {
    showToast(t('issues.copyFailed'), 'error');
  }
};

const copyRawData = async () => {
  try {
    const rawData = JSON.stringify(sampleEvent.value || issue.value, null, 2);
    await navigator.clipboard.writeText(rawData);
    showToast(t('common.success'), 'success');
  } catch (err) {
    showToast(t('issues.copyFailed'), 'error');
  }
};

const getUserDisplay = (user) => {
  // user._id is the user ID from aggregation
  // user.user is the user object with username, email, id
  if (!user || !user.user) {
    return user?._id || 'Unknown User';
  }
  
  const userData = user.user;
  
  // Try to display username, email, or id in that order
  if (userData.username) {
    return userData.username;
  }
  if (userData.email) {
    return userData.email;
  }
  if (userData.id) {
    return userData.id;
  }
  
  // Fallback to the aggregation _id
  return user._id || 'Unknown User';
};

const getStatusText = (status) => {
  const statusTexts = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    301: 'Moved Permanently',
    302: 'Found',
    304: 'Not Modified',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    408: 'Request Timeout',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout'
  };
  return statusTexts[status] || '';
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

onMounted(() => {
  fetchIssueDetail();
});
</script>
