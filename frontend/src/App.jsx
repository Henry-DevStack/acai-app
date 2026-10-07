import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import MenuPage from './pages/cliente/MenuPage'
import BuilderPage from './pages/cliente/BuilderPage'
import CartPage from './pages/cliente/CartPage'
import OrderPage from './pages/cliente/OrderPage'
import OwnerLayout from './pages/dono/OwnerLayout'
import OwnerLoginPage from './pages/dono/OwnerLoginPage'
import OrdersPage from './pages/dono/OrdersPage'
import IngredientsPage from './pages/dono/IngredientsPage'
import ProductsPage from './pages/dono/ProductsPage'

// HashRouter, como no LIFT: funciona em hospedagem estática sem configurar rotas no servidor.
export default function App() {
  return (
    <CartProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/montar" element={<BuilderPage />} />
          <Route path="/sacola" element={<CartPage />} />
          <Route path="/pedido" element={<OrderPage />} />
          <Route path="/dono/login" element={<OwnerLoginPage />} />
          <Route path="/dono" element={<OwnerLayout />}>
            <Route index element={<Navigate to="pedidos" replace />} />
            <Route path="pedidos" element={<OrdersPage />} />
            <Route path="insumos" element={<IngredientsPage />} />
            <Route path="produtos" element={<ProductsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </CartProvider>
  )
}
