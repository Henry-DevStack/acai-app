import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)
const CART_KEY = 'acai_cart'
const ORDER_KEY = 'acai_last_order'

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => read(CART_KEY, []))
  const [lastOrderId, setLastOrderId] = useState(() => read(ORDER_KEY, null))

  useEffect(() => localStorage.setItem(CART_KEY, JSON.stringify(items)), [items])
  useEffect(() => localStorage.setItem(ORDER_KEY, JSON.stringify(lastOrderId)), [lastOrderId])

  const value = {
    items,
    count: items.reduce((n, i) => n + i.quantity, 0),
    add: (item) => setItems((list) => [...list, { ...item, key: crypto.randomUUID() }]),
    replace: (key, item) => setItems((list) => list.map((i) => (i.key === key ? { ...item, key } : i))),
    setQuantity: (key, quantity) =>
      setItems((list) => list.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, quantity) } : i))),
    remove: (key) => setItems((list) => list.filter((i) => i.key !== key)),
    clear: () => setItems([]),
    lastOrderId,
    setLastOrderId,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
