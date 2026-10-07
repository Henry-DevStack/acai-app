import { describe, expect, it } from 'vitest'
import { seedMenu } from '../services/mockData'
import { cartTotal, isProductAvailable, similarCustom, suggestAlternative, validateItem } from './menu'

const withMissing = (id) => ({
  ...seedMenu,
  ingredients: seedMenu.ingredients.map((i) => (i.id === id ? { ...i, available: false } : i)),
})

describe('regras do cardápio', () => {
  it('pronto fica esgotado quando falta um insumo dele', () => {
    const menu = withMissing('morango')
    const tropical = menu.products.find((p) => p.id === 'tropical')
    const classico = menu.products.find((p) => p.id === 'classico')
    expect(isProductAvailable(tropical, menu.ingredients)).toBe(false)
    expect(isProductAvailable(classico, menu.ingredients)).toBe(true)
  })

  it('sugere o pronto disponível com mais insumos em comum', () => {
    const menu = withMissing('morango')
    const tropical = menu.products.find((p) => p.id === 'tropical')
    expect(suggestAlternative(tropical, menu.products, menu.ingredients).id).toBe('classico')
  })

  it('montar parecido mantém tamanho e tira só o que falta', () => {
    const menu = withMissing('morango')
    const tropical = menu.products.find((p) => p.id === 'tropical')
    expect(similarCustom(tropical, menu.ingredients)).toEqual({
      sizeId: 's500',
      complementIds: ['banana', 'kiwi'],
      extraIds: [],
    })
  })

  it('respeita o limite de complementos e bloqueia insumo esgotado', () => {
    const base = { kind: 'MONTADO', sizeId: 's300', extraIds: [], quantity: 1 }
    expect(validateItem(seedMenu, { ...base, complementIds: ['banana', 'morango', 'granola', 'kiwi'] })).toMatch(/até 3/)
    expect(validateItem(withMissing('kiwi'), { ...base, complementIds: ['kiwi'] })).toMatch(/esgotado/)
    expect(validateItem(seedMenu, { ...base, complementIds: ['banana'] })).toBeNull()
  })

  it('soma tamanho, extras e quantidade', () => {
    const items = [
      { kind: 'MONTADO', sizeId: 's500', complementIds: ['banana'], extraIds: ['leite-po'], quantity: 2 },
      { kind: 'PRONTO', productId: 'classico', quantity: 1 },
    ]
    expect(cartTotal(seedMenu, items)).toBe((24 + 3) * 2 + 18)
  })
})
