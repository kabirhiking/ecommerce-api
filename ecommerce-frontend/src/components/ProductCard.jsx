import React from 'react'
import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
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
            className="w-full h-40 sm:h-44 lg:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = '/api/placeholder/300/300'
            }}
          />
          {(product.quantity || product.stock) <= 5 && (product.quantity || product.stock) > 0 && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
              Only {product.quantity || product.stock} left
            </div>
          )}
          {(product.quantity || product.stock) === 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
              Out of Stock
            </div>
          )}
        </div>
        
        <div className="p-3 lg:p-4">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-1 lg:mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
            {product.name || product.title}
          </h3>
          
          {product.description && (
            <p className="text-gray-600 text-sm mb-2 lg:mb-3 line-clamp-2">
              {product.description}
            </p>
          )}
          
          <div className="mb-3 lg:mb-4">
            <div className="flex flex-col mb-2">
              <span className="text-lg lg:text-xl font-bold text-indigo-600">
                ৳{product.price}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-sm text-gray-400 line-through">
                  ৳{product.original_price}
                </span>
              )}
            </div>
            
            {product.rating && (
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-3 h-3 lg:w-4 lg:h-4 ${
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
                <span className="ml-1 text-xs lg:text-sm text-gray-600">
                  ({product.rating.toFixed(1)})
                </span>
              </div>
            )}
            
            {/* Stock Status */}
            {(product.quantity || product.stock) <= 5 && (product.quantity || product.stock) > 0 && (
              <div className="text-orange-600 text-xs font-medium mt-1">
                Only {product.quantity || product.stock} left
              </div>
            )}
            {(product.quantity || product.stock) === 0 && (
              <div className="text-red-600 text-xs font-medium mt-1">
                Out of Stock
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}