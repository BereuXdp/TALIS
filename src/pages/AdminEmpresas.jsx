import { useEffect, useState } from 'react'
import { Ban, Bot, Building2, CheckCircle2, Hourglass, Plus, Search, Smartphone, Users } from 'lucide-react'
import { api, fmtDate, fmtNum, INSTANCE_STATUS, ORG_STATUS, plural, ROLES } from '../api.js'
import { Alert, Avatar, Badge, CloseBtn, Drawer, Empty, Field, Item, Modal, Page, PageHead, SkeletonRows, ask, toast } from '../components/ui.jsx'

export default function AdminEmpresas() {
  const [orgs, setOrgs] = useState(null)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [open, setOpen] = useState(null)
  const [error, setError] = useState('')

  const load = (s = search) =>
    api(`/admin/organizations${s ? `?search=${encodeURIComponent(s)}` : ''}`)
      .then(setOrgs)
      .catch((e) => setError(e.message))
  useEffect(() => {
    load('')
  }, [])

  return (
    <Page>
      <PageHead eyebrow="Administração" title="Empresas" text="Todas as empresas (clientes) da plataforma.">
        <button className="btn primary" onClick={() => setCreating(true)}>
          <Plus size={16} /> Nova empresa
        </button>
      </PageHead>

      <Item
        as="form"
        className="row filters"
        onSubmit={(e) => {
          e.preventDefault()
          load()
        }}
      >
        <div className="input-icon grow">
          <Search size={16} />
          <input className="input" placeholder="Buscar empresa pelo nome" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="btn">Buscar</button>
      </Item>

      {error && <Alert>{error}</Alert>}

      <Item className="card table-wrap wide">
        <table>
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Status</th>
              <th className="num">Usuários</th>
              <th className="num">WhatsApp</th>
              <th className="num">Msgs 30d</th>
              <th>Agente</th>
              <th>Criada em</th>
            </tr>
          </thead>
          <tbody>
            {!orgs && <SkeletonRows cols={7} />}
            {orgs?.map((o) => (
              <tr key={o.id} className="clickable" onClick={() => setOpen(o.id)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setOpen(o.id)}>
                <td>
                  <div className="person">
                    <Avatar name={o.name} />
                    <div style={{ minWidth: 0 }}>
                      <b>{o.name}</b>
                      <span className="ellipsis">{o.owner ? `${o.owner.name} · ${o.owner.email}` : '—'}</span>
                    </div>
                  </div>
                </td>
                <td data-label="Status">
                  <Badge tone={ORG_STATUS[o.status].tone} dot>
                    {ORG_STATUS[o.status].label}
                  </Badge>
                  {o.status === 'TRIAL' && o.trialEndsAt && <div className="tiny muted" style={{ marginTop: 4 }}>até {fmtDate(o.trialEndsAt)}</div>}
                </td>
                <td className="num" data-label="Usuários">{o.users}</td>
                <td className="num" data-label="WhatsApp">
                  {o.connected}/{o.instances}
                </td>
                <td className="num" data-label="Msgs 30d">{fmtNum(o.messages30)}</td>
                <td data-label="Agente">{o.agentEnabled ? <Badge tone="brand">Ligado</Badge> : <span className="muted small">Desligado</span>}</td>
                <td className="muted tnum" data-label="Criada">{fmtDate(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orgs?.length === 0 && <Empty icon={Building2} title="Nenhuma empresa encontrada" text="Tente outro nome na busca." />}
      </Item>

      <NewOrg
        open={creating}
        onCancel={() => setCreating(false)}
        onCreated={() => {
          setCreating(false)
          load()
          toast('Empresa criada.')
        }}
      />
      <Drawer open={!!open} onClose={() => setOpen(null)}>
        {open && <OrgDetail id={open} onClose={() => setOpen(null)} onChanged={() => load()} />}
      </Drawer>
    </Page>
  )
}

function NewOrg({ open, onCancel, onCreated }) {
  const [f, setF] = useState({ company: '', status: 'ACTIVE', ownerName: '', ownerEmail: '', ownerPassword: '' })
  const [error, setError] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  async function submit(e) {
    e.preventDefault()
    setError('')
    try {
      await api('/admin/organizations', { method: 'POST', body: f })
      setF({ company: '', status: 'ACTIVE', ownerName: '', ownerEmail: '', ownerPassword: '' })
      onCreated()
    } catch (err) {
      setError(err.message)
    }
  }
  return (
    <Modal open={open} onClose={onCancel}>
      <form className="stack" onSubmit={submit}>
        <div className="row between">
          <h2>Nova empresa</h2>
          <CloseBtn onClick={onCancel} />
        </div>
        <div className="form-grid two">
          <Field label="Nome da empresa">
            <input className="input" value={f.company} onChange={set('company')} required minLength={2} autoFocus />
          </Field>
          <Field label="Status">
            <select className="select" value={f.status} onChange={set('status')}>
              <option value="ACTIVE">Ativa</option>
              <option value="TRIAL">Em teste (14 dias)</option>
            </select>
          </Field>
        </div>
        <span className="tiny muted" style={{ fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 4 }}>
          Dono da conta
        </span>
        <Field label="Nome do dono">
          <input className="input" value={f.ownerName} onChange={set('ownerName')} required minLength={2} />
        </Field>
        <div className="form-grid two">
          <Field label="E-mail do dono">
            <input className="input" type="email" value={f.ownerEmail} onChange={set('ownerEmail')} required />
          </Field>
          <Field label="Senha inicial">
            <input className="input" type="text" value={f.ownerPassword} onChange={set('ownerPassword')} required minLength={8} />
          </Field>
        </div>
        {error && <Alert>{error}</Alert>}
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn primary">Criar empresa</button>
        </div>
      </form>
    </Modal>
  )
}

function OrgDetail({ id, onClose, onChanged }) {
  const [o, setO] = useState(null)
  const [error, setError] = useState('')
  const load = () => api(`/admin/organizations/${id}`).then(setO).catch((e) => setError(e.message))
  useEffect(() => {
    load()
  }, [id])

  async function setStatus(status) {
    if (status === 'BLOCKED') {
      const ok = await ask.confirm('Bloquear esta empresa?', { text: 'Os usuários perdem o acesso e o agente para de responder.', confirmLabel: 'Bloquear', danger: true })
      if (!ok) return
    }
    setError('')
    try {
      const trialEndsAt = status === 'TRIAL' ? new Date(Date.now() + 14 * 864e5).toISOString() : null
      await api(`/admin/organizations/${id}`, { method: 'PATCH', body: { status, trialEndsAt } })
      load()
      onChanged()
    } catch (err) {
      setError(err.message)
    }
  }

  if (!o)
    return (
      <div className="stack">
        <div className="row between">
          <div className="sk" style={{ height: 32, width: 200 }} />
          <CloseBtn onClick={onClose} />
        </div>
        {error ? <Alert>{error}</Alert> : <div className="sk" style={{ height: 300 }} />}
      </div>
    )

  return (
    <div className="stack" style={{ gap: 22 }}>
      <div className="row between" style={{ alignItems: 'flex-start' }}>
        <div className="person">
          <Avatar name={o.name} lg />
          <div>
            <h2 style={{ fontSize: 22 }}>{o.name}</h2>
            <span className="small muted">Criada em {fmtDate(o.createdAt)}</span>
          </div>
        </div>
        <CloseBtn onClick={onClose} />
      </div>

      <div className="card stack" style={{ gap: 12 }}>
        <div className="row between">
          <Badge tone={ORG_STATUS[o.status].tone} dot>
            {ORG_STATUS[o.status].label}
          </Badge>
          {o.status === 'TRIAL' && <span className="small muted">Teste até {fmtDate(o.trialEndsAt)}</span>}
        </div>
        <div className="row">
          {o.status !== 'ACTIVE' && (
            <button className="btn sm" onClick={() => setStatus('ACTIVE')}>
              <CheckCircle2 size={14} /> Ativar
            </button>
          )}
          {o.status !== 'TRIAL' && (
            <button className="btn sm" onClick={() => setStatus('TRIAL')}>
              <Hourglass size={14} /> Colocar em teste (14 dias)
            </button>
          )}
          {o.status !== 'BLOCKED' && (
            <button className="btn sm danger" onClick={() => setStatus('BLOCKED')}>
              <Ban size={14} /> Bloquear
            </button>
          )}
        </div>
        {error && <Alert>{error}</Alert>}
      </div>

      <section className="detail-sec">
        <h3>
          <Bot size={15} /> Agente
        </h3>
        <p className="small">
          {o.agent ? `${o.agent.name} · ${o.agent.model} · ${o.agent.enabled ? 'ligado' : 'desligado'}` : 'Ainda não configurado'}
        </p>
        <p className="tiny muted">
          {plural(o._count.knowledge, 'item', 'itens')} na base · {plural(o._count.contacts, 'contato', 'contatos')}
        </p>
      </section>

      <section className="detail-sec">
        <h3>
          <Smartphone size={15} /> WhatsApp
        </h3>
        {o.instances.length === 0 && <p className="muted small">Nenhum número.</p>}
        {o.instances.map((i) => (
          <div key={i.id} className="row between small detail-row">
            <span>
              <b>{i.label}</b> <span className="muted tnum">{i.phone ? `+${i.phone}` : 'sem número'}</span>
            </span>
            <Badge tone={INSTANCE_STATUS[i.status]?.tone} dot>
              {INSTANCE_STATUS[i.status]?.label ?? i.status}
            </Badge>
          </div>
        ))}
      </section>

      <section className="detail-sec">
        <h3>
          <Users size={15} /> Usuários
        </h3>
        {o.users.map((u) => (
          <div key={u.id} className={`person detail-row ${u.active ? '' : 'dim'}`}>
            <Avatar name={u.name} />
            <div className="grow" style={{ minWidth: 0 }}>
              <b>{u.name}</b>
              <span className="ellipsis">
                {u.email} · {ROLES[u.role]}
              </span>
            </div>
            <span className="tiny muted tnum" style={{ textAlign: 'right' }}>
              último acesso
              <br />
              {fmtDate(u.lastLoginAt, true)}
            </span>
          </div>
        ))}
      </section>
    </div>
  )
}
