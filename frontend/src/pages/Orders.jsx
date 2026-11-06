// pages/Orders.jsx
// Displays the logged-in user's order history

import { useState, useEffect } from 'react'
import { orderAPI } from '../api/services'
import { getApiErrorMessage } from '../api/axios'
import { useNavigate } from 'react-router-dom'

// Map status to color and label
const statusConfig = {
  PENDING:    { color: '#f57f17', bg: '#fff8e1', label: '⏳ Pending' },
  CONFIRMED:  { color: '#1565c0', bg: '#e3f2fd', label: '✅ Confirmed' },
  PREPARING:  { color: '#e65100', bg: '#fff3e0', label: '👨‍🍳 Preparing' },
  DELIVERED:  { color: '#2e7d32', bg: '#e8f5e9', label: '🎉 Delivered' },
  CANCELLED:  { color: '#c62828', bg: '#ffebee', label: '❌ Cancelled' },
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const navigate              = useNavigate()

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await orderAPI.getHistory()
      setOrders(res.data.data || [])
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load orders.'))
    } finally {
      setLoading(false)
    }
  }

  // Format date string
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  if (loading) return (
    <div className="page">
      <div className="loading-center">
        <div className="spinner" />
        <span>Loading your orders...</span>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>📦 Your Orders</h1>
          <p>Track all your past and current orders</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Empty state */}
        {orders.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No orders yet</h3>
            <p>Place your first order and it'll show up here!</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: '16px' }}
              onClick={() => navigate('/')}
            >
              Start Ordering
            </button>
          </div>
        )}

        {/* Orders List */}
        <div style={styles.ordersList}>
          {orders.map(order => {
            const status = statusConfig[order.status] || statusConfig['PENDING']
            return (
              <div key={order.id} className="card" style={styles.orderCard}>
                {/* Order Header */}
                <div style={styles.orderHeader}>
                  <div>
                    <span style={styles.orderId}>Order #{order.id}</span>
                    <p style={styles.orderDate}>{formatDate(order.createdAt)}</p>
                  </div>
                  <span style={{
                    ...styles.statusBadge,
                    background: status.bg,
                    color: status.color,
                  }}>
                    {status.label}
                  </span>
                </div>

                {order.restaurant?.name && (
                  <div style={styles.restaurantRow}>
                    <span style={styles.restaurantLabel}>Restaurant</span>
                    <span style={styles.restaurantValue}>{order.restaurant.name}</span>
                  </div>
                )}

                <hr className="divider" />

                {/* Order Items */}
                {Array.isArray(order.items) && order.items.length > 0 && (
                  <div style={styles.itemsSection}>
                    <p style={styles.itemsLabel}>Items ordered:</p>
                    <div style={styles.itemsList}>
                      {order.items.map((item, idx) => (
                        <span key={`${item.id || item.itemName}-${idx}`} style={styles.itemChip}>
                          <span style={{ ...styles.typePill, background: item.itemType === 'NON_VEG' ? '#fff1f0' : '#eef7ee', color: item.itemType === 'NON_VEG' ? '#b71c1c' : '#2e7d32' }}>
                            {item.itemType === 'NON_VEG' ? 'Non-Veg' : 'Veg'}
                          </span>
                          <span>{item.itemName} x{item.quantity}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery address */}
                {order.deliveryAddress && (
                  <p style={styles.address}>
                    📍 {order.deliveryAddress}
                  </p>
                )}

                {/* Order Footer */}
                <div style={styles.orderFooter}>
                  <span style={styles.totalLabel}>Total Amount</span>
                  <span style={styles.totalAmount}>₹{order.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const styles = {
  ordersList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  orderCard: { padding: '20px 24px' },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '4px',
  },
  orderId: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '1.05rem',
    fontWeight: 700,
  },
  orderDate: {
    fontSize: '0.83rem',
    color: '#777770',
    marginTop: '4px',
  },
  restaurantRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '10px 0 4px',
    color: '#55554f',
    fontSize: '0.9rem',
  },
  restaurantLabel: { color: '#777770' },
  restaurantValue: { fontWeight: 600 },
  statusBadge: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.83rem',
    fontWeight: 600,
  },
  itemsSection: { marginBottom: '12px' },
  itemsLabel: {
    fontSize: '0.83rem',
    color: '#777770',
    marginBottom: '8px',
  },
  itemsList: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  itemChip: {
    background: '#f5f5f0',
    borderRadius: '999px',
    padding: '4px 10px',
    fontSize: '0.83rem',
    color: '#444',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  typePill: { borderRadius: '999px', padding: '2px 8px', fontSize: '0.72rem', fontWeight: 700 },
  address: {
    fontSize: '0.88rem',
    color: '#555',
    marginBottom: '12px',
  },
  orderFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
    paddingTop: '12px',
    borderTop: '1px solid #e8e8e2',
  },
  totalLabel: { fontSize: '0.88rem', color: '#777770' },
  totalAmount: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#ff5722',
  },
}
