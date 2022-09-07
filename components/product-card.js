import React from 'react'
import { m } from 'framer-motion'
import Link from 'next/link'
import cx from 'classnames'

import {
  ProductGallery,
  ProductThumbnail,
  ProductPrice,
  ProductOption,
  ProductAdd,
} from '@components/product'

const itemAnim = {
  show: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'linear',
    },
  },
  hide: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'linear',
    },
  },
}

const ProductCard = React.forwardRef(
  (
    {
      product,
      hasVisuals,
      showGallery,
      showThumbs,
      showPrice,
      showOption,
      showQuickAdd,
      className,
      onClick,
    },
    ref
  ) => {
    if (!product) return null

    return (
      <m.div
        ref={ref}
        variants={itemAnim}
        className={cx('product-card', className)}
      >
        {hasVisuals && (
          <div className="product-card--visuals">
            {/* Show Gallery */}
            {showGallery && (
              <div className="product-card--gallery">
                <ProductGallery
                  photosets={product.photos.main}
                  hasArrows
                  hasDots
                  hasDrag={false}
                />
              </div>
            )}

            {/* Show Thumbnail */}
            {showThumbs && (
              <div className="product-card--thumb">
                <ProductThumbnail
                  thumbnails={product.photos.listing}
                />
              </div>
            )}

            {/* Quick Add */}
            {showQuickAdd && (
              <div className="product-card--add is-inverted">
                <ProductAdd
                  productID={product.id}
                  className="btn is-white is-large"
                />
              </div>
            )}
          </div>
        )}

        <div className="product-card--details">
          <div className="product-card--header">
            <h2 className="product-card--title">
              <Link
                href={`/products/${product.slug.current}`}
                scroll={false}
              >
                <a className="product-card--link" onClick={onClick}>
                  {product.title}
                </a>
              </Link>
            </h2>

            {showPrice && (
              <ProductPrice
                price={product.price}
                comparePrice={product.comparePrice}
              />
            )}
          </div>

          {/* Surfaced Option */}
          {showOption && (
            <div className="product-card--option">
              {product.options?.map(
                (option, key) =>
                  option.position === parseInt(product.surfaceOption) &&
                  option.values.length > 1 && (
                    <ProductOption
                      key={key}
                      position={key}
                      option={option}
                      optionSettings={product.optionSettings}
                      strictMatch={false}
                      hideLabels
                      onChange={changeActiveVariant}
                    />
                  )
              )}
            </div>
          )}
        </div>
      </m.div>
    )
  }
)

export default ProductCard
