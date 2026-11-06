// context/CartContext.jsx
// Global cart state — tracks item count for the navbar badge
// Actual cart data is fetched fresh on the Cart page

import { createContext, useContext, useState, useCallback } from 'react'
import { cartAPI } from '../api/services'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cartCount, setCartCount] = useState(0)

  /** Refresh cart count from server */
  const refreshCartCount = useCallback(async () => {
    if (!user) { setCartCount(0); return }
    try {
      const res = await cartAPI.getCart()
      const items = res.data.data || []
      // Sum up all quantities
      const total = items.reduce((sum, item) => sum + item.quantity, 0)
      setCartCount(total)
    } catch {
      setCartCount(0)
    }
  }, [user])

  /** Increment count immediately (optimistic update) */
  const incrementCart = (qty = 1) => setCartCount(prev => prev + qty)

  /** Reset to zero (after order placed or cart cleared) */
  const resetCart = () => setCartCount(0)

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount, incrementCart, resetCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
