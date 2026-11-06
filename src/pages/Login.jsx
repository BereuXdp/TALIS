import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { api, demo } from '../api.js'
import { Alert, Field, ease } from '../components/ui.jsx'
import { Brand } from '../App.jsx'

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ company: '', name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const body = mode === 'login' ? { email: form.email, password: form.password } : form
      const { token } = await api(`/auth/${mode}`, { method: 'POST', body })
      onLogin(token)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth-form">
        <div className="auth-brand">
          <Brand />
        </div>
        <motion.form
          onSubmit={submit}
          className="stack"
          initial={{ opacity: 0, transform: 'translateY(12px)' }}
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          transition={{ duration: 0.5, ease }}
        >
          <div>
            <h1 className="auth-title">{mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}</h1>
            <p className="muted" style={{ marginTop: 8 }}>
              Seu agente de IA que vende pelo WhatsApp.
            </p>
          </div>
          <AnimatePresence initial={false}>
            {mode === 'register' && (
              <motion.div
                className="stack"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease }}
                style={{ overflow: 'hidden' }}
              >
                <Field label="Empresa">
                  <input className="input" value={form.company} onChange={set('company')} required minLength={2} autoComplete="organization" />
                </Field>
                <Field label="Seu nome">
                  <input className="input" value={form.name} onChange={set('name')} required minLength={2} autoComplete="name" />
                </Field>
              </motion.div>
            )}
          </AnimatePresence>
          <Field label="E-mail">
            <input className="input" type="email" value={form.email} onChange={set('email')} required autoComplete="email" />
          </Field>
          <Field label="Senha" aside={mode === 'register' && <span className="tiny muted">mín. 8 caracteres</span>}>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={set('password')}
              required
              minLength={mode === 'register' ? 8 : 1}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </Field>
          {error && <Alert>{error}</Alert>}
          <button className="btn primary block" disabled={busy}>
            {busy ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            {!busy && <ArrowRight size={16} />}
          </button>
          <p className="muted small" style={{ textAlign: 'center' }}>
            {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
            <button type="button" className="btn link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
              {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
            </button>
          </p>
          {import.meta.env.DEV && (
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                demo.start()
                location.reload()
              }}
            >
              <Sparkles size={15} /> Ver com dados de demonstração
            </button>
          )}
        </motion.form>
        <p className="tiny muted auth-foot">© {new Date().getFullYear()} TALIS · Devmais</p>
      </div>
      <Showcase />
    </div>
  )
}

/* Lado direito: conversa de exemplo do agente vendendo. */
const SCRIPT = [
  { who: 'in', text: 'Oi! Ainda tem o kit skincare do anúncio?' },
  { who: 'out', text: 'Tem sim! 😊 O Kit Aurora sai por R$ 189,90. Quer que eu reserve um pra você?' },
  { who: 'in', text: 'Quero. Aceita PIX?' },
  { who: 'out', text: 'Aceita, e no PIX fica R$ 180,40. Já te mando o link!' },
]

function Showcase() {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return setN(SCRIPT.length)
    const t = setInterval(() => setN((v) => (v >= SCRIPT.length + 2 ? 0 : v + 1)), 1500)
    return () => clearInterval(t)
  }, [])
  const shown = SCRIPT.slice(0, Math.min(n, SCRIPT.length))
  const typing = n < SCRIPT.length && SCRIPT[n]?.who === 'out'
  return (
    <div className="auth-art" aria-hidden="true">
      <div className="auth-art-glow" />
      <div className="auth-copy">
        <blockquote className="auth-quote">
          <span className="grc" lang="grc">Γνῶθι σεαυτόν</span>
          <p>
            “Conhece-te a ti mesmo.” <b>· Tales de Mileto</b>
          </p>
        </blockquote>
        <h2>Atende, tira dúvidas e fecha a venda, enquanto sua equipe cuida do resto.</h2>
      </div>
      <div className="phone">
        <div className="phone-head">
          <span className="avatar" style={{ background: 'var(--rose)', color: 'var(--cream)' }}>
            A
          </span>
          <div>
            <b>Aurora · Vendas</b>
            <span>{typing ? 'digitando…' : 'online'}</span>
          </div>
        </div>
        <div className="phone-body">
          <AnimatePresence initial={false}>
            {shown.map((m, i) => (
              <motion.div
                key={i}
                layout
                className={`bubble ${m.who}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', duration: 0.45, bounce: 0.15 }}
              >
                {m.text}
              </motion.div>
            ))}
          </AnimatePresence>
          {typing && (
            <motion.div layout className="bubble out typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <i />
              <i />
              <i />
            </motion.div>
          )}
        </div>
      </div>
      <div className="auth-stats">
        <div>
          <b>Base de conhecimento</b>
          <span>só informa preço e prazo que você cadastrou</span>
        </div>
        <div>
          <b>Passa para humano</b>
          <span>quando o cliente pede ou a venda precisa</span>
        </div>
      </div>
    </div>
  )
}
