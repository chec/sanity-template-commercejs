import React, { createContext, useContext, useState, useEffect } from 'react';

// Get our API clients (Commerce.js + Sanity)
import { getSanityClient } from './sanity';
import commerce from './commerce';

// Set our initial context states
const initialContext = {
  // Set page components context
  isPageTransition: false,
  meganav: {
    isOpen: false,
    activeID: null,
  },
  // Set the Commerce client
  commerceClient: commerce,
  // Set commerce resource states
  productCounts: [],
  products: [],
  cart: {},
  isLoading: true,
}

// Set context
const SiteContext = createContext({
  context: initialContext,
  setContext: () => null,
})

/**
 * @description Fetch products from the Commerce API
 * @returns {Array}
 */
const fetchProducts = async () => {
  const products = await commerce.products.list();
  return products;
}

/**
 * 
 * @description Fetch cart from the Commerce API
 * @returns {Object}
 */
const fetchCart = async () => {
  const cart = await commerce.cart.retrieve();
  return cart;
}

/*  ------------------------------ */
/*  Our Context Wrapper
/*  ------------------------------ */

const SiteContextProvider = ({ children }) => {
  const [context, setContext] = useState(initialContext);

  useEffect(() => {
    // Fetch products
    fetchProducts().then((products) => {
      setContext((prevState) => {
        return { ...prevState, products, isLoading: false }
      });
    });
  }, []);

  useEffect(() => {
    // Fetch cart
    fetchCart().then((cart) => {
      setContext((prevState) => {
        return { ...prevState, cart}
      });
    });
  }, []);

  return (
    <SiteContext.Provider
      value={{
        context,
        setContext,
      }}
    >
      {children}
    </SiteContext.Provider>
  )
}

// Access our global store states
function useSiteContext() {
  const { context } = useContext(SiteContext)
  return context
}

// Toggle page transition state
function useTogglePageTransition() {
  const {
    context: { isPageTransition },
    setContext,
  } = useContext(SiteContext)

  async function togglePageTransition(state) {
    setContext((prevState) => {
      return { ...prevState, isPageTransition: state }
    })
  }
  return togglePageTransition
}

// Toggle Mega Navigation states
function useToggleMegaNav() {
  const {
    context: { meganav },
    setContext,
  } = useContext(SiteContext)

  async function toggleMegaNav(state, id = null) {
    setContext((prevState) => {
      return {
        ...prevState,
        meganav: {
          isOpen: state === 'toggle' ? !meganav.isOpen : state,
          activeID: state === 'toggle' && meganav.isOpen ? null : id,
        },
      }
    })
  }
  return toggleMegaNav
}

export {
  SiteContextProvider,
  useSiteContext,
  useTogglePageTransition,
  useToggleMegaNav,
}
