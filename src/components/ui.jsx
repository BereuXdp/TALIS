import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, animate, motion, useInView } from 'motion/react'
import { Check, MoreHorizontal, X } from 'lucide-react'
import { initials } from '../api.js'

export const ease = [0.23, 1, 0.32, 1]
export const easeDrawer = [0.32, 0.72, 0, 1]

/* ---------- Página com entrada escalonada ---------- */
const pageV = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const itemV = {
  hidden: { opacity: 0, transform: 'translateY(10px)' },
  show: { opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.32, ease } },
}

export function Page({ children, className = '' }) {
  return (
    <motion.section className={`page ${className}`} variants={pageV} initial="hidden" animate="show">
      {children}
    </motion.section>
  )
}

export function Item({ as = 'div', children, ...rest }) {
  const C = motion[as]
  return (
    <C variants={itemV} {...rest}>
      {children}
    </C>
  )
}

export function PageHead({ eyebrow, title, text, children }) {
  return (
    <Item className="page-head">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
      {children && <div className="row">{children}</div>}
    </Item>
  )
}

/* ---------- Pequenos componentes ---------- */
export const Badge = ({ tone = '', dot, pulse, children }) => (
  <span className={`badge ${tone} ${pulse ? 'pulse' : ''}`}>
    {dot && <span className="dot" />}
    {children}
  </span>
)

export const Avatar = ({ name, lg }) => <span className={`avatar ${lg ? 'lg' : ''}`}>{initials(name)}</span>

export function Empty({ icon: Icon, title, text, children }) {
  return (
    <div className="empty">
      {Icon && (
        <span className="empty-icon">
          <Icon size={22} />
        </span>
      )}
      <b>{title}</b>
      {text && <p>{text}</p>}
      {children}
    </div>
  )
}

export function Field({ label, aside, children, className = '' }) {
  return (
    <label className={`field ${className}`}>
      <span className="field-label">
        {label}
        {aside}
      </span>
      {children}
    </label>
  )
}

export function Switch({ checked, onChange, children }) {
  return (
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={`switch-track ${checked ? 'on' : ''}`}>
        <motion.span layout transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }} className="switch-thumb" />
      </span>
      {children}
    </label>
  )
}

export function Alert({ tone = 'bad', icon: Icon, children }) {
  return (
    <motion.div
      className={`banner ${tone}`}
      initial={{ opacity: 0, transform: 'translateY(-4px)' }}
      animate={{ opacity: 1, transform: 'translateY(0px)' }}
      transition={{ duration: 0.2, ease }}
      role={tone === 'bad' ? 'alert' : 'status'}
    >
      {Icon && <Icon size={18} />}
      <div>{children}</div>
    </motion.div>
  )
}

/* Número que conta até o valor (só na primeira aparição). */
export function CountUp({ value, format = (n) => Math.round(n).toLocaleString('pt-BR') }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView || !ref.current) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return void (ref.current.textContent = format(value))
    const c = animate(0, value, {
      duration: 0.9,
      ease,
      onUpdate: (v) => ref.current && (ref.current.textContent = format(v)),
    })
    return () => c.stop()
  }, [inView, value])
  return (
    <span ref={ref} className="tnum">
      {format(0)}
    </span>
  )
}

/* ---------- Modal e drawer ---------- */
export function Modal({ open, onClose, children, className = '' }) {
  useEscape(open, onClose)
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className={`modal ${className}`}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, transform: 'scale(0.96) translateY(8px)' }}
            animate={{ opacity: 1, transform: 'scale(1) translateY(0px)' }}
            exit={{ opacity: 0, transform: 'scale(0.98) translateY(4px)', transition: { duration: 0.15 } }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.12 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Drawer({ open, onClose, children }) {
  useEscape(open, onClose)
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="overlay drawer-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          <motion.aside
            role="dialog"
            aria-modal="true"
            className="drawer"
            onClick={(e) => e.stopPropagation()}
            initial={{ transform: 'translateX(105%)' }}
            animate={{ transform: 'translateX(0%)' }}
            exit={{ transform: 'translateX(105%)', transition: { duration: 0.22, ease } }}
            transition={{ duration: 0.42, ease: easeDrawer }}
          >
            {children}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const CloseBtn = ({ onClick }) => (
  <button className="btn ghost sm" onClick={onClick} aria-label="Fechar">
    <X size={16} />
  </button>
)

function useEscape(active, fn) {
  useEffect(() => {
    if (!active) return
    const h = (e) => e.key === 'Escape' && fn?.()
    addEventListener('keydown', h)
    return () => removeEventListener('keydown', h)
  }, [active, fn])
}

/* ---------- Menu "⋯" ---------- */
// O menu abre num portal com posição fixa: não é cortado por tabelas com rolagem
// e abre para cima quando não há espaço embaixo.
export function Menu({ items, label = 'Ações' }) {
  const [pos, setPos] = useState(null)
  const open = !!pos
  const ref = useRef(null)
  const menuRef = useRef(null)
  const close = () => setPos(null)
  useEffect(() => {
    if (!open) return
    const h = (e) => !ref.current?.contains(e.target) && !menuRef.current?.contains(e.target) && close()
    const k = (e) => e.key === 'Escape' && close()
    addEventListener('pointerdown', h)
    addEventListener('keydown', k)
    addEventListener('resize', close)
    addEventListener('scroll', close, true)
    return () => {
      removeEventListener('pointerdown', h)
      removeEventListener('keydown', k)
      removeEventListener('resize', close)
      removeEventListener('scroll', close, true)
    }
  }, [open])
  function toggle() {
    if (open) return close()
    const r = ref.current.getBoundingClientRect()
    const up = r.bottom + 150 > innerHeight
    setPos({
      right: Math.max(8, innerWidth - r.right),
      ...(up ? { bottom: innerHeight - r.top + 6 } : { top: r.bottom + 6 }),
      origin: up ? 'bottom right' : 'top right',
    })
  }
  return (
    <div className="menu-wrap" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button className="btn ghost sm" aria-label={label} aria-expanded={open} onClick={toggle}>
        <MoreHorizontal size={18} />
      </button>
      {createPortal(
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            className="menu"
            role="menu"
            style={{ position: 'fixed', top: pos.top ?? 'auto', bottom: pos.bottom ?? 'auto', right: pos.right, transformOrigin: pos.origin }}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, transform: 'scale(0.95)' }}
            animate={{ opacity: 1, transform: 'scale(1)' }}
            exit={{ opacity: 0, transform: 'scale(0.97)', transition: { duration: 0.1 } }}
            transition={{ duration: 0.16, ease }}
          >
            {items.filter(Boolean).map(({ label, icon: Icon, onClick, danger }) => (
              <button
                key={label}
                role="menuitem"
                className={danger ? 'danger' : ''}
                onClick={() => {
                  close()
                  onClick()
                }}
              >
                {Icon && <Icon size={15} />}
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
      )}
    </div>
  )
}

/* ---------- Store simples para toasts e diálogos ---------- */
function createStore(init) {
  let state = init
  const subs = new Set()
  return {
    get: () => state,
    set: (fn) => {
      state = fn(state)
      subs.forEach((s) => s())
    },
    sub: (fn) => (subs.add(fn), () => subs.delete(fn)),
  }
}

const toastStore = createStore([])
export function toast(text) {
  const id = Math.random()
  toastStore.set((t) => [...t, { id, text }])
  setTimeout(() => toastStore.set((t) => t.filter((x) => x.id !== id)), 3200)
}

export function Toaster() {
  const items = useSyncExternalStore(toastStore.sub, toastStore.get)
  return (
    <div className="toasts" aria-live="polite">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            layout
            className="toast"
            initial={{ opacity: 0, transform: 'translateY(16px) scale(0.97)' }}
            animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
            exit={{ opacity: 0, transform: 'translateY(8px) scale(0.98)', transition: { duration: 0.18 } }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
          >
            <Check size={16} />
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/* Substitui confirm() e prompt() do navegador. */
const dialogStore = createStore(null)
export const ask = {
  confirm: (title, { text, confirmLabel = 'Confirmar', danger } = {}) =>
    new Promise((resolve) => dialogStore.set(() => ({ kind: 'confirm', title, text, confirmLabel, danger, resolve }))),
  prompt: (title, { text, placeholder, confirmLabel = 'Continuar', minLength, type = 'text' } = {}) =>
    new Promise((resolve) =>
      dialogStore.set(() => ({ kind: 'prompt', title, text, placeholder, confirmLabel, minLength, type, resolve })),
    ),
}

export function Dialogs() {
  const d = useSyncExternalStore(dialogStore.sub, dialogStore.get)
  const [value, setValue] = useState('')
  useEffect(() => setValue(''), [d])
  const close = (result) => {
    d?.resolve(result)
    dialogStore.set(() => null)
  }
  return (
    <Modal open={!!d} onClose={() => close(d?.kind === 'prompt' ? null : false)}>
      {d && (
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault()
            close(d.kind === 'prompt' ? value : true)
          }}
        >
          <h2>{d.title}</h2>
          {d.text && <p className="muted">{d.text}</p>}
          {d.kind === 'prompt' && (
            <input
              className="input"
              autoFocus
              type={d.type}
              placeholder={d.placeholder}
              value={value}
              minLength={d.minLength}
              required
              onChange={(e) => setValue(e.target.value)}
            />
          )}
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn ghost" onClick={() => close(d.kind === 'prompt' ? null : false)}>
              Cancelar
            </button>
            <button className={`btn primary ${d.danger ? 'danger-solid' : ''}`} autoFocus={d.kind === 'confirm'}>
              {d.confirmLabel}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}

/* Linhas de carregamento: a tabela já abre com a altura certa, sem "pular". */
export function SkeletonRows({ cols, rows = 3 }) {
  return Array.from({ length: rows }, (_, i) => (
    <tr key={`sk${i}`} aria-hidden="true">
      {Array.from({ length: cols }, (_, j) => (
        <td key={j}>
          <div className="sk sk-row" style={{ width: j === 0 ? '70%' : '50%' }} />
        </td>
      ))}
    </tr>
  ))
}
