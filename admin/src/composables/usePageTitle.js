import { watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

/**
 * 页面标题 composable
 * 自动处理页面标题的i18n翻译和更新
 */
export function usePageTitle() {
  const route = useRoute();
  const { t, locale } = useI18n();

  /**
   * 更新页面标题
   */
  const updatePageTitle = () => {
    let pageTitle = 'ErrorCatcher';
    
    if (route.meta.title) {
      try {
        const translatedTitle = t(route.meta.title);
        pageTitle = `${translatedTitle} - ErrorCatcher`;
      } catch (e) {
        // 如果翻译失败，使用原始标题
        pageTitle = `${route.meta.title} - ErrorCatcher`;
      }
    }
    
    document.title = pageTitle;
  };

  /**
   * 监听路由变化
   */
  watch(() => route.path, () => {
    updatePageTitle();
  });

  /**
   * 监听语言变化
   */
  watch(() => locale.value, () => {
    updatePageTitle();
  });

  // 初始化标题
  updatePageTitle();

  return {
    updatePageTitle
  };
}
