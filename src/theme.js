// Tema claro/escuro. Sem escolha salva, segue o sistema; a escolha fica neste navegador.
const KEY = 'talis_theme'
const media = matchMedia('(prefers-color-scheme: dark)')

const saved = () => {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export const currentTheme = () => saved() ?? (media.matches ? 'dark' : 'light')

export function applyTheme(theme = currentTheme()) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0f0f0f' : '#262626')
}

export function setTheme(theme) {
  try {
    localStorage.setItem(KEY, theme)
  } catch {}
  applyTheme(theme)
}

// acompanha o sistema enquanto a pessoa não escolheu
media.addEventListener('change', () => !saved() && applyTheme())
