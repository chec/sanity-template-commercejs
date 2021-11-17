import React, { useEffect } from 'react'
import Router from 'next/router'
import Head from 'next/head'
import { ThemeProvider } from 'next-themes'
import { LazyMotion, domAnimation, AnimatePresence } from 'framer-motion'

import '../styles/tailwind.css'
import '../styles/app.css'

import { isBrowser, useScrollRestoration } from '@lib/helpers'
import { pageTransitionSpeed } from '@lib/animate'

import {
  SiteContextProvider,
  useSiteContext,
  useTogglePageTransition,
} from '@lib/context'


const Site = ({ Component, pageProps, router }) => {
  const togglePageTransition = useTogglePageTransition()
  const { isPageTransition } = useSiteContext()

  const { data } = pageProps

  // Handle scroll position on history change
  useScrollRestoration(router, pageTransitionSpeed)

  // Trigger our loading class
  useEffect(() => {
    if (isBrowser) {
      document.documentElement.classList.toggle('is-loading', isPageTransition)
    }
  }, [isPageTransition])

  // Setup page transition loading states
  useEffect(() => {
    Router.events.on('routeChangeStart', (_, { shallow }) => {
      // Bail if we're just changing URL parameters
      if (shallow) return

      // Otherwise, start loading
      togglePageTransition(true)
    })

    Router.events.on('routeChangeComplete', () => {
      setTimeout(() => togglePageTransition(false), pageTransitionSpeed)
    })

    Router.events.on('routeChangeError', () => {
      togglePageTransition(false)
    })
  }, [])

  // intelligently add focus states if keyboard is used
  const handleFirstTab = (event) => {
    if (event.keyCode === 9) {
      if (isBrowser) {
        document.body.classList.add('is-tabbing')
        window.removeEventListener('keydown', handleFirstTab)
      }
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleFirstTab)
    return () => {
      window.removeEventListener('keydown', handleFirstTab)
    }
  }, [])

  return (
    <LazyMotion features={domAnimation}>
      {isPageTransition && (
        <Head>
          <title>Loading...</title>
        </Head>
      )}
      <AnimatePresence
        exitBeforeEnter
        onExitComplete={() => {
          document.body.classList.remove('overflow-hidden')
        }}
      >
        <Component key={router.asPath.split('?')[0]} {...pageProps} />
      </AnimatePresence>
    </LazyMotion>
  )
}

// Site wrapped with Context Providers
const MyApp = ({ Component, pageProps, router }) => {
  const { data } = pageProps

  return (
    <ThemeProvider enableSystem={false} disableTransitionOnChange>
      <SiteContextProvider data={{ ...data?.site }}>
        <Site Component={Component} pageProps={pageProps} router={router} />
      </SiteContextProvider>
    </ThemeProvider>
  )
}

export default MyApp
