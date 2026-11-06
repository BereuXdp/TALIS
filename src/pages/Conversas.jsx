import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Bot, Hand, MessagesSquare, Search, Undo2, UserRound } from 'lucide-react'
import { api } from '../api.js'
import { Avatar, Badge, Empty, Item, Page, PageHead, ease } from '../components/ui.jsx'

const AUTHOR = { LEAD: 'Lead', AI: 'TALIS', SELLER: 'Vendedor' }
const time = (d) => new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
const when = (d) => {
  const date = new Date(d)
  const today = new Date().toDateString() === date.toDateString()
  return today ? time(d) : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export default function Conversas() {
  const [list, setList] = useState(null)
  const [sel, setSel] = useState(null)
  const [msgs, setMsgs] = useState([])
  const [q, setQ] = useState('')
  const end = useRef(null)

  useEffect(() => {
    const load = () => api('/conversations').then(setList).catch(() => {})
    load()
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!sel) return
    setMsgs([])
    const load = () => api(`/conversations/${sel}/messages`).then(setMsgs).catch(() => {})
    load()
    const t = setInterval(load, 3000)
    return () => clearInterval(t)
  }, [sel])

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' })
  }, [msgs.length])

  const conv = list?.find((c) => c.id === sel)
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return list ?? []
    return (list ?? []).filter((c) => `${c.contact.name ?? ''} ${c.contact.phone} ${c.lastMessage?.content ?? ''}`.toLowerCase().includes(s))
  }, [list, q])

  async function setOwner(id, owner) {
    await api(`/conversations/${id}/owner`, { method: 'PATCH', body: { owner } })
    setList((l) => l.map((c) => (c.id === id ? { ...c, owner } : c)))
  }

  return (
    <Page>
      <PageHead eyebrow="Atendimento" title="Conversas" text="Mensagens recebidas pelos números conectados. Atualiza sozinho." />
      <Item className={`chat ${sel ? 'has-sel' : ''}`}>
        <div className="card chat-list">
          <div className="chat-search input-icon">
            <Search size={16} />
            <input className="input" placeholder="Buscar conversa" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="chat-items">
            {list?.length === 0 && (
              <Empty icon={MessagesSquare} title="Nenhuma conversa ainda" text="Mande uma mensagem para o número conectado para testar." />
            )}
            {list?.length > 0 && filtered.length === 0 && <Empty icon={Search} title="Nada encontrado" text={`Nenhuma conversa com “${q}”.`} />}
            {filtered.map((c) => (
              <button key={c.id} className={`chat-item ${sel === c.id ? 'active' : ''}`} onClick={() => setSel(c.id)}>
                {sel === c.id && <motion.span layoutId="chat-active" className="chat-item-bg" transition={{ type: 'spring', duration: 0.35, bounce: 0.1 }} />}
                <Avatar name={c.contact.name ?? '#'} />
                <div className="grow">
                  <div className="row between" style={{ gap: 8, flexWrap: 'nowrap' }}>
                    <b className="ellipsis">{c.contact.name ?? `+${c.contact.phone}`}</b>
                    <span className="tiny muted tnum">{when(c.updatedAt)}</span>
                  </div>
                  <div className="row between" style={{ gap: 8, flexWrap: 'nowrap' }}>
                    <span className="small muted ellipsis">{c.lastMessage?.content ?? '—'}</span>
                    {c.owner === 'HUMAN' ? (
                      <span className="owner-dot human" title="Com vendedor">
                        <UserRound size={11} />
                      </span>
                    ) : (
                      <span className="owner-dot" title="Agente respondendo">
                        <Bot size={11} />
                      </span>
                    )}
                  </div>
                  <span className="tiny muted">{c.instance}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card chat-view">
          {conv ? (
            <>
              <div className="chat-head">
                <button className="btn ghost sm chat-back" onClick={() => setSel(null)} aria-label="Voltar">
                  <ArrowLeft size={16} />
                </button>
                <Avatar name={conv.contact.name ?? '#'} lg />
                <div className="grow">
                  <b>{conv.contact.name ?? 'Sem nome'}</b>
                  <span className="small muted tnum" style={{ display: 'block' }}>
                    +{conv.contact.phone}
                  </span>
                </div>
                <Badge tone={conv.owner === 'AI' ? 'ok' : 'warn'} dot>
                  {conv.owner === 'AI' ? 'Agente respondendo' : 'Com vendedor (IA pausada)'}
                </Badge>
                <button className={`btn sm ${conv.owner === 'AI' ? 'primary' : ''}`} onClick={() => setOwner(conv.id, conv.owner === 'AI' ? 'HUMAN' : 'AI')}>
                  {conv.owner === 'AI' ? (
                    <>
                      <Hand size={14} /> Assumir conversa
                    </>
                  ) : (
                    <>
                      <Undo2 size={14} /> Devolver ao agente
                    </>
                  )}
                </button>
              </div>
              <div className="msgs wa-bg">
                <AnimatePresence initial={false}>
                  {msgs.map((m) => (
                    <motion.div
                      key={m.id}
                      layout="position"
                      className={`msg ${m.direction === 'IN' ? 'in' : m.author === 'AI' ? 'out ai' : 'out'}`}
                      initial={{ opacity: 0, transform: 'translateY(8px)' }}
                      animate={{ opacity: 1, transform: 'translateY(0px)' }}
                      transition={{ duration: 0.25, ease }}
                    >
                      <div className="pre">{m.content}</div>
                      <div className="msg-meta">
                        {m.direction !== 'IN' && (m.author === 'AI' ? <Bot size={11} /> : <UserRound size={11} />)}
                        {AUTHOR[m.author]} · {time(m.createdAt)}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={end} />
              </div>
              <div className="chat-foot small muted">
                {conv.owner === 'AI' ? (
                  <>
                    <Bot size={15} /> O agente está respondendo esta conversa. Assuma para pausar a IA.
                  </>
                ) : (
                  <>
                    <UserRound size={15} /> IA pausada. Responda pelo WhatsApp e devolva ao agente quando terminar.
                  </>
                )}
              </div>
            </>
          ) : (
            <Empty icon={MessagesSquare} title="Selecione uma conversa" text="Escolha um contato na lista para ver as mensagens." />
          )}
        </div>
      </Item>
    </Page>
  )
}
