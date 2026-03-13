<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">
          {{ isEdit ? '编辑消息模板' : '新建消息模板' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              模板名称 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="例如: 生产环境错误通知模板"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              v-model="form.description"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="模板的用途说明..."
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">分类</label>
              <select
                v-model="form.category"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="custom">自定义</option>
                <option value="error">错误</option>
                <option value="warning">警告</option>
                <option value="info">信息</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                项目 <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.projectId"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">请选择项目</option>
                <option v-for="project in projects" :key="project._id" :value="project._id">
                  {{ project.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- 可用变量提示 -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 class="font-medium text-blue-900 mb-2 text-sm">可用变量（点击复制）</h4>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="variable in variables"
                :key="variable.key"
                type="button"
                @click="copyVariable(variable.key)"
                class="text-left px-2 py-1 bg-white hover:bg-blue-100 rounded text-xs transition-colors"
                :title="variable.description + ' - ' + variable.example"
              >
                <code class="text-blue-700">{{ formatVariable(variable.key) }}</code>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              标题模板 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              placeholder="【{{priority}}】{{projectName}} - {{alertName}}"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              内容模板 <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="form.content"
              rows="8"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              placeholder="触发原因: {{reason}}&#10;错误数量: {{errorCount}}&#10;影响用户: {{userCount}}&#10;时间: {{time}}"
            ></textarea>
          </div>

          <div>
            <label class="flex items-center">
              <input
                v-model="form.isDefault"
                type="checkbox"
                class="mr-2"
              />
              <span class="text-sm">设为默认模板</span>
            </label>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
            >
              {{ submitting ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import { ref, reactive } from 'vue';
import axios from 'axios';
import { showToast } from '../utils/toast';

export default {
  name: 'TemplateModal',
  props: {
    isEdit: Boolean,
    template: {
      type: Object,
      default: null
    },
    projects: {
      type: Array,
      default: () => []
    },
    variables: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const submitting = ref(false);

    const form = reactive({
      name: '',
      description: '',
      title: '【{{priority}}】{{projectName}} - {{alertName}}',
      content: '触发原因: {{reason}}\n错误数量: {{errorCount}}\n影响用户: {{userCount}}\n时间: {{time}}',
      projectId: '',
      category: 'custom',
      isDefault: false
    });

    // 初始化表单
    if (props.isEdit && props.template) {
      form.name = props.template.name;
      form.description = props.template.description || '';
      form.title = props.template.title;
      form.content = props.template.content;
      form.projectId = props.template.projectId?._id || '';
      form.category = props.template.category;
      form.isDefault = props.template.isDefault;
    }

    const copyVariable = (key) => {
      const text = `{{${key}}}`;
      navigator.clipboard.writeText(text).then(() => {
        showToast(`已复制: ${text}`, 'success');
      });
    };

    const formatVariable = (key) => {
      return `{{${key}}}`;
    };

    const handleSubmit = async () => {
      submitting.value = true;
      try {
        const payload = {
          name: form.name,
          description: form.description,
          title: form.title,
          content: form.content,
          projectId: form.projectId || null,
          category: form.category,
          isDefault: form.isDefault
        };

        if (props.isEdit) {
          await axios.put(`/api/templates/${props.template._id}`, payload);
          showToast(t('notifications.templateUpdated'), 'success');
        } else {
          await axios.post('/api/templates', payload);
          showToast(t('notifications.templateCreated'), 'success');
        }

        emit('saved');
      } catch (error) {
        console.error('保存模板失败:', error);
        showToast(t('notifications.operationFailed'), 'error');
      } finally {
        submitting.value = false;
      }
    };

    return {
      submitting,
      form,
      copyVariable,
      formatVariable,
      handleSubmit
    };
  }
};
</script>
