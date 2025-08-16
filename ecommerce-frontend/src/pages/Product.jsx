import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'

export default function Product() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err))
  }, [id])

  if (!product) return <div className="container">Loading...</div>

  return (
    <div className="container product-page">
      
      <img src={product.image || ''} alt={product.name || product.title} />
      <div className="product-info">
        <h2>{product.name || product.title}</h2>
        <p>{product.description}</p>
        <div className="price">৳{product.price}</div>
      </div>
    </div>
  )
}