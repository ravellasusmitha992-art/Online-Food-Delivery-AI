// components/ProtectedRoute.jsx
// Wraps any page that requires authentication
// If user is not logged in → redirect to /login

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, token } = useAuth()
  const location = useLocation()

  if (!user || !token) {
    // Save the attempted URL so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
