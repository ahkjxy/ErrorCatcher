import { createApp } from 'vue';
import { createPinia } from 'pinia';
import axios from 'axios';
import App from './App.vue';
import router from './router';
import i18n from './i18n';
import { useAuthStore } from './stores/auth';
import envConfig from './config/env';
import ErrorCatcher from '../../dist/error-catcher.esm.js';
import './style.css';

// 配置 axios
axios.defaults.baseURL = envConfig.apiUrl;

// 请求拦截器
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 开发环境打印请求信息
    if (envConfig.debug) {
      console.log('[Request]', config.method?.toUpperCase(), config.url, config.data || config.params);
    }
    
    return config;
  },
  (error) => {
    console.error('[Request Error]', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
axios.interceptors.response.use(
  (response) => {
    // 开发环境打印响应信息
    if (envConfig.debug) {
      console.log('[Response]', response.config.url, response.data);
    }
    
    // 返回完整的 response 对象，保持与现有代码兼容
    return response;
  },
  (error) => {
    console.error('[Response Error]', error);
    
    // 处理 401 未授权
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (router.currentRoute.value.path !== '/login') {
        router.push('/login');
      }
    }
    
    return Promise.reject(error);
  }
);

// 打印环境信息
console.log('🚀 ErrorCatcher Admin');
console.log('📦 环境:', envConfig.env, `(${envConfig.envLabel})`);
console.log('🌐 API:', envConfig.apiUrl);
console.log('🔌 WebSocket:', envConfig.wsUrl);
console.log('🐛 调试模式:', envConfig.debug);

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18n);

// 全局属性
app.config.globalProperties.$env = envConfig;
app.config.globalProperties.$axios = axios;

// 初始化 ErrorCatcher
const errorCatcher = new ErrorCatcher({
  reportUrl: `${envConfig.apiUrl}/api/errors/report`,
  projectId: import.meta.env.VITE_ERROR_PROJECT_ID || '69ae7968cc87edb222a665dc',
  apiKey: 'ec_a3f6bf3d2bf6378b8bf13ee9b1889fc3c2c42e5acbb55e27a8bda26cd3d17060',
  environment: envConfig.env,
  debug: envConfig.debug,
  vue: app,
  axios: axios,
  router: router,
  beforeSend: (error) => {
    // 添加用户信息
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        error.user = {
          id: userData._id,
          username: userData.username,
          email: userData.email
        };
      } catch (e) {
        // ignore
      }
    }
    return error;
  }
});

// 全局暴露 ErrorCatcher 实例
app.config.globalProperties.$errorCatcher = errorCatcher;
window.$errorCatcher = errorCatcher;

// 初始化认证
const authStore = useAuthStore();
authStore.init();

app.mount('#app');
