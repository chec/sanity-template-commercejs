import React, { useState, useEffect, useCallback } from 'react'
import { useEmblaCarousel } from 'embla-carousel/react'
import { motion, AnimatePresence } from 'framer-motion'

const Carousel = ({ hasArrows, children }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ speed: 5, loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState([])

  const scrollTo = useCallback((index) => emblaApi.scrollTo(index), [emblaApi])

  useEffect(() => {
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }
    if (emblaApi) {
      setScrollSnaps(emblaApi.scrollSnapList())
      emblaApi.on('select', onSelect)
      onSelect()
    }
  }, [emblaApi])

  const flipAnim = {
    show: {
      y: ['100%', '0%'],
      transition: {
        duration: 1,
        ease: [0.16, 1, 0.3, 1],
        when: 'beforeChildren',
      },
    },
    hide: {
      y: ['0%', '-100%'],
      transition: {
        duration: 1,
        ease: [0.16, 1, 0.3, 1],
        when: 'afterChildren',
      },
    },
  }

  return (
    <div ref={emblaRef} className="carousel">
      <div className="carousel--container">
        {children.map((child, index) => (
          <div className="carousel--slide" key={index}>
            {child}
          </div>
        ))}
      </div>

      {scrollSnaps && (
        <div className="carousel--hud">
          {hasArrows && (
            <div className="carousel--nav">
              <button
                onClick={() => emblaApi.scrollPrev()}
                className="carousel--prev"
                tab-index="0"
                role="button"
                aria-label="Previous slide"
              >
                ←
              </button>
              <button
                onClick={() => emblaApi.scrollNext()}
                className="carousel--next"
                tab-index="0"
                role="button"
                aria-label="Next slide"
              >
                →
              </button>
            </div>
          )}
          <div className="carousel--status">
            <div className="carousel--counter is-current">
              <AnimatePresence>
                <motion.span
                  key={selectedIndex + 1}
                  initial="hide"
                  animate="show"
                  exit="hide"
                  variants={flipAnim}
                >
                  {selectedIndex + 1}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="carousel--progress">
              <span
                style={{
                  transform: `scaleX(${
                    selectedIndex / (scrollSnaps.length - 1)
                  })`,
                }}
              />
            </div>

            <div className="carousel--counter is-total">
              <span>{scrollSnaps.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Carousel
