import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react'
import { api, demo } from '../api.js'
import { ease } from '../components/ui.jsx'
import { Brand } from '../App.jsx'
import { BRAIN } from '../brand.js'

/* Tela de login: paisagem em preto e branco com granulado e um card de vidro.
   À direita, o cérebro da logo em pontilhado, se dissolvendo no vidro. */
export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ company: '', name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [show, setShow] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const isLogin = mode === 'login'

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const body = isLogin ? { email: form.email, password: form.password } : form
      const { token } = await api(`/auth/${mode}`, { method: 'POST', body })
      onLogin(token)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function toggle() {
    setMode(isLogin ? 'register' : 'login')
    setError('')
  }

  return (
    <div className="login">
      <Landscape />
      <div className="login-grain" aria-hidden="true" />

      <motion.div
        className="login-card"
        initial={{ opacity: 0, transform: 'translateY(16px) scale(0.985)' }}
        animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
        transition={{ duration: 0.6, ease }}
      >
        <div className="login-side">
          <div className="login-brand">
            <Brand />
          </div>

          <form onSubmit={submit} className="login-form">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode}
                initial={{ opacity: 0, filter: 'blur(4px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(4px)', transition: { duration: 0.12 } }}
                transition={{ duration: 0.25 }}
              >
                <h1>{isLogin ? 'Entrar' : 'Criar conta'}</h1>
                <p className="login-sub">{isLogin ? 'Continue para acessar seu painel' : 'Seu agente de IA que vende pelo WhatsApp'}</p>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {!isLogin && (
                <motion.div
                  className="login-extra"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease }}
                >
                  <label className="login-field">
                    <span>Empresa</span>
                    <input value={form.company} onChange={set('company')} required minLength={2} autoComplete="organization" placeholder="Nome da sua empresa" />
                  </label>
                  <label className="login-field">
                    <span>Seu nome</span>
                    <input value={form.name} onChange={set('name')} required minLength={2} autoComplete="name" placeholder="Como você se chama" />
                  </label>
                </motion.div>
              )}
            </AnimatePresence>

            <label className="login-field">
              <span>E-mail</span>
              <input type="email" value={form.email} onChange={set('email')} required autoComplete="email" placeholder="Digite seu e-mail" />
            </label>
            <label className="login-field">
              <span>
                Senha
                {!isLogin && <em>mín. 8 caracteres</em>}
              </span>
              <div className="login-pass">
                <input
                  type={show ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  required
                  minLength={isLogin ? 1 : 8}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  placeholder="Digite sua senha"
                />
                <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Esconder senha' : 'Mostrar senha'}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <button className="login-submit" disabled={busy}>
              {busy ? 'Aguarde…' : isLogin ? 'Entrar' : 'Criar conta'}
              {!busy && <ArrowRight size={16} />}
            </button>

            <p className="login-switch">
              {isLogin ? 'Ainda não tem conta?' : 'Já tem conta?'}
              <button type="button" onClick={toggle}>
                {isLogin ? 'Cadastre-se' : 'Entrar'}
              </button>
            </p>

            {import.meta.env.DEV && (
              <button
                type="button"
                className="login-demo"
                onClick={() => {
                  demo.start()
                  location.reload()
                }}
              >
                <Sparkles size={13} /> Ver com dados de demonstração
              </button>
            )}
          </form>

          <p className="login-quote">
            <span lang="grc">Γνῶθι σεαυτόν</span> · conhece-te a ti mesmo
          </p>
        </div>

        <div className="login-art" aria-hidden="true">
          <DotBrain />
        </div>
      </motion.div>
    </div>
  )
}

/* ---------- Cérebro em pontilhado (canvas) ---------- */
function DotBrain() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let last = ''
    function draw() {
      const dpr = Math.min(2, devicePixelRatio || 1)
      const rect = canvas.getBoundingClientRect()
      const W = Math.round(rect.width)
      const H = Math.round(rect.height)
      if (!W || !H || last === `${W}x${H}`) return
      last = `${W}x${H}`
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      // máscara do cérebro num canvas fora da tela
      const m = document.createElement('canvas')
      m.width = W
      m.height = H
      const mc = m.getContext('2d')
      const s = Math.min((W * 0.78) / BRAIN.w, (H * 0.62) / BRAIN.h)
      const bx = W * 0.56 - (BRAIN.w * s) / 2
      const by = H * 0.47 - (BRAIN.h * s) / 2
      mc.setTransform(s, 0, 0, s, bx, by)
      mc.fillStyle = '#fff'
      mc.fill(new Path2D(BRAIN.d))
      const px = mc.getImageData(0, 0, W, H).data

      // pseudo-aleatório estável (o desenho não muda a cada redimensionamento)
      let seed = 7
      const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
      const step = 6
      for (let y = step / 2; y < H; y += step) {
        for (let x = step / 2; x < W; x += step) {
          const inBrain = px[(Math.floor(y) * W + Math.floor(x)) * 4 + 3] > 120
          // dissolve: quanto mais à esquerda, menos pontos
          const fade = Math.min(1, Math.max(0, (x / W - 0.04) / 0.55))
          const r = rnd()
          if (inBrain) {
            if (r > 0.15 + fade * 0.85) continue
            ctx.fillStyle = `rgba(233,229,220,${0.55 + 0.4 * fade})`
            ctx.beginPath()
            ctx.arc(x, y, 1.9, 0, Math.PI * 2)
            ctx.fill()
          } else if (r < 0.55 * fade) {
            ctx.fillStyle = `rgba(233,229,220,${0.05 + 0.07 * rnd()})`
            ctx.fillRect(x - 0.8, y - 0.8, 1.6, 1.6)
          }
        }
      }
      canvas.classList.add('on')
    }
    // desenha direto (sem requestAnimationFrame, que pausa em abas ocultas)
    let t
    const ro = new ResizeObserver(() => {
      clearTimeout(t)
      t = setTimeout(draw, 60)
    })
    ro.observe(canvas)
    draw()
    return () => {
      ro.disconnect()
      clearTimeout(t)
    }
  }, [])
  return <canvas ref={ref} className="login-dots" />
}

/* ---------- Paisagem: serras em camadas + templo grego numa delas ---------- */
function Landscape() {
  const { layers, temple } = useMemo(() => {
    const W = 1600
    const H = 900
    const tones = ['#c9c9c7', '#adadab', '#8f8f8e', '#6f6f6e', '#4f4f4e', '#323232', '#1d1d1d']
    let seed = 11
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    // serra fractal (deslocamento do ponto médio): picos irregulares, como montanha de verdade
    const ridge = (i) => {
      const N = 256
      const base = 250 + i * 92
      const amp = 230 - i * 18
      const p = new Array(N + 1)
      p[0] = base + (rnd() - 0.5) * amp
      p[N] = base + (rnd() - 0.5) * amp
      for (let step = N, k = amp; step > 1; step /= 2, k *= 0.56)
        for (let a = 0; a < N; a += step) {
          const m = a + step / 2
          p[m] = (p[a] + p[a + step]) / 2 + (rnd() - 0.5) * k
        }
      const f = (x) => {
        const u = (x / W) * N
        const a = Math.min(N - 1, Math.floor(u))
        return p[a] + (p[a + 1] - p[a]) * (u - a)
      }
      let d = `M0 ${H}`
      for (let j = 0; j <= N; j++) d += ` L${((j / N) * W).toFixed(1)} ${p[j].toFixed(1)}`
      d += ` L${W} ${H} Z`
      return { d, f }
    }
    const layers = tones.map((c, i) => ({ c, ...ridge(i) }))
    // templo no pico mais alto da 3ª serra, à direita do card, onde as serras da frente não cobrem
    const L = layers[2]
    const front = layers.slice(3)
    let tx = 1420
    let best = -Infinity
    for (let x = 1350; x <= 1490; x += 6) {
      const clear = Math.min(...front.map((l) => l.f(x))) - L.f(x) // folga acima das serras da frente
      if (clear > 40 && L.f(x) > 60 && -L.f(x) > best) {
        best = -L.f(x)
        tx = x
      }
    }
    return { layers, temple: { x: tx, y: L.f(tx) + 3 } }
  }, [])
  return (
    <svg className="login-bg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#8c8c8c" />
          <stop offset="0.55" stopColor="#d8d8d6" />
          <stop offset="1" stopColor="#bfbfbd" />
        </linearGradient>
        <linearGradient id="mist" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#sky)" />
      {layers.map((l, i) => (
        <g key={i}>
          <path d={l.d} fill={l.c} />
          {i < 5 && <path d={l.d} fill="url(#mist)" opacity="0.5" />}
          {i === 2 && <Temple x={temple.x} y={temple.y} color={layers[2].c} />}
        </g>
      ))}
    </svg>
  )
}

function Temple({ x, y, color }) {
  // pequeno templo dórico: base, 6 colunas, arquitrave e frontão
  const w = 64
  const cols = Array.from({ length: 6 }, (_, i) => x - w / 2 + 4 + i * ((w - 12) / 5))
  return (
    <g fill={color} opacity="0.95">
      <rect x={x - w / 2 - 4} y={y - 4} width={w + 8} height="5" />
      <rect x={x - w / 2 - 2} y={y - 7} width={w + 4} height="3" />
      {cols.map((cx) => (
        <rect key={cx} x={cx} y={y - 31} width="4" height="24" />
      ))}
      <rect x={x - w / 2 - 2} y={y - 36} width={w + 4} height="5" />
      <path d={`M${x - w / 2 - 4} ${y - 36} L${x} ${y - 50} L${x + w / 2 + 4} ${y - 36} Z`} />
    </g>
  )
}
