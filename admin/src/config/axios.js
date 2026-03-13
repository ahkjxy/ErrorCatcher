import axios from 'axios';
import envConfig from './env';

// 创建 axios 实例
const instance = axios.create({
  baseURL: envConfig.apiUrl,
  timeout: envConfig.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 添加 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 开发环境打印请求信息
    if (envConfig.debug) {
      console.log('[Request]', config.method.toUpperCase(), config.url, config.data || config.params);
    }
    
    return config;
  },
  (error) => {
    console.error('[Request Error]', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 开发环境打印响应信息
    if (envConfig.debug) {
      console.log('[Response]', response.config.url, response.data);
    }
    
    return response.data;
  },
  (error) => {
    console.error('[Response Error]', error);
    
    // 处理 401 未授权
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default instance;
