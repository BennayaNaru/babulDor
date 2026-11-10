import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const storageKey = user ? `pkk_cart_${user.id}` : null
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)

  // muat keranjang milik user yang sedang login
  useEffect(() => {
    if (!storageKey) {
      setItems([])
      return
    }
    try {
      setItems(JSON.parse(localStorage.getItem(storageKey)) ?? [])
    } catch {
      setItems([])
    }
  }, [storageKey])

  const save = (updater) =>
    setItems((prev) => {
      const next = updater(prev)
      if (storageKey) localStorage.setItem(storageKey, JSON.stringify(next))
      return next
    })

  const add = (product, qty = 1) =>
    save((prev) => {
      const found = prev.find((i) => i.id === product.id)
      const nextQty = Math.min((found?.qty ?? 0) + qty, product.stock)
      const row = { id: product.id, name: product.name, price: product.price, stock: product.stock, qty: nextQty }
      return found ? prev.map((i) => (i.id === product.id ? row : i)) : [...prev, row]
    })

  const changeQty = (id, delta) =>
    save((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: Math.min(i.qty + delta, i.stock) } : i))
        .filter((i) => i.qty > 0)
    )

  const remove = (id) => save((prev) => prev.filter((i) => i.id !== id))
  const clear = () => save(() => [])

  const count = items.reduce((a, i) => a + i.qty, 0)
  const total = items.reduce((a, i) => a + i.qty * i.price, 0)

  return (
    <CartContext.Provider
      value={{
        items, count, total, add, changeQty, remove, clear,
        open, openCart: () => setOpen(true), closeCart: () => setOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)