import React from 'react'
import cx from 'classnames'

import { useSiteContext, useAddCartItem } from '@lib/context'

const ProductAdd = ({ productID, quantity = 1, className, children }) => {
  const addItemToCart = useAddCartItem()
  const { commerceClient, isLoading, isAdding } = useSiteContext()

  // Check that Commerce is connected
  if (!commerceClient) {
    return (
      <span className={cx('is-disabled', className)} disabled>
        Unavailable
      </span>
    )
  }

  return (
    <>
      {isLoading ? (
        <button className={cx('is-disabled', className)} disabled>
          Loading...
        </button>
      ) : (
        <button
          className={cx(className, { 'is-disabled': isAdding })}
          onClick={() => addItemToCart(productID, quantity)}
        >
          {isAdding ? 'Adding...' : <>{children ? children : 'Add to Cart'}</>}
        </button>
      )}
    </>
  )
}

export default ProductAdd
