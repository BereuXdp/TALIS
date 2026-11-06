import { useState } from 'react'
import { ROLES } from '../api.js'
import { Alert, CloseBtn, Field, Modal } from './ui.jsx'

/* Formulário "Novo usuário" (Equipe e Admin › Usuários). */
export default function UserForm({ open, roles, orgs, onSubmit, onCancel }) {
  return (
    <Modal open={open} onClose={onCancel}>
      {open && <Body roles={roles} orgs={orgs} onSubmit={onSubmit} onCancel={onCancel} />}
    </Modal>
  )
}

function Body({ roles, orgs, onSubmit, onCancel }) {
  const [f, setF] = useState({
    name: '',
    email: '',
    password: '',
    role: roles.includes('SELLER') ? 'SELLER' : roles[0],
    organizationId: orgs?.[0]?.id,
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await onSubmit(f)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="stack" onSubmit={submit}>
      <div className="row between">
        <h2>Novo usuário</h2>
        <CloseBtn onClick={onCancel} />
      </div>
      {orgs && (
        <Field label="Empresa">
          <select className="select" value={f.organizationId} onChange={set('organizationId')} required>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </Field>
      )}
      <Field label="Nome">
        <input className="input" value={f.name} onChange={set('name')} required minLength={2} autoFocus />
      </Field>
      <Field label="E-mail">
        <input className="input" type="email" value={f.email} onChange={set('email')} required />
      </Field>
      <div className="form-grid two">
        <Field label="Senha inicial" aside={<span className="tiny muted">mín. 8</span>}>
          <input className="input" type="text" value={f.password} onChange={set('password')} required minLength={8} />
        </Field>
        <Field label="Papel">
          <select className="select" value={f.role} onChange={set('role')}>
            {roles.map((r) => (
              <option key={r} value={r}>
                {ROLES[r]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {error && <Alert>{error}</Alert>}
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="btn ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button className="btn primary" disabled={busy}>
          {busy ? 'Criando…' : 'Criar usuário'}
        </button>
      </div>
    </form>
  )
}
