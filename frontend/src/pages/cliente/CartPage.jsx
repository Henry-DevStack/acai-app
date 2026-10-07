import { useState } from 'react'
import { ArrowRight, Minus, Plus, ShoppingBag } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import AcaiBowl from '../../components/AcaiBowl'
import BottomNav from '../../components/BottomNav'
import PageHeader from '../../components/PageHeader'
import Screen from '../../components/Screen'
import { ErrorMessage, Loading } from '../../components/Feedback'
import { useCart } from '../../context/CartContext'
import { api } from '../../services/api'
import { useMenu } from '../../services/useMenu'
import { brl, byId, cartTotal, describeItem, unitPrice, validateItem } from '../../utils/menu'

export default function CartPage() {
  const { menu, error: menuError, reload } = useMenu()
  const cart = useCart()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  // Um id por tentativa: se o cliente tocar duas vezes, o servidor devolve o mesmo pedido.
  const [requestId] = useState(() => crypto.randomUUID())

  if (menuError) return <Screen><ErrorMessage message={menuError} /></Screen>
  if (!menu) return <Screen><Loading /></Screen>

  if (cart.items.length === 0) {
    return (
      <Screen className="pb-28">
        <PageHeader title="Sua sacola" />
        <div className="flex flex-col items-center px-8 pt-20 text-center">
          <ShoppingBag size={48} className="text-acai/40" />
          <p className="mt-4 font-semibold">Sua sacola está vazia</p>
          <Link to="/" className="btn-primary mt-6">Ver cardápio</Link>
        </div>
        <BottomNav />
      </Screen>
    )
  }

  const invalid = cart.items.map((item) => validateItem(menu, item)).find(Boolean)

  const submit = async () => {
    setSending(true)
    setError(null)
    try {
      const order = await api.createOrder({
        customerName: name,
        note,
        requestId,
        items: cart.items.map(({ key, ...item }) => item),
      })
      cart.clear()
      cart.setLastOrderId(order.id)
      navigate('/pedido')
    } catch (e) {
      setError(e.message)
      reload()
    } finally {
      setSending(false)
    }
  }

  return (
    <Screen className="pb-48">
      <PageHeader title="Sua sacola" />
      <div className="space-y-3 px-4">
        {cart.items.map((item) => (
          <CartItem key={item.key} item={item} menu={menu} />
        ))}
      </div>

      <section className="px-4 pt-6">
        <label className="font-semibold" htmlFor="nome">Seu nome</label>
        <input id="nome" className="input mt-2" placeholder="Para chamarmos quando estiver pronto" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="mt-4 block font-semibold" htmlFor="obs">
          Alguma observação? <span className="font-normal text-muted">(opcional)</span>
        </label>
        <textarea id="obs" rows={2} className="input mt-2 resize-none" placeholder="Ex.: pouco leite em pó…" value={note} onChange={(e) => setNote(e.target.value)} />
      </section>

      <section className="card mx-4 mt-6 p-4">
        <div className="flex justify-between text-sm text-muted">
          <span>Subtotal</span>
          <span>{brl(cartTotal(menu, cart.items))}</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
          <span className="font-display text-xl font-extrabold">Total</span>
          <span className="font-display text-2xl font-extrabold text-acai">{brl(cartTotal(menu, cart.items))}</span>
        </div>
        <p className="mt-2 text-xs text-muted">Pagamento no balcão, na retirada.</p>
      </section>

      {(error || invalid) && <ErrorMessage message={error ?? invalid} />}

      <div className="fixed inset-x-0 bottom-[72px] z-10 px-4">
        <button
          onClick={submit}
          disabled={sending || !name.trim() || !!invalid}
          className="btn-primary mx-auto flex w-full max-w-md items-center justify-center gap-2 py-4 text-lg"
        >
          {sending ? 'Enviando…' : 'Fazer pedido'} {!sending && <ArrowRight size={20} />}
        </button>
      </div>
      <BottomNav />
    </Screen>
  )
}

function CartItem({ item, menu }) {
  const { setQuantity, remove } = useCart()
  const navigate = useNavigate()
  const ingredients = byId(menu.ingredients)
  const { name, detail } = describeItem(menu, item)
  const problem = validateItem(menu, item)
  const ids = item.kind === 'PRONTO'
    ? byId(menu.products)[item.productId]?.ingredientIds ?? []
    : [...item.complementIds, ...item.extraIds]

  return (
    <article className={`card flex gap-3 p-3 ${problem ? 'border-danger/50' : ''}`}>
      <AcaiBowl toppings={ids.map((id) => ingredients[id]?.emoji)} className="h-24 w-24 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <h3 className="font-bold">{name}</h3>
        <p className="text-xs text-muted">{detail}</p>
        {problem && <p className="mt-1 text-xs font-semibold text-danger">{problem}</p>}
        <div className="mt-2 flex items-center justify-between">
          <span className="font-display text-lg font-extrabold text-acai">{brl(unitPrice(menu, item))}</span>
          <div className="flex items-center rounded-xl border border-line">
            <button className="p-2" onClick={() => setQuantity(item.key, item.quantity - 1)} aria-label="Diminuir"><Minus size={14} /></button>
            <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
            <button className="p-2" onClick={() => setQuantity(item.key, item.quantity + 1)} aria-label="Aumentar"><Plus size={14} /></button>
          </div>
        </div>
        <div className="mt-1 flex gap-3 text-xs font-semibold">
          {item.kind === 'MONTADO' && (
            <button className="text-acai" onClick={() => navigate('/montar', { state: { editing: item } })}>Editar</button>
          )}
          <button className="text-danger" onClick={() => remove(item.key)}>Remover</button>
        </div>
      </div>
    </article>
  )
}
