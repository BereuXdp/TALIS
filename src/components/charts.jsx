import { useId, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { fmtDay, fmtNum } from '../api.js'
import { ease } from './ui.jsx'

/* Curva suave (Catmull-Rom → Bézier) */
function smooth(pts) {
  if (pts.length < 2) return ''
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const t = 0.18
    d += ` C${p1[0] + (p2[0] - p0[0]) * t},${p1[1] + (p2[1] - p0[1]) * t} ${p2[0] - (p3[0] - p1[0]) * t},${p2[1] - (p3[1] - p1[1]) * t} ${p2[0]},${p2[1]}`
  }
  return d
}

const niceMax = (v) => {
  if (v <= 4) return 4
  const p = 10 ** Math.floor(Math.log10(v))
  return Math.ceil(v / (p / 2)) * (p / 2)
}

/* Gráfico de área: total de mensagens e quanto foi respondido pela IA. */
export function AreaChart({ days, height = 260 }) {
  const W = 760
  const H = height
  const pad = { l: 36, r: 12, t: 16, b: 28 }
  const gid = useId()
  const ref = useRef(null)
  const [hover, setHover] = useState(null)

  const { max, xs, total, ai } = useMemo(() => {
    const max = niceMax(Math.max(1, ...days.map((d) => d.total)))
    const n = days.length
    const xs = days.map((_, i) => pad.l + (n === 1 ? 0 : (i / (n - 1)) * (W - pad.l - pad.r)))
    const y = (v) => pad.t + (1 - v / max) * (H - pad.t - pad.b)
    return {
      max,
      xs,
      total: days.map((d, i) => [xs[i], y(d.total)]),
      ai: days.map((d, i) => [xs[i], y(d.ai)]),
    }
  }, [days, H])

  const base = H - pad.b
  const line = smooth(total)
  const lineAi = smooth(ai)
  const area = `${line} L${xs.at(-1)},${base} L${xs[0]},${base} Z`
  const areaAi = `${lineAi} L${xs.at(-1)},${base} L${xs[0]},${base} Z`
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f))

  function onMove(e) {
    const r = ref.current.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * W
    let best = 0
    xs.forEach((v, i) => Math.abs(v - x) < Math.abs(xs[best] - x) && (best = i))
    setHover(best)
  }

  const h = hover != null ? days[hover] : null
  return (
    <div className="chart">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label="Mensagens por dia"
      >
        <defs>
          <linearGradient id={`${gid}a`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#8C8C8C" stopOpacity="0.28" />
            <stop offset="1" stopColor="#737371" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${gid}b`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#262626" stopOpacity="0.22" />
            <stop offset="1" stopColor="#262626" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="grid axis">
          {ticks.map((t) => {
            const y = pad.t + (1 - t / max) * (H - pad.t - pad.b)
            return (
              <g key={t}>
                <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} strokeDasharray={t ? '3 5' : ''} />
                <text x={pad.l - 10} y={y + 4} textAnchor="end">
                  {t >= 1000 ? `${(t / 1000).toLocaleString('pt-BR')}k` : t}
                </text>
              </g>
            )
          })}
          {days.map((d, i) =>
            i % 2 === 0 || days.length <= 8 ? (
              <text key={d.date} x={xs[i]} y={H - 6} textAnchor="middle">
                {fmtDay(d.date)}
              </text>
            ) : null,
          )}
        </g>
        <motion.path d={area} fill={`url(#${gid}a)`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }} />
        <motion.path d={areaAi} fill={`url(#${gid}b)`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }} />
        <motion.path d={line} fill="none" stroke="#8C8C8C" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease }} />
        <motion.path d={lineAi} fill="none" stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeDasharray="0" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.1, ease }} />
        {h && (
          <g>
            <line x1={xs[hover]} x2={xs[hover]} y1={pad.t} y2={base} stroke="#737371" strokeOpacity="0.35" />
            <circle cx={total[hover][0]} cy={total[hover][1]} r="5" fill="#fff" stroke="#8C8C8C" strokeWidth="2.5" />
            <circle cx={ai[hover][0]} cy={ai[hover][1]} r="4" fill="#fff" stroke="#262626" strokeWidth="2" />
          </g>
        )}
      </svg>
      <AnimatePresence>
        {h && (
          <motion.div
            className="chart-tip"
            style={{ left: `${(xs[hover] / W) * 100}%`, top: `${(total[hover][1] / H) * 100}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <span className="muted" style={{ color: 'rgba(233, 229, 220,.6)' }}>
              {fmtDay(h.date)}
            </span>
            <b className="tnum">{fmtNum(h.total)} mensagens</b>
            <span className="tnum">{fmtNum(h.ai)} pela IA</span>
          </motion.div>
        )}
      </AnimatePresence>
      <table className="sr-only">
        <tbody>
          {days.map((d) => (
            <tr key={d.date}>
              <td>{d.date}</td>
              <td>{d.total}</td>
              <td>{d.ai}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* Linha pequena para os cards de métrica. */
export function Sparkline({ values, color = '#737371', fill = true, height = 48 }) {
  const gid = useId()
  const W = 160
  const H = height
  if (!values?.length) return null
  // Sem dados: só uma linha tracejada discreta, sem área nem ponto.
  if (values.every((v) => !v))
    return (
      <svg viewBox={`0 0 160 ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: H, display: 'block' }} aria-hidden="true">
        <line x1="0" x2="160" y1={H - 4} y2={H - 4} stroke={color} strokeOpacity="0.35" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />
      </svg>
    )
  const max = Math.max(1, ...values)
  const min = Math.min(...values)
  const pts = values.map((v, i) => [(i / Math.max(1, values.length - 1)) * W, 4 + (1 - (v - min) / (max - min || 1)) * (H - 8)])
  const d = smooth(pts)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: H, display: 'block', overflow: 'visible' }} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={`${d} L${W},${H} L0,${H} Z`} fill={`url(#${gid})`} />}
      <motion.path d={d} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease }} />
      <circle cx={pts.at(-1)[0]} cy={pts.at(-1)[1]} r="3.5" fill={color} />
    </svg>
  )
}

/* Anel de progresso (0–1). */
export function Ring({ value, size = 56, stroke = 6, color = '#737371', track = 'rgba(38, 38, 38,.08)', children }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value || 0))
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - v) }}
          transition={{ duration: 1, ease, delay: 0.2 }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600 }}>{children}</div>
    </div>
  )
}

/* Barra empilhada horizontal (status das empresas). */
export function StackBar({ parts }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1
  return (
    <div style={{ display: 'flex', gap: 4, height: 12 }}>
      {parts.map((p, i) =>
        p.value ? (
          <motion.div
            key={p.label}
            style={{ background: p.color, borderRadius: 6, flexBasis: `${(p.value / total) * 100}%`, transformOrigin: 'left' }}
            initial={{ transform: 'scaleX(0)' }}
            animate={{ transform: 'scaleX(1)' }}
            transition={{ duration: 0.7, ease, delay: 0.2 + i * 0.08 }}
          />
        ) : null,
      )}
    </div>
  )
}
