<template>
  <div class="h-full flex flex-col bg-white">
    <!-- 页面头部 -->
    <div class="border-b border-gray-200">
      <div class="px-6 py-4">
        <h1 class="text-2xl font-bold text-gray-900">{{ t('profile.title') }}</h1>
        <p class="text-sm text-gray-600 mt-1">{{ t('profile.subtitle') }}</p>
      </div>
    </div>

    <!-- 页面内容 -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-4xl space-y-6">
        <!-- Personal Information -->
        <div class="border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t('profile.personalInfo') }}</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('users.username') }}</label>
              <input
                v-model="profileForm.username"
                type="text"
                disabled
                class="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p class="mt-1 text-xs text-gray-500">{{ t('profile.usernameCannotChange') }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('users.email') }}</label>
              <input
                v-model="profileForm.email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('users.role') }}</label>
              <input
                :value="profileForm.role"
                type="text"
                disabled
                class="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div class="flex gap-3">
              <button @click="updateProfile" class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                {{ t('common.save') }}
              </button>
              <button @click="resetProfile" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                {{ t('common.reset') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Change Password -->
        <div class="border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t('profile.changePassword') }}</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('profile.currentPassword') }}</label>
              <input
                v-model="passwordForm.oldPassword"
                type="password"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
                :placeholder="t('profile.enterCurrentPassword')"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('profile.newPassword') }}</label>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
                :placeholder="t('profile.enterNewPassword')"
              />
              <p class="mt-1 text-xs text-gray-500">{{ t('profile.passwordMinLength') }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('profile.confirmPassword') }}</label>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
                :placeholder="t('profile.confirmNewPassword')"
              />
            </div>
            <button @click="changePassword" class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
              {{ t('profile.changePassword') }}
            </button>
          </div>
        </div>

        <!-- Account Statistics -->
        <div class="border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ t('profile.accountStats') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 bg-blue-50 rounded">
              <div class="text-sm text-blue-600 font-medium mb-1">{{ t('projects.title') }}</div>
              <div class="text-2xl font-bold text-blue-900">{{ myProjects.length }}</div>
            </div>
            <div class="p-4 bg-green-50 rounded">
              <div class="text-sm text-green-600 font-medium mb-1">{{ t('profile.registered') }}</div>
              <div class="text-sm font-bold text-green-900">{{ formatDate(user?.createdAt) }}</div>
            </div>
            <div class="p-4 bg-purple-50 rounded">
              <div class="text-sm text-purple-600 font-medium mb-1">{{ t('users.lastLogin') }}</div>
              <div class="text-sm font-bold text-purple-900">{{ formatDate(user?.lastLogin) }}</div>
            </div>
          </div>
        </div>

        <!-- My Projects -->
        <div class="border border-gray-200 rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ t('profile.myProjects') }}</h3>
            <button @click="$router.push('/projects')" class="text-purple-600 hover:text-purple-700 text-sm font-medium">
              {{ t('dashboard.viewAll') }} →
            </button>
          </div>
          <div class="space-y-3">
            <div
              v-for="project in myProjects.slice(0, 5)"
              :key="project._id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
              @click="$router.push(`/projects/${project._id}`)"
            >
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-900">{{ project.name }}</div>
                <div class="text-xs text-gray-500 mt-1 truncate">{{ project.description }}</div>
              </div>
            </div>
            <div v-if="myProjects.length === 0" class="text-center py-8 text-gray-500">
              {{ t('profile.noProjects') }}
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

import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import dayjs from 'dayjs';
import { showToast } from '@/utils/toast';

const user = ref(null);
const myProjects = ref([]);

const profileForm = reactive({
  username: '',
  email: '',
  role: ''
});

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const fetchProfile = async () => {
  try {
    const { data } = await axios.get('/api/auth/profile');
    user.value = data;
    profileForm.username = data.username;
    profileForm.email = data.email;
    profileForm.role = data.role;
  } catch (error) {
    console.error('Failed to fetch profile', error);
  }
};

const fetchMyProjects = async () => {
  try {
    const { data } = await axios.get('/api/projects');
    myProjects.value = data.projects || [];
  } catch (error) {
    console.error('Failed to fetch projects', error);
  }
};

const updateProfile = async () => {
  try {
    await axios.put('/api/auth/profile', {
      email: profileForm.email
    });
    showToast(t('profile.profileUpdated'), 'success');
    fetchProfile();
  } catch (error) {
    showToast(t('messages.saveFailed'), 'error');
  }
};

const resetProfile = () => {
  profileForm.email = user.value.email;
};

const changePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showToast(t('profile.passwordMismatch'), 'error');
    return;
  }
  if (passwordForm.newPassword.length < 6) {
    showToast(t('profile.passwordTooShort'), 'error');
    return;
  }
  try {
    await axios.post('/api/auth/change-password', {
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    });
    showToast(t('profile.passwordChanged'), 'success');
    passwordForm.oldPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
  } catch (error) {
    showToast(error.response?.data?.message || t('profile.passwordChangeFailed'), 'error');
  }
};

const formatDate = (date) => {
  if (!date) return '-';
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

onMounted(() => {
  fetchProfile();
  fetchMyProjects();
});
</script>
