// pages/RestaurantMenu.jsx
// Shows the menu for a specific restaurant, grouped by category

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { restaurantAPI, menuAPI } from '../api/services'
import { getApiErrorMessage } from '../api/axios'
import MenuItemCard from '../components/MenuItemCard'

export default function RestaurantMenu() {
  const { id }                          = useParams()
  const navigate                        = useNavigate()
  const [restaurant, setRestaurant]     = useState(null)
  const [menuItems, setMenuItems]       = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [restRes, menuRes] = await Promise.all([
        restaurantAPI.getById(id),
        menuAPI.getByRestaurant(id),
      ])
      setRestaurant(restRes.data.data)
      setMenuItems(menuRes.data.data || [])
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load menu. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  // Get unique categories from menu items
  const categories = ['All', ...new Set(menuItems.map(i => i.category).filter(Boolean))]

  // Filter items by selected category
  const displayed = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(i => i.category === activeCategory)

  if (loading) return (
    <div className="page">
      <div className="loading-center">
        <div className="spinner" />
        <span>Loading menu...</span>
      </div>
    </div>
  )

  if (error) return (
    <div className="page">
      <div className="container">
        <div className="alert alert-error">{error}</div>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="container">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          style={styles.backBtn}
        >
          ← All Restaurants
        </button>

        {/* Restaurant Header */}
        {restaurant && (
          <div style={styles.restHeader}>
            <div style={styles.restEmoji}>🍽️</div>
            <div>
              <h1 style={styles.restName}>{restaurant.name}</h1>
              <div style={styles.restMeta}>
                <span>📍 {restaurant.location}</span>
                {restaurant.cuisineType && <span>🍽 {restaurant.cuisineType}</span>}
                <span>⭐ {restaurant.rating?.toFixed(1)}</span>
                <span>🕐 {restaurant.deliveryTime} min</span>
              </div>
            </div>
          </div>
        )}

        <hr className="divider" />

        {/* Category Filter Tabs */}
        {categories.length > 1 && (
          <div style={styles.categoryRow}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  ...styles.categoryBtn,
                  background: activeCategory === cat ? '#ff5722' : '#f5f5f0',
                  color: activeCategory === cat ? '#fff' : '#555',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Menu Grid */}
        {displayed.length > 0 ? (
          <>
            <p style={styles.itemCount}>{displayed.length} item{displayed.length !== 1 ? 's' : ''}</p>
            <div className="grid-3">
              {displayed.map(item => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <h3>No items available</h3>
            <p>This restaurant hasn't added menu items yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#ff5722',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: '0 0 20px',
    fontFamily: 'DM Sans, sans-serif',
  },
  restHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '20px',
  },
  restEmoji: {
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #fff3ef, #fce4ec)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
    flexShrink: 0,
  },
  restName: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '1.8rem',
    fontWeight: 800,
    marginBottom: '8px',
  },
  restMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    fontSize: '0.88rem',
    color: '#777770',
  },
  categoryRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '24px',
  },
  categoryBtn: {
    border: 'none',
    borderRadius: '20px',
    padding: '8px 18px',
    fontSize: '0.88rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'DM Sans, sans-serif',
  },
  itemCount: {
    fontSize: '0.88rem',
    color: '#777770',
    marginBottom: '16px',
  },
}
