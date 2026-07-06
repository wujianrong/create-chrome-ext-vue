import { ref, computed, onMounted } from 'vue'

export type Theme = 'light' | 'dark'

/** 从 storage 读取当前主题偏好 */
function getTheme(): Theme {
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  // 默认浅色主题
  return 'light'
}

/** 应用主题到 DOM */
function applyTheme(theme: Theme) {
  const html = document.documentElement
  html.classList.remove('theme-light', 'theme-dark')
  html.classList.add(`theme-${theme}`)
  localStorage.setItem('theme', theme)
}

/** 初始化主题（从 storage 读取） */
export function initTheme() {
  const theme = getTheme()
  applyTheme(theme)
}

/** 主题 Composable */
export function useTheme() {
  const theme = ref<Theme>(getTheme())

  onMounted(() => {
    // 确保初始主题已应用
    applyTheme(theme.value)
  })

  const toggleTheme = () => {
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    theme.value = newTheme
    applyTheme(newTheme)
  }

  return {
    theme,
    toggleTheme
  }
}
