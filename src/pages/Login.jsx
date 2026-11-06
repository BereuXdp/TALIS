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
  const hora = useHora()

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
    <div className={`login is-${periodo(hora)}`}>
      <Landscape hora={hora} />
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
                <p className="login-sub">{isLogin ? `${saudacao(hora)}! Continue para acessar seu painel` : 'Seu agente de IA que vende pelo WhatsApp'}</p>
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

/* ---------- Paisagem que muda com a hora: manhã, tarde e noite ----------
   As cores não trocam de uma vez: são misturadas aos poucos entre os pontos do dia
   abaixo, e o sol (de dia) e a lua (à noite) andam pelo céu. Atualiza a cada minuto.
   Em desenvolvimento, /?login&hora=7 força um horário para revisar. */
const MANHA = {
  sky: ['#b8b2a6', '#e6e1d6', '#f4f1ea'],
  ridges: ['#d9d4ca', '#c4bfb5', '#aaa59b', '#8d887f', '#6f6b64', '#4e4b46', '#2f2d2a'],
  mist: 0.6, sun: 1, moon: 0, stars: 0, glow: '#fff6e6',
}
const TARDE = {
  sky: ['#8c8c8c', '#d8d8d6', '#bfbfbd'],
  ridges: ['#c9c9c7', '#adadab', '#8f8f8e', '#6f6f6e', '#4f4f4e', '#323232', '#1d1d1d'],
  mist: 0.5, sun: 0.75, moon: 0, stars: 0, glow: '#ffffff',
}
const NOITE = {
  sky: ['#040404', '#101010', '#202020'],
  ridges: ['#2c2c2c', '#252525', '#1e1e1e', '#181818', '#121212', '#0d0d0d', '#080808'],
  mist: 0.12, sun: 0, moon: 1, stars: 1, glow: '#e9e5dc',
}
// pontos do dia (hora → cena); entre eles as cores são misturadas
const DIA = [
  [0, NOITE], [4.5, NOITE], [7, MANHA], [11, MANHA], [13, TARDE], [17, TARDE], [19.5, NOITE], [24, NOITE],
]

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const mixHex = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('')
const mixNum = (a, b, t) => a + (b - a) * t

function sceneAt(h) {
  let i = 0
  while (i < DIA.length - 2 && h >= DIA[i + 1][0]) i++
  const [h0, A] = DIA[i]
  const [h1, B] = DIA[i + 1]
  const t = Math.min(1, Math.max(0, (h - h0) / (h1 - h0 || 1)))
  const s = t * t * (3 - 2 * t) // suaviza o começo e o fim da transição
  return {
    sky: A.sky.map((c, k) => mixHex(c, B.sky[k], s)),
    ridges: A.ridges.map((c, k) => mixHex(c, B.ridges[k], s)),
    mist: mixNum(A.mist, B.mist, s),
    sun: mixNum(A.sun, B.sun, s),
    moon: mixNum(A.moon, B.moon, s),
    stars: mixNum(A.stars, B.stars, s),
    glow: mixHex(A.glow, B.glow, s),
  }
}

const periodo = (h) => (h >= 5 && h < 12 ? 'manha' : h >= 12 && h < 18 ? 'tarde' : 'noite')
const saudacao = (h) => ({ manha: 'Bom dia', tarde: 'Boa tarde', noite: 'Boa noite' })[periodo(h)]

function useHora() {
  const forced = import.meta.env.DEV ? new URLSearchParams(location.search).get('hora') : null
  const read = () => {
    if (forced !== null && forced !== '') return Number(forced)
    const d = new Date()
    return d.getHours() + d.getMinutes() / 60
  }
  const [h, setH] = useState(read)
  useEffect(() => {
    const t = setInterval(() => setH(read()), 60_000)
    return () => clearInterval(t)
  }, [])
  return h
}

// arco no céu: entra pela esquerda, sobe e desce pela direita
const arc = (p) => ({ x: -40 + p * 1680, y: 290 - Math.sin(Math.PI * p) * 220 })

function Landscape({ hora }) {
  const { layers, temple, stars } = useMemo(() => {
    const W = 1600
    const H = 900
    let seed = 11
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    // serra fractal (deslocamento do ponto médio): picos irregulares, como montanha de verdade
    const ridge = (i) => {
      const N = 256
      const base = 330 + i * 84
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
    const layers = Array.from({ length: 7 }, (_, i) => ridge(i))
    // templo no pico mais alto da 3ª serra, à direita do card, onde as serras da frente não cobrem
    const L = layers[2]
    const front = layers.slice(3)
    let tx = 1420
    let best = -Infinity
    for (let x = 1350; x <= 1490; x += 6) {
      const clear = Math.min(...front.map((l) => l.f(x))) - L.f(x)
      if (clear > 40 && L.f(x) > 60 && -L.f(x) > best) {
        best = -L.f(x)
        tx = x
      }
    }
    // estrelas só no céu (acima da serra do fundo)
    const stars = []
    for (let k = 0; k < 140; k++) {
      const x = rnd() * W
      const y = rnd() * 480
      if (y < layers[0].f(x) - 12) stars.push({ x, y, r: 0.6 + rnd() * 1.3, o: 0.35 + rnd() * 0.65 })
    }
    return { layers, temple: { x: tx, y: L.f(tx) + 3 }, stars }
  }, [])

  const s = sceneAt(hora)
  const sunP = (hora - 6) / 12 // 6h → 18h
  const moonP = (((hora - 18 + 24) % 24) / 12) // 18h → 6h
  const sun = arc(Math.min(1, Math.max(0, sunP)))
  const moon = arc(Math.min(1, Math.max(0, moonP)))
  const sunVis = sunP > -0.02 && sunP < 1.02 ? s.sun : 0
  const moonVis = moonP >= 0 && moonP <= 1 ? s.moon : 0

  return (
    <svg className="login-bg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" style={{ stopColor: s.sky[0] }} />
          <stop offset="0.55" style={{ stopColor: s.sky[1] }} />
          <stop offset="1" style={{ stopColor: s.sky[2] }} />
        </linearGradient>
        <linearGradient id="mist" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.35" />
        </linearGradient>
        <radialGradient id="glow">
          <stop offset="0" style={{ stopColor: s.glow }} stopOpacity="0.9" />
          <stop offset="0.25" style={{ stopColor: s.glow }} stopOpacity="0.35" />
          <stop offset="1" style={{ stopColor: s.glow }} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#sky)" />

      <g className="login-stars" style={{ opacity: s.stars }}>
        {stars.map((st, k) => (
          <circle key={k} cx={st.x} cy={st.y} r={st.r} fill="#f2efe9" opacity={st.o} />
        ))}
      </g>

      {/* sol: brilho grande e disco */}
      <g style={{ opacity: sunVis }} className="login-sky-body">
        <circle cx={sun.x} cy={sun.y} r="260" fill="url(#glow)" />
        <circle cx={sun.x} cy={sun.y} r="38" fill="#fbfaf6" />
      </g>
      {/* lua: disco com sombra (minguante) e brilho suave */}
      <g style={{ opacity: moonVis }} className="login-sky-body">
        <circle cx={moon.x} cy={moon.y} r="180" fill="url(#glow)" opacity="0.35" />
        <mask id="moon-cut">
          <rect x={moon.x - 40} y={moon.y - 40} width="80" height="80" fill="#fff" />
          <circle cx={moon.x + 12} cy={moon.y - 6} r="27" fill="#000" />
        </mask>
        <circle cx={moon.x} cy={moon.y} r="30" fill="#e9e5dc" mask="url(#moon-cut)" />
      </g>

      {layers.map((l, i) => (
        <g key={i}>
          <path d={l.d} style={{ fill: s.ridges[i] }} />
          {i < 5 && <path d={l.d} fill="url(#mist)" style={{ opacity: s.mist }} />}
          {i === 2 && <Temple x={temple.x} y={temple.y} color={s.ridges[2]} lit={s.moon > 0.5} />}
        </g>
      ))}
    </svg>
  )
}

function Temple({ x, y, color, lit }) {
  // pequeno templo dórico: base, 6 colunas, arquitrave e frontão
  const w = 64
  const cols = Array.from({ length: 6 }, (_, i) => x - w / 2 + 4 + i * ((w - 12) / 5))
  return (
    <g style={{ fill: color }} opacity="0.95">
      {/* à noite, uma luz fraca entre as colunas */}
      <rect x={x - w / 2 + 2} y={y - 31} width={w - 4} height="24" fill="#e9c98a" style={{ opacity: lit ? 0.35 : 0, transition: 'opacity 2s' }} />
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
