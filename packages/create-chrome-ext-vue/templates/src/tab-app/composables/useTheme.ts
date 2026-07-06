import { ref, watch } from 'vue';
import { storage } from '@chrome-ext-vue/core'

const STORAGE_KEY = 'tab_theme';
type Theme = 'dark' | 'light';

const theme = ref<Theme>('light');

/** 同步 html class：theme-dark / theme-light + Element Plus 暗黑模式联动 */
function applyTheme(value: Theme): void {
  document.documentElement.className = `theme-${value}`;
  document.documentElement.classList.toggle('dark', value === 'dark');
}

/** 初始化主题：从 storage 读取偏好，无记录则默认 light */
export async function initTheme(): Promise<void> {
  const saved = await storage.get(STORAGE_KEY);
  if (saved === 'dark' || saved === 'light') {
    theme.value = saved;
  }
  applyTheme(theme.value);
}

/** 切换主题并持久化 */
export function useTheme() {
  const toggleTheme = async (): Promise<void> => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
    applyTheme(theme.value);
    await storage.set(STORAGE_KEY, theme.value);
  };

  return {
    theme,
    toggleTheme
  };
}

/** 响应式同步 html class（组件内调用一次即可） */
watch(theme, (value) => {
  applyTheme(value);
});
