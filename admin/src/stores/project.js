import { defineStore } from 'pinia';
import axios from 'axios';

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [],
    currentProject: null,
    loading: false,
    total: 0
  }),

  getters: {
    // 获取当前项目 ID
    currentProjectId: (state) => state.currentProject?._id || null,
    
    // 检查是否选择了项目
    hasSelectedProject: (state) => !!state.currentProject,
  },

  actions: {
    // 设置当前项目
    setCurrentProject(project) {
      this.currentProject = project;
      // 保存到 localStorage
      if (project) {
        localStorage.setItem('currentProjectId', project._id);
      } else {
        localStorage.removeItem('currentProjectId');
      }
    },

    // 从 localStorage 恢复当前项目
    async restoreCurrentProject() {
      const projectId = localStorage.getItem('currentProjectId');
      if (projectId && this.projects.length > 0) {
        const project = this.projects.find(p => p._id === projectId);
        if (project) {
          this.currentProject = project;
        }
      }
    },

    // 获取项目列表
    async fetchProjects(params = {}) {
      this.loading = true;
      try {
        const { data } = await axios.get('/api/projects', { params });
        // API 返回 {projects: [], total, page, pages}
        this.projects = data.projects || [];
        this.total = data.total || 0;
        
        // 恢复当前项目
        await this.restoreCurrentProject();
        
        return data;
      } catch (error) {
        this.projects = [];
        this.total = 0;
        throw error.response?.data || error;
      } finally {
        this.loading = false;
      }
    },

    // 获取项目详情
    async fetchProject(projectId) {
      this.loading = true;
      try {
        const { data } = await axios.get(`/api/projects/${projectId}`);
        this.currentProject = data;
        return data;
      } catch (error) {
        throw error.response?.data || error;
      } finally {
        this.loading = false;
      }
    },

    // 创建项目
    async createProject(projectData) {
      try {
        const { data } = await axios.post('/api/projects', projectData);
        this.projects.unshift(data);
        this.total++;
        return data;
      } catch (error) {
        throw error.response?.data || error;
      }
    },

    // 更新项目
    async updateProject(projectId, updates) {
      try {
        const { data } = await axios.put(`/api/projects/${projectId}`, updates);
        const index = this.projects.findIndex(p => p._id === projectId);
        if (index !== -1) {
          this.projects[index] = data;
        }
        if (this.currentProject?._id === projectId) {
          this.currentProject = data;
        }
        return data;
      } catch (error) {
        throw error.response?.data || error;
      }
    },

    // 删除项目
    async deleteProject(projectId) {
      try {
        await axios.delete(`/api/projects/${projectId}`);
        this.projects = this.projects.filter(p => p._id !== projectId);
        this.total--;
        if (this.currentProject?._id === projectId) {
          this.currentProject = null;
        }
      } catch (error) {
        throw error.response?.data || error;
      }
    }
  }
});
