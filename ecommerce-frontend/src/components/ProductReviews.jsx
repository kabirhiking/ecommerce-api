import React, { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import api from '../api'

const StarRating = ({ rating, onRatingChange, readonly = false }) => {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex">
      {[...Array(5)].map((star, index) => {
        const ratingValue = index + 1
        return (
          <label key={index}>
            <input
              type="radio"
              name="rating"
              value={ratingValue}
              onClick={() => !readonly && onRatingChange(ratingValue)}
              className="hidden"
            />
            <svg
              className={`h-4 w-4 cursor-pointer transition-colors ${
                ratingValue <= (hover || rating)
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
              onMouseEnter={() => !readonly && setHover(ratingValue)}
              onMouseLeave={() => !readonly && setHover(0)}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 15.27L16.18 20l-1.64-7.03L20 8.24l-7.19-.61L10 0 7.19 7.63 0 8.24l5.46 4.73L3.82 20z"
                clipRule="evenodd"
              />
            </svg>
          </label>
        )
      })}
    </div>
  )
}

const ReviewForm = ({ productId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useContext(AuthContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      setError('Please login to submit a review')
      return
    }
    
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setLoading(true)
    setError('')

    try {
      const reviewData = {
        product_id: productId,
        rating: rating,
        title: title || null,
        comment: comment || null
      }

      await api.post('/reviews/', reviewData)
      
      // Reset form
      setRating(0)
      setTitle('')
      setComment('')
      
      if (onReviewSubmitted) onReviewSubmitted()
      
      // Show success message
      alert('Review submitted successfully!')
      
    } catch (err) {
      console.error('Error submitting review:', err)
      if (err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError('Failed to submit review. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600">Please login to write a review</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-3">Write a Review</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Rating *
          </label>
          <StarRating rating={rating} onRatingChange={setRating} />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Review Title (Optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief summary of your experience..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            maxLength={100}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Review (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell others about your experience with this product..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">{comment.length}/500 characters</p>
        </div>

        <button
          type="submit"
          disabled={loading || rating === 0}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  )
}

const ReviewList = ({ productId }) => {
  const [reviews, setReviews] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchReviews = async () => {
    try {
      setLoading(true)
      
      // Fetch reviews and summary in parallel
      const [reviewsResponse, summaryResponse] = await Promise.all([
        api.get(`/reviews/product/${productId}`),
        api.get(`/reviews/product/${productId}/summary`)
      ])
      
      setReviews(reviewsResponse.data)
      setSummary(summaryResponse.data)
      setError('')
    } catch (err) {
      console.error('Error fetching reviews:', err)
      setError('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (productId) {
      fetchReviews()
    }
  }, [productId])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading reviews...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchReviews}
          className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      {summary && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">Customer Reviews</h3>
            <span className="text-xs text-gray-500">{summary.total_reviews} reviews</span>
          </div>
          
          <div className="flex items-center space-x-3 mb-3">
            <div className="text-2xl font-bold text-gray-900">
              {summary.average_rating.toFixed(1)}
            </div>
            <div>
              <StarRating rating={Math.round(summary.average_rating)} readonly />
              <p className="text-xs text-gray-600 mt-1">
                Based on {summary.total_reviews} review{summary.total_reviews !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = summary.rating_distribution[rating] || 0
              const percentage = summary.total_reviews > 0 ? (count / summary.total_reviews) * 100 : 0
              
              return (
                <div key={rating} className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 w-8">{rating} ★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Individual Reviews */}
      <div className="space-y-3">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <StarRating rating={review.rating} readonly />
                  <span className="text-xs text-gray-600">
                    by {review.user?.username || 'Anonymous'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              
              {review.title && (
                <h4 className="font-medium text-gray-900 mb-1 text-sm">{review.title}</h4>
              )}
              
              {review.comment && (
                <p className="text-gray-700 text-sm">{review.comment}</p>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  )
}

const ProductReviews = ({ productId }) => {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Reviews & Ratings</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 text-sm"
        >
          {showForm ? 'Cancel' : 'Write Review'}
        </button>
      </div>

      {showForm && (
        <ReviewForm 
          productId={productId} 
          onReviewSubmitted={() => {
            setShowForm(false)
            // Trigger review list refresh
            window.location.reload()
          }}
        />
      )}

      <ReviewList productId={productId} />
    </div>
  )
}

export { StarRating, ReviewForm, ReviewList, ProductReviews }
