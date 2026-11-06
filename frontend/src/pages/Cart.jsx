// pages/Cart.jsx
// Shows all items in user's cart with quantity controls and order placement

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { cartAPI, orderAPI } from '../api/services'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const [cartItems, setCartItems]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [placing, setPlacing]       = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')
  const [address, setAddress]       = useState('')
  const [showAddressForm, setShowAddressForm] = useState(false)
  const { refreshCartCount, resetCart } = useCart()
  const navigate = useNavigate()

  useEffect(() => { fetchCart() }, [])

  const fetchCart = async () => {
    setLoading(true)
    try {
      const res = await cartAPI.getCart()
      setCartItems(res.data.data || [])
    } catch {
      setError('Failed to load cart.')
    } finally {
      setLoading(false)
    }
  }

  // Calculate total price
  const total = cartItems.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity, 0
  )

  const updateQuantity = async (cartItemId, newQty) => {
    try {
      if (newQty <= 0) {
        await cartAPI.removeItem(cartItemId)
        setCartItems(prev => prev.filter(i => i.id !== cartItemId))
      } else {
        await cartAPI.updateItem(cartItemId, newQty)
        setCartItems(prev =>
          prev.map(i => i.id === cartItemId ? { ...i, quantity: newQty } : i)
        )
      }
      refreshCartCount()
    } catch {
      setError('Failed to update quantity.')
    }
  }

  const removeItem = async (cartItemId) => {
    try {
      await cartAPI.removeItem(cartItemId)
      setCartItems(prev => prev.filter(i => i.id !== cartItemId))
      refreshCartCount()
    } catch {
      setError('Failed to remove item.')
    }
  }

  const placeOrder = async () => {
    if (!address.trim()) {
      setError('Please enter a delivery address.')
      return
    }
    setPlacing(true)
    setError('')
    try {
      await orderAPI.placeOrder({ deliveryAddress: address })
      setSuccess('🎉 Order placed successfully!')
      setCartItems([])
      resetCart()
      // Navigate to orders after 2 seconds
      setTimeout(() => navigate('/orders'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order.')
    } finally {
      setPlacing(false)
    }
  }

  if (loading) return (
    <div className="page">
      <div className="loading-center">
        <div className="spinner" />
        <span>Loading your cart...</span>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>🛒 Your Cart</h1>
          <p>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
        </div>

        {/* Alerts */}
        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Empty cart */}
        {!loading && cartItems.length === 0 && !success && (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some delicious food from our restaurants!</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: '16px' }}
              onClick={() => navigate('/')}
            >
              Browse Restaurants
            </button>
          </div>
        )}

        {/* Cart Items + Summary */}
        {cartItems.length > 0 && (
          <div className="cart-layout">
            {/* Cart Items List */}
            <div style={styles.itemsList}>
              {cartItems.map(item => (
                <div key={item.id} className="card" style={styles.cartItem}>
                  <div style={styles.itemInfo}>
                    <h4 style={styles.itemName}>{item.menuItem.name}</h4>
                    <p style={styles.itemPrice}>₹{item.menuItem.price?.toFixed(2)} each</p>
                  </div>
                  <div style={styles.itemActions}>
                    {/* Quantity Controls */}
                    <div className="qty-control">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >−</button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >+</button>
                    </div>
                    {/* Item subtotal */}
                    <span style={styles.subtotal}>
                      ₹{(item.menuItem.price * item.quantity).toFixed(2)}
                    </span>
                    {/* Remove */}
                    <button
                      style={styles.removeBtn}
                      onClick={() => removeItem(item.id)}
                      title="Remove item"
                    >🗑</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="cart-summary-sticky">
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={styles.summaryTitle}>Order Summary</h3>
                <hr className="divider" />

                {/* Item breakdown */}
                {cartItems.map(item => (
                  <div key={item.id} style={styles.summaryRow}>
                    <span style={styles.summaryLabel}>
                      {item.menuItem.name} × {item.quantity}
                    </span>
                    <span>₹{(item.menuItem.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}

                <hr className="divider" />

                {/* Delivery fee */}
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Delivery fee</span>
                  <span style={{ color: '#2e7d32' }}>Free</span>
                </div>

                {/* Total */}
                <div style={{ ...styles.summaryRow, ...styles.totalRow }}>
                  <span>Total</span>
                  <span style={styles.totalPrice}>₹{total.toFixed(2)}</span>
                </div>

                {/* Address input */}
                {showAddressForm ? (
                  <div style={{ marginTop: '20px' }}>
                    <label className="form-label">Delivery Address</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      placeholder="Enter your full delivery address..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      style={{ resize: 'vertical', marginTop: '6px' }}
                    />
                    <button
                      className="btn btn-primary btn-full"
                      onClick={placeOrder}
                      disabled={placing}
                      style={{ marginTop: '12px' }}
                    >
                      {placing ? '⏳ Placing Order...' : '✅ Confirm Order'}
                    </button>
                    <button
                      className="btn btn-ghost btn-full"
                      onClick={() => setShowAddressForm(false)}
                      style={{ marginTop: '8px' }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-primary btn-full"
                    style={{ marginTop: '20px' }}
                    onClick={() => setShowAddressForm(true)}
                  >
                    Proceed to Checkout →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  itemsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  cartItem: {
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
  },
  itemInfo: { flex: 1 },
  itemName: { fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 700, marginBottom: '4px' },
  itemPrice: { fontSize: '0.85rem', color: '#777770' },
  itemActions: { display: 'flex', alignItems: 'center', gap: '14px' },
  subtotal: { fontWeight: 700, fontSize: '1rem', minWidth: '80px', textAlign: 'right' },
  removeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.1rem',
    opacity: 0.6,
    transition: 'opacity 0.2s',
  },
  summaryTitle: { fontFamily: 'Syne, sans-serif', fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    marginBottom: '10px',
    color: '#444',
  },
  summaryLabel: { color: '#777770' },
  totalRow: { fontWeight: 700, fontSize: '1rem', color: '#1a1a1a', marginTop: '4px' },
  totalPrice: { color: '#ff5722', fontSize: '1.2rem', fontFamily: 'Syne, sans-serif' },
}
