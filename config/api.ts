// API 配置
export const API_CONFIG = {
  BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH || '',
};

// 获取完整的 API 路径
export const getApiPath = (path: string): string => {
  // 确保 path 以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_CONFIG.BASE_PATH}${normalizedPath}`;
};
