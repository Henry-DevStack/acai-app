import { Carrot, ClipboardList, LogOut, Package } from 'lucide-react'
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { isPrototype, ownerToken } from '../../services/api'

const tabs = [
  { to: 'pedidos', label: 'Pedidos', icon: ClipboardList },
  { to: 'insumos', label: 'Insumos', icon: Carrot },
  { to: 'produtos', label: 'Produtos', icon: Package },
]

export default function OwnerLayout() {
  const navigate = useNavigate()
  if (!ownerToken.get()) return <Navigate to="/dono/login" replace />

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-10 bg-acai text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <h1 className="font-display text-xl font-black">
            Açaí <span className="font-body text-sm font-medium text-white/70">• painel da loja</span>
          </h1>
          <button
            onClick={() => {
              ownerToken.clear()
              navigate('/dono/login')
            }}
            className="flex items-center gap-1 text-sm text-white/80"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 px-2">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-t-xl px-4 py-2.5 text-sm font-semibold ${isActive ? 'bg-cream text-acai' : 'text-white/80'}`
              }
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>
      </header>
      {isPrototype && (
        <p className="bg-lime/30 px-4 py-2 text-center text-xs text-acai-dark">
          Modo protótipo: os dados ficam só neste navegador até o backend ser ligado.
        </p>
      )}
      <main className="mx-auto max-w-5xl p-4">
        <Outlet />
      </main>
    </div>
  )
}
