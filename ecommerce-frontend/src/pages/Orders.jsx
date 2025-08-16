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
    return <div className="container">Loading orders...</div>
  }

  return (
    <div className="container mx-auto px-14 py-8 ">
      <h2 className="text-2xl font-bold mb-6">Your Orders</h2>
      {orders.length === 0 ? (
        <div className="text-center text-gray-500">No orders yet</div>
      ) : (
        <div className="space-y-6 px-60">
          {orders.map(order => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                  <p className="text-gray-600">Total: ${order.total_price?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {/* You could add order date here if available */}
                </div>
              </div>
              
              {order.order_items && order.order_items.length > 0 ? (
                <div>
                  <h4 className="font-medium mb-3">Order Items:</h4>
                  <div className="space-y-2">
                    {order.order_items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                        <div className="flex-1">
                          <h5 className="font-medium">{item.product?.name || `Product ID: ${item.product_id}`}</h5>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × ${item.price?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 italic">No order items found</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
