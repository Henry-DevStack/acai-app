import { useEffect, useState } from 'react'
import { CheckCircle2, ChefHat, ClipboardList, PartyPopper } from 'lucide-react'
import { Link } from 'react-router-dom'
import BottomNav from '../../components/BottomNav'
import Screen from '../../components/Screen'
import { ErrorMessage, Loading } from '../../components/Feedback'
import { useCart } from '../../context/CartContext'
import { api } from '../../services/api'
import { brl } from '../../utils/menu'

const steps = [
  { status: 'RECEBIDO', label: 'Recebido', hint: 'A loja já recebeu seu pedido.', icon: ClipboardList },
  { status: 'PRONTO', label: 'Pronto', hint: 'Pode retirar no balcão!', icon: ChefHat },
  { status: 'ENTREGUE', label: 'Entregue', hint: 'Bom apetite!', icon: PartyPopper },
]

export default function OrderPage() {
  const { lastOrderId } = useCart()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!lastOrderId) return
    const load = () => api.getOrder(lastOrderId).then(setOrder).catch((e) => setError(e.message))
    load()
    // Atualiza sozinho para o cliente ver quando ficar pronto.
    const timer = setInterval(load, 5000)
    return () => clearInterval(timer)
  }, [lastOrderId])

  if (!lastOrderId) {
    return (
      <Screen className="pb-28">
        <div className="flex flex-col items-center px-8 pt-24 text-center">
          <ClipboardList size={48} className="text-acai/40" />
          <p className="mt-4 font-semibold">Você ainda não fez um pedido</p>
          <Link to="/" className="btn-primary mt-6">Ver cardápio</Link>
        </div>
        <BottomNav />
      </Screen>
    )
  }
  if (error) return <Screen><ErrorMessage message={error} /><BottomNav /></Screen>
  if (!order) return <Screen><Loading /></Screen>

  const current = steps.findIndex((s) => s.status === order.status)
  const cancelled = order.status === 'CANCELADO'

  return (
    <Screen className="pb-28">
      <header className="px-5 pt-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">Pedido</p>
        <h1 className="font-display text-6xl font-black text-acai">#{String(order.number).padStart(3, '0')}</h1>
        <p className="mt-1 text-muted">{order.customerName}</p>
      </header>

      {cancelled ? (
        <ErrorMessage message="Este pedido foi cancelado pela loja. Fale com o atendente." />
      ) : (
        <ol className="card mx-5 mt-6 space-y-4 p-5">
          {steps.map((step, i) => {
            const done = i <= current
            const Icon = step.icon
            return (
              <li key={step.status} className="flex items-start gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${done ? 'bg-acai text-white' : 'bg-cream text-muted'}`}>
                  {done && i < current ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                </span>
                <div>
                  <p className={`font-bold ${done ? 'text-ink' : 'text-muted'}`}>{step.label}</p>
                  {i === current && <p className="text-sm text-muted">{step.hint}</p>}
                </div>
              </li>
            )
          })}
        </ol>
      )}

      <section className="card mx-5 mt-4 p-5">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between gap-3 py-1.5 text-sm">
            <span>
              {item.quantity}× <b>{item.name}</b>
              <span className="block text-xs text-muted">{item.detail}</span>
            </span>
            <span className="shrink-0">{brl(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-line pt-3 font-display text-lg font-extrabold">
          <span>Total</span>
          <span className="text-acai">{brl(order.total)}</span>
        </div>
        <p className="mt-1 text-xs text-muted">Pague no balcão ao retirar.</p>
      </section>
      <BottomNav />
    </Screen>
  )
}
