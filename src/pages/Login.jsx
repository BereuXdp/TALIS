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
  // /?cadastro (vindo da landing) abre direto em "Criar conta"
  const [mode, setMode] = useState(() => (new URLSearchParams(location.search).has('cadastro') ? 'register' : 'login'))
  const [form, setForm] = useState({ company: '', name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [show, setShow] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const isLogin = mode === 'login'
  const hora = useHora()
  const clima = useClima()

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
    <div className={`login is-${periodo(hora)} clima-${clima}`}>
      <Landscape hora={hora} clima={clima} />
      <Precip clima={clima} />
      <div className="login-grain" aria-hidden="true" />
      <a href="/site/" className="login-back">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        Voltar ao site
      </a>

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

function Landscape({ hora, clima }) {
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

  const s = applyClima(sceneAt(hora), clima)
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
        <filter id="cloudblur" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="30" />
        </filter>
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

      {/* nuvens: ficam na frente do sol e da lua, atrás das serras */}
      <g className="login-clouds" filter="url(#cloudblur)" style={{ opacity: s.cloud }}>
        {CLOUDS.map((c, k) => (
          <ellipse key={k} className="login-cloud" cx={c.x} cy={c.y} rx={c.rx} ry={c.ry} style={{ fill: s.cloudColor, animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }} />
        ))}
      </g>

      {layers.map((l, i) => (
        <g key={i}>
          <path d={l.d} style={{ fill: s.ridges[i] }} />
          {i < 5 && <path d={l.d} fill="url(#mist)" style={{ opacity: s.mist }} />}
          {i === 2 && <Temple x={temple.x} y={temple.y} color={s.ridges[2]} lit={s.moon > 0.5} owl={s.moon > 0.5} />}
          {/* pássaros voam entre a serra do fundo e a seguinte */}
          {i === 0 && s.birds && (s.moon > 0.5 ? <Bats /> : <Birds night={false} />)}
        </g>
      ))}
    </svg>
  )
}

/* ---------- Clima do lugar de quem acessa ----------
   Local aproximado pelo IP (sem pedir permissão) + tempo atual no Open-Meteo (grátis, sem chave).
   Se qualquer etapa falhar, a cena segue só o horário. Em desenvolvimento: /?clima=chuva
   (limpo, nublado, neblina, chuva, tempestade, neve). */
const CLIMA_KEY = 'talis_clima'

function codigoParaClima(code, nuvens) {
  if (code >= 95) return 'tempestade'
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'chuva'
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'neve'
  if (code === 45 || code === 48) return 'neblina'
  if (code === 2 || code === 3 || nuvens >= 60) return 'nublado'
  return 'limpo'
}

async function buscarClima() {
  const loc = await fetch('https://ipwho.is/?fields=success,latitude,longitude').then((r) => r.json())
  if (!loc.success) throw new Error('sem local')
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=weather_code,cloud_cover`
  const w = await fetch(url).then((r) => r.json())
  return codigoParaClima(w.current.weather_code, w.current.cloud_cover)
}

function useClima() {
  const forced = import.meta.env.DEV ? new URLSearchParams(location.search).get('clima') : null
  const [clima, setClima] = useState(() => {
    if (forced) return forced
    try {
      const c = JSON.parse(localStorage.getItem(CLIMA_KEY) || 'null')
      if (c && Date.now() - c.t < 20 * 60_000) return c.v
    } catch {}
    return 'limpo'
  })
  useEffect(() => {
    if (forced) return
    let vivo = true
    try {
      const c = JSON.parse(localStorage.getItem(CLIMA_KEY) || 'null')
      if (c && Date.now() - c.t < 20 * 60_000) return
    } catch {}
    buscarClima()
      .then((v) => {
        if (!vivo) return
        setClima(v)
        try {
          localStorage.setItem(CLIMA_KEY, JSON.stringify({ t: Date.now(), v }))
        } catch {}
      })
      .catch(() => {})
    return () => {
      vivo = false
    }
  }, [])
  return clima
}

// quanto cada clima cobre o céu e o que acontece com sol, estrelas, pássaros e névoa
const CLIMAS = {
  limpo: { cloud: 0, fog: 0, dark: 0 },
  nublado: { cloud: 0.7, fog: 0, dark: 0.3 },
  neblina: { cloud: 0.5, fog: 1, dark: 0.25 },
  chuva: { cloud: 0.92, fog: 0.25, dark: 0.55 },
  tempestade: { cloud: 1, fog: 0.2, dark: 0.75 },
  neve: { cloud: 0.8, fog: 0.5, dark: 0.3 },
}
const cinza = (c, k) => {
  const [r, g, b] = hex(c)
  const l = Math.round(0.3 * r + 0.59 * g + 0.11 * b)
  const alvo = '#' + [l, l, l].map((v) => v.toString(16).padStart(2, '0')).join('')
  return mixHex(c, alvo, k)
}
const escurece = (c, k) => mixHex(c, '#000000', k)

function applyClima(sc, clima) {
  const k = CLIMAS[clima] ?? CLIMAS.limpo
  const noite = sc.moon > 0.5
  const f = (c) => escurece(cinza(c, Math.min(1, k.cloud * 0.8)), k.dark * (noite ? 0.3 : 0.45))
  return {
    ...sc,
    sky: sc.sky.map(f),
    ridges: sc.ridges.map((c) => escurece(cinza(c, k.cloud * 0.5), k.dark * 0.25)),
    mist: Math.min(0.95, sc.mist + k.fog * 0.6),
    sun: sc.sun * (1 - k.cloud * 0.95),
    moon: sc.moon * (1 - k.cloud * 0.85),
    stars: sc.stars * (1 - k.cloud),
    cloud: k.cloud,
    cloudColor: noite ? '#262626' : mixHex('#d6d6d3', '#383838', Math.min(1, k.dark * 1.5)),
    birds: !['chuva', 'tempestade', 'neve'].includes(clima),
  }
}

// nuvens: posições fixas, cada uma à deriva no próprio ritmo
const CLOUDS = [
  { x: 150, y: 150, rx: 330, ry: 62, dur: 70, delay: -10 },
  { x: 520, y: 90, rx: 280, ry: 52, dur: 90, delay: -40 },
  { x: 880, y: 175, rx: 380, ry: 70, dur: 80, delay: -25 },
  { x: 1230, y: 105, rx: 300, ry: 56, dur: 100, delay: -60 },
  { x: 1500, y: 190, rx: 340, ry: 64, dur: 75, delay: -5 },
  { x: 330, y: 250, rx: 260, ry: 46, dur: 110, delay: -50 },
  { x: 1050, y: 270, rx: 300, ry: 50, dur: 95, delay: -30 },
]

/* Chuva, neve e relâmpago: camada por cima da paisagem e por trás do card. */
function Precip({ clima }) {
  const ref = useRef(null)
  const [flash, setFlash] = useState(false)
  const tipo = clima === 'chuva' || clima === 'tempestade' ? 'chuva' : clima === 'neve' ? 'neve' : null
  const forte = clima === 'tempestade'

  useEffect(() => {
    const c = ref.current
    if (!tipo || !c || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = c.getContext('2d')
    let raf
    let W = 0
    let H = 0
    let drops = []
    const novo = (spread) => ({
      x: Math.random() * (W + 200) - 100,
      y: spread ? Math.random() * H : -20 - Math.random() * 100,
      v: tipo === 'chuva' ? 900 + Math.random() * 600 : 40 + Math.random() * 60,
      l: tipo === 'chuva' ? 10 + Math.random() * 16 : 1.2 + Math.random() * 2.2,
      a: 0.22 + Math.random() * 0.45,
      s: Math.random() * Math.PI * 2,
    })
    const ajusta = () => {
      const dpr = Math.min(2, devicePixelRatio || 1)
      W = c.clientWidth
      H = c.clientHeight
      c.width = W * dpr
      c.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.round((W * H) / (tipo === 'chuva' ? (forte ? 1400 : 2300) : 7000))
      drops = Array.from({ length: n }, () => novo(true))
    }
    ajusta()
    const ro = new ResizeObserver(ajusta)
    ro.observe(c)
    let last = performance.now()
    const quadro = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      ctx.clearRect(0, 0, W, H)
      if (tipo === 'chuva') {
        ctx.lineWidth = 1.4
        ctx.lineCap = 'round'
        const vento = forte ? 0.28 : 0.14
        for (const d of drops) {
          d.y += d.v * dt
          d.x += d.v * vento * dt
          if (d.y > H + 20) Object.assign(d, novo(false))
          ctx.strokeStyle = `rgba(214,222,235,${d.a})`
          ctx.beginPath()
          ctx.moveTo(d.x, d.y)
          ctx.lineTo(d.x - d.l * vento, d.y - d.l)
          ctx.stroke()
        }
      } else {
        for (const d of drops) {
          d.y += d.v * dt
          d.s += dt
          d.x += Math.sin(d.s) * 18 * dt
          if (d.y > H + 10) Object.assign(d, novo(false))
          ctx.fillStyle = `rgba(255,255,255,${d.a + 0.25})`
          ctx.beginPath()
          ctx.arc(d.x, d.y, d.l, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      raf = requestAnimationFrame(quadro)
    }
    raf = requestAnimationFrame(quadro)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [tipo, forte])

  // relâmpago: clarão duplo em intervalos irregulares
  useEffect(() => {
    if (!forte || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let t
    const ciclo = () => {
      t = setTimeout(() => {
        setFlash(true)
        setTimeout(() => setFlash(false), 90)
        setTimeout(() => setFlash(true), 190)
        setTimeout(() => setFlash(false), 320)
        ciclo()
      }, 4000 + Math.random() * 9000)
    }
    ciclo()
    return () => clearTimeout(t)
  }, [forte])

  return (
    <>
      {tipo && <canvas ref={ref} className="login-precip" aria-hidden="true" />}
      {forte && <div className={`login-flash ${flash ? 'on' : ''}`} aria-hidden="true" />}
    </>
  )
}

/* ---------- Pássaros ----------
   Bandos em "V" solto cruzando o céu de forma orgânica:
   - as asas mudam de forma (cima → meio → baixo) com SMIL <animate>, como um bater de asa real;
   - de tempos em tempos o pássaro plana (asas abertas paradas);
   - cada pássaro oscila no próprio ritmo dentro do bando;
   - bandos mais distantes são menores, mais lentos e mais claros. */
const WING = {
  up: 'M-13 -8 C-9 -8 -4 -5 0 0 C4 -5 9 -8 13 -8',
  mid: 'M-13 -1 C-9 -4 -4 -4 0 0 C4 -4 9 -4 13 -1',
  down: 'M-12 6 C-8 1 -4 0 0 0 C4 0 8 1 12 6',
  glide: 'M-13 -2 C-9 -3 -4 -2 0 0 C4 -2 9 -3 13 -2',
}
// ciclo: bate 3 vezes e plana um pouco
const FLAP_D = [WING.mid, WING.up, WING.mid, WING.down, WING.mid, WING.up, WING.mid, WING.down, WING.mid, WING.up, WING.mid, WING.down, WING.glide, WING.glide, WING.mid].join(';')
const FLAP_T = '0;0.07;0.14;0.21;0.28;0.35;0.42;0.49;0.56;0.63;0.7;0.77;0.84;0.96;1'

const FLOCKS = [
  { y: 150, dur: 62, delay: -6, scale: 1.25, n: 7, tone: 1 },
  { y: 240, dur: 80, delay: -44, scale: 0.9, n: 5, tone: 0.75 },
  { y: 100, dur: 105, delay: -78, scale: 0.65, n: 4, tone: 0.55 },
]

function Birds({ night }) {
  const flocks = useMemo(() => {
    let seed = 23
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    return FLOCKS.map((f) => ({
      ...f,
      birds: Array.from({ length: f.n }, (_, k) => {
        // formação em V: líder na frente, os outros alternando atrás, em cima e embaixo
        const row = Math.ceil(k / 2)
        const side = k % 2 ? -1 : 1
        return {
          x: -row * 34 + (rnd() - 0.5) * 12,
          y: side * row * 17 + (rnd() - 0.5) * 10,
          s: 0.85 + rnd() * 0.3,
          flap: 2.6 + rnd() * 1.4, // duração do ciclo bater+planar
          begin: -rnd() * 4,
          sway: 3.5 + rnd() * 3, // oscilação própria dentro do bando
          dx: 4 + rnd() * 6,
          dy: 5 + rnd() * 7,
        }
      }),
    }))
  }, [])
  return (
    <g className="birds" style={{ opacity: night ? 0.45 : 0.8 }}>
      {flocks.map((f, i) =>
        night && i > 0 ? null : (
          <g key={i} className="flock" style={{ animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s` }}>
            <g className="flock-bob" style={{ animationDuration: `${9 + i * 3}s`, animationDelay: `${f.delay / 3}s` }}>
              <g transform={`translate(0 ${f.y}) scale(${f.scale})`} style={{ color: night ? '#bfbfbd' : '#262626', stroke: 'currentColor', opacity: f.tone }}>
                {f.birds.map((b, k) => (
                  <g key={k} transform={`translate(${b.x} ${b.y})`}>
                    <g>
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        values={`0 0; ${b.dx} ${-b.dy}; ${-b.dx / 2} ${b.dy / 2}; 0 0`}
                        dur={`${b.sway}s`}
                        begin={`${b.begin}s`}
                        repeatCount="indefinite"
                        calcMode="spline"
                        keySplines="0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1"
                      />
                      <g transform={`scale(${b.s})`}>
                        <path d={WING.mid}>
                          <animate attributeName="d" values={FLAP_D} keyTimes={FLAP_T} dur={`${b.flap}s`} begin={`${b.begin}s`} repeatCount="indefinite" />
                        </path>
                        <ellipse cx="0" cy="0.6" rx="1.6" ry="1.1" className="bird-body" />
                      </g>
                    </g>
                  </g>
                ))}
              </g>
            </g>
          </g>
        ),
      )}
    </g>
  )
}

function Temple({ x, y, color, lit, owl }) {
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
      {owl && <Owl x={x} y={y - 50} />}
    </g>
  )
}

/* ---------- Animais da noite ----------
   Morcegos: voo em zigue-zague pelo céu, batendo as asas rápido.
   Coruja de Atena (símbolo da sabedoria): pousada no alto do templo, olhos acesos que piscam. */
const BAT_UP = 'M0 0 C-3 -2 -6 -9 -14 -10 C-11 -6 -11 -3 -12 0 C-8 -2 -5 -1 -3 1 C-1 3 1 3 3 1 C5 -1 8 -2 12 0 C11 -3 11 -6 14 -10 C6 -9 3 -2 0 0 Z'
const BAT_DOWN = 'M0 0 C-3 1 -7 5 -13 9 C-10 5 -9 3 -10 1 C-7 1 -5 1 -3 1 C-1 3 1 3 3 1 C5 1 7 1 10 1 C9 3 10 5 13 9 C7 5 3 1 0 0 Z'

function Bats() {
  const bats = useMemo(() => {
    let seed = 41
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    return Array.from({ length: 6 }, (_, k) => {
      // caminho em zigue-zague da esquerda para a direita (ou ao contrário), alto no céu
      const ltr = k % 2 === 0
      const pts = []
      const n = 9
      for (let j = 0; j <= n; j++) {
        const x = ltr ? -80 + (j / n) * 1760 : 1680 - (j / n) * 1760
        const y = 70 + rnd() * 230
        pts.push([x, y])
      }
      let d = `M${pts[0][0]} ${pts[0][1]}`
      for (let j = 1; j < pts.length; j++) {
        const [x0, y0] = pts[j - 1]
        const [x1, y1] = pts[j]
        const cx = (x0 + x1) / 2
        d += ` Q${cx} ${Math.min(y0, y1) - 40 - rnd() * 60} ${x1} ${y1}`
      }
      return {
        d,
        dur: 16 + rnd() * 14,
        begin: -rnd() * 30,
        flap: 0.16 + rnd() * 0.08,
        s: 1.3 + rnd() * 0.7,
      }
    })
  }, [])
  return (
    <g className="bats" fill="#1e1e1e" stroke="rgba(233,229,220,.45)" strokeWidth="0.7">
      {bats.map((b, k) => (
        <g key={k}>
          <animateMotion path={b.d} dur={`${b.dur}s`} begin={`${b.begin}s`} repeatCount="indefinite" />
          <g transform={`scale(${b.s})`}>
            <path d={BAT_UP}>
              <animate attributeName="d" values={`${BAT_UP};${BAT_DOWN};${BAT_UP}`} dur={`${b.flap}s`} begin={`${b.begin}s`} repeatCount="indefinite" />
            </path>
          </g>
        </g>
      ))}
    </g>
  )
}

function Owl({ x, y }) {
  // ~12 de largura: corpo, tufos das orelhas, olhos que brilham e piscam de vez em quando
  return (
    <g className="owl" transform={`translate(${x} ${y}) scale(1.7)`}>
      <path d="M-6 -1 C-7 -8 -6 -14 -5 -17 L-3.5 -14 C-1.5 -15 1.5 -15 3.5 -14 L5 -17 C6 -14 7 -8 6 -1 C4 1 -4 1 -6 -1 Z" fill="#0f0f0f" />
      <g className="owl-eyes">
        <circle cx="-2.4" cy="-10" r="1.5" fill="#e9c98a" />
        <circle cx="2.4" cy="-10" r="1.5" fill="#e9c98a" />
      </g>
      <circle cx="-2.4" cy="-10" r="4" fill="#e9c98a" opacity="0.12" />
      <circle cx="2.4" cy="-10" r="4" fill="#e9c98a" opacity="0.12" />
    </g>
  )
}
