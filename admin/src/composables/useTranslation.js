import { useI18n } from 'vue-i18n';

/**
 * 简化的翻译 composable
 * 提供常用的翻译函数和工具
 */
export function useTranslation() {
  const { t, locale } = useI18n();

  // 通用翻译
  const translate = (key, params) => t(key, params);

  // 常用按钮文本
  const buttons = {
    save: () => t('common.save'),
    cancel: () => t('common.cancel'),
    delete: () => t('common.delete'),
    edit: () => t('common.edit'),
    create: () => t('common.create'),
    search: () => t('common.search'),
    filter: () => t('common.filter'),
    refresh: () => t('common.refresh'),
    back: () => t('common.back'),
    confirm: () => t('common.confirm'),
    close: () => t('common.close'),
    submit: () => t('common.submit'),
    reset: () => t('common.reset'),
    clear: () => t('common.clear'),
    view: () => t('common.view'),
  };

  // 状态文本
  const status = {
    enabled: () => t('common.enabled'),
    disabled: () => t('common.disabled'),
    active: () => t('common.active'),
    inactive: () => t('common.inactive'),
    loading: () => t('common.loading'),
  };

  // 消息文本
  const messages = {
    success: () => t('messages.operationSuccess'),
    failed: () => t('messages.operationFailed'),
    loadingFailed: () => t('messages.loadingFailed'),
    saveFailed: () => t('messages.saveFailed'),
    deleteFailed: () => t('messages.deleteFailed'),
    networkError: () => t('messages.networkError'),
    serverError: () => t('messages.serverError'),
  };

  // 优先级文本
  const priority = {
    critical: () => t('alerts.critical'),
    high: () => t('alerts.high'),
    medium: () => t('alerts.medium'),
    low: () => t('alerts.low'),
  };

  // 通知类型标签
  const notificationType = {
    dingtalk: 'DingTalk',
    email: 'Email',
    webhook: 'Webhook',
    wechat: 'WeChat Work',
    slack: 'Slack',
  };

  return {
    t: translate,
    locale,
    buttons,
    status,
    messages,
    priority,
    notificationType,
  };
}
