// pages/Home.jsx
// Shows all restaurants — the main landing page after login

import { useState, useEffect } from 'react'
import { restaurantAPI } from '../api/services'
import RestaurantCard from '../components/RestaurantCard'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [search, setSearch]           = useState('')
  const { user }                      = useAuth()

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    setLoading(true)
    try {
      const res = await restaurantAPI.getAll()
      setRestaurants(res.data.data || [])
    } catch (err) {
      setError('Failed to load restaurants. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  // Filter by search query (name or location or cuisine)
  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.location.toLowerCase().includes(search.toLowerCase()) ||
    (r.cuisineType || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page">
      <div className="container">
        {/* Hero Section */}
        <div className="hero-panel rise-in">
          <h1 style={styles.heroTitle}>
            🍔 What are you<br />
            <span className="hero-accent">craving today?</span>
          </h1>
          <p style={styles.heroSub}>
            Hungry, {user?.name?.split(' ')[0]}? Pick a restaurant and order in minutes.
          </p>
        </div>

        {/* Search Bar */}
        <div className="search-shell">
          <span style={styles.searchIcon}>🔎</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search restaurants, cuisines, locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button style={styles.clearBtn} onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        {/* Stats bar */}
        {!loading && !error && (
          <p style={styles.stats}>
            {filtered.length} restaurant{filtered.length !== 1 ? 's' : ''} available
            {search && ` for "${search}"`}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="loading-center">
            <div className="spinner" />
            <span>Loading restaurants...</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="alert alert-error" style={{ maxWidth: '500px', margin: '0 auto' }}>
            {error}
            <button onClick={fetchRestaurants} style={styles.retryBtn}>Retry</button>
          </div>
        )}

        {/* Restaurant Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid-2">
            {filtered.map(restaurant => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🏪</div>
            <h3>No restaurants found</h3>
            <p>
              {search
                ? `No results for "${search}". Try a different search.`
                : 'No restaurants have been added yet. Add some via the API!'}
            </p>
            {search && (
              <button
                className="btn btn-outline"
                style={{ marginTop: '16px' }}
                onClick={() => setSearch('')}
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 800,
    lineHeight: 1.1,
    marginBottom: '12px',
  },
  heroSub: {
    fontSize: '1.05rem',
    color: '#736556',
  },
  searchIcon: { fontSize: '1.1rem', flexShrink: 0 },
  clearBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#999',
    fontSize: '1rem',
    padding: '4px',
    borderRadius: '50%',
  },
  stats: {
    fontSize: '0.88rem',
    color: '#736556',
    marginBottom: '20px',
  },
  retryBtn: {
    marginLeft: '12px',
    background: '#c62828',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
}
