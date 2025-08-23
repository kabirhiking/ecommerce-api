import React, { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../../contexts/AuthContext'
import api from '../../api'

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [customerStats, setCustomerStats] = useState(null)
  const [inventoryStats, setInventoryStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('30') // days
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
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Fetch main analytics
      const response = await api.get(`/admin/analytics?days=${timeRange}`)
      setAnalytics(response.data)
      
      // Fetch additional analytics
      const [customerResponse, inventoryResponse] = await Promise.all([
        api.get('/admin/analytics/customer-stats'),
        api.get('/admin/analytics/inventory-stats')
      ])
      
      setCustomerStats(customerResponse.data)
      setInventoryStats(inventoryResponse.data)
      setError(null)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return `৳${(amount || 0).toFixed(2)}`
  }

  // Helper function to format percentage
  const formatPercentage = (value, total) => {
    if (!total) return '0%'
    return `${((value / total) * 100).toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error Loading Analytics</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchAnalytics}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">No analytics data available</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Business insights and performance metrics</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
              <button 
                onClick={fetchAnalytics}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white text-xl">
                  💰
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analytics.total_revenue)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white text-xl">
                  📦
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {analytics.total_orders?.toLocaleString() || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          {/* New Customers */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white text-xl">
                  👥
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">New Customers</dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {analytics.new_customers?.toLocaleString() || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white text-xl">
                  📊
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Average Order</dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analytics.average_order_value)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Customer Statistics */}
          {customerStats && (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">👥 Customer Insights</h3>
                <span className="text-sm text-gray-500">Total Overview</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{customerStats.total_customers}</div>
                  <div className="text-xs text-gray-600">Total Customers</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{customerStats.active_customers}</div>
                  <div className="text-xs text-gray-600">Active Customers</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{customerStats.customer_retention_rate.toFixed(1)}%</div>
                  <div className="text-xs text-gray-600">Retention Rate</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{customerStats.new_customers}</div>
                  <div className="text-xs text-gray-600">New Customers</div>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Statistics */}
          {inventoryStats && (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">📦 Inventory Overview</h3>
                <span className="text-sm text-gray-500">Stock Status</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{inventoryStats.total_products}</div>
                  <div className="text-xs text-gray-600">Total Products</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{inventoryStats.low_stock_products}</div>
                  <div className="text-xs text-gray-600">Low Stock</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{inventoryStats.out_of_stock_products}</div>
                  <div className="text-xs text-gray-600">Out of Stock</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(inventoryStats.total_inventory_value)}</div>
                  <div className="text-xs text-gray-600">Inventory Value</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Products */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">🏆 Top Products</h3>
              <span className="text-sm text-gray-500">Last {timeRange} days</span>
            </div>
            <div className="space-y-4">
              {analytics.top_products?.length > 0 ? (
                analytics.top_products.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.total_sold} units sold
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(product.revenue)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(product.revenue / product.total_sold)} per unit
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  📭 No product sales data available
                </div>
              )}
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">📈 Order Status</h3>
              <span className="text-sm text-gray-500">Distribution</span>
            </div>
            <div className="space-y-4">
              {analytics.order_status_distribution ? (
                Object.entries(analytics.order_status_distribution).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                      <span className="text-xs text-gray-500">
                        ({formatPercentage(count, analytics.total_orders)})
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  📭 No order status data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">🔔 Recent Activities</h3>
          </div>
          <div className="p-6">
            {analytics.recent_activities?.length > 0 ? (
              <div className="space-y-4">
                {analytics.recent_activities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        📦
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                📭 No recent activities
              </div>
            )}
          </div>
        </div>

        {/* Summary Footer */}
        <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">📋 Analytics Summary</h3>
            <p className="text-indigo-100">
              In the last {timeRange} days: {analytics.total_orders} orders generating {formatCurrency(analytics.total_revenue)} revenue
              {analytics.new_customers > 0 && ` with ${analytics.new_customers} new customers`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
