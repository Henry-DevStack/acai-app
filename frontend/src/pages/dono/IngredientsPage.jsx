import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { api } from '../../services/api'
import { ErrorMessage, Loading } from '../../components/Feedback'
import { brl } from '../../utils/menu'

const empty = { name: '', type: 'COMPLEMENTO', extraPrice: 0, available: true, emoji: '' }

export default function IngredientsPage() {
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

  const usedBy = (id) => menu.products.filter((p) => p.ingredientIds.includes(id)).map((p) => p.name)

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Insumos</h2>
          <p className="text-sm text-muted">Desligue o que acabou: some do Monte o seu e os prontos que usam ficam esgotados.</p>
        </div>
        <button onClick={() => setEditing(empty)} className="btn-primary flex shrink-0 items-center gap-1 px-4 py-2 text-sm">
          <Plus size={16} /> Novo
        </button>
      </div>
      {error && <ErrorMessage message={error} />}
      {editing && (
        <IngredientForm
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={(i) => run(async () => { await api.saveIngredient(i); setEditing(null) })}
        />
      )}
      <div className="mt-4 space-y-2">
        {['COMPLEMENTO', 'EXTRA'].map((type) => (
          <div key={type}>
            <h3 className="mb-2 mt-4 text-sm font-bold uppercase tracking-wide text-muted">{type === 'EXTRA' ? 'Extras pagos' : 'Complementos'}</h3>
            {menu.ingredients.filter((i) => i.type === type).map((i) => (
              <div key={i.id} className={`card mb-2 flex items-center gap-3 p-3 ${i.available ? '' : 'bg-cream'}`}>
                <span className="text-2xl">{i.emoji || '•'}</span>
                <div className="flex-1">
                  <p className={`font-semibold ${i.available ? '' : 'text-muted line-through'}`}>{i.name}</p>
                  <p className="text-xs text-muted">
                    {i.type === 'EXTRA' ? `+ ${brl(i.extraPrice)}` : 'Incluído'}
                    {usedBy(i.id).length > 0 && ` • usado em ${usedBy(i.id).join(', ')}`}
                  </p>
                </div>
                <Toggle checked={i.available} onChange={(available) => run(() => api.saveIngredient({ ...i, available }))} />
                <button onClick={() => setEditing(i)} className="p-2 text-muted" aria-label="Editar"><Pencil size={16} /></button>
                <button onClick={() => confirm(`Excluir ${i.name}?`) && run(() => api.deleteIngredient(i.id))} className="p-2 text-danger" aria-label="Excluir">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? 'bg-lime-dark' : 'bg-line'}`}
      title={checked ? 'Disponível' : 'Esgotado'}
    >
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  )
}

function IngredientForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial)
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ ...form, extraPrice: form.type === 'EXTRA' ? Number(form.extraPrice) : 0 })
      }}
      className="card mt-4 grid gap-3 p-4 sm:grid-cols-[80px_1fr_160px_120px]"
    >
      <input className="input" placeholder="🍓" value={form.emoji} onChange={set('emoji')} maxLength={4} />
      <input className="input" placeholder="Nome" value={form.name} onChange={set('name')} required />
      <select className="input" value={form.type} onChange={set('type')}>
        <option value="COMPLEMENTO">Complemento</option>
        <option value="EXTRA">Extra pago</option>
      </select>
      <input className="input" type="number" step="0.5" min="0" placeholder="R$" value={form.extraPrice} onChange={set('extraPrice')} disabled={form.type !== 'EXTRA'} />
      <div className="flex gap-2 sm:col-span-4">
        <button className="btn-primary px-5 py-2 text-sm">Salvar</button>
        <button type="button" onClick={onCancel} className="px-4 text-sm text-muted">Cancelar</button>
      </div>
    </form>
  )
}
