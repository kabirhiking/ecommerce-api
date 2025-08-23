import React, { useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'
import { ProductReviews } from '../components/ProductReviews'
import { CartContext } from '../contexts/CartContext'

export default function Product() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { addToCart } = useContext(CartContext)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/products/${id}`)
        setProduct(response.data)
        setError(null)
      } catch (err) {
        console.error('Error fetching product:', err)
        setError('Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, 1)
      alert('Product added to cart!')
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add product to cart')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-4">{error || 'Product not found'}</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        {/* Product Details Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-5 p-3 lg:p-4">
            {/* Product Image */}
            <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={product.image ? `http://127.0.0.1:8000${product.image}` : '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-48 sm:h-56 lg:h-64 object-contain hover:object-cover transition-all duration-300 cursor-pointer"
                onError={(e) => {
                  e.target.src = '/placeholder-product.jpg'
                }}
              />
            </div>

            {/* Product Info */}
            <div className="space-y-2 lg:space-y-3">
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{product.name}</h1>
                {product.category && (
                  <p className="text-xs text-gray-500 mt-1">Category: {product.category}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-600">৳{product.price}</span>
                {product.quantity > 0 ? (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    In Stock ({product.quantity})
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                    Out of Stock
                  </span>
                )}
              </div>

              {product.description && (
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">Description</h3>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              )}

              {product.sku && (
                <div className="text-xs text-gray-500">
                  SKU: {product.sku}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.quantity === 0}
                  className="w-full bg-indigo-600 text-white py-2 px-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 text-sm"
                >
                  {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                
                <button
                  onClick={() => {
                    // Add to wishlist functionality can be added later
                    alert('Wishlist feature coming soon!')
                  }}
                  className="w-full border border-gray-300 text-gray-700 py-2 px-3 rounded-lg font-medium hover:bg-gray-50 transition duration-200 text-sm"
                >
                  Add to Wishlist
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ProductReviews productId={parseInt(id)} />
      </div>
    </div>
  )
}