import { useState } from 'react'
import { ArrowRight, Plus, Search, Sparkles, Wand2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AcaiBowl from '../../components/AcaiBowl'
import BottomNav from '../../components/BottomNav'
import Screen from '../../components/Screen'
import { ErrorMessage, Loading } from '../../components/Feedback'
import { useCart } from '../../context/CartContext'
import { useMenu } from '../../services/useMenu'
import { brl, byId, describeItem, isProductAvailable, similarCustom, suggestAlternative } from '../../utils/menu'

export default function MenuPage() {
  const { menu, error } = useMenu()
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const navigate = useNavigate()

  if (error) return <Screen><ErrorMessage message={error} /></Screen>
  if (!menu) return <Screen><Loading /></Screen>

  const products = menu.products
    .filter((p) => p.active)
    .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <Screen className="pb-28">
      <header className="flex items-center justify-between px-5 pt-6">
        <h1 className="font-display text-3xl font-black text-ink">Açaí</h1>
        <button onClick={() => setSearching((s) => !s)} className="p-1" aria-label="Buscar">
          <Search size={24} />
        </button>
      </header>
      {searching && (
        <div className="px-5 pt-3">
          <input autoFocus className="input" placeholder="Buscar açaí pronto" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      )}

      <h2 className="px-5 pt-6 font-display text-[2.6rem] font-black leading-[1.05] text-ink">
        Seu açaí,
        <br />
        <span className="text-acai">do seu jeito.</span>
      </h2>

      <section className="mx-5 mt-6 flex overflow-hidden rounded-xl2 bg-acai text-white">
        <div className="flex-1 p-5">
          <h3 className="font-display text-2xl font-extrabold">Monte o seu</h3>
          <p className="mt-1 text-sm text-white/80">Escolha tamanho e complementos.</p>
          <button onClick={() => navigate('/montar')} className="btn-lime mt-5">
            Começar <ArrowRight size={18} />
          </button>
        </div>
        <AcaiBowl toppings={['🍓', '🍌', '🥣', '🍓']} className="w-[42%] !bg-none" />
      </section>

      <div className="mt-8 flex items-center justify-between px-5">
        <h3 className="section-title">Açaís prontos</h3>
      </div>
      {products.length === 0 && <p className="px-5 pt-4 text-sm text-muted">Nenhum açaí pronto por aqui.</p>}
      <div className="grid grid-cols-2 gap-3 px-5 pt-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} menu={menu} />
        ))}
      </div>
      <BottomNav />
    </Screen>
  )
}

function ProductCard({ product, menu }) {
  const { add } = useCart()
  const navigate = useNavigate()
  const [added, setAdded] = useState(false)
  const ingredients = byId(menu.ingredients)
  const available = isProductAvailable(product, menu.ingredients)
  const { detail } = describeItem(menu, { kind: 'PRONTO', productId: product.id })
  const toppings = product.ingredientIds.map((id) => ingredients[id]?.emoji).filter(Boolean)

  const addToCart = () => {
    add({ kind: 'PRONTO', productId: product.id, quantity: 1 })
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  if (!available) {
    const alternative = suggestAlternative(product, menu.products, menu.ingredients)
    return (
      <article className="card flex flex-col overflow-hidden">
        <div className="relative">
          <AcaiBowl toppings={toppings} className="aspect-[4/3]" soldOut />
          <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            Esgotado
          </span>
        </div>
        <div className="flex flex-1 flex-col p-3">
          <h4 className="font-bold text-muted">{product.name}</h4>
          <p className="mt-0.5 text-xs text-muted">{detail}</p>
          <div className="mt-auto space-y-1.5 pt-3">
            <button
              onClick={() => navigate('/montar', { state: { preset: similarCustom(product, menu.ingredients) } })}
              className="flex w-full items-center justify-center gap-1.5 rounded-full bg-acai-soft py-2 text-xs font-bold text-acai"
            >
              <Wand2 size={14} /> Montar parecido
            </button>
            {alternative && (
              <p className="flex items-center justify-center gap-1 text-center text-[11px] text-muted">
                <Sparkles size={12} className="text-lime-dark" /> Experimente o <b className="text-acai">{alternative.name}</b>
              </p>
            )}
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="card flex flex-col overflow-hidden">
      <AcaiBowl toppings={toppings} className="aspect-[4/3]" />
      <div className="flex flex-1 flex-col p-3">
        <h4 className="font-bold">{product.name}</h4>
        <p className="mt-0.5 text-xs text-muted">{detail}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-display text-lg font-extrabold text-acai">{brl(product.price)}</span>
          <button
            onClick={addToCart}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-white transition ${added ? 'bg-lime-dark' : 'bg-acai'}`}
            aria-label={`Adicionar ${product.name}`}
          >
            {added ? '✓' : <Plus size={20} />}
          </button>
        </div>
      </div>
    </article>
  )
}
