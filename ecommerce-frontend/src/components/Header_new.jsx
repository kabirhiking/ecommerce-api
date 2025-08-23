import React, { useContext, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { CartContext } from '../contexts/CartContext'

export default function Header() {
  const { user, logout } = useContext(AuthContext)
  const { getCartItemCount } = useContext(CartContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const cartItemCount = getCartItemCount()

  const isActive = (path) => {
    return location.pathname === path
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMobileMenuOpen(false)
  }

  const handleProductsClick = (e) => {
    e.preventDefault()
    
    // If we're on the home page, scroll to products
    if (location.pathname === '/') {
      const productsSection = document.getElementById('featured-products')
      if (productsSection) {
        productsSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }
    } else {
      // If we're not on home page, navigate to home and scroll
      navigate('/')
      setTimeout(() => {
        const productsSection = document.getElementById('featured-products')
        if (productsSection) {
          productsSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          })
        }
      }, 100)
    }
    setIsMobileMenuOpen(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      // Navigate to products page with search query
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`)
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header Row - Logo, Search, Cart, User */}
        <div className="flex items-center justify-between py-4 lg:py-6">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <div className="text-2xl lg:text-3xl font-bold text-indigo-600">
              🛒 E-Shop
            </div>
          </Link>

          {/* Search Bar - Desktop Center */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search in E-Shop..."
                  className="w-full px-4 py-3 pl-12 pr-12 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200 text-base"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  <div className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </button>
              </div>
            </form>
          </div>

          {/* Right Side - Cart & User Menu */}
          <div className="flex items-center space-x-3 lg:space-x-4 flex-shrink-0">
            {/* Cart Icon */}
            {user && (
              <Link 
                to="/cart" 
                className={`relative flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isActive('/cart') 
                    ? 'text-indigo-600 bg-indigo-50' 
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5-5M7 13l-2.5 5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                <span className="hidden lg:inline text-sm">Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu */}
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-sm lg:text-base font-medium text-indigo-600">
                      {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm lg:text-base text-gray-700 font-medium">
                    {user.full_name || user.email}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="hidden md:block bg-red-500 text-white px-4 py-2 lg:px-6 lg:py-2 rounded-md text-sm lg:text-base font-medium hover:bg-red-600 transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="hidden md:block text-gray-600 hover:text-indigo-600 text-sm lg:text-base font-medium transition-colors duration-200 px-3 py-2 hover:bg-indigo-50 rounded-lg"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="hidden md:block bg-indigo-600 text-white px-4 py-2 lg:px-6 lg:py-2 rounded-md text-sm lg:text-base font-medium hover:bg-indigo-700 transition-all duration-200"
                >
                  Register
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Navigation - Below main header */}
        <div className="hidden md:flex items-center justify-center space-x-6 lg:space-x-8 pb-4 border-b border-gray-100">
          <Link 
            to="/" 
            className={`text-sm lg:text-base font-medium transition-colors duration-200 px-3 py-2 rounded-lg ${
              isActive('/') 
                ? 'text-indigo-600 bg-indigo-50' 
                : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            Home
          </Link>
          <button 
            onClick={handleProductsClick}
            className="text-sm lg:text-base font-medium transition-colors duration-200 px-3 py-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
          >
            Products
          </button>
          
          {user && (
            <>
              <Link 
                to="/orders" 
                className={`text-sm lg:text-base font-medium transition-colors duration-200 px-3 py-2 rounded-lg ${
                  isActive('/orders') 
                    ? 'text-indigo-600 bg-indigo-50' 
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                Orders
              </Link>
              {user && (user.role === 'admin' || user.role === 'super_admin') && (
                <Link 
                  to="/admin" 
                  className={`text-sm lg:text-base font-medium transition-colors duration-200 px-3 py-2 rounded-lg ${
                    isActive('/admin') 
                      ? 'text-purple-600 bg-purple-50' 
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  Admin
                </Link>
              )}
              <Link 
                to="/about" 
                className={`text-sm lg:text-base font-medium transition-colors duration-200 px-3 py-2 rounded-lg ${
                  isActive('/about') 
                    ? 'text-indigo-600 bg-indigo-50' 
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                About Us
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
            {/* Mobile Search Bar */}
            <div className="px-4 py-3 border-b border-gray-100">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    id="mobile-search-input"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    className="w-full px-4 py-2.5 pl-11 pr-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 transition-colors duration-200"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
            
            <div className="px-2 pt-2 pb-3 space-y-1 max-h-96 overflow-y-auto">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive('/') 
                    ? 'text-indigo-600 bg-indigo-50 border-l-4 border-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                🏠 Home
              </Link>
              <button
                onClick={handleProductsClick}
                className="block w-full text-left px-4 py-3 rounded-md text-base font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-colors duration-200"
              >
                🛍️ Products
              </button>
              
              {user ? (
                <>
                  <Link
                    to="/cart"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-md text-base font-medium transition-colors duration-200 ${
                      isActive('/cart') 
                        ? 'text-indigo-600 bg-indigo-50 border-l-4 border-indigo-600' 
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>🛒 Cart</span>
                    {cartItemCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center font-bold">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-md text-base font-medium transition-colors duration-200 ${
                      isActive('/orders') 
                        ? 'text-indigo-600 bg-indigo-50 border-l-4 border-indigo-600' 
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                    }`}
                  >
                    📦 Orders
                  </Link>
                  {user && (user.role === 'admin' || user.role === 'super_admin') && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-4 py-3 rounded-md text-base font-medium transition-colors duration-200 ${
                        isActive('/admin') 
                          ? 'text-purple-600 bg-purple-50 border-l-4 border-purple-600' 
                          : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      👨‍💼 Admin Panel
                    </Link>
                  )}
                  <Link
                    to="/about"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-md text-base font-medium transition-colors duration-200 ${
                      isActive('/about') 
                        ? 'text-indigo-600 bg-indigo-50 border-l-4 border-indigo-600' 
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                    }`}
                  >
                    ℹ️ About Us
                  </Link>
                  
                  {/* User Info Section */}
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-50 rounded-md">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-indigo-600">
                          {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {user.full_name || 'User'}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full mt-2 flex items-center px-4 py-3 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-md text-base font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-colors duration-200"
                  >
                    🔑 Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                  >
                    📝 Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
