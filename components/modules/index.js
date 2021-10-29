import React from 'react'
import dynamic from 'next/dynamic'

const Grid = dynamic(() => import('./grid'))
const Hero = dynamic(() => import('./hero'))
const Marquee = dynamic(() => import('./marquee'))
const DividerPhoto = dynamic(() => import('./divider-photo'))

/**
 * Module that can be added to a page document
 * 
 * @returns {React.Component}
 */
export const Module = ({ module }) => {
  const type = module._type

  switch (type) {
    case 'grid':
      return <Grid data={module} />
    case 'hero':
      return <Hero data={module} />
    case 'marquee':
      return <Marquee data={module} />
    case 'dividerPhoto':
      return <DividerPhoto data={module} />
    default:
      return null
  }
}
