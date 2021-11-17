import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookie from 'js-cookie';

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
  cart: {},
  isLoading: true,
}

// Set context
const SiteContext = createContext({
  context: initialContext,
  setContext: () => null,
})

/**
 * Create cart from the Commerce API
 */
 const createNewCart = async () => {
  let cart = {};

  try {
    cart = await fetch(
      'https://api.chec.io/v1/carts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Authorization': process.env.NEXT_PUBLIC_CHEC_PUBLIC_KEY,
        },
      }).then((cart) => cart);
  } catch (error) {
    console.log('Error creating a new cart', error)
  }

  return cart;
}

/**
 * Retrieves the cart if it exists, otherwise create it
 */
const fetchCart = async () => {
  let cart = {};
  try {
    cart = await commerce.cart.retrieve();
  } catch (error) {
    console.log('Error retrieving cart', error);
  }

  return cart;
}

/**
 * Sets the cart state
 */
const setCartState = async (cart, setContext, openCart) => {
  if (!cart) {
    return null;
  }

  setContext((prevState) => {
    return {
      ...prevState,
      isAdding: false,
      isLoading: false,
      isUpdating: false,
      isCartOpen: openCart ? true : prevState.isCartOpen,
      cart: {
        id: cart.id,
        lineItems: cart.line_items,
        subtotal: cart.subtotal,
        hostedCheckoutURL: cart.hosted_checkout_url,
      },
    }
  })
}

/*  ------------------------------ */
/*  Gloabl context wrapper
/*  ------------------------------ */

const SiteContextProvider = ({ children }) => {
  const [context, setContext] = useState(initialContext);

  useEffect(() => {
    fetchCart().then((cart) => {
      setCartState(cart, setContext);
    })
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
  const { context } = useContext(SiteContext);
  return context;
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
  return toggleMegaNav;
}

/*  ------------------------------ */
/*  Our Commerce.js hooks
/*  ------------------------------ */

// Access cart item count
function useCartCount() {
  const { context: { cart } } = useContext(SiteContext);
  return cart.total_unique_items;
}

// Access cart total
function useCartTotals() {
  const { context: { cart } } = useContext(SiteContext);
  return cart.subtotal;
}

// Access cart line items
function useCartItems() {
  const {
    context: { cart }
  } = useContext(SiteContext);
  return cart.line_items;
}

/**
 * Adds item to cart
 */
function useAddCartItem() {
  const {
    context: { commerceClient },
    setContext,
  } = useContext(SiteContext);

  async function addItem(productID, quantity, variant) {
    if (!productID) {
      return;
    }

    setContext((prevState) => {
      return { ...prevState, isAdding: true, isUpdating: true }
    });

    const updatedCart = await commerceClient.cart.add(
      productID,
      quantity,
      { variant },
    );

    setCartState(updatedCart, setContext, true);
  }

  return addItem;
}

/**
 * Updates cart line item
 */
function useUpdateCartItem() {
  const { context: { commerceClient } } = useSiteContext(SiteContext);

  async function updateItem(lineItemID, quantity) {
    if(!lineItemID) {
      return;
    }

    setContext((prevState) => {
      return { ...prevState, isUpdating: true }
    });

    const updatedCart = await commerceClient.cart.update(
      lineItemID,
      { quantity },
    );

    setCartState(updatedCart, setContext);
  }

  return updateItem;
}

/**
 * Removes item from cart
 */
function useRemoveCartItem() {
  const {
    context: { commerceClient },
    setContext,
  } = useContext(SiteContext);

  async function removeItem(lineItemID) {
    if (!lineItemID) {
      return;
    }

    // Otherwise, start removing the product
    setContext((prevState) => {
      return { ...prevState, isUpdating: true }
    });

    const updatedCart = await commerceClient.cart.remove(lineItemID);

    setCheckoutState(updatedCart, setContext);
  }
  return removeItem;
}

// Build our Checkout URL
function useCheckout() {
  const { context: { cart } } = useContext(SiteContext);
  return cart.hosted_checkout_url;
}

export {
  SiteContextProvider,
  useSiteContext,
  useTogglePageTransition,
  useToggleMegaNav,
  useCartCount,
  useCartTotals,
  useCartItems,
  useAddCartItem,
  useUpdateCartItem,
  useRemoveCartItem,
  useCheckout,
}
