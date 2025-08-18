// Admin Dashboard Component
import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../contexts/AuthContext'
import api from '../../api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useContext(AuthContext)

  // Check if user is admin
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Access Denied: Admin privileges required
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/dashboard')
      setStats(response.data)
      setError(null)
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      setError('Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <h3 className="font-bold">Error</h3>
          <p>{error}</p>
          <button 
            onClick={fetchDashboardStats}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.username}!</p>
        </div>

        {/* Quick Navigation */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-blue-500"
          >
            <div className="flex items-center">
              <div className="text-3xl mr-4">👥</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Manage Users</h3>
                <p className="text-gray-600 text-sm">View and manage user accounts</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/products"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-green-500"
          >
            <div className="flex items-center">
              <div className="text-3xl mr-4">📦</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Manage Products</h3>
                <p className="text-gray-600 text-sm">Add, edit and manage products</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-purple-500"
          >
            <div className="flex items-center">
              <div className="text-3xl mr-4">🛒</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Manage Orders</h3>
                <p className="text-gray-600 text-sm">View and process orders</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/analytics"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-yellow-500"
          >
            <div className="flex items-center">
              <div className="text-3xl mr-4">📊</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                <p className="text-gray-600 text-sm">View business insights</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.total_users}
            icon="👥"
            color="bg-blue-500"
          />
          <StatCard
            title="Total Products"
            value={stats.total_products}
            icon="📦"
            color="bg-green-500"
          />
          <StatCard
            title="Total Orders"
            value={stats.total_orders}
            icon="🛒"
            color="bg-purple-500"
          />
          <StatCard
            title="Total Revenue"
            value={`৳${stats.total_revenue.toFixed(2)}`}
            icon="💰"
            color="bg-yellow-500"
          />
          <StatCard
            title="Pending Orders"
            value={stats.pending_orders}
            icon="⏳"
            color="bg-orange-500"
            alert={stats.pending_orders > 0}
          />
          <StatCard
            title="Low Stock Products"
            value={stats.low_stock_products}
            icon="⚠️"
            color="bg-red-500"
            alert={stats.low_stock_products > 0}
          />
        </div>

        {/* Quick Actions
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionButton
              title="Manage Users"
              description="View and manage user accounts"
              icon="👥"
              onClick={() => window.location.href = '/admin/users'}
            />
            <QuickActionButton
              title="Manage Products"
              description="Add, edit, and manage products"
              icon="📦"
              onClick={() => window.location.href = '/admin/products'}
            />
            <QuickActionButton
              title="Manage Orders"
              description="View and process orders"
              icon="🛒"
              onClick={() => window.location.href = '/admin/orders'}
            />
            <QuickActionButton
              title="Analytics"
              description="View sales and analytics"
              icon="📊"
              onClick={() => window.location.href = '/admin/analytics'}
            />
          </div>
        </div> */}
      </div>
    </div>
  )
}

// Reusable StatCard Component
function StatCard({ title, value, icon, color, alert = false }) {
  return (
    <div className={`${color} rounded-lg shadow-md p-6 text-white ${alert ? 'ring-2 ring-yellow-400' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="text-4xl opacity-75">
          {icon}
        </div>
      </div>
      {alert && (
        <div className="mt-2 text-sm font-medium">
          ⚠️ Requires attention
        </div>
      )}
    </div>
  )
}

// Quick Action Button Component
function QuickActionButton({ title, description, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 text-left group"
    >
      <div className="flex items-center mb-2">
        <span className="text-2xl mr-2">{icon}</span>
        <h3 className="font-medium text-gray-900 group-hover:text-indigo-600">{title}</h3>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  )
}
