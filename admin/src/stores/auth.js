import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    isDeveloper: (state) => ['admin', 'developer'].includes(state.user?.role)
  },

  actions: {
    // 登录
    async login(credentials) {
      this.loading = true;
      try {
        const { data } = await axios.post('/api/auth/login', credentials);
        
        if (!data.token || !data.user) {
          throw new Error('登录响应数据不完整');
        }
        
        this.token = data.token;
        this.user = data.user;
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        return data;
      } catch (error) {
        throw error.response?.data || error;
      } finally {
        this.loading = false;
      }
    },

    // 注册
    async register(userData) {
      this.loading = true;
      try {
        const { data } = await axios.post('/api/auth/register', userData);
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('token', data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        return data;
      } catch (error) {
        throw error.response?.data || error;
      } finally {
        this.loading = false;
      }
    },

    // 获取当前用户信息
    async fetchUser() {
      if (!this.token) return;
      
      try {
        const { data } = await axios.get('/api/auth/me');
        this.user = data.user;
      } catch (error) {
        // Token 无效，清除登录状态
        this.logout();
      }
    },

    // 登出
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    },

    // 初始化（设置 axios 默认 header）
    init() {
      console.log('Auth Store: 初始化...');
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      console.log('Auth Store: localStorage token:', token ? '存在' : '不存在');
      console.log('Auth Store: localStorage user:', userStr ? '存在' : '不存在');
      
      if (token) {
        this.token = token;
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        if (userStr) {
          try {
            this.user = JSON.parse(userStr);
            console.log('Auth Store: 用户信息已恢复', this.user.username);
          } catch (e) {
            console.error('Auth Store: 解析用户信息失败', e);
          }
        }
        
        // 验证 token 是否有效
        this.fetchUser();
      } else {
        console.log('Auth Store: 没有 token，未登录状态');
      }
    }
  }
});
