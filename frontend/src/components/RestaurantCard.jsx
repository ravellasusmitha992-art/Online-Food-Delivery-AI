// components/RestaurantCard.jsx
import { useNavigate } from 'react-router-dom'

// Emoji map for cuisine types
const cuisineEmoji = {
  'Indian':    '🍛',
  'Chinese':   '🥡',
  'Italian':   '🍕',
  'Mexican':   '🌮',
  'Japanese':  '🍣',
  'Fast Food': '🍔',
  'Desserts':  '🍰',
  'default':   '🍽️',
}

export default function RestaurantCard({ restaurant }) {
  const navigate = useNavigate()
  const emoji = cuisineEmoji[restaurant.cuisineType] || cuisineEmoji['default']

  return (
    <div
      className="restaurant-card"
      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/restaurant/${restaurant.id}`)}
    >
      {/* Image / Visual Header */}
      <div className="restaurant-image">
        <span style={styles.emoji}>{emoji}</span>
      </div>

      {/* Info */}
      <div className="restaurant-body">
        <h3 className="restaurant-name">{restaurant.name}</h3>
        <p style={styles.meta}>
          <span className="meta-pill">📍 {restaurant.location}</span>
          {restaurant.cuisineType && (
            <span className="meta-pill">🍽 {restaurant.cuisineType}</span>
          )}
        </p>
        <div style={styles.footer}>
          <span style={styles.rating}>⭐ {restaurant.rating?.toFixed(1) || '4.0'}</span>
          <span style={styles.delivery}>🕐 {restaurant.deliveryTime || 30} min</span>
          <span style={styles.viewMenu}>View Menu →</span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  emoji: { fontSize: '4rem' },
  meta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '12px',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '0.85rem',
  },
  rating: { color: '#f57f17', fontWeight: 600 },
  delivery: { color: '#736556' },
  viewMenu: {
    marginLeft: 'auto',
    color: '#d4552d',
    fontWeight: 600,
    fontSize: '0.88rem',
  },
}
