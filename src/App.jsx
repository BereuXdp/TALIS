import { useEffect, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import {
  Bot, Building2, LayoutDashboard, LogOut, Menu as MenuIcon, MessagesSquare, Plug, Smartphone, Users, UserCog, AlertTriangle, Hourglass,
} from 'lucide-react'
import { api, auth, ORG_STATUS } from './api.js'
import { BRAIN, WORD } from './brand.js'
import { Alert, Avatar, Dialogs, Toaster, ease } from './components/ui.jsx'
import Login from './pages/Login.jsx'
import WhatsApp from './pages/WhatsApp.jsx'
import Conversas from './pages/Conversas.jsx'
import Agente from './pages/Agente.jsx'
import Integracoes from './pages/Integracoes.jsx'
import Equipe from './pages/Equipe.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminEmpresas from './pages/AdminEmpresas.jsx'
import AdminUsuarios from './pages/AdminUsuarios.jsx'

const NAV = [
  { id: 'whatsapp', label: 'WhatsApp', icon: Smartphone },
  { id: 'conversas', label: 'Conversas', icon: MessagesSquare },
  { id: 'agente', label: 'Agente vendedor', icon: Bot },
  { id: 'integracoes', label: 'Integrações', icon: Plug },
  { id: 'equipe', label: 'Equipe', icon: Users },
]
const ADMIN = [
  { id: 'admin', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'admin-empresas', label: 'Empresas', icon: Building2 },
  { id: 'admin-usuarios', label: 'Usuários', icon: UserCog },
]
// Mesmas URLs do app atual.
const PATHS = { admin: '/admin', 'admin-empresas': '/admin/empresas', 'admin-usuarios': '/admin/usuarios' }
const fromPath = () =>
  Object.entries(PATHS).find(([, p]) => p === location.pathname.replace(/\/$/, ''))?.[0] ?? 'whatsapp'

export default function App() {
  const [token, setToken] = useState(auth.get())
  const [me, setMe] = useState(null)
  const [view, setView] = useState(fromPath)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (token) api('/me').then(setMe).catch(() => setMe(null))
  }, [token])
  useEffect(() => {
    const h = () => setView(fromPath())
    addEventListener('popstate', h)
    return () => removeEventListener('popstate', h)
  }, [])

  function go(id) {
    setView(id)
    setMenuOpen(false)
    const p = PATHS[id] ?? '/'
    if (location.pathname !== p) history.pushState(null, '', p)
    document.querySelector('.main')?.scrollIntoView({ block: 'start' })
  }

  if (!token)
    return (
      <>
        <Login onLogin={(t) => (auth.set(t), setToken(t))} />
        <Toaster />
      </>
    )

  const isSuper = me?.user.isSuperAdmin ?? false
  const isAdminView = view.startsWith('admin')
  const org = me?.user.organization
  const trialDays = org?.trialEndsAt ? Math.ceil((new Date(org.trialEndsAt) - Date.now()) / 864e5) : null

  const logout = () => {
    auth.clear()
    setToken(null)
    setMe(null)
    history.pushState(null, '', '/')
  }

  const navItem = (n) => (
    <button key={n.id} className={`nav-item ${view === n.id ? 'active' : ''}`} onClick={() => go(n.id)} aria-current={view === n.id ? 'page' : undefined}>
      {view === n.id && <motion.span layoutId="nav-pill" className="nav-pill" transition={{ type: 'spring', duration: 0.4, bounce: 0.12 }} />}
      <n.icon size={19} strokeWidth={view === n.id ? 2.2 : 1.8} />
      <span>{n.label}</span>
    </button>
  )

  return (
    <div className="shell">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <Brand />
        <div className="meander light" aria-hidden="true" />
        <div className="org-chip">
          <Avatar name={org?.name ?? '…'} />
          <div className="grow">
            <b className="ellipsis">{org?.name ?? '…'}</b>
            <span>{org ? ORG_STATUS[org.status]?.label : ''}</span>
          </div>
        </div>
        <LayoutGroup>
          <nav className="nav">
            {NAV.map(navItem)}
            {isSuper && (
              <>
                <div className="nav-section">Administração</div>
                {ADMIN.map(navItem)}
              </>
            )}
          </nav>
        </LayoutGroup>
        <div className="sidebar-foot">
          <Avatar name={me?.user.name ?? me?.user.email ?? ''} />
          <div className="who">
            <b className="ellipsis">{me?.user.name ?? 'Conta'}</b>
            <span className="ellipsis">{me?.user.email}</span>
          </div>
          <button className="icon-btn" onClick={logout} aria-label="Sair" title="Sair">
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <AnimatePresence>
        {menuOpen && (
          <motion.div className="scrim" onClick={() => setMenuOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
        )}
      </AnimatePresence>

      <div className="main">
        <header className="topbar">
          <Brand />
          <button className="icon-btn" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
            <MenuIcon size={22} />
          </button>
        </header>
        <main className="panel">
          <div className="page notices">
            {me && !isAdminView && !me.evolutionConfigured && (
              <Alert tone="warn" icon={AlertTriangle}>
                Evolution não configurada. Preencha <code>EVOLUTION_API_URL</code>, <code>EVOLUTION_API_KEY</code> e{' '}
                <code>TALIS_WEBHOOK_URL</code> no <code>.env</code> e reinicie a API.
              </Alert>
            )}
            {org?.status === 'TRIAL' && !isAdminView && trialDays !== null && (
              <Alert tone="info" icon={Hourglass}>
                {trialDays > 0 ? (
                  <>
                    {trialDays === 1 ? 'Falta' : 'Faltam'} <b>{trialDays === 1 ? '1 dia' : `${trialDays} dias`}</b> do seu período de teste.
                  </>
                ) : (
                  'O período de teste terminou.'
                )}
              </Alert>
            )}
            {isAdminView && me && !isSuper && <Alert>Acesso restrito ao administrador da plataforma.</Alert>}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={view} initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.12, ease } }}>
              {isSuper && view === 'admin' && <AdminDashboard />}
              {isSuper && view === 'admin-empresas' && <AdminEmpresas />}
              {isSuper && view === 'admin-usuarios' && <AdminUsuarios />}
              {view === 'whatsapp' && <WhatsApp />}
              {view === 'conversas' && <Conversas />}
              {view === 'agente' && <Agente />}
              {view === 'equipe' && me && <Equipe me={me} />}
              {view === 'integracoes' && <Integracoes />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <Toaster />
      <Dialogs />
    </div>
  )
}

// Logo nova: cérebro + "TALIS" (gerados por tools/logo.mjs). Usa a cor do texto (currentColor).
export function Brand({ iconOnly = false }) {
  return (
    <div className="brand" aria-label="TALIS" role="img">
      <svg className="brand-icon" viewBox={`0 0 ${BRAIN.w} ${BRAIN.h}`} fill="currentColor" aria-hidden="true">
        <path d={BRAIN.d} />
      </svg>
      {!iconOnly && (
        <svg className="brand-word" viewBox={`0 0 ${WORD.w} ${WORD.h}`} fill="currentColor" aria-hidden="true">
          <path d={WORD.d} />
        </svg>
      )}
    </div>
  )
}

