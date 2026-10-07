// Camada de dados do app. Com VITE_API_URL definido, fala com o backend Spring Boot.
// Sem ele, roda em modo protótipo: tudo fica no localStorage deste navegador,
// então o painel do dono e a tela do cliente só "se veem" no mesmo aparelho.
import { seedMenu } from './mockData'
import { byId, cartTotal, describeItem, unitPrice, validateItem } from '../utils/menu'

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '')
const TOKEN_KEY = 'acai_owner_token'

export const isPrototype = !API_URL

export const ownerToken = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: (t) => sessionStorage.setItem(TOKEN_KEY, t),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
}

async function http(path, { method = 'GET', body, owner = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (owner) headers.Authorization = `Bearer ${ownerToken.get()}`
  const res = await fetch(`${API_URL}${path}`, { method, headers, body: body && JSON.stringify(body) })
  if (res.status === 401) {
    ownerToken.clear()
    throw new Error('Sessão expirada. Entre de novo.')
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message ?? 'Algo deu errado. Tente de novo.')
  return data
}

// ---------- modo protótipo (localStorage) ----------

const DB_KEY = 'acai_db_v1'
const PROTOTYPE_PASSWORD = 'acai123'

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(DB_KEY))
    if (saved?.menu) return saved
  } catch { /* começa do zero */ }
  return { menu: structuredClone(seedMenu), orders: [] }
}
const save = (db) => localStorage.setItem(DB_KEY, JSON.stringify(db))
const uid = () => Math.random().toString(36).slice(2, 10)
const delay = (value) => new Promise((r) => setTimeout(() => r(structuredClone(value)), 120))

const local = {
  getMenu: () => delay(load().menu),

  createOrder({ customerName, note, items, requestId }) {
    const db = load()
    const repeated = db.orders.find((o) => o.requestId === requestId)
    if (repeated) return delay(repeated)
    if (!customerName?.trim()) return Promise.reject(new Error('Informe seu nome'))
    if (!items.length) return Promise.reject(new Error('Sua sacola está vazia'))
    for (const item of items) {
      const error = validateItem(db.menu, item)
      if (error) return Promise.reject(new Error(error))
    }
    const today = new Date().toDateString()
    const number = db.orders.filter((o) => new Date(o.createdAt).toDateString() === today).length + 1
    const order = {
      id: uid(),
      requestId,
      number,
      customerName: customerName.trim(),
      note: note?.trim() ?? '',
      items: items.map((item) => ({
        ...describeItem(db.menu, item),
        quantity: item.quantity,
        unitPrice: unitPrice(db.menu, item),
      })),
      total: cartTotal(db.menu, items),
      status: 'RECEBIDO',
      createdAt: new Date().toISOString(),
    }
    db.orders.push(order)
    save(db)
    return delay(order)
  },

  getOrder: (id) => {
    const order = load().orders.find((o) => o.id === id)
    return order ? delay(order) : Promise.reject(new Error('Pedido não encontrado'))
  },

  login(password) {
    if (password !== PROTOTYPE_PASSWORD) return Promise.reject(new Error('Senha incorreta'))
    return delay({ token: 'prototype' })
  },

  listOrders: () => delay(load().orders.slice().reverse()),

  setOrderStatus(id, status) {
    const db = load()
    const order = db.orders.find((o) => o.id === id)
    order.status = status
    save(db)
    return delay(order)
  },

  saveIngredient(ingredient) {
    const db = load()
    upsert(db.menu.ingredients, ingredient)
    save(db)
    return delay(ingredient)
  },

  deleteIngredient(id) {
    const db = load()
    if (db.menu.products.some((p) => p.ingredientIds.includes(id))) {
      return Promise.reject(new Error('Esse insumo está em um açaí pronto. Tire ele da receita primeiro.'))
    }
    db.menu.ingredients = db.menu.ingredients.filter((i) => i.id !== id)
    save(db)
    return delay(null)
  },

  saveProduct(product) {
    const db = load()
    upsert(db.menu.products, product)
    save(db)
    return delay(product)
  },

  deleteProduct(id) {
    const db = load()
    db.menu.products = db.menu.products.filter((p) => p.id !== id)
    save(db)
    return delay(null)
  },

  saveSize(size) {
    const db = load()
    upsert(db.menu.sizes, size)
    save(db)
    return delay(size)
  },
}

function upsert(list, item) {
  if (!item.id) item.id = uid()
  const i = list.findIndex((x) => x.id === item.id)
  if (i >= 0) list[i] = item
  else list.push(item)
}

// ---------- modo backend ----------

const remote = {
  getMenu: () => http('/api/menu'),
  createOrder: (order) => http('/api/orders', { method: 'POST', body: order }),
  getOrder: (id) => http(`/api/orders/${id}`),
  login: (password) => http('/api/owner/login', { method: 'POST', body: { password } }),
  listOrders: () => http('/api/owner/orders', { owner: true }),
  setOrderStatus: (id, status) => http(`/api/owner/orders/${id}/status`, { method: 'PATCH', body: { status }, owner: true }),
  saveIngredient: (i) => http(i.id ? `/api/owner/ingredients/${i.id}` : '/api/owner/ingredients', { method: i.id ? 'PUT' : 'POST', body: i, owner: true }),
  deleteIngredient: (id) => http(`/api/owner/ingredients/${id}`, { method: 'DELETE', owner: true }),
  saveProduct: (p) => http(p.id ? `/api/owner/products/${p.id}` : '/api/owner/products', { method: p.id ? 'PUT' : 'POST', body: p, owner: true }),
  deleteProduct: (id) => http(`/api/owner/products/${id}`, { method: 'DELETE', owner: true }),
  saveSize: (s) => http(s.id ? `/api/owner/sizes/${s.id}` : '/api/owner/sizes', { method: s.id ? 'PUT' : 'POST', body: s, owner: true }),
}

export const api = isPrototype ? local : remote
export { byId }
