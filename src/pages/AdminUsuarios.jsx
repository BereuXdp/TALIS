import { useEffect, useState } from 'react'
import { KeyRound, Plus, Search, ShieldCheck, UserCheck, UserX, Users } from 'lucide-react'
import { api, fmtDate, ORG_STATUS, ROLE_LIST, ROLES } from '../api.js'
import { Alert, Avatar, Badge, Empty, Item, Menu, Page, PageHead, SkeletonRows, ask, toast } from '../components/ui.jsx'
import UserForm from '../components/UserForm.jsx'

export default function AdminUsuarios() {
  const [users, setUsers] = useState(null)
  const [orgs, setOrgs] = useState([])
  const [search, setSearch] = useState('')
  const [orgId, setOrgId] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    const p = new URLSearchParams()
    if (search) p.set('search', search)
    if (orgId) p.set('organizationId', orgId)
    return api(`/admin/users?${p}`).then(setUsers).catch((e) => setError(e.message))
  }
  useEffect(() => {
    api('/admin/organizations').then(setOrgs).catch(() => {})
  }, [])
  useEffect(() => {
    load()
  }, [orgId])

  async function patch(u, body) {
    setError('')
    try {
      await api(`/admin/users/${u.id}`, { method: 'PATCH', body })
      load()
      return true
    } catch (err) {
      setError(err.message)
    }
  }

  async function resetPassword(u) {
    const password = await ask.prompt(`Nova senha para ${u.name}`, { text: 'Mínimo de 8 caracteres.', minLength: 8, confirmLabel: 'Redefinir senha' })
    if (password && (await patch(u, { password }))) toast('Senha redefinida.')
  }

  return (
    <Page>
      <PageHead eyebrow="Administração" title="Usuários" text="Usuários de todas as empresas.">
        <button className="btn primary" onClick={() => setAdding(true)} disabled={!orgs.length}>
          <Plus size={16} /> Novo usuário
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
          <input className="input" placeholder="Buscar por nome ou e-mail" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="select" style={{ width: 'auto', minWidth: 200 }} value={orgId} onChange={(e) => setOrgId(e.target.value)} aria-label="Filtrar por empresa">
          <option value="">Todas as empresas</option>
          {orgs.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <button className="btn">Buscar</button>
      </Item>

      {error && <Alert>{error}</Alert>}

      <Item className="card table-wrap wide">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Empresa</th>
              <th>Papel</th>
              <th>Último acesso</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {!users && <SkeletonRows cols={6} />}
            {users?.map((u) => (
              <tr key={u.id} className={u.active ? '' : 'dim'}>
                <td>
                  <div className="person">
                    <Avatar name={u.name} />
                    <div style={{ minWidth: 0 }}>
                      <b>
                        {u.name}{' '}
                        {u.isSuperAdmin && (
                          <span className="badge brand" style={{ height: 20, fontSize: 11, marginLeft: 4 }}>
                            <ShieldCheck size={12} /> Admin da plataforma
                          </span>
                        )}
                      </b>
                      <span className="ellipsis">{u.email}</span>
                    </div>
                  </div>
                </td>
                <td data-label="Empresa">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                    <span>{u.organization.name}</span>
                    <Badge tone={ORG_STATUS[u.organization.status].tone}>{ORG_STATUS[u.organization.status].label}</Badge>
                  </div>
                </td>
                <td data-label="Papel">
                  <select className="select sm" value={u.role} onChange={(e) => patch(u, { role: e.target.value })} aria-label={`Papel de ${u.name}`}>
                    {ROLE_LIST.map((r) => (
                      <option key={r} value={r}>
                        {ROLES[r]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="muted tnum" data-label="Acesso">{fmtDate(u.lastLoginAt, true)}</td>
                <td data-label="Status">
                  <Badge tone={u.active ? 'ok' : ''} dot>
                    {u.active ? 'Ativo' : 'Desativado'}
                  </Badge>
                </td>
                <td className="actions">
                  <Menu
                    items={[
                      { label: 'Redefinir senha', icon: KeyRound, onClick: () => resetPassword(u) },
                      { label: u.active ? 'Desativar' : 'Reativar', icon: u.active ? UserX : UserCheck, danger: u.active, onClick: () => patch(u, { active: !u.active }) },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users?.length === 0 && <Empty icon={Users} title="Nenhum usuário encontrado" />}
      </Item>

      <UserForm
        open={adding}
        roles={ROLE_LIST}
        orgs={orgs}
        onCancel={() => setAdding(false)}
        onSubmit={async (body) => {
          await api('/admin/users', { method: 'POST', body })
          setAdding(false)
          load()
          toast('Usuário criado.')
        }}
      />
    </Page>
  )
}
