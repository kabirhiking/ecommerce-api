import React, { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../contexts/AuthContext'

export default function Profile() {
  const { user, updateUser } = useContext(AuthContext)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [stats, setStats] = useState({
    total_orders: 0,
    total_spent: 0,
    reviews_given: 0
  })
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile: ''
  })

  useEffect(() => {
    console.log('User in Profile component:', user) // Debug log
    if (user) {
      // Try different ways to get full name
      let fullName = '';
      if (user.full_name) {
        fullName = user.full_name;
      } else if (user.first_name || user.last_name) {
        fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
      }
      
      // Try different ways to get mobile
      let mobile = '';
      if (user.mobile) {
        mobile = user.mobile;
      } else if (user.phone) {
        mobile = user.phone;
      }
      
      const userFormData = {
        full_name: fullName,
        email: user.email || '',
        mobile: mobile
      }
      console.log('Setting form data:', userFormData) // Debug log
      setFormData(userFormData)
      
      // Fetch user stats
      fetchUserStats()
    }
  }, [user])

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8000/auth/profile/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    console.log('Form data being sent:', formData) // Debug log

    try {
      const token = localStorage.getItem('token')
      console.log('Token exists:', !!token) // Debug log
      
      const response = await fetch('http://localhost:8000/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      console.log('Response status:', response.status) // Debug log

      if (response.ok) {
        const data = await response.json()
        console.log('Response data:', data) // Debug log
        setMessage('Profile updated successfully!')
        setIsEditing(false)
        // Update user context
        if (updateUser) {
          updateUser(data)
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.log('Error data:', errorData) // Debug log
        setMessage(errorData.detail || `Failed to update profile (${response.status})`)
        console.error('Profile update error:', errorData)
      }
    } catch (error) {
      console.log('Catch error:', error) // Debug log
      setMessage('Error updating profile: ' + error.message)
      console.error('Profile update error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Same logic as useEffect to maintain consistency
    let fullName = '';
    if (user.full_name) {
      fullName = user.full_name;
    } else if (user.first_name || user.last_name) {
      fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    
    let mobile = '';
    if (user.mobile) {
      mobile = user.mobile;
    } else if (user.phone) {
      mobile = user.phone;
    }
    
    setFormData({
      full_name: fullName,
      email: user.email || '',
      mobile: mobile
    })
    setIsEditing(false)
    setMessage('')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Please log in to view your profile</h2>
          <p className="mt-2 text-gray-600">You need to be logged in to manage your profile</p>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-indigo-600">
                  {(() => {
                    const fullName = user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
                    return (fullName || user.email || user.username || 'U').charAt(0).toUpperCase();
                  })()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600">Manage your account information</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                  }`}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                  }`}
                  placeholder="Enter your email address"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                  }`}
                  placeholder="Enter your mobile number"
                />
              </div>

              {/* User Role (Read-only) */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <input
                  type="text"
                  id="role"
                  value={user.role === 'admin' ? 'Administrator' : user.role === 'super_admin' ? 'Super Admin' : 'Customer'}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Account Statistics */}
            {/* <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.total_orders}</div>
                <div className="text-sm text-blue-600">Total Orders</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">${stats.total_spent.toFixed(2)}</div>
                <div className="text-sm text-green-600">Total Spent</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.reviews_given}</div>
                <div className="text-sm text-purple-600">Reviews Given</div>
              </div>
            </div> */}

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
