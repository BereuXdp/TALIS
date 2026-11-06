import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, LogOut, Plus, QrCode, Send, Smartphone } from 'lucide-react'
import { api, INSTANCE_STATUS } from '../api.js'
import { Alert, Badge, CloseBtn, Empty, Item, Menu, Modal, Page, PageHead, ask, ease, toast } from '../components/ui.jsx'

export default function WhatsApp() {
  const [list, setList] = useState(null)
  const [label, setLabel] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [qr, setQr] = useState(null)

  const load = useCallback(() => api('/instances').then(setList).catch((e) => setError(e.message)), [])
  useEffect(() => {
    api('/instances')
      .then((l) => Promise.allSettled(l.map((i) => api(`/instances/${i.id}/status`))))
      .finally(load)
  }, [load])

  async function create(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const inst = await api('/instances', { method: 'POST', body: { label } })
      setLabel('')
      await load()
      setQr(inst)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function sendTest(inst) {
    const number = await ask.prompt('Enviar mensagem de teste', {
      text: 'Para qual número? Use DDI e DDD, só dígitos.',
      placeholder: '5585999999999',
      confirmLabel: 'Enviar teste',
      type: 'tel',
    })
    if (!number) return
    setError('')
    try {
      await api(`/instances/${inst.id}/send-test`, {
        method: 'POST',
        body: { number: number.replace(/\D/g, ''), text: 'Teste do TALIS: se você recebeu esta mensagem, o envio está funcionando.' },
      })
      toast('Mensagem enviada. Confira no WhatsApp do destino.')
    } catch (err) {
      setError(err.message)
    }
  }

  async function logout(inst) {
    const ok = await ask.confirm(`Desconectar "${inst.label}"?`, {
      text: 'O agente para de responder por este número até você ler o QR Code de novo.',
      confirmLabel: 'Desconectar', danger: true,
    })
    if (!ok) return
    try {
      await api(`/instances/${inst.id}/logout`, { method: 'POST' })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Page>
      <PageHead
        eyebrow="Canais"
        title="WhatsApp"
        text="Conecte o número que o agente vai usar para vender. A instância é criada na Evolution do TALIS."
      />

      <Item as="form" className="card connect" onSubmit={create}>
        <span className="connect-icon">
          <Smartphone size={22} />
        </span>
        <div className="grow">
          <h2>Conectar um número</h2>
          <p className="muted small">Dê um nome para identificar o número, depois leia o QR Code no celular.</p>
        </div>
        <div className="row connect-form">
          <input className="input" placeholder="Nome do número (ex.: Vendas)" value={label} onChange={(e) => setLabel(e.target.value)} required minLength={2} />
          <button className="btn primary" disabled={busy}>
            <Plus size={16} />
            {busy ? 'Criando…' : 'Conectar WhatsApp'}
          </button>
        </div>
      </Item>

      {error && <Alert>{error}</Alert>}

      <Item className="instances">
        {list?.length === 0 && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <Empty icon={Smartphone} title="Nenhum número conectado ainda" text="Conecte o primeiro número acima para o agente começar a atender." />
          </div>
        )}
        <AnimatePresence initial={false}>
          {list?.map((i) => {
            const st = INSTANCE_STATUS[i.status] ?? INSTANCE_STATUS.CREATED
            const connected = i.status === 'CONNECTED'
            return (
              <motion.div
                key={i.id}
                layout
                className={`card instance ${connected ? 'on' : ''}`}
                initial={{ opacity: 0, transform: 'scale(0.97)' }}
                animate={{ opacity: 1, transform: 'scale(1)' }}
                transition={{ duration: 0.25, ease }}
              >
                <div className="row between" style={{ alignItems: 'flex-start' }}>
                  <span className="instance-icon">
                    <Smartphone size={20} />
                  </span>
                  <Menu
                    items={[
                      !connected && { label: 'Ler QR Code', icon: QrCode, onClick: () => setQr(i) },
                      connected && { label: 'Enviar teste', icon: Send, onClick: () => sendTest(i) },
                      connected && { label: 'Desconectar', icon: LogOut, onClick: () => logout(i), danger: true },
                    ]}
                  />
                </div>
                <div>
                  <h2>{i.label}</h2>
                  <p className="muted small tnum">
                    {i.phone ? `+${i.phone}${i.profileName ? ` · ${i.profileName}` : ''}` : 'Número ainda não lido'}
                  </p>
                </div>
                <div className="row between">
                  <Badge tone={st.tone} dot pulse={i.status === 'CONNECTING'}>
                    {st.label}
                  </Badge>
                  {!connected ? (
                    <button className="btn sm primary" onClick={() => setQr(i)}>
                      <QrCode size={15} /> Ler QR Code
                    </button>
                  ) : (
                    <button className="btn sm" onClick={() => sendTest(i)}>
                      <Send size={14} /> Enviar teste
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </Item>

      <QrModal
        inst={qr}
        onClose={() => {
          setQr(null)
          load()
        }}
      />
    </Page>
  )
}

function QrModal({ inst, onClose }) {
  return (
    <Modal open={!!inst} onClose={onClose} className="qr-modal">
      {inst && <QrBody inst={inst} onClose={onClose} />}
    </Modal>
  )
}

function QrBody({ inst, onClose }) {
  const [qr, setQr] = useState(null)
  const [code, setCode] = useState(null)
  const [status, setStatus] = useState(inst.status)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    const getQr = () =>
      api(`/instances/${inst.id}/qrcode`)
        .then((r) => alive && (setQr(r.qrcode), setCode(r.pairingCode)))
        .catch((e) => alive && setError(e.message))
    const getStatus = () =>
      api(`/instances/${inst.id}/status`)
        .then((r) => alive && setStatus(r.status))
        .catch(() => {})
    getQr()
    const a = setInterval(getQr, 30000)
    const b = setInterval(getStatus, 3000)
    return () => {
      alive = false
      clearInterval(a)
      clearInterval(b)
    }
  }, [inst.id])

  useEffect(() => {
    if (status === 'CONNECTED') {
      const t = setTimeout(onClose, 1500)
      return () => clearTimeout(t)
    }
  }, [status, onClose])

  return (
    <div className="stack">
      <div className="row between">
        <h2>Conectar “{inst.label}”</h2>
        <CloseBtn onClick={onClose} />
      </div>
      {status === 'CONNECTED' ? (
        <motion.div className="qr-success" initial={{ opacity: 0, transform: 'scale(0.95)' }} animate={{ opacity: 1, transform: 'scale(1)' }} transition={{ type: 'spring', duration: 0.4, bounce: 0.25 }}>
          <CheckCircle2 size={44} />
          <b>WhatsApp conectado!</b>
        </motion.div>
      ) : error ? (
        <Alert>{error}</Alert>
      ) : (
        <>
          <div className="qr-frame">
            {qr ? (
              <motion.img
                key={qr}
                className="qr"
                src={qr.startsWith('data:') ? qr : `data:image/png;base64,${qr}`}
                alt="QR Code"
                initial={{ opacity: 0, filter: 'blur(6px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.3 }}
              />
            ) : (
              <div className="qr-loading">Gerando QR Code…</div>
            )}
          </div>
          <ol className="steps">
            <li>Abra o WhatsApp no celular</li>
            <li>
              Toque em <b>Dispositivos conectados → Conectar dispositivo</b>
            </li>
            <li>Aponte a câmera para este QR Code</li>
          </ol>
          {code && (
            <p className="muted small" style={{ textAlign: 'center' }}>
              Ou use o código <b className="pair-code">{code}</b>
            </p>
          )}
        </>
      )}
    </div>
  )
}
