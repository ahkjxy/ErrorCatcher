import { h, render } from 'vue';

const Toast = {
  success(message) {
    this.show(message, 'success');
  },
  error(message) {
    this.show(message, 'error');
  },
  warning(message) {
    this.show(message, 'warning');
  },
  info(message) {
    this.show(message, 'info');
  },
  show(message, type = 'info') {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    const vnode = h('div', {
      class: 'fixed top-4 right-4 z-50 animate-slide-in'
    }, [
      h('div', {
        class: `${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`
      }, [
        h('span', { class: 'text-xl' }, icons[type]),
        h('span', message)
      ])
    ]);

    render(vnode, container);

    setTimeout(() => {
      render(null, container);
      document.body.removeChild(container);
    }, 3000);
  }
};

// 命名导出
export const showToast = (message, type = 'info') => {
  Toast.show(message, type);
};

// 默认导出
export default Toast;
