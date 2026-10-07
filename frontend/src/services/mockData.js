// Dados de exemplo usados enquanto o backend não está ligado.
// Preços, insumos e açaís prontos serão cadastrados pelo dono no painel.
export const seedMenu = {
  sizes: [
    { id: 's300', name: '300 ml', price: 18, maxComplements: 3 },
    { id: 's500', name: '500 ml', price: 24, maxComplements: 3 },
    { id: 's700', name: '700 ml', price: 30, maxComplements: 4 },
  ],
  ingredients: [
    { id: 'banana', name: 'Banana', type: 'COMPLEMENTO', extraPrice: 0, available: true, emoji: '🍌' },
    { id: 'morango', name: 'Morango', type: 'COMPLEMENTO', extraPrice: 0, available: true, emoji: '🍓' },
    { id: 'granola', name: 'Granola', type: 'COMPLEMENTO', extraPrice: 0, available: true, emoji: '🥣' },
    { id: 'pacoca', name: 'Paçoca', type: 'COMPLEMENTO', extraPrice: 0, available: true, emoji: '🥜' },
    { id: 'kiwi', name: 'Kiwi', type: 'COMPLEMENTO', extraPrice: 0, available: true, emoji: '🥝' },
    { id: 'leite-po', name: 'Leite em pó', type: 'EXTRA', extraPrice: 3, available: true, emoji: '🥛' },
    { id: 'leite-cond', name: 'Leite condensado', type: 'EXTRA', extraPrice: 2, available: true, emoji: '🍯' },
    { id: 'avela', name: 'Creme de avelã', type: 'EXTRA', extraPrice: 5, available: true, emoji: '🌰' },
  ],
  products: [
    { id: 'classico', name: 'Clássico', sizeId: 's300', ingredientIds: ['banana', 'granola'], price: 18, active: true },
    { id: 'morango-leite', name: 'Morango & leite', sizeId: 's500', ingredientIds: ['morango', 'leite-po'], price: 26, active: true },
    { id: 'tropical', name: 'Tropical', sizeId: 's500', ingredientIds: ['banana', 'morango', 'kiwi'], price: 24, active: true },
    { id: 'pacoquinha', name: 'Paçoquinha', sizeId: 's300', ingredientIds: ['pacoca', 'leite-cond'], price: 20, active: true },
  ],
}
