import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AlertTriangle, BookOpen, Bot, Pencil, Plus, RotateCcw, SendHorizontal, Trash2 } from 'lucide-react'
import { api, MODELS } from '../api.js'
import { Alert, Empty, Field, Item, Menu, Page, PageHead, Switch, ask, ease, toast } from '../components/ui.jsx'

export default function Agente() {
  const [agent, setAgent] = useState(null)
  const [models, setModels] = useState([])
  const [llm, setLlm] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api('/agent')
      .then((r) => {
        setAgent(r.agent)
        setModels(r.models)
        setLlm(r.llmConfigured)
      })
      .catch((e) => setError(e.message))
  }, [])

  async function save(e) {
    e?.preventDefault()
    if (!agent) return
    setError('')
    setSaving(true)
    try {
      const { name, prompt, model, enabled, replyDelaySec } = agent
      await api('/agent', { method: 'PUT', body: { name, prompt, model, enabled, replyDelaySec } })
      toast('Configuração do agente salva.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function restore() {
    if (!agent) return
    const ok = await ask.confirm('Restaurar o prompt padrão?', { text: 'O prompt atual será substituído. Você ainda precisa salvar depois.', confirmLabel: 'Restaurar' })
    if (!ok) return
    const { prompt } = await api('/agent/default-prompt')
    setAgent({ ...agent, prompt })
  }

  if (!agent)
    return <Page>{error ? <Alert>{error}</Alert> : <Skeleton />}</Page>

  return (
    <Page>
      <PageHead eyebrow="Inteligência" title="Agente vendedor" text="Configure como o agente vende. Ele usa o prompt, a base de conhecimento e o histórico da conversa como contexto.">
        <div className={`agent-state ${agent.enabled ? 'on' : ''}`}>
          <Switch checked={agent.enabled} onChange={(v) => setAgent({ ...agent, enabled: v })}>
            {agent.enabled ? 'Respondendo no WhatsApp' : 'Desligado no WhatsApp'}
          </Switch>
        </div>
      </PageHead>

      {!llm && (
        <Alert tone="warn" icon={AlertTriangle}>
          Chave da IA não configurada: preencha <code>ANTHROPIC_API_KEY</code> em <code>apps/api/.env</code> e reinicie a API.
        </Alert>
      )}

      <div className="agent-grid">
        <div className="stack" style={{ gap: 20 }}>
          <Item as="form" className="card stack" onSubmit={save}>
            <div className="card-head">
              <h2>Configuração</h2>
              <span className="tiny muted">Salve antes de testar</span>
            </div>
            <div className="form-grid">
              <Field label="Nome do agente">
                <input className="input" value={agent.name} onChange={(e) => setAgent({ ...agent, name: e.target.value })} />
              </Field>
              <Field label="Modelo de IA">
                <select className="select" value={agent.model} onChange={(e) => setAgent({ ...agent, model: e.target.value })}>
                  {models.map((m) => (
                    <option key={m} value={m}>
                      {MODELS[m] ?? m}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Espera (segundos)">
                <input className="input tnum" type="number" min={0} max={60} value={agent.replyDelaySec} onChange={(e) => setAgent({ ...agent, replyDelaySec: Number(e.target.value) })} />
              </Field>
            </div>
            <Field
              label="Prompt (instruções do agente)"
              aside={
                <button type="button" className="btn link small" onClick={restore}>
                  <RotateCcw size={13} /> Restaurar padrão
                </button>
              }
            >
              <textarea className="textarea prompt" rows={16} value={agent.prompt} onChange={(e) => setAgent({ ...agent, prompt: e.target.value })} />
            </Field>
            <div className="row between">
              <span className="tiny muted tnum">{agent.prompt.length.toLocaleString('pt-BR')} caracteres</span>
              <button className="btn primary" disabled={saving}>
                {saving ? 'Salvando…' : 'Salvar configuração'}
              </button>
            </div>
            {error && <Alert>{error}</Alert>}
          </Item>
          <Knowledge />
        </div>
        <Item className="playground-wrap">
          <Playground name={agent.name} />
        </Item>
      </div>
    </Page>
  )
}

function Skeleton() {
  return (
    <div className="stack" aria-label="Carregando…">
      <div className="sk" style={{ height: 70, width: '50%' }} />
      <div className="sk" style={{ height: 420 }} />
    </div>
  )
}

function Knowledge() {
  const [items, setItems] = useState([])
  const [edit, setEdit] = useState(null)
  const [error, setError] = useState('')
  const load = () => api('/knowledge').then(setItems).catch((e) => setError(e.message))
  useEffect(() => {
    load()
  }, [])

  async function save(e) {
    e.preventDefault()
    if (!edit) return
    setError('')
    try {
      const body = { title: edit.title, content: edit.content }
      if (edit.id) await api(`/knowledge/${edit.id}`, { method: 'PUT', body })
      else await api('/knowledge', { method: 'POST', body })
      setEdit(null)
      load()
      toast('Item salvo na base.')
    } catch (err) {
      setError(err.message)
    }
  }

  async function remove(k) {
    const ok = await ask.confirm(`Excluir "${k.title}"?`, { text: 'O agente deixa de usar essa informação.', confirmLabel: 'Excluir', danger: true })
    if (!ok) return
    await api(`/knowledge/${k.id}`, { method: 'DELETE' })
    load()
  }

  return (
    <Item className="card">
      <div className="card-head">
        <h2>Base de conhecimento</h2>
        {!edit && (
          <button className="btn sm" onClick={() => setEdit({ id: '', title: '', content: '' })}>
            <Plus size={15} /> Adicionar
          </button>
        )}
      </div>
      <p className="card-sub">Produtos, preços, formas de pagamento, prazos, FAQ e políticas. O agente só informa o que estiver aqui.</p>

      {items.length === 0 && !edit && <Empty icon={BookOpen} title="Nenhum item ainda" text="Comece pela tabela de preços e pelas formas de pagamento." />}

      <div className="kb-list">
        <AnimatePresence initial={false}>
          {items.map((k) => (
            <motion.div key={k.id} layout className="kb-item" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
              <span className="kb-icon">
                <BookOpen size={16} />
              </span>
              <div className="grow">
                <b>{k.title}</b>
                <div className="small muted ellipsis">{k.content}</div>
              </div>
              <Menu
                items={[
                  { label: 'Editar', icon: Pencil, onClick: () => setEdit(k) },
                  { label: 'Excluir', icon: Trash2, onClick: () => remove(k), danger: true },
                ]}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {edit && (
          <motion.form
            className="stack kb-form"
            onSubmit={save}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease }}
          >
            <div className="stack" style={{ paddingTop: 16 }}>
              <Field label="Título">
                <input className="input" autoFocus value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} placeholder="Ex.: Tabela de preços" required minLength={2} />
              </Field>
              <Field label="Conteúdo">
                <textarea
                  className="textarea"
                  rows={7}
                  value={edit.content}
                  onChange={(e) => setEdit({ ...edit, content: e.target.value })}
                  placeholder={'Ex.: Plano Básico: R$ 99/mês, até 3 usuários\nPlano Pro: R$ 199/mês, usuários ilimitados\nPagamento: PIX, cartão em até 12x'}
                  required
                />
              </Field>
              <div className="row" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn ghost" onClick={() => setEdit(null)}>
                  Cancelar
                </button>
                <button className="btn primary">Salvar item</button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
      {error && <Alert>{error}</Alert>}
    </Item>
  )
}

function Playground({ name }) {
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const end = useRef(null)

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [msgs, busy])

  async function send(e) {
    e.preventDefault()
    if (!text.trim()) return
    const next = [...msgs, { role: 'user', content: text.trim() }]
    setMsgs(next)
    setText('')
    setBusy(true)
    setError('')
    try {
      const r = await api('/agent/test', { method: 'POST', body: { messages: next.map(({ role, content }) => ({ role, content })) } })
      const note = r.handoff ? 'Passaria a conversa para um humano' : r.optOut ? 'Cliente pediu para não receber mensagens' : undefined
      setMsgs([...next, { role: 'assistant', content: r.text || '(sem resposta)', note }])
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="playground">
      <div className="pg-head">
        <span className="avatar" style={{ background: 'var(--rose)', color: 'var(--cream)' }}>
          <Bot size={17} />
        </span>
        <div className="grow">
          <b>Testar {name || 'agente'}</b>
          <span>{busy ? 'digitando…' : 'Converse como se fosse um cliente'}</span>
        </div>
        {msgs.length > 0 && (
          <button className="btn sm pg-clear" onClick={() => setMsgs([])}>
            Limpar
          </button>
        )}
      </div>
      <div className="pg-body">
        {msgs.length === 0 && (
          <div className="pg-hint">
            Usa o prompt e a base salvos.
            <br />
            Experimente: <b>“Oi, quanto custa o plano Pro?”</b>
          </div>
        )}
        <AnimatePresence initial={false}>
          {msgs.map((m, i) => (
            <motion.div
              key={i}
              layout="position"
              className={`bubble ${m.role === 'user' ? 'in' : 'out'}`}
              initial={{ opacity: 0, transform: 'translateY(8px) scale(0.98)' }}
              animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.12 }}
            >
              <div className="pre">{m.content}</div>
              {m.note && <div className="bubble-note">{m.note}</div>}
            </motion.div>
          ))}
        </AnimatePresence>
        {/* Fora do AnimatePresence: some na hora, sem deixar espaço vazio antes da resposta. */}
        {busy && (
          <motion.div className="bubble out typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <i />
            <i />
            <i />
          </motion.div>
        )}
        <div ref={end} />
      </div>
      {error && <div className="pg-error">{error}</div>}
      <form className="pg-input" onSubmit={send}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Mensagem do cliente…" disabled={busy} />
        <button className="pg-send" disabled={busy || !text.trim()} aria-label="Enviar">
          <SendHorizontal size={17} />
        </button>
      </form>
    </div>
  )
}
