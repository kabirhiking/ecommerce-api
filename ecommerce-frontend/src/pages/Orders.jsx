import React, { useEffect, useState } from 'react'
import api from '../api'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/')
        setOrders(response.data)
      } catch (err) {
        console.error('Error fetching orders:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center lg:text-left">Your Orders</h2>
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center max-w-md mx-auto">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">When you make your first purchase, it will appear here.</p>
            <button
              onClick={() => window.history.back()}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition duration-200"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto lg:max-w-full">
            {orders.map(order => (
              <div key={order.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                        Order #{order.id}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mt-1">
                        Status: <span className="font-medium text-indigo-600 capitalize">{order.status || 'Pending'}</span>
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-lg sm:text-xl font-bold text-gray-900">
                        Total: ৳{order.total_price?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Date not available'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="p-4 sm:p-6">
                  {order.order_items && order.order_items.length > 0 ? (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 sm:mb-4">Order Items:</h4>
                      <div className="space-y-3 sm:space-y-4">
                        {order.order_items.map((item, index) => (
                          <div key={index} className="flex gap-3 sm:gap-4 bg-gray-50 p-3 sm:p-4 rounded-lg">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                              <img 
                                src={item.product?.image ? `http://127.0.0.1:8000${item.product.image}` : '/placeholder-product.jpg'}
                                alt={item.product?.name || 'Product'}
                                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-200"
                                onError={(e) => {
                                  e.target.src = '/placeholder-product.jpg'
                                }}
                              />
                            </div>
                            
                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                                {item.product?.name || `Product ID: ${item.product_id}`}
                              </h5>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                                <p className="text-xs sm:text-sm text-gray-600">
                                  Qty: <span className="font-medium">{item.quantity}</span>
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  Price: <span className="font-medium">৳{item.price?.toFixed(2) || '0.00'}</span>
                                </p>
                              </div>
                              {/* Product description/category if available */}
                              {item.product?.category && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Category: {item.product.category}
                                </p>
                              )}
                            </div>
                            
                            {/* Subtotal */}
                            <div className="flex flex-col justify-between items-end text-right">
                              <div className="flex sm:hidden text-xs text-gray-600 mb-1">
                                Subtotal:
                              </div>
                              <p className="font-medium text-gray-900 text-sm sm:text-base">
                                ৳{((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 italic">No order items found</p>
                    </div>
                  )}
                </div>
                
                {/* Order Actions */}
                <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition duration-200">
                      Track Order
                    </button>
                    <button className="w-full sm:w-auto border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition duration-200">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
