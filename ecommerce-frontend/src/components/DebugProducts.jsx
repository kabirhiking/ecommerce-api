import React, { useState } from 'react'
import api from '../api'

const DebugProducts = () => {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testProductsAPI = async () => {
    setLoading(true)
    setResult('')

    try {
      console.log('Testing products API...')
      
      // Test 1: Get all products
      console.log('1. Getting all products...')
      const productsResponse = await api.get('/products/')
      console.log('Products response:', productsResponse.data)

      // Test 2: Get first product if available
      if (productsResponse.data.length > 0) {
        const firstProduct = productsResponse.data[0]
        console.log('2. Testing first product:', firstProduct)
        
        // Test reviews for this product
        try {
          const reviewsResponse = await api.get(`/reviews/product/${firstProduct.id}`)
          console.log('Reviews for first product:', reviewsResponse.data)
          
          const summaryResponse = await api.get(`/reviews/product/${firstProduct.id}/summary`)
          console.log('Summary for first product:', summaryResponse.data)
          
          setResult(JSON.stringify({
            products: productsResponse.data.slice(0, 3), // Show first 3 products
            firstProductReviews: reviewsResponse.data,
            firstProductSummary: summaryResponse.data
          }, null, 2))
        } catch (reviewError) {
          setResult(JSON.stringify({
            products: productsResponse.data.slice(0, 3),
            reviewsError: `Error loading reviews: ${reviewError.message}`,
            reviewsStatus: reviewError.response?.status,
            reviewsData: reviewError.response?.data
          }, null, 2))
        }
      } else {
        setResult('No products found in database!')
      }

    } catch (error) {
      console.error('Error testing API:', error)
      setResult(`Error: ${error.message}\nResponse: ${error.response?.data || 'No response data'}\nStatus: ${error.response?.status}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Products & Reviews API Debug</h1>
      
      <button
        onClick={testProductsAPI}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Testing...' : 'Test Products & Reviews API'}
      </button>

      {result && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">API Test Result:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm max-h-96">
            {result}
          </pre>
        </div>
      )}
    </div>
  )
}

export default DebugProducts
