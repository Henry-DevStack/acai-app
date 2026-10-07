import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { ErrorMessage, Loading } from '../../components/Feedback'
import { ORDER_STATUS, brl } from '../../utils/menu'

const columns = ['RECEBIDO', 'PRONTO']

export default function OrdersPage() {
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  const load = () => api.listOrders().then(setOrders).catch((e) => setError(e.message))
  useEffect(() => {
    load()
    const timer = setInterval(load, 5000)
    return () => clearInterval(timer)
  }, [])

  const setStatus = async (id, status) => {
    await api.setOrderStatus(id, status).catch((e) => setError(e.message))
    load()
  }

  if (error) return <ErrorMessage message={error} />
  if (!orders) return <Loading />

  // A fila mostra o mais antigo primeiro: é o próximo a ser preparado.
  const queue = (status) => orders.filter((o) => o.status === status).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const history = orders.filter((o) => !columns.includes(o.status))

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        {columns.map((status) => (
          <section key={status}>
            <h2 className="section-title mb-3">
              {ORDER_STATUS[status].label} <span className="text-base text-muted">({queue(status).length})</span>
            </h2>
            <div className="space-y-3">
              {queue(status).length === 0 && <p className="text-sm text-muted">Nenhum pedido aqui.</p>}
              {queue(status).map((order) => (
                <OrderCard key={order.id} order={order} onStatus={setStatus} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <button onClick={() => setShowHistory((s) => !s)} className="mt-8 text-sm font-semibold text-acai">
        {showHistory ? 'Esconder' : 'Ver'} histórico ({history.length})
      </button>
      {showHistory && (
        <div className="mt-3 space-y-2">
          {history.map((order) => (
            <OrderCard key={order.id} order={order} onStatus={setStatus} compact />
          ))}
        </div>
      )}
    </div>
  )
}

function OrderCard({ order, onStatus, compact }) {
  const status = ORDER_STATUS[order.status]
  const time = new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return (
    <article className="card p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-2xl font-black text-acai">#{String(order.number).padStart(3, '0')}</h3>
        <span className="text-xs text-muted">{time} • {status.label}</span>
      </div>
      <p className="font-semibold">{order.customerName}</p>
      {!compact && (
        <ul className="mt-2 space-y-1 text-sm">
          {order.items.map((item, i) => (
            <li key={i}>
              {item.quantity}× <b>{item.name}</b> <span className="text-muted">— {item.detail}</span>
            </li>
          ))}
        </ul>
      )}
      {order.note && <p className="mt-2 rounded-lg bg-lime/20 px-3 py-2 text-sm">Obs.: {order.note}</p>}
      <div className="mt-3 flex items-center justify-between">
        <span className="font-bold">{brl(order.total)}</span>
        <div className="flex gap-2">
          {order.status === 'RECEBIDO' && (
            <button onClick={() => confirm('Cancelar este pedido?') && onStatus(order.id, 'CANCELADO')} className="rounded-full px-3 py-2 text-sm text-danger">
              Cancelar
            </button>
          )}
          {status.next && (
            <button onClick={() => onStatus(order.id, status.next)} className="btn-primary px-4 py-2 text-sm">
              {status.action}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
