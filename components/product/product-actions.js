import React, { useState } from 'react'

import {
  ProductCounter,
  ProductAdd,
} from '@components/product'

const ProductActions = ({ activeVariant, product, klaviyoAccountID }) => {
  // set default quantity
  const [quantity, setQuantity] = useState(1)

  return (
    <div className="product--actions">
      {product?.inStock ? (
        <>
          <ProductCounter
            id={product.id}
            max={10}
            onUpdate={setQuantity}
          />
          <ProductAdd
            productID={product.id}
            quantity={quantity}
            className="btn is-primary is-large is-block"
          >
            Add To Cart
          </ProductAdd>
        </>
      ) : (
        <>
          {klaviyoAccountID ? (
            <ProductWaitlist
              variant={activeVariant.id}
              klaviyo={klaviyoAccountID}
            />
          ) : (
            <div className="btn is-large is-disabled is-block">
              Out of Stock
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ProductActions
