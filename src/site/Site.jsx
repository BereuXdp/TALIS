import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react'
import {
  ArrowRight, ArrowUpRight, BookOpen, Bot, Clock, Hand, LayoutDashboard, MessageCircle, Minus, Plus, QrCode, Smartphone, Users,
} from 'lucide-react'
import { BRAIN, WORD } from '../brand.js'

// Endereço do painel (login). Em produção, defina VITE_APP_URL (ex.: https://app.talis.com.br).
const APP = import.meta.env.VITE_APP_URL || '/'
const ease = [0.23, 1, 0.32, 1]

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease },
}

export default function Site() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Frieze />
        <Steps />
        <Study />
        <Demo />
        <Features />
        <Name />
        <Faq />
        <Final />
      </main>
      <Footer />
    </>
  )
}

/* ---------- Marca ---------- */
function Logo({ word = true }) {
  return (
    <span className="s-logo" aria-label="TALIS">
      <svg viewBox={`0 0 ${BRAIN.w} ${BRAIN.h}`} fill="currentColor" aria-hidden="true">
        <path d={BRAIN.d} />
      </svg>
      {word && (
        <svg className="s-logo-word" viewBox={`0 0 ${WORD.w} ${WORD.h}`} fill="currentColor" aria-hidden="true">
          <path d={WORD.d} />
        </svg>
      )}
    </span>
  )
}

/* ---------- Navegação ---------- */
function Nav() {
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const h = () => setSolid(scrollY > 24)
    h()
    addEventListener('scroll', h, { passive: true })
    return () => removeEventListener('scroll', h)
  }, [])
  return (
    <header className={`s-nav ${solid ? 'solid' : ''}`}>
      <a href="#topo" className="s-nav-brand">
        <Logo />
      </a>
      <nav className="s-nav-links" aria-label="Seções">
        <a href="#como-funciona">Como funciona</a>
        <a href="#recursos">Recursos</a>
        <a href="#perguntas">Perguntas</a>
      </nav>
      <div className="s-nav-cta">
        <a href={APP} className="s-link">
          Entrar
        </a>
        <a href={`${APP}?cadastro`} className="s-btn sm">
          Começar
        </a>
      </div>
    </header>
  )
}

/* ---------- Hero: TALIS gigante atrás do busto 3D ---------- */
function Hero() {
  const { scrollY } = useScroll()
  const wordY = useTransform(scrollY, [0, 600], [0, 120])
  const bustY = useTransform(scrollY, [0, 600], [0, -60])

  return (
    <section className="s-hero" id="topo">
      <div className="s-hero-beam" aria-hidden="true" />
      <motion.div className="s-hero-word" aria-hidden="true" style={{ y: wordY }}>
        <svg viewBox={`0 0 ${WORD.w} ${WORD.h}`}>
          <path d={WORD.d} />
        </svg>
      </motion.div>

      <motion.div className="s-hero-bust" style={{ y: bustY }} aria-hidden="true">
        <div className="s-halo on" />
        <motion.img
          src="/site/busto.webp"
          alt=""
          className="s-bust-img"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease }}
        />
      </motion.div>

      <div className="s-hero-copy">
        <motion.span className="s-eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.1 }}>
          Agente de IA para WhatsApp
        </motion.span>
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.2 }}>
          A sabedoria de um bom vendedor, <em>no seu WhatsApp.</em>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.32 }}>
          O TALIS atende seus clientes a qualquer hora, responde com o que você cadastrou e chama sua equipe quando a venda precisa de uma pessoa.
        </motion.p>
        <motion.div className="s-hero-cta" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.44 }}>
          <a href={`${APP}?cadastro`} className="s-btn">
            Criar minha conta <ArrowRight size={16} />
          </a>
          <a href="#como-funciona" className="s-btn ghost">
            Ver como funciona
          </a>
        </motion.div>
      </div>

      <div className="s-hero-meta" aria-hidden="true">
        <span>Mileto · séc. VI a.C.</span>
        <span className="s-hero-line" />
        <span>Role para descer</span>
      </div>
    </section>
  )
}

/* ---------- Friso: faixa com grega e palavras ---------- */
const FRIEZE = ['Atende 24 horas', 'Responde com a sua base', 'Passa para o vendedor', 'Vários números', 'Painel com conversas', 'Teste antes de ligar']
function Frieze() {
  return (
    <div className="s-frieze" aria-hidden="true">
      <div className="s-key" />
      <div className="s-marquee">
        <div className="s-marquee-track">
          {[...FRIEZE, ...FRIEZE].map((t, i) => (
            <span key={i}>
              {t} <i>✦</i>
            </span>
          ))}
        </div>
      </div>
      <div className="s-key" />
    </div>
  )
}

/* ---------- Como funciona: I, II, III ---------- */
const STEPS = [
  { n: 'I', icon: QrCode, title: 'Conecte o WhatsApp', text: 'Leia um QR Code com o celular do número de vendas. Pronto: o TALIS passa a receber as mensagens.' },
  { n: 'II', icon: BookOpen, title: 'Ensine o seu negócio', text: 'Cadastre produtos, preços, formas de pagamento, prazos e dúvidas frequentes. O agente só responde com o que estiver ali.' },
  { n: 'III', icon: MessageCircle, title: 'Ele vende por você', text: 'O agente conversa, tira dúvidas e conduz até o pedido. Quando precisa de uma pessoa, passa a conversa para a sua equipe.' },
]
function Steps() {
  return (
    <section className="s-section" id="como-funciona">
      <motion.header className="s-head" {...reveal}>
        <span className="s-eyebrow">Como funciona</span>
        <h2>Três passos, como numa boa aula de lógica.</h2>
      </motion.header>
      <div className="s-steps">
        {STEPS.map((s, i) => (
          <motion.article key={s.n} className="s-step" {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }}>
            <span className="s-step-n">{s.n}</span>
            <s.icon size={22} className="s-step-ic" />
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

/* ---------- Estudo: imagem do filósofo lendo ---------- */
function Study() {
  return (
    <section className="s-study">
      <motion.div className="s-study-img" initial={{ opacity: 0, scale: 1.04 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1.2, ease }}>
        <picture>
          <source media="(max-width: 700px)" srcSet="/site/leitor-900.webp" />
          <img src="/site/leitor.webp" alt="Estátua de filósofo grego de óculos lendo um livro" loading="lazy" />
        </picture>
      </motion.div>
      <motion.div className="s-study-copy" {...reveal}>
        <span className="s-eyebrow">Base de conhecimento</span>
        <h2>Ele estuda o seu negócio antes de falar.</h2>
        <p>
          Preços, estoque, entrega, trocas: tudo o que o agente diz vem da base que você mantém. Nada de inventar desconto ou prometer prazo que não existe.
        </p>
        <ul className="s-checks">
          <li>Atualize um item e o agente já usa na próxima mensagem</li>
          <li>Escreva do seu jeito, em texto simples</li>
          <li>Teste no painel antes de ligar no WhatsApp</li>
        </ul>
      </motion.div>
    </section>
  )
}

/* ---------- Demonstração de conversa ---------- */
const CHAT = [
  { who: 'in', text: 'Oi! Vocês entregam hoje em Fortaleza?' },
  { who: 'out', text: 'Oi! Entregamos sim, para pedidos feitos até 14h. Quer que eu veja algum produto pra você?' },
  { who: 'in', text: 'Quero o kit completo. Aceita PIX?' },
  { who: 'out', text: 'Aceita! O kit sai por R$ 189,90 e no PIX tem 5% de desconto. Posso gerar o pedido?' },
  { who: 'in', text: 'Pode! Mas queria falar com alguém sobre a nota fiscal.' },
  { who: 'note', text: 'Conversa passada para Beatriz (vendedora)' },
]
function Demo() {
  const [n, setN] = useState(0)
  const [play, setPlay] = useState(false)
  useEffect(() => {
    if (!play) return
    const t = setInterval(() => setN((v) => (v >= CHAT.length + 3 ? 0 : v + 1)), 1600)
    return () => clearInterval(t)
  }, [play])
  return (
    <section className="s-section s-demo">
      <motion.div className="s-demo-copy" {...reveal} onViewportEnter={() => setPlay(true)}>
        <span className="s-eyebrow">Na prática</span>
        <h2>Conversa de gente, não de robô.</h2>
        <p>Mensagens curtas, uma pergunta por vez e o nome do cliente quando ele diz. E quando o assunto foge do que o agente sabe, ele avisa sua equipe e pausa.</p>
        <a href={`${APP}?cadastro`} className="s-btn">
          Testar no meu negócio <ArrowRight size={16} />
        </a>
      </motion.div>
      <motion.div className="s-phone" {...reveal}>
        <div className="s-phone-head">
          <span className="s-phone-av">
            <Logo word={false} />
          </span>
          <div>
            <b>Sua loja</b>
            <span>{n < CHAT.length && CHAT[n]?.who === 'out' ? 'digitando…' : 'online'}</span>
          </div>
        </div>
        <div className="s-phone-body">
          <AnimatePresence initial={false}>
            {CHAT.slice(0, Math.min(n, CHAT.length)).map((m, i) => (
              <motion.div
                key={i}
                layout
                className={`s-bubble ${m.who}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', duration: 0.45, bounce: 0.15 }}
              >
                {m.who === 'note' && <Hand size={13} />} {m.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  )
}

/* ---------- Recursos ---------- */
const FEATURES = [
  { icon: Clock, title: 'Atende 24 horas', text: 'Responde de madrugada, no fim de semana e no feriado, sem fila.' },
  { icon: Hand, title: 'Você assume quando quiser', text: 'Um clique pausa a IA naquela conversa. Outro clique devolve.' },
  { icon: Smartphone, title: 'Vários números', text: 'Conecte o número de vendas, o de pós-venda e quantos mais precisar.' },
  { icon: Users, title: 'Equipe com papéis', text: 'Dono, gestor, vendedor e auditor, cada um vendo o que precisa.' },
  { icon: Bot, title: 'Modelos Claude', text: 'Escolha entre mais inteligente, equilibrado ou mais econômico.' },
  { icon: LayoutDashboard, title: 'Tudo num painel', text: 'Conversas, números conectados e configurações do agente em um lugar só.' },
]
function Features() {
  return (
    <section className="s-section" id="recursos">
      <motion.header className="s-head" {...reveal}>
        <span className="s-eyebrow">Recursos</span>
        <h2>O essencial para vender, sem complicação.</h2>
      </motion.header>
      <div className="s-features">
        {FEATURES.map((f, i) => (
          <motion.article key={f.title} className="s-feature" {...reveal} transition={{ ...reveal.transition, delay: (i % 3) * 0.07 }}>
            <span className="s-feature-ic">
              <f.icon size={20} />
            </span>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

/* ---------- Por que TALIS: o busto no feixe de luz ---------- */
function Name() {
  return (
    <section className="s-name">
      <motion.div className="s-name-copy" {...reveal}>
        <span className="s-eyebrow">Por que TALIS</span>
        <h2>Um nome que vem de Tales de Mileto.</h2>
        <p>
          Tales é lembrado como o primeiro filósofo do Ocidente: trocou explicações inventadas por observação. O TALIS segue a mesma ideia nas suas vendas, respondendo com fatos do seu negócio e não com suposições.
        </p>
      </motion.div>
    </section>
  )
}

/* ---------- Perguntas ---------- */
const FAQ = [
  ['Preciso trocar meu número de WhatsApp?', 'Não. Você conecta o número que já usa lendo um QR Code, como no WhatsApp Web.'],
  ['O agente pode inventar preço ou prazo?', 'Ele é instruído a responder só com o que está na sua base de conhecimento. Se não souber, diz que vai verificar e pode chamar sua equipe.'],
  ['Consigo assumir uma conversa?', 'Sim. No painel, “Assumir conversa” pausa a IA naquele cliente. Quando terminar, devolva ao agente.'],
  ['Dá para testar antes de ligar?', 'Sim. O painel tem uma área de teste onde você conversa com o agente como se fosse um cliente.'],
  ['Quem da minha equipe pode usar?', 'Você cria usuários com papéis diferentes: dono, administrador, gestor comercial, vendedor e auditor.'],
]
function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section className="s-section s-faq" id="perguntas">
      <motion.header className="s-head" {...reveal}>
        <span className="s-eyebrow">Perguntas</span>
        <h2>Dúvidas frequentes</h2>
      </motion.header>
      <div className="s-faq-list">
        {FAQ.map(([q, a], i) => (
          <motion.div key={q} className={`s-faq-item ${open === i ? 'open' : ''}`} {...reveal}>
            <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
              <span>{q}</span>
              {open === i ? <Minus size={18} /> : <Plus size={18} />}
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease }} style={{ overflow: 'hidden' }}>
                  <p>{a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* ---------- Chamada final com templo ---------- */
function Final() {
  return (
    <section className="s-final">
      <Temple />
      <motion.div className="s-final-copy" {...reveal}>
        <h2>Coloque um vendedor que nunca dorme no seu WhatsApp.</h2>
        <p>Crie sua conta, conecte o número e ensine o agente. Em poucos minutos ele começa a atender.</p>
        <div className="s-hero-cta center">
          <a href={`${APP}?cadastro`} className="s-btn">
            Criar minha conta <ArrowRight size={16} />
          </a>
          <a href={APP} className="s-btn ghost">
            Já tenho conta <ArrowUpRight size={16} />
          </a>
        </div>
      </motion.div>
    </section>
  )
}

function Temple() {
  // templo dórico em linhas finas, desenhado conforme entra na tela
  const cols = Array.from({ length: 8 }, (_, i) => 70 + i * 66)
  return (
    <motion.svg className="s-temple" viewBox="0 0 600 300" aria-hidden="true" initial="h" whileInView="v" viewport={{ once: true, margin: '-60px' }}>
      {[
        'M300 18 L560 92 L40 92 Z',
        'M30 92 H570 V108 H30 Z',
        'M40 108 H560 V120 H40 Z',
        ...cols.map((x) => `M${x - 10} 120 H${x + 10} V250 H${x - 10} Z`),
        'M30 250 H570 V262 H30 Z',
        'M18 262 H582 V276 H18 Z',
        'M6 276 H594 V290 H6 Z',
      ].map((d, i) => (
        <motion.path key={i} d={d} variants={{ h: { pathLength: 0, opacity: 0 }, v: { pathLength: 1, opacity: 1, transition: { duration: 1.4, delay: i * 0.05, ease } } }} />
      ))}
    </motion.svg>
  )
}

/* ---------- Rodapé ---------- */
function Footer() {
  return (
    <footer className="s-footer">
      <div className="s-key" />
      <div className="s-footer-row">
        <Logo />
        <span>© {new Date().getFullYear()} TALIS · Devmais</span>
      </div>
    </footer>
  )
}
