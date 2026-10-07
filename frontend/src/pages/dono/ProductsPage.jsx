import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { api } from '../../services/api'
import { ErrorMessage, Loading } from '../../components/Feedback'
import { brl, byId, isProductAvailable, missingIngredients } from '../../utils/menu'
import { Toggle } from './IngredientsPage'

export default function ProductsPage() {
  const [menu, setMenu] = useState(null)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState(null)

  const load = () => api.getMenu().then(setMenu).catch((e) => setError(e.message))
  useEffect(() => { load() }, [])

  const run = async (action) => {
    setError(null)
    try {
      await action()
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  if (!menu) return error ? <ErrorMessage message={error} /> : <Loading />
  const sizes = byId(menu.sizes)
  const ingredients = byId(menu.ingredients)

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="section-title">Açaís prontos</h2>
            <p className="text-sm text-muted">Cada pronto é uma receita: tamanho, insumos e preço.</p>
          </div>
          <button
            onClick={() => setEditing({ name: '', sizeId: menu.sizes[0]?.id, ingredientIds: [], price: '', active: true })}
            className="btn-primary flex shrink-0 items-center gap-1 px-4 py-2 text-sm"
          >
            <Plus size={16} /> Novo
          </button>
        </div>
        {error && <ErrorMessage message={error} />}
        {editing && (
          <ProductForm
            initial={editing}
            menu={menu}
            onCancel={() => setEditing(null)}
            onSave={(p) => run(async () => { await api.saveProduct(p); setEditing(null) })}
          />
        )}
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {menu.products.map((p) => {
            const missing = missingIngredients(p, menu.ingredients).map((id) => ingredients[id]?.name ?? 'insumo removido')
            return (
              <div key={p.id} className="card flex items-center gap-3 p-3">
                <div className="flex-1">
                  <p className="font-semibold">
                    {p.name} <span className="text-sm font-normal text-muted">• {sizes[p.sizeId]?.name}</span>
                  </p>
                  <p className="text-xs text-muted">{p.ingredientIds.map((id) => ingredients[id]?.name).filter(Boolean).join(', ')}</p>
                  {p.active && !isProductAvailable(p, menu.ingredients) && (
                    <p className="text-xs font-semibold text-danger">Esgotado: falta {missing.join(', ')}</p>
                  )}
                </div>
                <span className="font-bold text-acai">{brl(p.price)}</span>
                <Toggle checked={p.active} onChange={(active) => run(() => api.saveProduct({ ...p, active }))} />
                <button onClick={() => setEditing(p)} className="p-2 text-muted" aria-label="Editar"><Pencil size={16} /></button>
                <button onClick={() => confirm(`Excluir ${p.name}?`) && run(() => api.deleteProduct(p.id))} className="p-2 text-danger" aria-label="Excluir">
                  <Trash2 size={16} />
                </button>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="section-title">Tamanhos do Monte o seu</h2>
        <p className="text-sm text-muted">Preço base e quantos complementos cada tamanho inclui.</p>
        <div className="mt-4 grid gap-2 md:grid-cols-3">
          {menu.sizes.map((s) => (
            <SizeRow key={s.id} size={s} onSave={(size) => run(() => api.saveSize(size))} />
          ))}
        </div>
      </section>
    </div>
  )
}

function SizeRow({ size, onSave }) {
  const [form, setForm] = useState(size)
  const dirty = form.price !== size.price || form.maxComplements !== size.maxComplements || form.name !== size.name
  return (
    <div className="card space-y-2 p-3">
      <input className="input font-semibold" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <div className="flex gap-2">
        <label className="flex-1 text-xs text-muted">
          Preço (R$)
          <input className="input mt-1" type="number" step="0.5" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        </label>
        <label className="flex-1 text-xs text-muted">
          Complementos
          <input className="input mt-1" type="number" min="0" value={form.maxComplements} onChange={(e) => setForm({ ...form, maxComplements: Number(e.target.value) })} />
        </label>
      </div>
      {dirty && <button onClick={() => onSave(form)} className="btn-primary w-full py-2 text-sm">Salvar</button>}
    </div>
  )
}

function ProductForm({ initial, menu, onSave, onCancel }) {
  const [form, setForm] = useState(initial)
  const toggle = (id) =>
    setForm({ ...form, ingredientIds: form.ingredientIds.includes(id) ? form.ingredientIds.filter((x) => x !== id) : [...form.ingredientIds, id] })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ ...form, price: Number(form.price) })
      }}
      className="card mt-4 space-y-3 p-4"
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_140px_140px]">
        <input className="input" placeholder="Nome do açaí" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <select className="input" value={form.sizeId} onChange={(e) => setForm({ ...form, sizeId: e.target.value })}>
          {menu.sizes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input className="input" type="number" step="0.5" min="0" placeholder="Preço R$" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold">Insumos da receita</p>
        <div className="flex flex-wrap gap-2">
          {menu.ingredients.map((i) => (
            <button
              type="button"
              key={i.id}
              onClick={() => toggle(i.id)}
              className={`rounded-full border px-3 py-1.5 text-sm ${form.ingredientIds.includes(i.id) ? 'border-acai bg-acai text-white' : 'border-line bg-white'}`}
            >
              {i.emoji} {i.name}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button className="btn-primary px-5 py-2 text-sm" disabled={form.ingredientIds.length === 0}>Salvar</button>
        <button type="button" onClick={onCancel} className="px-4 text-sm text-muted">Cancelar</button>
      </div>
    </form>
  )
}
