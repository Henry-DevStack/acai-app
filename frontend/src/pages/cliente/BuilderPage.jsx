import { useState } from 'react'
import { Check } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import AcaiBowl from '../../components/AcaiBowl'
import PageHeader from '../../components/PageHeader'
import Screen from '../../components/Screen'
import { ErrorMessage, Loading } from '../../components/Feedback'
import { useCart } from '../../context/CartContext'
import { useMenu } from '../../services/useMenu'
import { brl, byId, customPrice, validateItem } from '../../utils/menu'

export default function BuilderPage() {
  const { menu, error } = useMenu()
  const { state } = useLocation()
  if (error) return <Screen><ErrorMessage message={error} /></Screen>
  if (!menu) return <Screen><Loading /></Screen>
  return <Builder menu={menu} preset={state?.preset} editing={state?.editing} />
}

function Builder({ menu, preset, editing }) {
  const { add, replace } = useCart()
  const navigate = useNavigate()
  const start = editing ?? preset ?? {}
  const [sizeId, setSizeId] = useState(start.sizeId ?? menu.sizes[1]?.id ?? menu.sizes[0]?.id)
  const [complementIds, setComplementIds] = useState(start.complementIds ?? [])
  const [extraIds, setExtraIds] = useState(start.extraIds ?? [])

  const size = byId(menu.sizes)[sizeId]
  const ingredients = byId(menu.ingredients)
  const complements = menu.ingredients.filter((i) => i.type === 'COMPLEMENTO')
  const extras = menu.ingredients.filter((i) => i.type === 'EXTRA')
  const item = { kind: 'MONTADO', sizeId, complementIds, extraIds, quantity: editing?.quantity ?? 1 }
  const error = validateItem(menu, item)
  const atLimit = complementIds.length >= (size?.maxComplements ?? 0)

  const toggle = (list, setList, id) =>
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])

  const submit = () => {
    if (editing) replace(editing.key, item)
    else add(item)
    navigate('/sacola')
  }

  return (
    <Screen className="pb-32">
      <PageHeader title="Monte o seu" />
      <AcaiBowl
        toppings={[...complementIds, ...extraIds].map((id) => ingredients[id]?.emoji)}
        className="mx-4 aspect-[16/10] rounded-xl2"
      />

      <section className="px-4 pt-6">
        <h2 className="section-title">Tamanho</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {menu.sizes.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSizeId(s.id)
                setComplementIds((ids) => ids.slice(0, s.maxComplements))
              }}
              className={`rounded-2xl border py-3 text-center transition ${s.id === sizeId ? 'border-acai bg-acai text-white' : 'border-line bg-white'}`}
            >
              <div className="font-display text-lg font-extrabold">{s.name}</div>
              <div className={`text-xs ${s.id === sizeId ? 'text-white/80' : 'text-muted'}`}>{brl(s.price)}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pt-6">
        <h2 className="section-title">Complementos</h2>
        <p className="text-sm text-muted">
          Escolha até {size?.maxComplements} • <span className="font-semibold text-lime-dark">incluídos</span>
        </p>
        <div className="mt-3 space-y-2">
          {complements.map((i) => (
            <OptionRow
              key={i.id}
              ingredient={i}
              checked={complementIds.includes(i.id)}
              disabled={!complementIds.includes(i.id) && atLimit}
              onToggle={() => toggle(complementIds, setComplementIds, i.id)}
            />
          ))}
        </div>
      </section>

      {extras.length > 0 && (
        <section className="px-4 pt-6">
          <h2 className="section-title">Extras</h2>
          <div className="mt-3 space-y-2">
            {extras.map((i) => (
              <OptionRow
                key={i.id}
                ingredient={i}
                price={i.extraPrice}
                checked={extraIds.includes(i.id)}
                onToggle={() => toggle(extraIds, setExtraIds, i.id)}
              />
            ))}
          </div>
        </section>
      )}

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-md items-center gap-4 px-4 py-3">
          <span className="font-display text-2xl font-extrabold text-acai">{brl(customPrice(menu, item))}</span>
          <button onClick={submit} disabled={!!error} className="btn-primary flex-1" title={error ?? ''}>
            {editing ? 'Salvar alterações' : 'Adicionar à sacola'}
          </button>
        </div>
      </footer>
    </Screen>
  )
}

function OptionRow({ ingredient, checked, disabled, price, onToggle }) {
  const soldOut = !ingredient.available
  return (
    <button
      onClick={onToggle}
      disabled={soldOut || disabled}
      className={`card flex w-full items-center gap-3 p-3 text-left transition ${soldOut ? 'opacity-50' : disabled ? 'opacity-60' : ''}`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-cream text-2xl">{ingredient.emoji ?? '•'}</span>
      <span className={`flex-1 font-medium ${soldOut ? 'line-through' : ''}`}>{ingredient.name}</span>
      {soldOut ? (
        <span className="rounded-full bg-ink/10 px-2.5 py-1 text-[11px] font-bold uppercase text-muted">Esgotado</span>
      ) : (
        <>
          {price > 0 && <span className="text-sm text-muted">+ {brl(price)}</span>}
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg border-2 ${checked ? 'border-acai bg-acai text-white' : 'border-line'}`}>
            {checked && <Check size={16} strokeWidth={3} />}
          </span>
        </>
      )}
    </button>
  )
}
