import { useEffect, useState } from 'react'
import { KeyRound, Plus, UserCheck, UserX, Users } from 'lucide-react'
import { api, fmtDate, plural, ROLE_LIST, ROLES } from '../api.js'
import { Alert, Avatar, Badge, Empty, Item, Menu, Page, PageHead, SkeletonRows, ask, toast } from '../components/ui.jsx'
import UserForm from '../components/UserForm.jsx'

export default function Equipe({ me }) {
  const [team, setTeam] = useState(null)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const canEdit = me.user.role === 'OWNER' || me.user.role === 'ADMIN'
  const roles = me.user.role === 'OWNER' ? ROLE_LIST : ROLE_LIST.filter((r) => r !== 'OWNER')
  const load = () => api('/team').then(setTeam).catch((e) => setError(e.message))
  useEffect(() => {
    load()
  }, [])

  async function patch(u, body) {
    setError('')
    try {
      await api(`/team/${u.id}`, { method: 'PATCH', body })
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

  const active = team?.filter((u) => u.active).length ?? 0

  return (
    <Page>
      <PageHead eyebrow="Pessoas" title="Equipe" text={`Usuários da ${me.user.organization.name}. Vendedores recebem as conversas que o agente passar para humano.`}>
        {canEdit && (
          <button className="btn primary" onClick={() => setAdding(true)}>
            <Plus size={16} /> Adicionar usuário
          </button>
        )}
      </PageHead>

      {error && <Alert>{error}</Alert>}

      <Item className="card table-wrap">
        <div className="card-head">
          <h2>Membros</h2>
          <span className="small muted tnum">
            {plural(active, 'ativo', 'ativos')} de {team?.length ?? 0}
          </span>
        </div>
        {team?.length === 0 ? (
          <Empty icon={Users} title="Ninguém por aqui ainda" />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Papel</th>
                <th>Último acesso</th>
                <th>Status</th>
                {canEdit && <th />}
              </tr>
            </thead>
            <tbody>
              {!team && <SkeletonRows cols={canEdit ? 5 : 4} rows={2} />}
              {team?.map((u) => {
                const self = u.email === me.user.email
                return (
                  <tr key={u.id} className={u.active ? '' : 'dim'}>
                    <td>
                      <div className="person">
                        <Avatar name={u.name} />
                        <div style={{ minWidth: 0 }}>
                          <b>
                            {u.name} {self && <span className="tiny muted">(você)</span>}
                          </b>
                          <span className="ellipsis">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td data-label="Papel">
                      {canEdit && !self ? (
                        <select className="select sm" value={u.role} onChange={(e) => patch(u, { role: e.target.value })} aria-label={`Papel de ${u.name}`}>
                          {(u.role === 'OWNER' ? ROLE_LIST : roles).map((r) => (
                            <option key={r} value={r}>
                              {ROLES[r]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        ROLES[u.role]
                      )}
                    </td>
                    <td className="muted tnum" data-label="Acesso">{fmtDate(u.lastLoginAt, true)}</td>
                    <td data-label="Status">
                      <Badge tone={u.active ? 'ok' : ''} dot>
                        {u.active ? 'Ativo' : 'Desativado'}
                      </Badge>
                    </td>
                    {canEdit && (
                      <td className="actions">
                        <Menu
                          items={[
                            { label: 'Redefinir senha', icon: KeyRound, onClick: () => resetPassword(u) },
                            !self && {
                              label: u.active ? 'Desativar' : 'Reativar',
                              icon: u.active ? UserX : UserCheck,
                              danger: u.active,
                              onClick: () => patch(u, { active: !u.active }),
                            },
                          ]}
                        />
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Item>

      <UserForm
        open={adding}
        roles={roles}
        onCancel={() => setAdding(false)}
        onSubmit={async (body) => {
          await api('/team', { method: 'POST', body })
          setAdding(false)
          load()
          toast('Usuário criado.')
        }}
      />
    </Page>
  )
}
