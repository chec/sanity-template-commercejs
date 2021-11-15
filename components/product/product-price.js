import React from 'react'

const ProductPrice = ({ price }) => {
  return (
    <div className="price">
      <span className="price--current">{price}</span>
    </div>
  )
}

export default ProductPrice
