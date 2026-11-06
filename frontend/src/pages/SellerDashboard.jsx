// pages/SellerDashboard.jsx
// Seller console for restaurant ownership and order status updates

import { useEffect, useState } from 'react'
import { menuAPI, restaurantAPI, sellerAPI } from '../api/services'
import { getApiErrorMessage } from '../api/axios'
import { useAuth } from '../context/AuthContext'

const statusOptions = ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERED', 'CANCELLED']

export default function SellerDashboard() {
  const { user } = useAuth()
  const [restaurants, setRestaurants] = useState([])
  const [orders, setOrders] = useState([])
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL')
  const [menuItems, setMenuItems] = useState([])
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    location: '',
    cuisineType: '',
    deliveryTime: '',
  })
  const [menuForm, setMenuForm] = useState({
    restaurantId: '',
    name: '',
    description: '',
    price: '',
    itemType: 'VEG',
    category: '',
    available: true,
  })
  const [editingMenuItemId, setEditingMenuItemId] = useState(null)
  const [activeRestaurantId, setActiveRestaurantId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [creatingRestaurant, setCreatingRestaurant] = useState(false)
  const [creatingMenuItem, setCreatingMenuItem] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [restaurantsRes, ordersRes] = await Promise.all([
        sellerAPI.getRestaurants(),
        sellerAPI.getOrders(),
      ])
      const sellerRestaurants = restaurantsRes.data.data || []
      setRestaurants(sellerRestaurants)
      if (sellerRestaurants.length > 0) {
        setActiveRestaurantId((current) => current || String(sellerRestaurants[0].id))
      }
      setOrders(ordersRes.data.data || [])

      const menuResponses = await Promise.all(
        sellerRestaurants.map(async (restaurant) => {
          const response = await sellerAPI.getMenu(restaurant.id)
          return (response.data.data || []).map((item) => ({
            ...item,
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
          }))
        })
      )
      setMenuItems(menuResponses.flat())
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load seller dashboard.'))
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId)
    try {
      await sellerAPI.updateStatus(orderId, status)
      await fetchData()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update order status.'))
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRestaurantInput = (event) => {
    const { name, value } = event.target
    setRestaurantForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleMenuInput = (event) => {
    const { name, value, type, checked } = event.target
    setMenuForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const createRestaurant = async (event) => {
    event.preventDefault()
    setCreatingRestaurant(true)
    setError('')

    try {
      const payload = {
        name: restaurantForm.name.trim(),
        location: restaurantForm.location.trim(),
        cuisineType: restaurantForm.cuisineType.trim(),
        deliveryTime: restaurantForm.deliveryTime ? Number(restaurantForm.deliveryTime) : null,
      }

      await restaurantAPI.add(payload)
      setRestaurantForm({ name: '', location: '', cuisineType: '', deliveryTime: '' })
      await fetchData()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create restaurant.'))
    } finally {
      setCreatingRestaurant(false)
    }
  }

  const createMenuItem = async (event) => {
    event.preventDefault()
    setCreatingMenuItem(true)
    setError('')

    try {
      if (!menuForm.restaurantId) {
        setError('Please select a restaurant first.')
        return
      }

      const payload = {
        name: menuForm.name.trim(),
        description: menuForm.description.trim(),
        price: Number(menuForm.price),
        itemType: menuForm.itemType,
        category: menuForm.category.trim(),
        available: Boolean(menuForm.available),
      }

      if (editingMenuItemId) {
        await menuAPI.updateItem(editingMenuItemId, payload)
      } else {
        await menuAPI.addItem(menuForm.restaurantId, payload)
      }

      resetMenuForm()
      await fetchData()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create menu item.'))
    } finally {
      setCreatingMenuItem(false)
    }
  }

  const resetMenuForm = () => {
    setMenuForm({
      restaurantId: '',
      name: '',
      description: '',
      price: '',
      itemType: 'VEG',
      category: '',
      available: true,
    })
    setEditingMenuItemId(null)
  }

  const editMenuItem = (item) => {
    setMenuForm({
      restaurantId: String(item.restaurantId),
      name: item.name || '',
      description: item.description || '',
      price: item.price ?? '',
      itemType: item.itemType || 'VEG',
      category: item.category || '',
      available: item.available !== false,
    })
    setEditingMenuItemId(item.id)
    setActiveRestaurantId(String(item.restaurantId))
  }

  const deleteMenuItem = async (itemId) => {
    setError('')
    try {
      await menuAPI.deleteItem(itemId)
      await fetchData()
      if (editingMenuItemId === itemId) {
        resetMenuForm()
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete menu item.'))
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (orderStatusFilter === 'ALL') return true
    return order.status === orderStatusFilter
  })

  if (loading) {
    return (
      <div className="page">
        <div className="loading-center">
          <div className="spinner" />
          <span>Loading seller dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Seller Dashboard</h1>
          <p>{user?.name ? `Welcome back, ${user.name}` : 'Manage your restaurants and orders.'}</p>
        </div>

        <div style={styles.statsGrid}>
          <div className="card" style={styles.statCard}>
            <span style={styles.statLabel}>Restaurants</span>
            <strong style={styles.statValue}>{restaurants.length}</strong>
          </div>
          <div className="card" style={styles.statCard}>
            <span style={styles.statLabel}>Menu Items</span>
            <strong style={styles.statValue}>{menuItems.length}</strong>
          </div>
          <div className="card" style={styles.statCard}>
            <span style={styles.statLabel}>Orders</span>
            <strong style={styles.statValue}>{orders.length}</strong>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card" style={styles.section}>
          <h2 style={styles.sectionTitle}>Add Restaurant</h2>
          <p style={styles.helperText}>
            Create a restaurant here. It will appear on the public restaurant list and any orders from it will belong to you.
          </p>
          <form onSubmit={createRestaurant} style={styles.form}>
            <input
              className="form-input"
              name="name"
              placeholder="Restaurant name"
              value={restaurantForm.name}
              onChange={handleRestaurantInput}
              required
            />
            <input
              className="form-input"
              name="location"
              placeholder="Location"
              value={restaurantForm.location}
              onChange={handleRestaurantInput}
              required
            />
            <input
              className="form-input"
              name="cuisineType"
              placeholder="Cuisine type"
              value={restaurantForm.cuisineType}
              onChange={handleRestaurantInput}
            />
            <input
              className="form-input"
              name="deliveryTime"
              type="number"
              min="10"
              step="5"
              placeholder="Delivery time in minutes"
              value={restaurantForm.deliveryTime}
              onChange={handleRestaurantInput}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creatingRestaurant}
              style={styles.createBtn}
            >
              {creatingRestaurant ? 'Creating...' : 'Add Restaurant'}
            </button>
          </form>
        </div>

        <div className="card" style={styles.section}>
          <h2 style={styles.sectionTitle}>Your Restaurants</h2>
          {restaurants.length > 0 ? (
            <div style={styles.list}>
              {restaurants.map((restaurant) => (
                <div key={restaurant.id} style={styles.row}>
                  <strong>{restaurant.name}</strong>
                  <span>{restaurant.location}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.muted}>No restaurants assigned yet.</p>
          )}
        </div>

        <div className="card" style={styles.section}>
          <h2 style={styles.sectionTitle}>Manage Menu Items</h2>
          {restaurants.length === 0 ? (
            <p style={styles.muted}>Create a restaurant first to manage menu items.</p>
          ) : menuItems.length > 0 ? (
            <div style={styles.menuGroups}>
              <div style={styles.tabRow}>
                {restaurants.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    type="button"
                    onClick={() => setActiveRestaurantId(String(restaurant.id))}
                    style={{
                      ...styles.tabBtn,
                      background: activeRestaurantId === String(restaurant.id) ? '#ff5722' : '#f5f5f0',
                      color: activeRestaurantId === String(restaurant.id) ? '#fff' : '#555',
                      boxShadow: activeRestaurantId === String(restaurant.id) ? '0 8px 20px rgba(255, 87, 34, 0.18)' : 'none',
                    }}
                  >
                    <span>{restaurant.name}</span>
                    <span
                      style={{
                        ...styles.tabCount,
                        background: activeRestaurantId === String(restaurant.id) ? 'rgba(255,255,255,0.22)' : '#fff',
                        color: activeRestaurantId === String(restaurant.id) ? '#fff' : '#777770',
                      }}
                    >
                      {menuItems.filter((item) => item.restaurantId === restaurant.id).length}
                    </span>
                  </button>
                ))}
              </div>

              {restaurants.map((restaurant) => {
                if (activeRestaurantId !== String(restaurant.id)) {
                  return null
                }

                const items = menuItems.filter((item) => item.restaurantId === restaurant.id)

                return (
                  <div key={restaurant.id} style={styles.menuGroup}>
                    <div style={styles.menuGroupHeader}>
                      <strong>{restaurant.name}</strong>
                      <span style={styles.muted}>{items.length} item{items.length !== 1 ? 's' : ''}</span>
                    </div>
                    {items.length > 0 ? (
                      <div style={styles.menuList}>
                        {items.map((item) => (
                          <div key={item.id} style={styles.menuItemRow}>
                            <div style={styles.menuItemMain}>
                              <div style={styles.menuTitleRow}>
                                <strong>{item.name}</strong>
                                <span style={{ ...styles.typeBadge, background: item.itemType === 'NON_VEG' ? '#fff1f0' : '#eef7ee', color: item.itemType === 'NON_VEG' ? '#b71c1c' : '#2e7d32' }}>
                                  {item.itemType === 'NON_VEG' ? 'Non-Veg' : 'Veg'}
                                </span>
                              </div>
                              <span style={styles.muted}>
                                {item.category || 'Uncategorized'} · ₹{item.price}
                                {item.available === false ? ' · Unavailable' : ''}
                              </span>
                              {item.description && <span style={styles.description}>{item.description}</span>}
                            </div>
                            <div style={styles.menuActions}>
                              <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => editMenuItem(item)}
                                style={styles.actionBtn}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => deleteMenuItem(item.id)}
                                style={styles.deleteBtn}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={styles.muted}>No menu items yet.</p>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p style={styles.muted}>No menu items available yet.</p>
          )}
        </div>

        <div className="card" style={styles.section}>
          <h2 style={styles.sectionTitle}>Add Menu Item</h2>
          <p style={styles.helperText}>
            Add items to one of your restaurants. These items will appear on the public restaurant menu page automatically.
          </p>
          <form onSubmit={createMenuItem} style={styles.form}>
            <select
              className="form-input"
              name="restaurantId"
              value={menuForm.restaurantId}
              onChange={handleMenuInput}
              required
            >
              <option value="">Select restaurant</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
            <select
              className="form-input"
              name="itemType"
              value={menuForm.itemType}
              onChange={handleMenuInput}
              required
            >
              <option value="VEG">Veg</option>
              <option value="NON_VEG">Non-Veg</option>
            </select>
            <input
              className="form-input"
              name="name"
              placeholder="Item name"
              value={menuForm.name}
              onChange={handleMenuInput}
              required
            />
            <input
              className="form-input"
              name="description"
              placeholder="Description"
              value={menuForm.description}
              onChange={handleMenuInput}
            />
            <input
              className="form-input"
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="Price"
              value={menuForm.price}
              onChange={handleMenuInput}
              required
            />
            <input
              className="form-input"
              name="category"
              placeholder="Category"
              value={menuForm.category}
              onChange={handleMenuInput}
            />
            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                name="available"
                checked={menuForm.available}
                onChange={handleMenuInput}
              />
              <span>Available</span>
            </label>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creatingMenuItem || restaurants.length === 0}
              style={styles.createBtn}
            >
              {creatingMenuItem ? 'Saving...' : editingMenuItemId ? 'Update Menu Item' : 'Add Menu Item'}
            </button>
            {editingMenuItemId && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={resetMenuForm}
                style={styles.cancelBtn}
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        <div className="card" style={styles.section}>
          <h2 style={styles.sectionTitle}>Restaurant Orders</h2>
          <div style={styles.filterRow}>
            {['ALL', 'PENDING', 'DELIVERED'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setOrderStatusFilter(filter)}
                style={{
                  ...styles.filterBtn,
                  background: orderStatusFilter === filter ? '#ff5722' : '#f5f5f0',
                  color: orderStatusFilter === filter ? '#fff' : '#555',
                  boxShadow: orderStatusFilter === filter ? '0 8px 20px rgba(255, 87, 34, 0.14)' : 'none',
                }}
              >
                {filter === 'ALL' ? 'All Orders' : filter}
                <span style={{ ...styles.filterCount, background: orderStatusFilter === filter ? 'rgba(255,255,255,0.22)' : '#fff' }}>
                  {filter === 'ALL' ? orders.length : orders.filter((order) => order.status === filter).length}
                </span>
              </button>
            ))}
          </div>

          {filteredOrders.length > 0 ? (
            <div style={styles.orders}>
              {filteredOrders.map((order) => (
                <div key={order.id} style={styles.orderCard}>
                  <div style={styles.orderTop}>
                    <div>
                      <strong>Order #{order.id}</strong>
                      {order.restaurant?.name && (
                        <div style={styles.restaurantName}>{order.restaurant.name}</div>
                      )}
                      <div style={styles.muted}>₹{order.totalAmount?.toFixed?.(2) || order.totalAmount}</div>
                    </div>
                    <div style={styles.statusStack}>
                      <span style={{ ...styles.statusBadge, ...styles[order.status] || styles.PENDING }}>
                        {order.status}
                      </span>
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        style={styles.statusSelect}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {Array.isArray(order.items) && order.items.length > 0 && (
                    <div style={styles.items}>
                      {order.items.map((item, idx) => (
                        <span key={`${item.id || item.itemName}-${idx}`} style={styles.itemChip}>
                          <span style={{ ...styles.typePill, background: item.itemType === 'NON_VEG' ? '#fff1f0' : '#eef7ee', color: item.itemType === 'NON_VEG' ? '#b71c1c' : '#2e7d32' }}>
                            {item.itemType === 'NON_VEG' ? 'Non-Veg' : 'Veg'}
                          </span>
                          <span>{item.itemName} x{item.quantity}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {order.deliveryAddress && <div style={styles.muted}>{order.deliveryAddress}</div>}
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.muted}>No {orderStatusFilter === 'ALL' ? '' : orderStatusFilter.toLowerCase() + ' '}orders for your restaurants yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  section: { padding: '20px', marginBottom: '20px' },
  sectionTitle: { marginBottom: '12px', fontFamily: 'Syne, sans-serif' },
  helperText: { color: '#777770', fontSize: '0.92rem', marginBottom: '14px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' },
  statCard: { padding: '16px 18px', display: 'grid', gap: '6px', border: '1px solid #ece8df', borderRadius: '14px' },
  statLabel: { fontSize: '0.85rem', color: '#777770' },
  statValue: { fontSize: '1.5rem', fontFamily: 'Syne, sans-serif' },
  form: { display: 'grid', gap: '10px' },
  checkboxRow: { display: 'flex', alignItems: 'center', gap: '8px', color: '#444' },
  createBtn: { justifySelf: 'start', marginTop: '4px' },
  cancelBtn: { justifySelf: 'start', marginTop: '4px' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  row: { display: 'flex', justifyContent: 'space-between', gap: '12px' },
  menuGroups: { display: 'grid', gap: '16px' },
  tabRow: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  tabBtn: { border: 'none', borderRadius: '20px', padding: '8px 12px 8px 14px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease' },
  tabCount: { minWidth: '22px', height: '22px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, padding: '0 6px' },
  menuGroup: { border: '1px solid #ece8df', borderRadius: '12px', padding: '14px' },
  menuGroupHeader: { display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' },
  menuList: { display: 'grid', gap: '10px' },
  menuItemRow: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '12px', alignItems: 'center', padding: '12px', background: '#faf9f6', borderRadius: '10px' },
  menuItemMain: { display: 'grid', gap: '4px' },
  menuTitleRow: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  description: { color: '#55554f', fontSize: '0.9rem' },
  menuActions: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' },
  actionBtn: { padding: '8px 12px', background: '#fff', border: '1px solid #d7d7cf', color: '#333', minWidth: '82px' },
  deleteBtn: { padding: '8px 12px', background: '#fff4f4', border: '1px solid #f0b6b6', color: '#b71c1c', minWidth: '82px' },
  filterRow: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' },
  filterBtn: { border: 'none', borderRadius: '20px', padding: '8px 12px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' },
  filterCount: { minWidth: '22px', height: '22px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, padding: '0 6px', color: '#777770' },
  orders: { display: 'flex', flexDirection: 'column', gap: '12px' },
  orderCard: { padding: '14px', border: '1px solid #ece8df', borderRadius: '12px' },
  orderTop: { display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' },
  statusStack: { display: 'grid', gap: '8px', justifyItems: 'end' },
  statusBadge: { padding: '5px 10px', borderRadius: '999px', fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.02em' },
  PENDING: { background: '#fff8e1', color: '#f57f17' },
  CONFIRMED: { background: '#e3f2fd', color: '#1565c0' },
  PREPARING: { background: '#fff3e0', color: '#e65100' },
  DELIVERED: { background: '#e8f5e9', color: '#2e7d32' },
  CANCELLED: { background: '#ffebee', color: '#c62828' },
  statusSelect: { borderRadius: '10px', border: '1px solid #ddd', padding: '8px 10px' },
  restaurantName: { marginTop: '4px', color: '#55554f', fontSize: '0.9rem', fontWeight: 600 },
  items: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' },
  itemChip: { background: '#f5f5f0', borderRadius: '999px', padding: '4px 10px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  typePill: { borderRadius: '999px', padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700 },
  muted: { color: '#777770', fontSize: '0.92rem' },
}