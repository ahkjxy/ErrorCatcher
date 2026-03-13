<template>
  <div class="border border-gray-200 rounded-lg p-6 bg-white">
    <!-- 头部 -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-900">{{ t('ai.title') }}</h3>
      </div>
      <button
        v-if="analysis && !analyzing"
        @click="$emit('analyze', true)"
        class="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
        :title="t('ai.reanalyze')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ t('ai.reanalyze') }}
      </button>
    </div>

    <!-- 分析中状态 -->
    <div v-if="analyzing" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
      <p class="text-gray-600">{{ t('ai.analyzing') }}</p>
      <p class="text-sm text-gray-500 mt-2">{{ t('ai.analyzingHint') }}</p>
    </div>

    <!-- 未分析状态 -->
    <div v-else-if="!analysis" class="text-center py-12">
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
      <p class="text-gray-600 mb-4">{{ t('ai.noAnalysis') }}</p>
      <button
        @click="$emit('analyze')"
        class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium"
      >
        {{ t('ai.analyzeButton') }}
      </button>
    </div>

    <!-- 分析结果 -->
    <div v-else class="space-y-6">
      <!-- 根本原因 -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h4 class="font-semibold text-gray-900">{{ t('ai.rootCause') }}</h4>
              <span :class="getConfidenceClass(analysis.confidence)" class="px-2 py-0.5 text-xs font-medium rounded-full">
                {{ t('ai.confidence') }}: {{ (analysis.confidence * 100).toFixed(0) }}%
              </span>
              <span class="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                {{ analysis.category }}
              </span>
            </div>
            <p class="text-gray-700">{{ analysis.rootCause }}</p>
            <p v-if="analysis.analysis" class="text-sm text-gray-600 mt-2">{{ analysis.analysis }}</p>
          </div>
        </div>
      </div>

      <!-- 可能原因 -->
      <div v-if="analysis.possibleReasons && analysis.possibleReasons.length > 0" class="bg-gray-50 rounded-lg p-4">
        <h4 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {{ t('ai.possibleReasons') }}
        </h4>
        <ul class="space-y-2">
          <li v-for="(reason, index) in analysis.possibleReasons" :key="index" class="flex items-start gap-2 text-sm text-gray-700">
            <span class="flex-shrink-0 w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-medium">
              {{ index + 1 }}
            </span>
            <span>{{ reason }}</span>
          </li>
        </ul>
      </div>

      <!-- 修复建议 -->
      <div v-if="analysis.suggestedFixes && analysis.suggestedFixes.length > 0" class="bg-gray-50 rounded-lg p-4">
        <h4 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ t('ai.suggestedFixes') }}
        </h4>
        <div class="space-y-3">
          <div
            v-for="(fix, index) in analysis.suggestedFixes"
            :key="index"
            class="border-l-4 pl-4 py-2"
            :class="{
              'border-red-400 bg-red-50': fix.priority === 'high',
              'border-yellow-400 bg-yellow-50': fix.priority === 'medium',
              'border-blue-400 bg-blue-50': fix.priority === 'low'
            }"
          >
            <div class="flex items-center gap-2 mb-1">
              <span
                class="px-2 py-0.5 text-xs font-medium rounded"
                :class="{
                  'bg-red-100 text-red-700': fix.priority === 'high',
                  'bg-yellow-100 text-yellow-700': fix.priority === 'medium',
                  'bg-blue-100 text-blue-700': fix.priority === 'low'
                }"
              >
                {{ fix.priority === 'high' ? t('ai.highPriority') : fix.priority === 'medium' ? t('ai.mediumPriority') : t('ai.lowPriority') }}
              </span>
              <h5 class="font-medium text-gray-900">{{ fix.title }}</h5>
            </div>
            <p class="text-sm text-gray-700">{{ fix.description }}</p>
          </div>
        </div>
      </div>

      <!-- 预防建议 -->
      <div v-if="analysis.preventionTips && analysis.preventionTips.length > 0" class="bg-gray-50 rounded-lg p-4">
        <h4 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          {{ t('ai.preventionTips') }}
        </h4>
        <ul class="space-y-2">
          <li v-for="(tip, index) in analysis.preventionTips" :key="index" class="flex items-start gap-2 text-sm text-gray-700">
            <svg class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{{ tip }}</span>
          </li>
        </ul>
      </div>

      <!-- 相关错误 -->
      <div v-if="analysis.relatedErrors && analysis.relatedErrors.length > 0" class="border border-gray-200 rounded-lg p-4 bg-white">
        <h4 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          {{ t('ai.relatedErrors') }} ({{ analysis.relatedErrors.length }})
        </h4>
        <div class="space-y-2">
          <div
            v-for="relatedError in analysis.relatedErrors"
            :key="relatedError._id"
            class="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
            @click="$emit('view-related', relatedError._id)"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="text-sm text-gray-900 truncate">{{ relatedError.message }}</p>
                <span
                  v-if="relatedError.resolved"
                  class="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full flex-shrink-0"
                >
                  {{ t('ai.resolved') }}
                </span>
              </div>
              <p class="text-xs text-gray-500">{{ formatTime(relatedError.timestamp) }}</p>
            </div>
            <svg class="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      <!-- 反馈 -->
      <div class="border border-gray-200 rounded-lg p-4 bg-white">
        <h4 class="font-semibold text-gray-900 mb-3">{{ t('ai.feedback') }}</h4>
        <div v-if="!feedbackSubmitted" class="flex items-center gap-3">
          <button
            @click="submitFeedback(true)"
            class="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm font-medium"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            {{ t('ai.helpful') }}
          </button>
          <button
            @click="submitFeedback(false)"
            class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
            </svg>
            {{ t('ai.notHelpful') }}
          </button>
        </div>
        <div v-else class="text-sm text-gray-600">
          {{ t('ai.thanksFeedback') }}
        </div>
      </div>

      <!-- 元信息 -->
      <div class="pt-4 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
        <span>{{ t('ai.analyzedAt') }}: {{ formatTime(analysis.analyzedAt) }}</span>
        <span>{{ t('ai.modelUsed') }}: {{ analysis.model }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

const { t } = useI18n();

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const props = defineProps({
  analysis: {
    type: Object,
    default: null
  },
  analyzing: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['analyze', 'feedback', 'view-related']);

const feedbackSubmitted = ref(false);

const getConfidenceClass = (confidence) => {
  if (confidence >= 0.8) return 'bg-green-100 text-green-700';
  if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-700';
};

const formatTime = (date) => {
  return dayjs(date).fromNow();
};

const submitFeedback = (helpful) => {
  feedbackSubmitted.value = true;
  emit('feedback', { helpful });
};
</script>
