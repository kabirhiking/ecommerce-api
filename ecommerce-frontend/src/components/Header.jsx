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

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center  py-4 lg:py-6">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="text-2xl lg:text-3xl xl:text-4xl font-bold text-indigo-600">
              🛒 E-Shop
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 xl:space-x-10">
            <Link 
              to="/" 
              className={`text-sm lg:text-base xl:text-lg font-medium transition-colors duration-200 px-3 py-2 rounded-lg ${
                isActive('/') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              Home
            </Link>
            <button 
              onClick={handleProductsClick}
              className="text-sm lg:text-base xl:text-lg font-medium transition-colors duration-200 px-3 py-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
            >
              Products
            </button>
            
            {user && (
              <>
                <Link 
                  to="/cart" 
                  className={`relative text-sm lg:text-base xl:text-lg font-medium transition-colors duration-200 px-3 py-2 rounded-lg ${
                    isActive('/cart') 
                      ? 'text-indigo-600 bg-indigo-50' 
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  Cart
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 bg-red-500 text-white text-xs lg:text-sm rounded-full h-5 w-5 lg:h-6 lg:w-6 flex items-center justify-center font-bold">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
                <Link 
                  to="/orders" 
                  className={`text-sm lg:text-base xl:text-lg font-medium transition-colors duration-200 px-3 py-2 rounded-lg ${
                    isActive('/orders') 
                      ? 'text-indigo-600 bg-indigo-50' 
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  Orders
                </Link>
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {user ? (
              <>
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-sm lg:text-base xl:text-lg font-medium text-indigo-600">
                      {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm lg:text-base xl:text-lg text-gray-700 font-medium">
                    {user.full_name || user.email}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 lg:px-6 lg:py-3 xl:px-8 xl:py-4 rounded-md text-sm lg:text-base xl:text-lg font-medium hover:bg-red-600 transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-indigo-600 text-sm lg:text-base xl:text-lg font-medium transition-colors duration-200 px-3 py-2 hover:bg-indigo-50 rounded-lg"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-indigo-600 text-white px-4 py-2 lg:px-6 lg:py-3 xl:px-8 xl:py-4 rounded-md text-sm lg:text-base xl:text-lg font-medium hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
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

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/') 
                    ? 'text-indigo-600 bg-indigo-50' 
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                Home
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleProductsClick();
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
              >
                Products
              </button>
              
              {user ? (
                <>
                  <Link
                    to="/cart"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/cart') 
                        ? 'text-indigo-600 bg-indigo-50' 
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                    }`}
                  >
                    Cart {cartItemCount > 0 && `(${cartItemCount})`}
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/orders') 
                        ? 'text-indigo-600 bg-indigo-50' 
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                    }`}
                  >
                    Orders
                  </Link>
                  <div className="px-3 py-2 text-sm text-gray-700">
                    {user.full_name || user.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Register
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