<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Left Side - Dark Sidebar Style -->
    <div class="hidden lg:flex lg:w-2/5 bg-gray-900 flex-col justify-between p-12 text-white">
      <div>
        <div class="flex items-center gap-3 mb-16">
          <div class="w-10 h-10 bg-purple-600 rounded flex items-center justify-center">
            <span class="text-white font-bold text-lg">EC</span>
          </div>
          <span class="text-xl font-semibold">ErrorCatcher</span>
        </div>

        <div class="space-y-12">
          <div>
            <h1 class="text-3xl font-bold mb-4 leading-tight">
              {{ t('auth.loginTitle') }}
            </h1>
            <p class="text-gray-400 text-lg">
              {{ t('auth.loginSubtitle') }}
            </p>
          </div>

          <div class="space-y-6">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-white mb-1">{{ t('auth.realtimeMonitoring') }}</h3>
                <p class="text-gray-400 text-sm">{{ t('auth.realtimeMonitoringDesc') }}</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-white mb-1">{{ t('auth.smartAlerts') }}</h3>
                <p class="text-gray-400 text-sm">{{ t('auth.smartAlertsDesc') }}</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-white mb-1">{{ t('auth.detailedAnalytics') }}</h3>
                <p class="text-gray-400 text-sm">{{ t('auth.detailedAnalyticsDesc') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="text-gray-500 text-sm">
        <p>{{ t('auth.copyright') }}</p>
      </div>
    </div>

    <!-- Right Side - Login Form -->
    <div class="flex-1 flex items-center justify-center p-8 lg:p-12">
      <div class="w-full max-w-md">
        <!-- Mobile Logo -->
        <div class="lg:hidden text-center mb-8">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-purple-600 rounded mb-4">
            <span class="text-white font-bold text-xl">EC</span>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">ErrorCatcher</h1>
        </div>

        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ t('auth.login') }}</h2>
          <p class="text-gray-600">{{ t('auth.loginSubtitle') }}</p>
        </div>

        <!-- Login Form -->
        <div class="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <form @submit.prevent="handleLogin" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('auth.username') }}
              </label>
              <input
                v-model="form.username"
                type="text"
                required
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
                :placeholder="t('auth.username')"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('auth.password') }}
              </label>
              <input
                v-model="form.password"
                type="password"
                required
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
                :placeholder="t('auth.password')"
              />
            </div>

            <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div class="flex items-start gap-2">
                <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm text-red-800">{{ error }}</p>
              </div>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="loading" class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ t('common.loading') }}
              </span>
              <span v-else>{{ t('auth.login') }}</span>
            </button>
          </form>
        </div>

        <!-- Footer -->
        <div class="text-center mt-6 text-sm text-gray-600">
          <p>{{ t('auth.needAccess') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();

const loading = ref(false);
const error = ref('');

const form = reactive({
  username: '',
  password: ''
});

const handleLogin = async () => {
  loading.value = true;
  error.value = '';

  try {
    await authStore.login({
      username: form.username,
      password: form.password
    });
    router.push('/issues');
  } catch (err) {
    error.value = err.message || err.error || t('auth.loginFailed');
  } finally {
    loading.value = false;
  }
};
</script>
