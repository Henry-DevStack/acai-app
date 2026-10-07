import { NavLink } from 'react-router-dom'
import { ClipboardList, ShoppingBag, UtensilsCrossed } from 'lucide-react'
import { useCart } from '../context/CartContext'

const tabs = [
  { to: '/', label: 'Cardápio', icon: UtensilsCrossed, end: true },
  { to: '/sacola', label: 'Sacola', icon: ShoppingBag },
  { to: '/pedido', label: 'Meu pedido', icon: ClipboardList },
]

export default function BottomNav() {
  const { count } = useCart()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-md">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center gap-1 py-3 text-xs font-semibold ${isActive ? 'text-acai' : 'text-muted'}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
                {label}
                {to === '/sacola' && count > 0 && (
                  <span className="absolute right-[30%] top-2 rounded-full bg-lime px-1.5 text-[10px] font-bold text-acai-dark">
                    {count}
                  </span>
                )}
                {isActive && <span className="absolute bottom-0 h-0.5 w-12 rounded-full bg-acai" />}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
