import React from 'react'

import {
  ProductGallery,
  ProductPrice,
  ProductForm,
  ProductActions,
} from '@components/product'

const ProductHero = ({ product, activeVariant, onVariantChange }) => {
  return (
    <section className="product">
      <div className="product--content">
        <div className="product--gallery">
          <ProductGallery
            photosets={product.photos.main}
            hasArrows
            hasCounter
            hasThumbs
          />
        </div>

        <div className="product--details">
          <div className="product--info">
            <div className="product--header">
              <div className="product--title">
                <h1 className="product--name">{product.title}</h1>
              </div>

              <ProductPrice price={product.price} />
            </div>

            {product.description && (
              <div className="product--desc" dangerouslySetInnerHTML={{__html: product.description}} />
            )}

            <ProductForm
              product={product}
              onVariantChange={onVariantChange}
              className="product--form"
            />
          </div>

          <ProductActions
            product={product}
            klaviyoAccountID={product.klaviyoAccountID}
          />
        </div>
      </div>
    </section>
  )
}

export default ProductHero
