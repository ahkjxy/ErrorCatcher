<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">
          {{ isEdit ? t('notifications.editConfiguration') : t('notifications.addConfiguration') }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t('notifications.name') }} <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              :placeholder="t('notifications.name')"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('notifications.description') }}</label>
            <textarea
              v-model="form.description"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              :placeholder="t('notifications.description')"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t('notifications.type') }} <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.type"
              required
              :disabled="isEdit"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">{{ t('notifications.type') }}</option>
              <option value="dingtalk">{{ t('notifications.type') === 'Type' ? 'DingTalk' : '钉钉' }}</option>
              <option value="email">{{ t('notifications.type') === 'Type' ? 'Email' : '邮件' }}</option>
              <option value="webhook">Webhook</option>
              <option value="wechat">{{ t('notifications.type') === 'Type' ? 'WeChat Work' : '企业微信' }}</option>
              <option value="slack">Slack</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t('notifications.project') }} <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.projectId"
              required
              @change="onProjectChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">{{ t('notifications.leaveEmptyForGlobal') }}</option>
              <option v-for="project in projects" :key="project._id" :value="project._id">
                {{ project.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('notifications.notificationTemplateOptional') }}</label>
            <select
              v-model="form.templateId"
              :disabled="!form.projectId || loadingTemplates"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">{{ t('notifications.noTemplate') }}</option>
              <option v-for="template in availableTemplates" :key="template._id" :value="template._id">
                {{ template.name }}
              </option>
            </select>
            <p v-if="!form.projectId" class="text-xs text-gray-500 mt-1">{{ t('notifications.selectTemplateHelp') }}</p>
            <p v-else-if="loadingTemplates" class="text-xs text-gray-500 mt-1">{{ t('common.loading') }}</p>
          </div>

          <!-- 钉钉配置 -->
          <div v-if="form.type === 'dingtalk'" class="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h3 class="font-medium text-gray-900">{{ t('notifications.type') === 'Type' ? 'DingTalk Configuration' : '钉钉配置' }}</h3>
            <div>
              <label class="block text-sm text-gray-700 mb-1">{{ t('notifications.webhook') }} <span class="text-red-500">*</span></label>
              <input
                v-model="form.config.webhook"
                type="url"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="https://oapi.dingtalk.com/robot/send?access_token=..."
              />
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1">{{ t('notifications.secret') }}</label>
              <input
                v-model="form.config.secret"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="SEC..."
              />
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1">{{ t('notifications.atMobiles') }}</label>
              <input
                v-model="dingtalkMobiles"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                :placeholder="t('notifications.atMobilesPlaceholder')"
              />
              <p class="text-xs text-gray-500 mt-1">{{ t('notifications.atMobilesHelp') }}</p>
            </div>
          </div>

          <!-- 邮件配置 -->
          <div v-if="form.type === 'email'" class="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h3 class="font-medium text-gray-900">{{ t('notifications.type') === 'Type' ? 'Email Configuration' : '邮件配置' }}</h3>
            <div>
              <label class="block text-sm text-gray-700 mb-1">{{ t('notifications.type') === 'Type' ? 'Recipients' : '收件人' }} <span class="text-red-500">*</span></label>
              <input
                v-model="emailRecipients"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="admin@example.com,dev@example.com"
              />
            </div>
          </div>

          <!-- Webhook配置 -->
          <div v-if="form.type === 'webhook'" class="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h3 class="font-medium text-gray-900">Webhook {{ t('notifications.config') }}</h3>
            <div>
              <label class="block text-sm text-gray-700 mb-1">URL <span class="text-red-500">*</span></label>
              <input
                v-model="form.config.url"
                type="url"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="https://api.example.com/webhook"
              />
            </div>
            <div>
              <label class="block text-sm text-gray-700 mb-1">{{ t('notifications.type') === 'Type' ? 'Method' : '请求方法' }}</label>
              <select
                v-model="form.config.method"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
              </select>
            </div>
          </div>

          <div>
            <label class="flex items-center">
              <input
                v-model="form.isDefault"
                type="checkbox"
                class="mr-2"
              />
              <span class="text-sm">{{ t('notifications.setDefault') }}</span>
            </label>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
            >
              {{ submitting ? t('common.loading') : t('common.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import { ref, reactive, watch, onMounted } from 'vue';
import axios from 'axios';
import { showToast } from '../utils/toast';

export default {
  name: 'ConfigModal',
  props: {
    isEdit: Boolean,
    config: {
      type: Object,
      default: null
    },
    projects: {
      type: Array,
      default: () => []
    },
    templates: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const submitting = ref(false);
    const loadingTemplates = ref(false);
    const availableTemplates = ref([]);
    const dingtalkMobiles = ref('');
    const emailRecipients = ref('');

    const form = reactive({
      name: '',
      description: '',
      type: '',
      projectId: '',
      templateId: '',
      config: {},
      isDefault: false
    });

    // 根据项目加载可用模板
    const loadTemplatesForProject = async (projectId) => {
      if (!projectId) {
        availableTemplates.value = [];
        return;
      }

      loadingTemplates.value = true;
      try {
        // 后端会根据用户权限返回模板：
        // - Admin: 返回所有模板
        // - 普通用户: 只返回该项目的模板
        const { data } = await axios.get('/api/templates', {
          params: { projectId }
        });
        availableTemplates.value = data.templates || [];
      } catch (error) {
        console.error('获取模板列表失败:', error);
        availableTemplates.value = [];
      } finally {
        loadingTemplates.value = false;
      }
    };

    // 项目变化时重新加载模板
    const onProjectChange = () => {
      form.templateId = ''; // 清空已选模板
      loadTemplatesForProject(form.projectId);
    };

    // 初始化表单
    if (props.isEdit && props.config) {
      form.name = props.config.name;
      form.description = props.config.description || '';
      form.type = props.config.type;
      form.projectId = props.config.projectId?._id || '';
      form.templateId = props.config.templateId?._id || '';
      form.config = { ...props.config.config };
      form.isDefault = props.config.isDefault;

      if (props.config.type === 'dingtalk') {
        dingtalkMobiles.value = props.config.config.atMobiles?.join(',') || '';
      } else if (props.config.type === 'email') {
        emailRecipients.value = props.config.config.recipients?.join(',') || '';
      }

      // 编辑时加载该项目的模板
      if (form.projectId) {
        loadTemplatesForProject(form.projectId);
      }
    }

    // 监听类型变化，重置配置
    watch(() => form.type, () => {
      if (!props.isEdit) {
        form.config = {};
        dingtalkMobiles.value = '';
        emailRecipients.value = '';
      }
    });

    const handleSubmit = async () => {
      submitting.value = true;
      try {
        const payload = {
          name: form.name,
          description: form.description,
          type: form.type,
          projectId: form.projectId || null,
          templateId: form.templateId || null,
          isDefault: form.isDefault,
          config: { ...form.config }
        };

        if (form.type === 'dingtalk') {
          payload.config.atMobiles = dingtalkMobiles.value.split(',').map(m => m.trim()).filter(Boolean);
        } else if (form.type === 'email') {
          payload.config.recipients = emailRecipients.value.split(',').map(e => e.trim()).filter(Boolean);
        }

        if (props.isEdit) {
          await axios.put(`/api/notifications/configs/${props.config._id}`, payload);
          showToast(t('notifications.configurationUpdated'), 'success');
        } else {
          await axios.post('/api/notifications/configs', payload);
          showToast(t('notifications.configurationCreated'), 'success');
        }

        emit('saved');
      } catch (error) {
        console.error('保存配置失败:', error);
        showToast(t('notifications.operationFailed'), 'error');
      } finally {
        submitting.value = false;
      }
    };

    return {
      submitting,
      loadingTemplates,
      availableTemplates,
      form,
      dingtalkMobiles,
      emailRecipients,
      onProjectChange,
      handleSubmit
    };
  }
};
</script>
