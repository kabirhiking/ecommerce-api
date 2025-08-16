import React from 'react'
import { Link } from 'react-router-dom'

export default function ProductCard({ product, onAdd }) {
  const [isAdding, setIsAdding] = React.useState(false)
  
  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isAdding) return // Prevent double clicks
    
    setIsAdding(true)
    try {
      await onAdd(product)
    } finally {
      setIsAdding(false)
    }
  }

  // Create full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/api/placeholder/300/300'
    if (imagePath.startsWith('http')) return imagePath // External URL
    return `http://localhost:8000${imagePath}` // Local uploaded file
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1">
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-w-1 aspect-h-1 relative overflow-hidden">
          <img 
            src={getImageUrl(product.image)} 
            alt={product.name || product.title}
            className="w-full h-48 sm:h-56 lg:h-64 xl:h-72 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = '/api/placeholder/300/300'
            }}
          />
          {(product.quantity || product.stock) <= 5 && (product.quantity || product.stock) > 0 && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 lg:px-3 lg:py-2 rounded text-xs lg:text-sm font-medium">
              Only {product.quantity || product.stock} left
            </div>
          )}
          {(product.quantity || product.stock) === 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 lg:px-3 lg:py-2 rounded text-xs lg:text-sm font-medium">
              Out of Stock
            </div>
          )}
        </div>
        
        <div className="p-4 lg:p-6 xl:p-8">
          <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold text-gray-900 mb-2 lg:mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
            {product.name || product.title}
          </h3>
          
          {product.description && (
            <p className="text-gray-600 text-sm lg:text-base mb-3 lg:mb-4 line-clamp-2">
              {product.description}
            </p>
          )}
          
          <div className="mb-4 lg:mb-6">
            <div className="flex flex-col mb-4">
              <span className="text-xl lg:text-2xl xl:text-3xl font-bold text-indigo-600">
                ৳{product.price}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-sm lg:text-base text-gray-400 line-through">
                  ৳{product.original_price}
                </span>
              )}
            </div>
            
            {product.rating && (
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 lg:w-5 lg:h-5 ${
                        i < Math.floor(product.rating) 
                          ? 'text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-sm lg:text-base text-gray-600">
                  ({product.rating.toFixed(1)})
                </span>
              </div>
            )}
            
            <button
              onClick={handleAddToCart}
              disabled={(product.quantity || product.stock) === 0 || isAdding}
              className={`w-full px-4 py-2 lg:px-6 lg:py-3 xl:px-8 xl:py-4 rounded-lg font-medium text-sm lg:text-base transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                (product.quantity || product.stock) === 0 || isAdding
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-md hover:shadow-lg'
              }`}
            >
              {(product.quantity || product.stock) === 0 
                ? 'Out of Stock' 
                : isAdding 
                  ? 'Adding...' 
                  : 'Add to Cart'}
            </button>
          </div>
        </div>
      </Link>
    </div>
  )
}