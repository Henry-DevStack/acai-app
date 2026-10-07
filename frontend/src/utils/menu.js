// Regras do cardápio. O backend aplica as mesmas regras antes de salvar o pedido;
// aqui elas servem para a tela já mostrar o certo ao cliente.

export const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]))

export const brl = (value) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function missingIngredients(product, ingredients) {
  const map = byId(ingredients)
  return product.ingredientIds.filter((id) => !map[id]?.available)
}

export function isProductAvailable(product, ingredients) {
  return product.active && missingIngredients(product, ingredients).length === 0
}

// "Experimente também": o pronto disponível com mais insumos em comum.
export function suggestAlternative(product, products, ingredients) {
  const candidates = products
    .filter((p) => p.id !== product.id && isProductAvailable(p, ingredients))
    .map((p) => ({ p, shared: p.ingredientIds.filter((id) => product.ingredientIds.includes(id)).length }))
    .sort((a, b) => b.shared - a.shared)
  return candidates[0]?.p ?? null
}

// "Montar parecido": mesma base do pronto, sem os insumos que faltam.
export function similarCustom(product, ingredients) {
  const map = byId(ingredients)
  const kept = product.ingredientIds.filter((id) => map[id]?.available)
  return {
    sizeId: product.sizeId,
    complementIds: kept.filter((id) => map[id].type === 'COMPLEMENTO'),
    extraIds: kept.filter((id) => map[id].type === 'EXTRA'),
  }
}

export function customPrice(menu, { sizeId, extraIds }) {
  const size = byId(menu.sizes)[sizeId]
  const ingredients = byId(menu.ingredients)
  return (size?.price ?? 0) + extraIds.reduce((sum, id) => sum + (ingredients[id]?.extraPrice ?? 0), 0)
}

// Retorna uma mensagem de erro, ou null se o item pode ser pedido.
export function validateItem(menu, item) {
  const ingredients = byId(menu.ingredients)
  if (!(item.quantity >= 1)) return 'Quantidade inválida'
  if (item.kind === 'PRONTO') {
    const product = byId(menu.products)[item.productId]
    if (!product) return 'Produto não encontrado'
    if (!isProductAvailable(product, menu.ingredients)) return `${product.name} está esgotado`
    return null
  }
  const size = byId(menu.sizes)[item.sizeId]
  if (!size) return 'Escolha um tamanho'
  if (item.complementIds.length > size.maxComplements) {
    return `Escolha até ${size.maxComplements} complementos`
  }
  for (const id of item.complementIds) {
    if (ingredients[id]?.type !== 'COMPLEMENTO') return 'Complemento inválido'
  }
  for (const id of item.extraIds) {
    if (ingredients[id]?.type !== 'EXTRA') return 'Extra inválido'
  }
  const missing = [...item.complementIds, ...item.extraIds].find((id) => !ingredients[id]?.available)
  if (missing) return `${ingredients[missing]?.name ?? 'Um insumo'} está esgotado`
  return null
}

export function unitPrice(menu, item) {
  if (item.kind === 'PRONTO') return byId(menu.products)[item.productId]?.price ?? 0
  return customPrice(menu, item)
}

export function describeItem(menu, item) {
  const sizes = byId(menu.sizes)
  const ingredients = byId(menu.ingredients)
  if (item.kind === 'PRONTO') {
    const product = byId(menu.products)[item.productId]
    if (!product) return { name: 'Produto removido', detail: '' }
    const names = product.ingredientIds.map((id) => ingredients[id]?.name).filter(Boolean)
    return { name: product.name, detail: [sizes[product.sizeId]?.name, names.join(', ')].filter(Boolean).join(' • ') }
  }
  const names = [...item.complementIds, ...item.extraIds].map((id) => ingredients[id]?.name).filter(Boolean)
  return {
    name: 'Açaí personalizado',
    detail: [sizes[item.sizeId]?.name, names.join(', ') || 'Sem complementos'].join(' • '),
  }
}

export function cartTotal(menu, items) {
  return items.reduce((sum, item) => sum + unitPrice(menu, item) * item.quantity, 0)
}

export const ORDER_STATUS = {
  RECEBIDO: { label: 'Recebido', next: 'PRONTO', action: 'Marcar como pronto' },
  PRONTO: { label: 'Pronto', next: 'ENTREGUE', action: 'Marcar como entregue' },
  ENTREGUE: { label: 'Entregue', next: null },
  CANCELADO: { label: 'Cancelado', next: null },
}
