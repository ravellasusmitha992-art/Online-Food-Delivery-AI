// App.jsx
// Root component — sets up router, context providers, and all routes

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

// Pages
import Login           from './pages/Login'
import Register        from './pages/Register'
import Home            from './pages/Home'
import RestaurantMenu  from './pages/RestaurantMenu'
import Cart            from './pages/Cart'
import Orders          from './pages/Orders'
import SellerDashboard from './pages/SellerDashboard'

export default function App() {
  return (
    // BrowserRouter: enables client-side routing
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {/* AuthProvider: global authentication state */}
      <AuthProvider>
        {/* CartProvider: global cart count state */}
        <CartProvider>
          {/* Navbar: always visible at the top */}
          <Navbar />

          {/* Route definitions */}
          <Routes>
            {/* Public routes: accessible without login */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes: require JWT token */}
            <Route path="/" element={
              <ProtectedRoute><Home /></ProtectedRoute>
            } />
            <Route path="/restaurant/:id" element={
              <ProtectedRoute><RestaurantMenu /></ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute><Cart /></ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute><Orders /></ProtectedRoute>
            } />
            <Route path="/seller" element={
              <ProtectedRoute><SellerDashboard /></ProtectedRoute>
            } />

            {/* Fallback: redirect unknown paths to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
