import React, { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import ProductCard from '../components/ProductCard'
import { AuthContext } from '../contexts/AuthContext'
import { CartContext } from '../contexts/CartContext'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { user } = useContext(AuthContext)
  const { addToCart } = useContext(CartContext)

  useEffect(() => {
    api.get('/products/')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleAddToCart = async (product) => {
    if (!user) {
      alert('You must login to add to cart')
      return
    }

    try {
      // Add to local cart context
      addToCart(product)
      
      // Also add to backend cart if needed
      await api.post('/cart/add', { product_id: product.id, quantity: 1 })
      alert('Added to cart successfully!')
    } catch (e) {
      console.error(e)
      // Even if backend fails, we keep it in local cart
      alert('Added to cart locally')
    }
  }

  // Smooth scroll to products section
  const scrollToProducts = () => {
    const productsSection = document.getElementById('featured-products')
    if (productsSection) {
      productsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 xl:py-32">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 lg:mb-8">
              Welcome to E-Shop
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-6 sm:mb-8 lg:mb-12 opacity-90 max-w-4xl mx-auto leading-relaxed">
              Discover amazing products at unbeatable prices. Shop with confidence and enjoy fast delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center items-center max-w-md sm:max-w-none mx-auto">
              <button
                onClick={scrollToProducts}
                className="w-full sm:w-auto bg-white text-indigo-600 px-6 sm:px-8 lg:px-10 py-3 lg:py-4 rounded-lg font-semibold text-lg lg:text-xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
              >
                Shop Now
              </button>
              {!user && (
                <Link
                  to="/register"
                  className="w-full sm:w-auto border-2 border-white text-white px-6 sm:px-8 lg:px-10 py-3 lg:py-4 rounded-lg font-semibold text-lg lg:text-xl hover:bg-white hover:text-indigo-600 transition-all duration-200 transform hover:scale-105"
                >
                  Join Today
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 sm:py-16 lg:py-24 xl:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 lg:mb-6">
              Why Choose E-Shop?
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We provide the best shopping experience with top-quality products and excellent service.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            <div className="text-center p-6 lg:p-8 group hover:bg-gray-50 rounded-xl transition-all duration-200">
              <div className="bg-indigo-100 w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 group-hover:bg-indigo-200 transition-colors duration-200">
                <svg className="w-8 h-8 lg:w-10 lg:h-10 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold mb-2 lg:mb-4">Secure Shopping</h3>
              <p className="text-gray-600 lg:text-lg leading-relaxed">Your data and payments are always protected with industry-standard encryption.</p>
            </div>
            
            <div className="text-center p-6 lg:p-8 group hover:bg-gray-50 rounded-xl transition-all duration-200">
              <div className="bg-green-100 w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 group-hover:bg-green-200 transition-colors duration-200">
                <svg className="w-8 h-8 lg:w-10 lg:h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold mb-2 lg:mb-4">Fast Delivery</h3>
              <p className="text-gray-600 lg:text-lg leading-relaxed">Quick and reliable shipping to your door with real-time tracking.</p>
            </div>
            
            <div className="text-center p-6 lg:p-8 group hover:bg-gray-50 rounded-xl transition-all duration-200 sm:col-span-2 lg:col-span-1">
              <div className="bg-purple-100 w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 group-hover:bg-purple-200 transition-colors duration-200">
                <svg className="w-8 h-8 lg:w-10 lg:h-10 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold mb-2 lg:mb-4">24/7 Support</h3>
              <p className="text-gray-600 lg:text-lg leading-relaxed">We're here to help whenever you need us with dedicated customer service.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div id="featured-products" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8">
              Check out our most popular items and latest arrivals.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                {searchTerm ? 'No products found matching your search.' : 'No products available.'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.slice(0, 8).map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAdd={handleAddToCart} 
                />
              ))}
            </div>
          )}

          {filteredProducts.length > 8 && (
            <div className="text-center mt-8 sm:mt-12">
              <Link
                to="/products"
                className="inline-block bg-indigo-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                View All Products
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}