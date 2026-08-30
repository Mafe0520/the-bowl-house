'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, CartTopping, CartItemSelection, Product } from '@/types'

interface CartState {
  items: CartItem[]
  addItem: (product: Product, toppings: CartTopping[], quantity: number, selections?: CartItemSelection[]) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  subtotal: () => number
  totalItems: () => number
}

function calcItemTotal(product: Product, toppings: CartTopping[], quantity: number, selections?: CartItemSelection[]): number {
  const toppingExtra = toppings.reduce((sum, t) => sum + (t.is_free ? 0 : t.price), 0)
  const selectionExtra = (selections || []).filter(s => s.price > 0).reduce((sum, s) => sum + s.price, 0)
  return (product.price + toppingExtra + selectionExtra) * quantity
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, toppings, quantity, selections) => {
        const id = crypto.randomUUID()
        const itemTotal = calcItemTotal(product, toppings, quantity, selections)
        set(state => ({
          items: [...state.items, { id, product, toppings, quantity, itemTotal, selections }],
        }))
      },
      removeItem: (id) => set(state => ({ items: state.items.filter(i => i.id !== id) })),
      updateQuantity: (id, quantity) =>
        set(state => ({
          items: state.items.map(item =>
            item.id === id
              ? { ...item, quantity, itemTotal: calcItemTotal(item.product, item.toppings, quantity, item.selections) }
              : item
          ),
        })),
      clearCart: () => set({ items: [] }),
      subtotal: () => get().items.reduce((sum, i) => sum + i.itemTotal, 0),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'tbh-cart' }
  )
)
