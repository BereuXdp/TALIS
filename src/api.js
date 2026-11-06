// Mesmo contrato da API do TALIS (/api, token Bearer em localStorage "talis_token").

const TOKEN = 'talis_token'
const DEMO = 'talis_demo'

export const auth = {
  get: () => localStorage.getItem(TOKEN),
  set: (t) => localStorage.setItem(TOKEN, t),
  clear: () => {
    localStorage.removeItem(TOKEN)
    localStorage.removeItem(DEMO)
  },
}

export const demo = {
  // Modo demonstração só existe em desenvolvimento.
  on: () => import.meta.env.DEV && localStorage.getItem(DEMO) === '1',
  start: () => {
    localStorage.setItem(DEMO, '1')
    localStorage.setItem(TOKEN, 'demo')
  },
}

export class ApiError extends Error {
  constructor(status, message, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

export async function api(path, opts = {}) {
  if (import.meta.env.DEV && demo.on()) return (await import('./demo.js')).demoApi(path, opts)
  const token = auth.get()
  const res = await fetch(`/api${path}`, {
    method: opts.method ?? 'GET',
    headers: {
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (res.status === 401 && token) {
    auth.clear()
    location.reload()
  }
  if (!res.ok) throw new ApiError(res.status, data.error ?? 'Erro inesperado', data.code)
  return data
}

export const ROLES = {
  OWNER: 'Dono',
  ADMIN: 'Administrador',
  MANAGER: 'Gestor comercial',
  SELLER: 'Vendedor',
  AUDITOR: 'Auditor (só leitura)',
}
export const ROLE_LIST = ['OWNER', 'ADMIN', 'MANAGER', 'SELLER', 'AUDITOR']

export const ORG_STATUS = {
  TRIAL: { label: 'Em teste', tone: 'warn' },
  ACTIVE: { label: 'Ativa', tone: 'ok' },
  BLOCKED: { label: 'Bloqueada', tone: 'bad' },
}

export const INSTANCE_STATUS = {
  CREATED: { label: 'Criada', tone: 'neutral' },
  CONNECTING: { label: 'Aguardando QR Code', tone: 'warn' },
  CONNECTED: { label: 'Conectado', tone: 'ok' },
  DISCONNECTED: { label: 'Desconectado', tone: 'bad' },
}

export const MODELS = {
  'claude-opus-5-5': 'Claude Opus 5.5 (mais inteligente)',
  'claude-sonnet-5-5': 'Claude Sonnet 5.5 (equilíbrio custo/qualidade)',
  'claude-haiku-5-5': 'Claude Haiku 5.5 (mais barato e rápido)',
}

export const fmtDate = (d, withTime = false) =>
  d
    ? new Date(d).toLocaleString(
        'pt-BR',
        withTime ? { dateStyle: 'short', timeStyle: 'short' } : { dateStyle: 'short' },
      )
    : '—'

export const fmtNum = (n) => (n ?? 0).toLocaleString('pt-BR')
export const plural = (n, one, many) => `${fmtNum(n)} ${n === 1 ? one : many}`
export const fmtDay = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '?'
