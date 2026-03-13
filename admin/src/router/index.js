import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginSentry.vue'),
    meta: { title: 'pageTitle.login', public: true }
  },
  {
    path: '/',
    component: () => import('@/layouts/SentryLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/issues'
      },
      {
        path: 'issues',
        name: 'Issues',
        component: () => import('@/views/IssuesSentry.vue'),
        meta: { title: 'pageTitle.issues' }
      },
      {
        path: 'issues/:id',
        name: 'IssueDetail',
        component: () => import('@/views/IssueDetailSentry.vue'),
        meta: { title: 'pageTitle.issueDetail' }
      },
      {
        path: 'errors',
        name: 'Errors',
        component: () => import('@/views/ErrorsSentry.vue'),
        meta: { title: 'pageTitle.errors' }
      },
      {
        path: 'errors/:id',
        name: 'ErrorDetail',
        component: () => import('@/views/ErrorDetailSentry.vue'),
        meta: { title: 'pageTitle.errorDetail' }
      },
      {
        path: 'projects',
        name: 'Projects',
        component: () => import('@/views/ProjectsSentry.vue'),
        meta: { title: 'pageTitle.projects' }
      },
      {
        path: 'projects/:id',
        name: 'ProjectDetail',
        component: () => import('@/views/ProjectDetailSentry.vue'),
        meta: { title: 'pageTitle.projectDetail' }
      },
      {
        path: 'alerts',
        name: 'Alerts',
        component: () => import('@/views/AlertsSentry.vue'),
        meta: { title: 'pageTitle.alerts' }
      },
      {
        path: 'alerts/new',
        name: 'AlertNew',
        component: () => import('@/views/AlertFormSentry.vue'),
        meta: { title: 'pageTitle.alertNew' }
      },
      {
        path: 'alerts/:id',
        name: 'AlertDetail',
        component: () => import('@/views/AlertDetailSentry.vue'),
        meta: { title: 'pageTitle.alertDetail' }
      },
      {
        path: 'alerts/:id/edit',
        name: 'AlertEdit',
        component: () => import('@/views/AlertFormSentry.vue'),
        meta: { title: 'pageTitle.alertEdit' }
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('@/views/NotificationsSentry.vue'),
        meta: { title: 'pageTitle.notifications' }
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/DashboardSentry.vue'),
        meta: { title: 'pageTitle.dashboard' }
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('@/views/AnalyticsSentry.vue'),
        meta: { title: 'pageTitle.analytics' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/ProfileSentry.vue'),
        meta: { title: 'pageTitle.profile' }
      },
      {
        path: 'environment',
        name: 'Environment',
        component: () => import('@/views/EnvironmentSentry.vue'),
        meta: { title: 'pageTitle.environment' }
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('@/views/UserManagementSentry.vue'),
        meta: { title: 'pageTitle.userManagement', requiresAdmin: true }
      },
      {
        path: 'ai-config',
        name: 'AIConfig',
        component: () => import('@/views/AIConfigSentry.vue'),
        meta: { title: 'AI 配置', requiresAdmin: true }
      },
      {
        path: 'documentation',
        name: 'Documentation',
        component: () => import('@/views/DocumentationSentry.vue'),
        meta: { title: 'pageTitle.documentation' }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  console.log('Router Guard:', {
    to: to.path,
    from: from.path,
    isAuthenticated: authStore.isAuthenticated,
    token: authStore.token ? '存在' : '不存在',
    requiresAuth: to.meta.requiresAuth
  });
  
  // 设置页面标题 - 标题翻译由usePageTitle composable处理
  document.title = to.meta.title ? `${to.meta.title} - ErrorCatcher` : 'ErrorCatcher';

  // 检查是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('Router Guard: 需要认证但未登录，跳转到登录页');
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if (to.name === 'Login' && authStore.isAuthenticated) {
    console.log('Router Guard: 已登录，跳转到 Issues');
    next({ name: 'Issues' });
  } else {
    console.log('Router Guard: 允许访问');
    next();
  }
});

export default router;
