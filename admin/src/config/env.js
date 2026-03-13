// 环境配置工具

/**
 * 获取当前环境
 * @returns {string} development | test | pre | production
 */
export const getEnv = () => {
  return import.meta.env.VITE_ENV || import.meta.env.MODE || 'development';
};

/**
 * 判断是否为开发环境
 */
export const isDev = () => {
  return getEnv() === 'development';
};

/**
 * 判断是否为测试环境
 */
export const isTest = () => {
  return getEnv() === 'test';
};

/**
 * 判断是否为预发布环境
 */
export const isPre = () => {
  return getEnv() === 'pre';
};

/**
 * 判断是否为生产环境
 */
export const isProd = () => {
  return getEnv() === 'production';
};

/**
 * 获取 API 地址
 */
export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3001';
};

/**
 * 获取 WebSocket 地址
 */
export const getWsUrl = () => {
  return import.meta.env.VITE_WS_URL || 'http://localhost:3001';
};

/**
 * 环境配置
 */
export const envConfig = {
  // 当前环境
  env: getEnv(),
  
  // API 地址
  apiUrl: getApiUrl(),
  
  // WebSocket 地址
  wsUrl: getWsUrl(),
  
  // 是否开发环境
  isDev: isDev(),
  
  // 是否测试环境
  isTest: isTest(),
  
  // 是否预发布环境
  isPre: isPre(),
  
  // 是否生产环境
  isProd: isProd(),
  
  // 是否启用调试
  debug: isDev() || isTest(),
  
  // 是否启用 mock
  mock: false,
  
  // 请求超时时间（毫秒）
  timeout: 30000,
  
  // 上传文件大小限制（MB）
  uploadMaxSize: 10,
  
  // 分页大小
  pageSize: 20,
  
  // 环境标识显示
  envLabel: {
    development: '开发',
    test: '测试',
    pre: '预发布',
    production: '生产'
  }[getEnv()] || '未知'
};

export default envConfig;
