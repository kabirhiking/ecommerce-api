import React, { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import ProductCard from '../components/ProductCard'
import { AuthContext } from '../contexts/AuthContext'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const { user } = useContext(AuthContext)

  // Hero images for automatic slideshow with discount offers
  const heroImages = [
    {
      title: "Premium Electronics",
      image: "📱",
      bg: "from-blue-600 to-indigo-600",
      discount: "Up to 50% OFF",
      offer: "Latest smartphones, laptops & gadgets"
    },
    {
      title: "Fashion & Style", 
      image: "👕",
      bg: "from-purple-600 to-pink-600",
      discount: "Buy 2 Get 1 FREE",
      offer: "Trending fashion for men & women"
    },
    {
      title: "Home & Living",
      image: "🏠", 
      bg: "from-green-600 to-teal-600",
      discount: "Flat 40% OFF",
      offer: "Transform your home today"
    },
    {
      title: "Sports & Fitness",
      image: "⚽",
      bg: "from-orange-600 to-red-600",
      discount: "Weekend Sale 60% OFF",
      offer: "Gear up for your fitness goals"
    }
  ]

  useEffect(() => {
    api.get('/products/')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  // Auto-slide effect
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 4000) // Change every 4 seconds

    return () => clearInterval(slideInterval)
  }, [heroImages.length])

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

  // Show featured/limited products on home page
  const featuredProducts = products.slice(0, 8) // Show first 8 products

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className={`bg-gradient-to-r ${heroImages[currentSlide].bg} text-white relative overflow-hidden transition-all duration-1000`}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Auto-changing Hero Images/Icons */}
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <div className="text-8xl lg:text-9xl opacity-20 animate-pulse transition-all duration-1000">
              {heroImages[currentSlide].image}
            </div>
          </div>

          <div className="absolute right-32 top-1/4">
            <div className="text-4xl lg:text-6xl opacity-10 animate-bounce">
              {heroImages[(currentSlide + 1) % heroImages.length].image}
            </div>
          </div>

          <div className="absolute right-20 bottom-1/4">
            <div className="text-5xl lg:text-7xl opacity-15 animate-pulse delay-500">
              {heroImages[(currentSlide + 2) % heroImages.length].image}
            </div>
          </div>

          {/* Floating Shopping Icons - Right to Left Animation */}
          <div className="absolute top-20 right-0 animate-pulse">
            <div className="animate-bounce delay-75">
              <svg className="w-12 h-12 text-white/20" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            </div>
          </div>

          {/* Sliding Elements - Right to Left */}
          <div className="absolute top-1/4 right-0 w-64 h-64 opacity-10">
            <div className="animate-pulse">
              <div className="w-full h-full bg-gradient-to-l from-white/20 to-transparent rounded-full blur-xl animate-slide-left"></div>
            </div>
          </div>
          
          <div className="absolute bottom-1/4 right-16 w-48 h-48 opacity-10">
            <div className="animate-pulse delay-500">
              <div className="w-full h-full bg-gradient-to-l from-white/15 to-transparent rounded-full blur-lg animate-slide-left-slow"></div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative z-10">
          <div className="text-center">
            {/* Discount Badge */}
            <div className="animate-fade-in-up mb-6">
              <span className="inline-block px-6 py-3 bg-yellow-400 text-yellow-900 text-lg lg:text-xl font-bold rounded-full shadow-lg animate-pulse">
                🔥 {heroImages[currentSlide].discount} 🔥
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 animate-fade-in-up">
              Discover Amazing {heroImages[currentSlide].title}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl mb-6 sm:mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-200">
              {heroImages[currentSlide].offer} - Limited time offers you can't miss!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center items-center max-w-md sm:max-w-none mx-auto animate-fade-in-up delay-300">
              <button
                onClick={scrollToProducts}
                className="w-full sm:w-auto bg-white text-indigo-600 px-6 sm:px-8 py-3 lg:py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <span className="flex items-center justify-center gap-2">
                  🛍️ Shop Now & Save
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                  </svg>
                </span>
              </button>
              
              <Link
                to="/products"
                className="w-full sm:w-auto border-2 border-white text-white px-6 sm:px-8 py-3 lg:py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg group"
              >
                <span className="flex items-center justify-center gap-2">
                  💰 View All Deals
                  <svg className="w-5 h-5 transform group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </span>
              </Link>
            </div>

            {/* Trust Badges & Offers */}
            <div className="mt-8 lg:mt-10 animate-fade-in-up delay-500">
              <div className="flex flex-wrap justify-center items-center gap-4 lg:gap-6 opacity-90">
                <div className="flex items-center gap-2 text-white/90 text-sm lg:text-base bg-white/20 rounded-full px-3 py-2 backdrop-blur-sm">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Free Delivery
                </div>
                <div className="flex items-center gap-2 text-white/90 text-sm lg:text-base bg-white/20 rounded-full px-3 py-2 backdrop-blur-sm">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Easy Returns
                </div>
                <div className="flex items-center gap-2 text-white/90 text-sm lg:text-base bg-white/20 rounded-full px-3 py-2 backdrop-blur-sm">
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Secure Payment
                </div>
              </div>

              {/* Slide Indicators */}
              <div className="flex justify-center space-x-2 mt-8">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'bg-white scale-125' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>

              {/* Current Category Label */}
              <div className="mt-4">
                <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium transition-all duration-1000">
                  Now Featuring: {heroImages[currentSlide].title}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section - Moved to Top for Amazon-style Layout */}
      <div id="featured-products" className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full mb-4">
              ⭐ TRENDING NOW
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8">
              Handpicked bestsellers and latest arrivals that our customers love most
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                No products available.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {featuredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                />
              ))}
            </div>
          )}

          {/* View All Products Button */}
          <div className="text-center mt-8 sm:mt-12">
            <Link
              to="/products"
              className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span>View All Products</span>
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section - Compact */}
      <div className="bg-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="group">
              <div className="text-xl sm:text-2xl font-bold text-indigo-600 mb-1">
                {products.length}+
              </div>
              <div className="text-gray-600 text-sm">Products</div>
            </div>
            <div className="group">
              <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                5000+
              </div>
              <div className="text-gray-600 text-sm">Customers</div>
            </div>
            <div className="group">
              <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">
                99%
              </div>
              <div className="text-gray-600 text-sm">Satisfaction</div>
            </div>
            <div className="group">
              <div className="text-xl sm:text-2xl font-bold text-orange-600 mb-1">
                24/7
              </div>
              <div className="text-gray-600 text-sm">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-8 sm:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">
            Why Choose E-Shop?
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-8">
            <div className="text-center p-6 lg:p-8 group hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:shadow-lg">
              <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 group-hover:from-indigo-200 group-hover:to-indigo-300 transition-all duration-300 group-hover:scale-110">
                <svg className="w-8 h-8 lg:w-10 lg:h-10 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4">Secure Shopping</h3>
              <p className="text-gray-600 lg:text-lg leading-relaxed">SSL encryption & secure payment gateways protect your data</p>
            </div>
            
            <div className="text-center p-6 lg:p-8 group hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 rounded-xl transition-all duration-300 hover:shadow-lg">
              <div className="bg-gradient-to-br from-green-100 to-green-200 w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300 group-hover:scale-110">
                <svg className="w-8 h-8 lg:w-10 lg:h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4">Fast Delivery</h3>
              <p className="text-gray-600 lg:text-lg leading-relaxed">Express shipping with real-time tracking in 24-48 hours</p>
            </div>
            
            <div className="text-center p-6 lg:p-8 group hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 rounded-xl transition-all duration-300 hover:shadow-lg">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300 group-hover:scale-110">
                <svg className="w-8 h-8 lg:w-10 lg:h-10 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4">24/7 Support</h3>
              <p className="text-gray-600 lg:text-lg leading-relaxed">Expert customer service via chat, email & phone</p>
            </div>

            <div className="text-center p-6 lg:p-8 group hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 rounded-xl transition-all duration-300 hover:shadow-lg">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300 group-hover:scale-110">
                <svg className="w-8 h-8 lg:w-10 lg:h-10 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4">Quality Guarantee</h3>
              <p className="text-gray-600 lg:text-lg leading-relaxed">30-day return policy with money-back guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section - Compact */}
      <div className="bg-gray-100 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">
            What Our Customers Say
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="flex text-yellow-400 text-sm">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3">"Great quality and fast delivery!"</p>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-xs font-medium text-indigo-600">SM</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">Sarah M.</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="flex text-yellow-400 text-sm">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3">"Excellent customer service!"</p>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-xs font-medium text-green-600">RJ</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">Robert J.</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="flex text-yellow-400 text-sm">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3">"Best prices, authentic products!"</p>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-xs font-medium text-purple-600">AC</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">Alice C.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section - Compact */}
      <div className="bg-indigo-600 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
            Stay Updated! 📧
          </h2>
          <p className="text-indigo-100 mb-6">
            Get exclusive deals and new product alerts
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter email address"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}