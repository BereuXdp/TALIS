import { useEffect, useState } from 'react'
import { ArrowUpRight, Bot, Building2, MessageCircle, MessagesSquare, Smartphone, UserPlus, Users } from 'lucide-react'
import { api, fmtNum, plural } from '../api.js'
import { Alert, Badge, CountUp, Empty, Item, Page, PageHead } from '../components/ui.jsx'
import { AreaChart, Ring, Sparkline, StackBar } from '../components/charts.jsx'

export default function AdminDashboard() {
  const [d, setD] = useState(null)
  const [top, setTop] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api('/admin/dashboard').then(setD).catch((e) => setError(e.message))
    api('/admin/organizations')
      .then((o) => setTop([...o].sort((a, b) => b.messages30 - a.messages30).slice(0, 5)))
      .catch(() => {})
  }, [])

  if (error) return <Page><Alert>{error}</Alert></Page>
  if (!d)
    return (
      <Page>
        <div className="sk" style={{ height: 60, width: '40%' }} />
        <div className="dash-top">
          {[0, 1, 2, 3].map((i) => <div key={i} className="sk" style={{ height: 170 }} />)}
        </div>
        <div className="sk" style={{ height: 340 }} />
      </Page>
    )

  const aiPct = d.last30.messages ? Math.round((d.last30.aiMessages / d.last30.messages) * 100) : 0
  const series = d.days.map((x) => x.total)
  const half = Math.floor(series.length / 2)
  const prev = series.slice(0, half).reduce((a, b) => a + b, 0)
  const curr = series.slice(half).reduce((a, b) => a + b, 0)
  const delta = prev ? Math.round(((curr - prev) / prev) * 100) : null
  const peak = Math.max(0, ...series)
  const o = d.organizations

  return (
    <Page>
      <PageHead eyebrow="Administração" title="Dashboard da plataforma" text="Visão de todas as empresas que usam o TALIS." />

      <div className="dash-top">
        <Item className="card dark hero-tile">
          <div className="row between">
            <span className="tile-label" style={{ color: 'rgba(233, 229, 220,.7)' }}>
              <span className="ic dark-ic">
                <MessageCircle size={15} />
              </span>
              Mensagens (30 dias)
            </span>
            {delta !== null && (
              <span className="chip-dark tnum">
                <ArrowUpRight size={13} style={{ transform: delta < 0 ? 'rotate(90deg)' : 'none' }} />
                {delta > 0 ? '+' : ''}
                {delta}%
              </span>
            )}
          </div>
          <div className="tile-value" style={{ color: 'var(--cream)', fontSize: 38 }}>
            <CountUp value={d.last30.messages} />
          </div>
          <span className="muted small">{aiPct}% respondidas pela IA</span>
          <div className="hero-spark">
            <Sparkline values={series} color="#BFBFBD" height={70} />
          </div>
        </Item>

        <Tile icon={Building2} label="Empresas" value={o.total} sub={`${plural(o.active, 'ativa', 'ativas')} · ${o.trial} em teste · ${plural(o.blocked, 'bloqueada', 'bloqueadas')}`}>
          <StackBar
            parts={[
              { label: 'Ativas', value: o.active, color: 'var(--c-mid)' },
              { label: 'Em teste', value: o.trial, color: 'var(--c-soft)' },
              { label: 'Bloqueadas', value: o.blocked, color: 'var(--c-total)' },
            ]}
          />
        </Tile>
        <Tile icon={UserPlus} label="Leads novos (30 dias)" value={d.last30.newLeads} sub={`${plural(o.new30, 'empresa nova', 'empresas novas')} no período`}>
          <Sparkline values={d.days.map((x) => x.total - x.ai)} color="var(--c-total)" height={40} />
        </Tile>
        <Tile icon={MessagesSquare} label="Conversas (total)" value={d.conversations} sub={plural(d.users, 'usuário ativo', 'usuários ativos')}>
          <Sparkline values={d.days.map((x) => x.ai)} color="var(--c-mid)" height={40} />
        </Tile>
      </div>

      <div className="dash-mid">
        <Item className="card">
          <div className="card-head">
            <div>
              <h2>Mensagens por dia</h2>
              <p className="small muted">Últimos 14 dias, todas as empresas. Passe o mouse para ver o detalhe.</p>
            </div>
            <div className="legend">
              <span>
                <i style={{ background: 'var(--c-total)' }} />
                Total
              </span>
              <span>
                <i style={{ background: 'var(--c-ai)' }} />
                Pela IA
              </span>
            </div>
          </div>
          {peak > 0 && (
            <div className="small muted tnum" style={{ margin: '6px 0 14px' }}>
              Pico: <b style={{ color: 'var(--text)' }}>{fmtNum(peak)}</b> mensagens/dia
            </div>
          )}
          {peak > 0 ? (
            <AreaChart days={d.days} />
          ) : (
            <Empty icon={MessageCircle} title="Ainda sem mensagens" text="O gráfico aparece quando os números conectados começarem a receber mensagens." />
          )}
        </Item>

        <Item className="card stats-col">
          <h2>Operação</h2>
          <Stat ring={d.instances.total ? d.instances.connected / d.instances.total : 0} icon={Smartphone} label="WhatsApp conectados" value={d.instances.connected} sub={`de ${plural(d.instances.total, 'número criado', 'números criados')}`} />
          <Stat ring={o.total ? d.agentsEnabled / o.total : 0} icon={Bot} label="Agentes ligados" value={d.agentsEnabled} sub={`em ${plural(o.total, 'empresa', 'empresas')}`} color="var(--c-mid)" />
          <Stat ring={aiPct / 100} icon={MessageCircle} label="Respostas da IA" value={d.last30.aiMessages} sub="mensagens em 30 dias" color="var(--c-ai)" />
          <Stat icon={Users} label="Usuários ativos" value={d.users} sub="em todas as empresas" />
        </Item>
      </div>

      <Item className="card top-orgs">
        <div className="card-head">
          <div>
            <h2>Empresas mais ativas</h2>
            <p className="small muted">Últimos 30 dias</p>
          </div>
        </div>
        <div className="top-grid">
          {top.map((t, i) => (
            <div key={t.id} className={`top-card ${i === 0 ? 'first' : ''}`}>
              <div className="row between">
                <span className="rank tnum">#{i + 1}</span>
                <Badge tone={t.agentEnabled ? 'ok' : ''} dot>
                  {t.agentEnabled ? 'Ligado' : 'Desligado'}
                </Badge>
              </div>
              <b className="ellipsis">{t.name}</b>
              <div>
                <span className="top-num tnum">{fmtNum(t.messages30)}</span>
                <span className="tiny"> mensagens</span>
              </div>
              <span className="tiny">{plural(t.connected, 'número conectado', 'números conectados')}</span>
            </div>
          ))}
          {top.length === 0 && <p className="muted small">Nenhuma empresa ainda.</p>}
        </div>
      </Item>
    </Page>
  )
}

function Tile({ icon: Icon, label, value, sub, children }) {
  return (
    <Item className="card tile">
      <span className="tile-label">
        <span className="ic">
          <Icon size={15} />
        </span>
        {label}
      </span>
      <div className="tile-value">
        <CountUp value={value} />
      </div>
      {sub && <span className="tile-sub">{sub}</span>}
      <div style={{ marginTop: 'auto', paddingTop: 14 }}>{children}</div>
    </Item>
  )
}

function Stat({ icon: Icon, label, value, sub, ring, color = 'var(--c-total)', raw }) {
  return (
    <div className="stat">
      <div className="grow">
        <span className="small" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={15} color="var(--rose)" />
          {label}
        </span>
        <span className="tiny muted">{sub}</span>
      </div>
      {ring !== undefined && (
        <Ring value={ring} size={46} stroke={5} color={color}>
          <span className="tiny tnum">{Math.round(ring * 100)}%</span>
        </Ring>
      )}
      <span className="stat-value tnum">{raw ? value : <CountUp value={value} />}</span>
    </div>
  )
}
