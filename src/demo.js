// Dados fictícios para ver o design sem conta real (só em desenvolvimento).
const now = Date.now()
const ago = (min) => new Date(now - min * 60000).toISOString()
const wait = (ms = 220) => new Promise((r) => setTimeout(r, ms))
let seq = 100
const id = () => `d${++seq}`

const org = { id: 'o1', name: 'Loja Aurora', status: 'TRIAL', trialEndsAt: new Date(now + 9 * 864e5).toISOString() }
const me = {
  user: { id: 'u1', name: 'Gabriel', email: 'gabriel@aurora.com.br', role: 'OWNER', isSuperAdmin: true, organization: org },
  evolutionConfigured: true,
}

const instances = [
  { id: 'i1', label: 'Vendas', phone: '5585999120044', profileName: 'Aurora Vendas', status: 'CONNECTED' },
  { id: 'i2', label: 'Pós-venda', phone: null, profileName: null, status: 'CONNECTING' },
]

const contacts = [
  ['Mariana Lopes', '5585988110022', 'Perfeito! Pode me mandar o link do PIX?', 3, 'AI'],
  ['Carlos Eduardo', '5585997413388', 'Vocês entregam em Fortaleza no mesmo dia?', 18, 'AI'],
  [null, '5511994021175', 'Quero falar com alguém da loja', 46, 'HUMAN'],
  ['Juliana Prado', '5521988004411', 'Obrigada, vou pensar e te aviso', 130, 'AI'],
  ['Rafael Nunes', '5585996302214', 'Tem o modelo em preto?', 380, 'AI'],
]
const conversations = contacts.map(([name, phone, last, min, owner], i) => ({
  id: `c${i + 1}`,
  contact: { name, phone },
  lastMessage: { content: last },
  instance: 'Vendas',
  updatedAt: ago(min),
  owner,
}))
const messages = {
  c1: [
    ['IN', 'LEAD', 'Oi! Vi o anúncio do kit skincare, ainda tem?', 14],
    ['OUT', 'AI', 'Oi, Mariana! Tem sim 😊 O Kit Aurora sai por R$ 189,90 e vem com sérum, hidratante e protetor. Quer que eu reserve um pra você?', 13],
    ['IN', 'LEAD', 'Quero! Aceita PIX?', 8],
    ['OUT', 'AI', 'Aceita sim, e no PIX tem 5% de desconto: fica R$ 180,40. Posso gerar o pedido?', 7],
    ['IN', 'LEAD', 'Perfeito! Pode me mandar o link do PIX?', 3],
  ],
  c3: [
    ['IN', 'LEAD', 'Boa tarde, comprei semana passada e não chegou', 60],
    ['OUT', 'AI', 'Sinto muito pela demora! Vou chamar alguém da equipe pra verificar seu pedido agora.', 59],
    ['OUT', 'SELLER', 'Oi! Aqui é a Bia, da Aurora. Me passa o número do pedido?', 50],
    ['IN', 'LEAD', 'Quero falar com alguém da loja', 46],
  ],
}
const msgs = (cid) =>
  (messages[cid] ?? [['IN', 'LEAD', conversations.find((c) => c.id === cid)?.lastMessage.content ?? 'Oi', 5]]).map(
    ([direction, author, content, min], i) => ({ id: `${cid}m${i}`, direction, author, content, createdAt: ago(min) }),
  )

const agent = {
  name: 'Aurora',
  model: 'claude-sonnet-5-5',
  enabled: true,
  replyDelaySec: 4,
  prompt:
    'Você é a Aurora, assistente de vendas da Loja Aurora, e atende clientes pelo WhatsApp.\n\nSeu objetivo é entender o que o cliente procura, mostrar o produto certo e conduzir a conversa até o pedido.\n\nComo conversar:\n- Mensagens curtas (1 a 3 frases), tom cordial e natural.\n- Faça uma pergunta por vez.\n- Nunca invente preço ou prazo: use só a base de conhecimento.',
}
const knowledge = [
  { id: 'k1', title: 'Tabela de preços', content: 'Kit Aurora: R$ 189,90 · Sérum: R$ 79,90 · Hidratante: R$ 59,90 · Protetor: R$ 69,90' },
  { id: 'k2', title: 'Pagamento e entrega', content: 'PIX com 5% de desconto, cartão em até 6x sem juros. Entrega em Fortaleza no mesmo dia para pedidos até 14h.' },
  { id: 'k3', title: 'Trocas', content: 'Troca em até 7 dias com produto lacrado.' },
]

const team = [
  { id: 'u1', name: 'Gabriel', email: 'gabriel@aurora.com.br', role: 'OWNER', active: true, lastLoginAt: ago(2) },
  { id: 'u2', name: 'Beatriz Sales', email: 'bia@aurora.com.br', role: 'SELLER', active: true, lastLoginAt: ago(50) },
  { id: 'u3', name: 'Tiago Moura', email: 'tiago@aurora.com.br', role: 'MANAGER', active: true, lastLoginAt: ago(1500) },
  { id: 'u4', name: 'Paula Reis', email: 'paula@aurora.com.br', role: 'AUDITOR', active: false, lastLoginAt: ago(40000) },
]

const days = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(now - (13 - i) * 864e5).toISOString().slice(0, 10)
  const total = Math.round(220 + i * 18 + Math.sin(i * 1.3) * 70 + (i % 4) * 25)
  return { date: d, total, ai: Math.round(total * (0.78 + Math.sin(i) * 0.06)) }
})

const orgs = [
  ['Loja Aurora', 'TRIAL', 2, 1, 2, 4210, true, 'Gabriel', 'gabriel@aurora.com.br'],
  ['Ótica Visão Clara', 'ACTIVE', 5, 2, 2, 3184, true, 'Renata Lima', 'renata@visaoclara.com'],
  ['Pet Mundo', 'ACTIVE', 3, 1, 1, 1902, true, 'André Costa', 'andre@petmundo.com'],
  ['Barbearia Navalha', 'ACTIVE', 2, 1, 1, 880, false, 'Lucas Silva', 'lucas@navalha.com'],
  ['Studio Pilates Ser', 'BLOCKED', 1, 0, 1, 0, false, 'Fernanda Rocha', 'fe@ser.com'],
].map(([name, status, users, connected, inst, m30, agentEnabled, on, oe], i) => ({
  id: `o${i + 1}`,
  name,
  status,
  trialEndsAt: status === 'TRIAL' ? org.trialEndsAt : null,
  users,
  connected,
  instances: inst,
  messages30: m30,
  agentEnabled,
  owner: { name: on, email: oe },
  createdAt: ago(60 * 24 * (40 - i * 7)),
}))

const allUsers = [
  ...team.map((u) => ({ ...u, isSuperAdmin: u.id === 'u1', organization: { id: 'o1', name: 'Loja Aurora', status: 'TRIAL' } })),
  { id: 'u9', name: 'Renata Lima', email: 'renata@visaoclara.com', role: 'OWNER', active: true, lastLoginAt: ago(300), organization: { id: 'o2', name: 'Ótica Visão Clara', status: 'ACTIVE' } },
  { id: 'u10', name: 'André Costa', email: 'andre@petmundo.com', role: 'OWNER', active: true, lastLoginAt: ago(4000), organization: { id: 'o3', name: 'Pet Mundo', status: 'ACTIVE' } },
]

export async function demoApi(path, { method = 'GET', body } = {}) {
  await wait()
  const [p, qs] = path.split('?')
  const q = new URLSearchParams(qs)
  const seg = p.split('/').filter(Boolean)

  if (p === '/me') return me
  if (p === '/instances' && method === 'GET') return instances
  if (p === '/instances' && method === 'POST') {
    const inst = { id: id(), label: body.label, phone: null, status: 'CONNECTING' }
    instances.push(inst)
    return inst
  }
  if (seg[0] === 'instances') {
    const inst = instances.find((i) => i.id === seg[1])
    if (seg[2] === 'status') return { status: inst.status }
    if (seg[2] === 'qrcode') return { qrcode: QR, pairingCode: 'TL4S-9K2M' }
    if (seg[2] === 'logout') return (inst.status = 'DISCONNECTED'), {}
    if (seg[2] === 'send-test') return {}
  }
  if (p === '/conversations') return conversations
  if (seg[0] === 'conversations' && seg[2] === 'messages') return msgs(seg[1])
  if (seg[0] === 'conversations' && seg[2] === 'owner') {
    conversations.find((c) => c.id === seg[1]).owner = body.owner
    return {}
  }
  if (p === '/agent' && method === 'GET') return { agent, models: Object.keys(MODELS_KEYS), llmConfigured: true }
  if (p === '/agent' && method === 'PUT') return Object.assign(agent, body), { agent }
  if (p === '/agent/default-prompt') return { prompt: agent.prompt }
  if (p === '/agent/test') {
    await wait(900)
    const last = body.messages.at(-1).content.toLowerCase()
    const text = /pre[cç]o|quanto|valor/.test(last)
      ? 'O Kit Aurora sai por R$ 189,90, e no PIX tem 5% de desconto. Quer que eu reserve um pra você?'
      : /humano|atendente|pessoa/.test(last)
        ? 'Claro! Vou chamar alguém da equipe pra continuar com você.'
        : 'Oi! Sou a Aurora, da Loja Aurora 😊 Me conta o que você está procurando?'
    return { text, handoff: /humano|atendente|pessoa/.test(last), optOut: false }
  }
  if (p === '/knowledge' && method === 'GET') return knowledge
  if (p === '/knowledge' && method === 'POST') return knowledge.push({ id: id(), ...body }), {}
  if (seg[0] === 'knowledge') {
    const i = knowledge.findIndex((k) => k.id === seg[1])
    if (method === 'PUT') Object.assign(knowledge[i], body)
    if (method === 'DELETE') knowledge.splice(i, 1)
    return {}
  }
  if (p === '/team' && method === 'GET') return team
  if (p === '/team' && method === 'POST') return team.push({ id: id(), ...body, active: true, lastLoginAt: null }), {}
  if (seg[0] === 'team') return Object.assign(team.find((u) => u.id === seg[1]), body), {}

  if (p === '/admin/dashboard')
    return {
      organizations: { total: 5, active: 3, trial: 1, blocked: 1, new30: 2 },
      instances: { connected: 5, total: 7 },
      agentsEnabled: 3,
      last30: { messages: 10176, aiMessages: 8243, newLeads: 412 },
      users: 13,
      conversations: 1288,
      days,
    }
  if (p === '/admin/organizations' && method === 'GET') {
    const s = (q.get('search') ?? '').toLowerCase()
    return orgs.filter((o) => o.name.toLowerCase().includes(s))
  }
  if (p === '/admin/organizations' && method === 'POST')
    return orgs.push({ id: id(), name: body.company, status: body.status, users: 1, connected: 0, instances: 0, messages30: 0, agentEnabled: false, owner: { name: body.ownerName, email: body.ownerEmail }, createdAt: new Date().toISOString() }), {}
  if (seg[0] === 'admin' && seg[1] === 'organizations') {
    const o = orgs.find((x) => x.id === seg[2])
    if (method === 'PATCH') return Object.assign(o, body), {}
    return {
      ...o,
      agent: o.agentEnabled ? { name: 'Aurora', model: 'claude-sonnet-5-5', enabled: true } : null,
      _count: { knowledge: 3, contacts: 214 },
      instances: instances.map((i) => ({ ...i })),
      users: allUsers.filter((u) => u.organization.name === o.name),
    }
  }
  if (p === '/admin/users' && method === 'GET') {
    const s = (q.get('search') ?? '').toLowerCase()
    const oid = q.get('organizationId')
    return allUsers.filter((u) => (!oid || u.organization.id === oid) && (u.name + u.email).toLowerCase().includes(s))
  }
  if (p === '/admin/users' && method === 'POST') return {}
  if (seg[0] === 'admin' && seg[1] === 'users') return Object.assign(allUsers.find((u) => u.id === seg[2]), body), {}
  return {}
}

const MODELS_KEYS = { 'claude-opus-5-5': 1, 'claude-sonnet-5-5': 1, 'claude-haiku-5-5': 1 }

// QR de exemplo (padrão gerado, não é um QR real).
const QR = (() => {
  const n = 25
  let r = ''
  let s = 7
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const finder = (a, b) => x >= a && x < a + 7 && y >= b && y < b + 7
      let on
      if (finder(0, 0) || finder(n - 7, 0) || finder(0, n - 7)) {
        const fx = x < 7 ? x : x - (n - 7)
        const fy = y < 7 ? y : y - (n - 7)
        on = fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx > 1 && fx < 5 && fy > 1 && fy < 5)
      } else {
        s = (s * 9301 + 49297) % 233280
        on = s / 233280 > 0.52
      }
      if (on) r += `<rect x="${x}" y="${y}" width="1" height="1"/>`
    }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${n + 4} ${n + 4}" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/><g fill="#262626">${r}</g></svg>`
  return `data:image/svg+xml;base64,${btoa(svg)}`
})()
