import React from 'react'
import dynamic from 'next/dynamic'

const Grid = dynamic(() => import('./grid'))
const Hero = dynamic(() => import('./hero'))
const Marquee = dynamic(() => import('./marquee'))
const DividerPhoto = dynamic(() => import('./divider-photo'))
const ProductHero = dynamic(() => import('./product-hero'))
const Category = dynamic(() => import('./category-grid'))

/**
 * Module that can be added to a page document
 *
 * @returns {React.Component}
 */
export const Module = ({
  index,
  module,
  product,
  activeVariant,
  onVariantChange,
  categoryProducts,
}) => {
  const type = module._type

  switch (type) {
    case 'grid':
      return <Grid index={index} data={module} />
    case 'hero':
      return <Hero index={index} data={module} />
    case 'marquee':
      return <Marquee index={index} data={module} />
    case 'dividerPhoto':
      return <DividerPhoto index={index} data={module} />
    case 'productHero':
      return (
        <ProductHero
          index={index}
          product={product}
          activeVariant={activeVariant}
          onVariantChange={onVariantChange}
        />
      )
    case 'categoryGrid':
      return (
        <Category
          index={index}
          data={{ ...module, products: categoryProducts }}
        />
      )
    default:
      return null
  }
}
