import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useContext(AuthContext)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!username.trim()) {
      setError('Username is required')
      return
    }
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    if (!password.trim()) {
      setError('Password is required')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      await register(username, email, password)
      // go to login so the user can login
      navigate('/login')
    } catch (err) {
      console.error('Registration error:', err)
      
      // Handle different types of errors
      if (err.response?.status === 422) {
        setError('Please check your input fields. Make sure all required fields are filled correctly.')
      } else if (err.response?.status === 400) {
        setError(err.response.data.detail || 'Username already exists')
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError(err.message || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full lg:max-w-lg xl:max-w-xl space-y-8 lg:space-y-9 px-4 sm:px-6 lg:px-12">
        <div>
          <h2 className="mt-6 text-center text-3xl lg:text-4xl xl:text-5xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 lg:mt-4 text-center text-sm lg:text-base xl:text-lg text-gray-600">
            Join us today and start shopping!
          </p>
        </div>
        
        <form className="mt-8 lg:mt-12 space-y-6 lg:space-y-8" onSubmit={submit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 lg:px-6 lg:py-4 rounded-md lg:text-lg">
              {error}
            </div>
          )}
          
          <div className="space-y-4 lg:space-y-6">
            <input
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full px-3 py-3 lg:px-4 lg:py-4 xl:px-5 xl:py-5 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base xl:text-lg transition-all duration-200"
            />
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full px-3 py-3 lg:px-4 lg:py-4 xl:px-5 xl:py-5 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base xl:text-lg transition-all duration-200"
            />
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password (min. 6 characters)"
              className="w-full px-3 py-3 lg:px-4 lg:py-4 xl:px-5 xl:py-5 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base xl:text-lg transition-all duration-200"
            />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full px-3 py-3 lg:px-4 lg:py-4 xl:px-5 xl:py-5 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm lg:text-base xl:text-lg transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 lg:py-4 lg:px-6 xl:py-5 xl:px-8 border border-transparent text-sm lg:text-base xl:text-lg font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 lg:h-6 lg:w-6 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="text-center">
            <span className="text-sm lg:text-base xl:text-lg text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
              >
                Sign in here
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}
