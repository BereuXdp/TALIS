import { Boxes, Database, Plug, ShoppingBag } from 'lucide-react'
import { Badge, Item, Page, PageHead } from '../components/ui.jsx'

const ITEMS = [
  { icon: Database, title: 'CRM', text: 'Envie leads e oportunidades para o seu CRM automaticamente.' },
  { icon: ShoppingBag, title: 'Sistema de vendas', text: 'Consulte estoque e gere pedidos direto da conversa.' },
  { icon: Boxes, title: 'Outros sistemas', text: 'Conecte por API (token) ou por login e senha.' },
]

export default function Integracoes() {
  return (
    <Page>
      <PageHead
        eyebrow="Conexões"
        title="Integrações"
        text="Conecte seu CRM e o sistema de vendas por API (token) ou login e senha. Essa parte chega na próxima etapa."
      />
      <div className="integrations">
        {ITEMS.map((it) => (
          <Item key={it.title} className="card integration">
            <div className="row between">
              <span className="instance-icon">
                <it.icon size={20} />
              </span>
              <Badge tone="warn">Em construção</Badge>
            </div>
            <h2>{it.title}</h2>
            <p className="muted small">{it.text}</p>
            <button className="btn sm" disabled>
              <Plug size={14} /> Conectar
            </button>
          </Item>
        ))}
      </div>
    </Page>
  )
}
