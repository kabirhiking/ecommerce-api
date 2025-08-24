import React, { useContext } from 'react'
import { CartContext } from '../contexts/CartContext'
import { AuthContext } from '../contexts/AuthContext'
import api from '../api'

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useContext(CartContext)
  const { user } = useContext(AuthContext)

  // Create full image URL (same as ProductCard)
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/api/placeholder/80/80'
    if (imagePath.startsWith('http')) return imagePath // External URL
    return `http://localhost:8000${imagePath}` // Local uploaded file
  }

  const handleRemoveItem = (productId) => {
    // Handle both local cart items and backend cart items
    const itemId = typeof productId === 'object' ? productId.product?.id || productId.id : productId
    removeFromCart(itemId)
  }

  const handleUpdateQuantity = (productId, newQuantity) => {
    // Handle both local cart items and backend cart items  
    const itemId = typeof productId === 'object' ? productId.product?.id || productId.id : productId
    updateQuantity(itemId, newQuantity)
  }

  const placeOrder = async () => {
    if (!user) {
      alert('Please login to place an order')
      return
    }

    try {
      // Use the backend checkout endpoint
      const response = await api.post('/cart/checkout')
      alert('Order placed successfully!')
      clearCart()
      // Optionally redirect to orders page
      // window.location.href = '/orders'
    } catch (err) {
      console.error('Checkout error:', err)
      if (err.response?.data?.detail) {
        alert(`Could not place order: ${err.response.data.detail}`)
      } else {
        alert('Could not place order. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          </div>
          
          {cartItems.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-500 text-lg">Your cart is empty</div>
              <p className="text-gray-400 mt-2">Add some products to get started!</p>
            </div>
          ) : (
            <>
              <div className="px-6 py-4">
                {cartItems.map((item, index) => {
                  // Handle both local cart items and backend cart items
                  const product = item.product || item
                  const itemId = product.id
                  const productName = product.name || product.title
                  const productPrice = parseFloat(product.price) || 0
                  const itemQuantity = item.quantity || 0
                  
                  // Use a unique key that includes cart item ID if available
                  const uniqueKey = item.id ? `cart-${item.id}` : `product-${itemId}-${index}`
                  
                  return (
                    <div key={uniqueKey} className="flex items-center py-4 border-b border-gray-200 last:border-b-0">
                      <img 
                        src={getImageUrl(product.image)} 
                        alt={productName}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/80/80'
                        }}
                      />
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {productName}
                        </h3>
                        <p className="text-gray-600">৳{productPrice.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUpdateQuantity(itemId, itemQuantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{itemQuantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(itemId, itemQuantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                      <div className="ml-4 text-lg font-medium text-gray-900">
                        ৳{(productPrice * itemQuantity).toFixed(2)}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(itemId)}
                        className="ml-4 text-red-600 hover:text-red-800 p-2"
                      >
                        ✕
                      </button>
                    </div>
                  )
                })}
              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-xl font-bold text-gray-900">
                    Total: ৳{getCartTotal().toFixed(2)}
                  </div>
                  <button
                    onClick={placeOrder}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}