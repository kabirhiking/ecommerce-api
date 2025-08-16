import React, { createContext, useState, useEffect, useContext } from 'react'
import { AuthContext } from './AuthContext'
import api from '../api'

export const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const { user } = useContext(AuthContext)

  // Load cart from backend when user is authenticated
  useEffect(() => {
    if (user) {
      loadCartFromBackend()
    } else {
      // Load from localStorage for non-authenticated users
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        setCartItems(JSON.parse(savedCart))
      }
    }
  }, [user])

  // Save cart to localStorage for non-authenticated users
  useEffect(() => {
    if (!user) {
      localStorage.setItem('cart', JSON.stringify(cartItems))
    }
  }, [cartItems, user])

  const loadCartFromBackend = async () => {
    try {
      const response = await api.get('/cart/')
      console.log('Loading cart from backend:', response.data)
      
      // Remove duplicates on frontend as a safety measure
      const deduplicatedItems = response.data.reduce((acc, item) => {
        const productId = item.product?.id || item.product_id
        const existingIndex = acc.findIndex(existing => {
          const existingProductId = existing.product?.id || existing.product_id
          return existingProductId === productId
        })
        
        if (existingIndex >= 0) {
          // Merge quantities if duplicate found
          acc[existingIndex].quantity += item.quantity
          console.log(`Merged duplicate item for product ${productId}, new quantity: ${acc[existingIndex].quantity}`)
        } else {
          acc.push(item)
          console.log(`Added item for product ${productId}, quantity: ${item.quantity}`)
        }
        return acc
      }, [])
      
      setCartItems(deduplicatedItems)
    } catch (error) {
      console.error('Error loading cart from backend:', error)
    }
  }

  const addToCart = async (product) => {
    console.log('Adding to cart:', product.id, 'Current cart items:', cartItems.length)
    
    if (user) {
      // Add to backend cart
      try {
        const response = await api.post('/cart/add', {
          product_id: product.id,
          quantity: 1
        })
        console.log('Backend add response:', response.data)
        await loadCartFromBackend() // Refresh cart
      } catch (error) {
        console.error('Error adding to backend cart:', error)
        // Fallback to local cart
        addToLocalCart(product)
      }
    } else {
      // Add to local cart
      addToLocalCart(product)
    }
  }

  const addToLocalCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => {
        const productId = item.product?.id || item.id
        return productId === product.id
      })
      
      if (existingItem) {
        return prevItems.map(item => {
          const productId = item.product?.id || item.id
          return productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        })
      } else {
        return [...prevItems, { ...product, quantity: 1 }]
      }
    })
  }

  const removeFromCart = async (productId) => {
    if (user) {
      // Find the cart item to get its backend ID
      const cartItem = cartItems.find(item => item.product?.id === productId || item.id === productId)
      if (cartItem) {
        try {
          await api.delete(`/cart/remove/${cartItem.id}`)
          await loadCartFromBackend() // Refresh cart
        } catch (error) {
          console.error('Error removing from backend cart:', error)
          // Fallback to local removal
          setCartItems(prevItems => prevItems.filter(item => (item.product?.id || item.id) !== productId))
        }
      }
    } else {
      setCartItems(prevItems => prevItems.filter(item => {
        const itemProductId = item.product?.id || item.id
        return itemProductId !== productId
      }))
    }
  }

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    if (user) {
      // Use the new update endpoint
      const cartItem = cartItems.find(item => item.product?.id === productId || item.id === productId)
      if (cartItem) {
        try {
          await api.put(`/cart/update/${cartItem.id}?quantity=${newQuantity}`)
          await loadCartFromBackend() // Refresh cart
        } catch (error) {
          console.error('Error updating quantity in backend cart:', error)
          // Fallback to local update
          updateLocalQuantity(productId, newQuantity)
        }
      }
    } else {
      updateLocalQuantity(productId, newQuantity)
    }
  }

  const updateLocalQuantity = (productId, newQuantity) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        const itemProductId = item.product?.id || item.id
        return itemProductId === productId
          ? { ...item, quantity: newQuantity }
          : item
      })
    )
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('cart')
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || item.price || 0
      const quantity = item.quantity || 0
      return total + (price * quantity)
    }, 0)
  }

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0)
  }

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    loadCartFromBackend
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}
