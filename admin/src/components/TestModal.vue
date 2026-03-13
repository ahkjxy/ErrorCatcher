<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg max-w-lg w-full">
      <div class="p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">测试通知</h2>

        <form @submit.prevent="handleTest" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">通知标题</label>
            <input
              v-model="testForm.customTitle"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="测试通知"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">通知内容</label>
            <textarea
              v-model="testForm.customMessage"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="这是一条测试通知消息..."
            ></textarea>
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
              :disabled="testing"
              class="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
            >
              {{ testing ? '发送中...' : '发送测试' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import axios from 'axios';
import { showToast } from '../utils/toast';

export default {
  name: 'TestModal',
  props: {
    config: {
      type: Object,
      required: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const testing = ref(false);
    const testForm = reactive({
      customTitle: '',
      customMessage: ''
    });

    const handleTest = async () => {
      testing.value = true;
      try {
        const { data: result } = await axios.post(
          `/api/notifications/configs/${props.config._id}/test`,
          {
            customTitle: testForm.customTitle || '测试通知',
            customMessage: testForm.customMessage || '这是一条测试通知消息，用于验证通知配置是否正确'
          }
        );

        if (result.success) {
          showToast(`测试成功！响应时间: ${result.responseTime}ms`, 'success');
        } else {
          showToast(result.message || '测试失败', 'error');
        }
        emit('close');
      } catch (error) {
        console.error('测试失败:', error);
        showToast(error.response?.data?.message || '测试失败', 'error');
      } finally {
        testing.value = false;
      }
    };

    return {
      testing,
      testForm,
      handleTest
    };
  }
};
</script>
