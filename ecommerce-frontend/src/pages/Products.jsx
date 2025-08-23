import React, { useEffect, useState, useContext } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api'
import ProductCard from '../components/ProductCard'
import { AuthContext } from '../contexts/AuthContext'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const searchTerm = searchParams.get('search') || '' // Get search from URL
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name')
  const [filterBy, setFilterBy] = useState(searchParams.get('category') || '')
  
  const { user } = useContext(AuthContext)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm) // Keep existing search from navbar
    if (sortBy !== 'name') params.set('sort', sortBy)
    if (filterBy) params.set('category', filterBy)
    setSearchParams(params)
  }, [sortBy, filterBy, setSearchParams]) // Removed searchTerm from dependency

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await api.get('/products/')
      setProducts(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !filterBy || product.category === filterBy
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

  // Get unique categories
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))]

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 lg:mb-6">
            All Products
          </h1>
          <p className="text-gray-600 lg:text-lg xl:text-xl max-w-3xl">
            Discover our complete collection of amazing products at unbeatable prices.
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8 mb-8 lg:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 lg:gap-6">
            {/* Left side - Results count */}
            <div className="flex items-center">
              <h3 className="text-lg lg:text-xl font-medium text-gray-900">
                {filteredProducts.length} Products Found
                {searchTerm && (
                  <span className="text-indigo-600 ml-2">
                    for "{searchTerm}"
                  </span>
                )}
              </h3>
            </div>

            {/* Right side - Sort and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
              {/* Sort */}
              <div className="min-w-0 sm:min-w-[200px]">
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 lg:px-4 lg:py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="price-low">Price (Low to High)</option>
                  <option value="price-high">Price (High to Low)</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="min-w-0 sm:min-w-[200px]">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="w-full px-3 py-2 lg:px-4 lg:py-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || filterBy || sortBy !== 'name') && (
            <div className="mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterBy('')
                  setSortBy('name')
                }}
                className="text-indigo-600 hover:text-indigo-800 font-medium lg:text-lg transition-colors duration-200 px-4 py-2 hover:bg-indigo-50 rounded-lg"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6 lg:mb-8">
          <p className="text-gray-600 lg:text-lg">
            {loading ? 'Loading...' : `Showing ${filteredProducts.length} of ${products.length} products`}
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12 lg:py-16">
            <div className="animate-spin rounded-full h-12 w-12 lg:h-16 lg:w-16 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 lg:py-16">
            <div className="w-24 h-24 lg:w-32 lg:h-32 mx-auto mb-6 lg:mb-8 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20.4a7.962 7.962 0 01-8-7.109c0-3.39 2.33-6.291 6-6.291s6 2.901 6 6.291z" />
              </svg>
            </div>
            <h3 className="text-xl lg:text-2xl xl:text-3xl font-semibold text-gray-900 mb-2 lg:mb-4">No products found</h3>
            <p className="text-gray-600 lg:text-lg mb-6 lg:mb-8">
              {searchTerm || filterBy 
                ? "Try adjusting your search or filter criteria." 
                : "No products are available at the moment."
              }
            </p>
            {(searchTerm || filterBy) && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterBy('')
                }}
                className="bg-indigo-600 text-white px-6 py-3 lg:px-8 lg:py-4 rounded-lg font-medium lg:text-lg hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                View All Products
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
