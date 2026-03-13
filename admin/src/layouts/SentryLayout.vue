<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <!-- 左侧导航栏 - Sentry 风格 -->
    <aside class="w-64 bg-gray-900 flex flex-col">
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b border-gray-800">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
            <span class="text-white font-bold text-sm">EC</span>
          </div>
          <span class="text-white font-semibold text-lg">ErrorCatcher</span>
        </div>
      </div>

      <!-- 导航菜单 -->
      <nav class="flex-1 px-4 py-4 overflow-y-auto">
        <div class="space-y-1">
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-3 px-3 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            :class="{ 'bg-gray-800 text-white': isActive(item.path) }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
            </svg>
            <span class="text-sm font-medium">{{ item.label }}</span>
          </router-link>
        </div>

        <!-- Settings Section -->
        <div class="mt-8 pt-4 border-t border-gray-800">
          <div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {{ t('nav.settings') }}
          </div>
          <div class="space-y-1 mt-2">
            <router-link
              to="/documentation"
              class="flex items-center gap-3 px-3 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              :class="{ 'bg-gray-800 text-white': isActive('/documentation') }"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span class="text-sm font-medium">{{ t('nav.documentation') }}</span>
            </router-link>
            <router-link
              to="/profile"
              class="flex items-center gap-3 px-3 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              :class="{ 'bg-gray-800 text-white': isActive('/profile') }"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="text-sm font-medium">{{ t('nav.profile') }}</span>
            </router-link>
            <router-link
              to="/environment"
              class="flex items-center gap-3 px-3 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              :class="{ 'bg-gray-800 text-white': isActive('/environment') }"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="text-sm font-medium">{{ t('settings.environment') }}</span>
            </router-link>
            <router-link
              v-if="authStore.isAdmin"
              to="/users"
              class="flex items-center gap-3 px-3 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              :class="{ 'bg-gray-800 text-white': isActive('/users') }"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span class="text-sm font-medium">{{ t('nav.users') }}</span>
            </router-link>
            <router-link
              v-if="authStore.isAdmin"
              to="/ai-config"
              class="flex items-center gap-3 px-3 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              :class="{ 'bg-gray-800 text-white': isActive('/ai-config') }"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span class="text-sm font-medium">{{ t('nav.aiConfig') }}</span>
            </router-link>
          </div>
        </div>
      </nav>

      <!-- 用户信息 -->
      <div class="p-4 border-t border-gray-800">
        <div class="text-center text-xs text-gray-500">
          Made with ❤️ by ahkjxy
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- 顶部工具栏 -->
      <div class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div class="flex-1"></div>
        <div class="flex items-center gap-4">
          <!-- 语言切换器 -->
          <LanguageSwitcher />
          
          <!-- 用户信息 -->
          <div class="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div class="text-right">
              <div class="text-sm font-medium text-gray-900">
                {{ authStore.user?.username }}
              </div>
              <div class="text-xs text-gray-500">
                {{ authStore.user?.email }}
              </div>
            </div>
            <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-white text-sm font-bold">
                {{ authStore.user?.username?.charAt(0).toUpperCase() }}
              </span>
            </div>
            <button @click="handleLogout" class="text-gray-400 hover:text-gray-600 ml-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 页面内容 -->
      <main class="flex-1 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import LanguageSwitcher from '@/components/LanguageSwitcher.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();

const menuItems = computed(() => [
  {
    path: '/dashboard',
    label: t('nav.dashboard'),
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    guideName: 'dashboard'
  },
  {
    path: '/analytics',
    label: t('analytics.title'),
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    guideName: 'analytics'
  },
  {
    path: '/projects',
    label: t('nav.projects'),
    icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    guideName: 'projects'
  },
  {
    path: '/notifications',
    label: t('nav.notifications'),
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    guideName: 'notifications'
  },
  {
    path: '/alerts',
    label: t('nav.alerts'),
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    guideName: 'alerts'
  },
  {
    path: '/issues',
    label: t('nav.issues'),
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    guideName: 'issues'
  },
  {
    path: '/errors',
    label: t('nav.errors'),
    icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    guideName: 'errors'
  },
]);

const isActive = (path) => {
  return route.path.startsWith(path);
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>
