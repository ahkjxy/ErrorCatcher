<template>
  <div class="h-full flex flex-col bg-white">
    <!-- Page Header -->
    <div class="border-b border-gray-200">
      <div class="px-6 py-4">
        <h1 class="text-2xl font-bold text-gray-900">{{ t('settings.environment') }}</h1>
        <p class="text-sm text-gray-600 mt-1">{{ t('settings.environmentSubtitle') }}</p>
      </div>
    </div>

    <!-- Page Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-4xl space-y-6">
        <!-- Current Environment -->
        <div class="border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t('settings.currentEnvironment') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 rounded">
              <div class="text-sm text-gray-600 mb-1">{{ t('settings.environment') }}</div>
              <div class="flex items-center gap-2">
                <span class="text-lg font-semibold text-gray-900">{{ envConfig.envLabel }}</span>
                <span 
                  class="px-2 py-0.5 text-xs font-medium rounded"
                  :class="envBadgeClass"
                >
                  {{ envConfig.env }}
                </span>
              </div>
            </div>

            <div class="p-4 bg-gray-50 rounded">
              <div class="text-sm text-gray-600 mb-1">{{ t('settings.debugMode') }}</div>
              <div class="text-lg font-semibold text-gray-900">
                {{ envConfig.debug ? t('common.enabled') : t('common.disabled') }}
              </div>
            </div>

            <div class="p-4 bg-gray-50 rounded">
              <div class="text-sm text-gray-600 mb-1">{{ t('settings.apiUrl') }}</div>
              <div class="text-sm font-mono text-gray-900 break-all">
                {{ envConfig.apiUrl }}
              </div>
            </div>

            <div class="p-4 bg-gray-50 rounded">
              <div class="text-sm text-gray-600 mb-1">{{ t('settings.wsUrl') }}</div>
              <div class="text-sm font-mono text-gray-900 break-all">
                {{ envConfig.wsUrl }}
              </div>
            </div>

            <div class="p-4 bg-gray-50 rounded">
              <div class="text-sm text-gray-600 mb-1">{{ t('settings.requestTimeout') }}</div>
              <div class="text-lg font-semibold text-gray-900">
                {{ envConfig.timeout / 1000 }}s
              </div>
            </div>

            <div class="p-4 bg-gray-50 rounded">
              <div class="text-sm text-gray-600 mb-1">{{ t('settings.pageSize') }}</div>
              <div class="text-lg font-semibold text-gray-900">
                {{ envConfig.pageSize }}
              </div>
            </div>
          </div>
        </div>

        <!-- System Information -->
        <div class="border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t('settings.systemInfo') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 rounded">
              <div class="text-sm text-gray-600 mb-1">{{ t('settings.appName') }}</div>
              <div class="text-lg font-semibold text-gray-900">
                ErrorCatcher Admin
              </div>
            </div>

            <div class="p-4 bg-gray-50 rounded">
              <div class="text-sm text-gray-600 mb-1">{{ t('settings.version') }}</div>
              <div class="text-lg font-semibold text-gray-900">
                v1.0.0
              </div>
            </div>

            <div class="p-4 bg-gray-50 rounded">
              <div class="text-sm text-gray-600 mb-1">{{ t('settings.buildMode') }}</div>
              <div class="text-lg font-semibold text-gray-900">
                {{ buildMode }}
              </div>
            </div>

            <div class="p-4 bg-gray-50 rounded">
              <div class="text-sm text-gray-600 mb-1">{{ t('settings.devMode') }}</div>
              <div class="text-lg font-semibold text-gray-900">
                {{ isDev ? t('common.yes') : t('common.no') }}
              </div>
            </div>
          </div>
        </div>

        <!-- Information Notice -->
        <div class="p-4 bg-blue-50 border border-blue-200 rounded">
          <div class="flex gap-3">
            <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-sm text-blue-800">
              <p class="font-medium mb-1">{{ t('settings.envConfigNote') }}</p>
              <p>{{ t('settings.envConfigDesc') }}</p>
              <p class="mt-1">{{ t('settings.envConfigGuide') }}</p>
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

import { computed } from 'vue';
import envConfig from '@/config/env';

const buildMode = computed(() => {
  return import.meta.env.MODE || 'production';
});

const isDev = computed(() => {
  return import.meta.env.DEV || false;
});

const envBadgeClass = computed(() => {
  const classMap = {
    development: 'bg-green-100 text-green-700',
    test: 'bg-blue-100 text-blue-700',
    pre: 'bg-yellow-100 text-yellow-700',
    production: 'bg-red-100 text-red-700'
  };
  return classMap[envConfig.env] || 'bg-gray-100 text-gray-700';
});
</script>
