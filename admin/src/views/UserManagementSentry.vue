<template>
  <div class="h-full flex flex-col bg-white">
    <!-- Page Header -->
    <div class="border-b border-gray-200">
      <div class="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ t('users.title') }}</h1>
          <p class="text-sm text-gray-600 mt-1">{{ t('users.subtitle') }}</p>
        </div>
        <button @click="showCreateModal = true" class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium">
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ t('users.createUser') }}
        </button>
      </div>
    </div>

    <!-- Page Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="border border-gray-200 rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('users.username') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('users.role') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('projects.title') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('users.status') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('users.createdAt') }}</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('common.edit') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="u in users" :key="u._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                    {{ u.username.charAt(0).toUpperCase() }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ u.username }}</div>
                    <div class="text-sm text-gray-500">{{ u.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getUserRoleClass(u.role)" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ getUserRoleText(u.role) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ u.projectCount || 0 }} {{ t('projects.title').toLowerCase() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'" 
                      class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ u.status === 'active' ? t('users.active') : t('users.inactive') }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(u.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click.stop="editUser(u)" class="text-purple-600 hover:text-purple-900 mr-4">
                  <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click.stop="deleteUser(u)" class="text-red-600 hover:text-red-900">
                  <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit User Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showCreateModal = false">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 class="text-xl font-bold text-gray-900 mb-4">{{ editingUser ? t('users.editUser') : t('users.createUser') }}</h3>
        <form @submit.prevent="handleUserSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('users.username') }}</label>
            <input v-model="userForm.username" type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500" :placeholder="t('users.username')" required :disabled="editingUser" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('users.email') }}</label>
            <input v-model="userForm.email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500" :placeholder="t('users.email')" required />
          </div>
          <div v-if="!editingUser">
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('users.password') }}</label>
            <input v-model="userForm.password" type="password" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500" :placeholder="t('users.password')" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('users.role') }}</label>
            <select v-model="userForm.role" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500" required>
              <option value="developer">Developer</option>
              <option value="admin">{{ t('users.admin') }}</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('users.assignProjects') }}</label>
            <select v-model="userForm.projects" multiple class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500" size="5">
              <option v-for="project in allProjects" :key="project._id" :value="project._id">
                {{ project.name }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">{{ t('users.holdCtrl') }}</p>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="button" @click="showCreateModal = false" class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">{{ t('common.cancel') }}</button>
            <button type="submit" class="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">{{ editingUser ? t('common.save') : t('common.create') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import dayjs from 'dayjs';
import { showToast } from '@/utils/toast';

const users = ref([]);
const showCreateModal = ref(false);
const editingUser = ref(null);
const allProjects = ref([]);

const userForm = reactive({
  username: '',
  email: '',
  password: '',
  role: 'developer',
  projects: []
});

const fetchUsers = async () => {
  try {
    const { data } = await axios.get('/api/users');
    users.value = data.users || [];
  } catch (error) {
    console.error('Failed to fetch users', error);
  }
};

const fetchAllProjects = async () => {
  try {
    const { data } = await axios.get('/api/projects');
    allProjects.value = data.projects || [];
  } catch (error) {
    console.error('Failed to fetch projects', error);
  }
};

const handleUserSubmit = async () => {
  try {
    if (editingUser.value) {
      // Update user basic info
      await axios.patch(`/api/users/${editingUser.value._id}`, {
        email: userForm.email,
        role: userForm.role
      });
      
      // Update project assignments
      if (userForm.projects.length > 0) {
        try {
          // Get user's current projects
          const { data: currentProjects } = await axios.get(`/api/users/${editingUser.value._id}/projects`);
          const currentProjectIds = [
            ...currentProjects.memberProjects.map(p => p._id),
            ...currentProjects.ownedProjects.map(p => p._id)
          ];
          
          // Find projects to add
          const projectsToAdd = userForm.projects.filter(id => !currentProjectIds.includes(id));
          
          // Find projects to remove (only member projects, not owned projects)
          const memberProjectIds = currentProjects.memberProjects.map(p => p._id);
          const projectsToRemove = memberProjectIds.filter(id => !userForm.projects.includes(id));
          
          // Add new projects
          if (projectsToAdd.length > 0) {
            await axios.post(`/api/users/${editingUser.value._id}/projects`, {
              projectIds: projectsToAdd,
              role: 'developer'
            });
          }
          
          // Remove projects
          for (const projectId of projectsToRemove) {
            await axios.delete(`/api/users/${editingUser.value._id}/projects/${projectId}`);
          }
          
          showToast(t('users.userUpdated'), 'success');
        } catch (error) {
          showToast(t('users.userUpdatedPartial'), 'warning');
        }
      } else {
        showToast(t('users.userUpdated'), 'success');
      }
    } else {
      // Create user
      const { data } = await axios.post('/api/auth/register', {
        username: userForm.username,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role
      });
      
      // Assign projects if selected
      if (userForm.projects.length > 0) {
        try {
          await axios.post(`/api/users/${data.user._id}/projects`, {
            projectIds: userForm.projects,
            role: 'developer'
          });
          showToast(t('users.userCreated'), 'success');
        } catch (error) {
          showToast(t('users.userCreatedPartial'), 'warning');
        }
      } else {
        showToast(t('users.userCreated'), 'success');
      }
    }
    showCreateModal.value = false;
    resetUserForm();
    fetchUsers();
  } catch (error) {
    showToast(error.response?.data?.error || t('messages.operationFailed'), 'error');
  }
};

const editUser = async (u) => {
  editingUser.value = u;
  userForm.username = u.username;
  userForm.email = u.email;
  userForm.role = u.role;
  userForm.projects = [];
  
  // Load user's current projects
  try {
    const { data } = await axios.get(`/api/users/${u._id}/projects`);
    // Merge member and owned project IDs
    const memberProjectIds = data.memberProjects.map(p => p._id);
    const ownedProjectIds = data.ownedProjects.map(p => p._id);
    userForm.projects = [...new Set([...memberProjectIds, ...ownedProjectIds])];
  } catch (error) {
    console.error('Failed to load user projects', error);
  }
  
  showCreateModal.value = true;
};

const deleteUser = async (u) => {
  if (!confirm(t('users.confirmDelete', { name: u.username }))) return;
  
  try {
    await axios.delete(`/api/users/${u._id}`);
    showToast(t('users.userDeleted'), 'success');
    fetchUsers();
  } catch (error) {
    showToast(error.response?.data?.error || t('messages.deleteFailed'), 'error');
  }
};

const resetUserForm = () => {
  editingUser.value = null;
  userForm.username = '';
  userForm.email = '';
  userForm.password = '';
  userForm.role = 'developer';
  userForm.projects = [];
};

const getUserRoleClass = (role) => {
  const classes = {
    admin: 'bg-red-100 text-red-800',
    developer: 'bg-blue-100 text-blue-800',
    viewer: 'bg-gray-100 text-gray-800'
  };
  return classes[role] || classes.viewer;
};

const getUserRoleText = (role) => {
  const texts = {
    admin: 'Admin',
    developer: 'Developer',
    viewer: 'Viewer'
  };
  return texts[role] || 'Unknown';
};

const formatDate = (date) => {
  if (!date) return '-';
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

onMounted(() => {
  fetchUsers();
  fetchAllProjects();
});
</script>
