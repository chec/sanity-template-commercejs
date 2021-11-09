import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr'
import axios from 'axios';

import { getProduct, getAllDocSlugs } from '@data';
import { useParams,  usePrevious, centsToPrice, hasObject } from '@lib/helpers';
import { useSiteContext } from '@lib/context';

import NotFoundPage from '@pages/404';
import Layout from '@components/layout';
import { Module } from '@components/modules';

// setup our inventory fetcher
const fetchInventory = (url, id) =>
  axios.get(url, {
      params: {
        id: id,
      },
    }).then((res) => res.data)

const Product = ({ data }) => {
  const router = useRouter();

  // Return NotFoundPage if no product is found
  if (!router.isFallback && !data) {
    return <NotFoundPage statusCode={404} />;
  }

  // Extract site and page from the product data
  const { site, page } = data;

  // Set the product state
  const [product, setProduct] = useState(page.product);

  // Find the default variant for this product by matching against the first product option
  const defaultVariant = page.product.variants?.find((variant) => {
    const option = {
      name: page.product.variant_groups?.[0].name,
      option: page.product.variant_groups?.[0].options[0].name,
    }
    return hasObject(variant.options, option);
  });

  const defaultVariantID = defaultVariant.id ?? page.product.variants[0].id;

  // Set up our variant URL params
  const [currentParams, setCurrentParams] = useParams([
    {
      name: 'variant',
      option: defaultVariantID,
    }
  ]);

  const previousParams = usePrevious(currentParams)

  // determine which params set to use
  const activeParams =
    isPageTransition && previousParams ? previousParams : currentParams

  // Find our activeVariantID ID
  const paramVariantID = activeParams.find(
    (filter) => filter.name === 'variant'
  ).option
  const foundVariant = page.product.variants?.find(
    (variant) => variant.id == paramVariantID
  )
  const activeVariantID = foundVariant ? paramVariantID : defaultVariantID

  // handle variant change
  const updateVariant = useCallback(
    (id) => {
      const isValidVariant = page.product.variants.find((v) => v.id == id)

      setCurrentParams([
        ...activeParams,
        {
          name: 'variant',
          value: isValidVariant ? `${id}` : defaultVariantID,
        },
      ])
    },
    [activeParams]
  )

  // Check our product inventory
  const { data: productInventory } = useSWR(
    [`/api/commerce/product-inventory`, page.product.id],
    (url, id) => fetchInventory(url, id),
    { errorRetryCount: 3 },
  );

  useEffect(() => {
    if (page.product && productInventory) {
      setProduct({
        ...page.product,
        inStock: productInventory.inStock,
        lowStock: productInventory.lowStock,
        variants: [
          ...page.product.variants.map((variant) => {
            const newInventory = productInventory.variants.find(
              (inventory) => inventory.id === variant.id,
            )
            return newInventory ? { ...variant, ...newInventory } : variant
          }),
        ],
      })
    }
  }, [page.product, productInventory]);

  return (
    <>
      {!router.isFallback && (
        <Layout
          site={site}
          page={page}
          schema={getProductSchema(product, activeVariantID, site)}
        >
          {page.modules.map((module, key) => (
            <Module
              key={key}
              index={key}
              module={module}
              product={product}
              activeVariant={product.variants.find(
                (v) => v.id == activeVariantID
              )}
            />
          ))}
        </Layout>
      )}
    </>
  );
}


const getProductSchema = (product, activeVariantId, site) => {
  const schema = {
    '@context': 'http://schema.org',
    '@type': 'Product',
    name: product.title,
    price: product.price,
    sku: product.sku,
  }

  if (!product) {
    return null;
  }

  return schema;
}

export async function getStaticProps({ params, preview, previewData }) {
  const productData = await getProduct(params.slug, {
    active: preview,
    token: previewData?.token,
  });

  return {
    props: {
      data: productData
    }
  }
}

// Fetch all product document slugs
export async function getStaticPaths() {
  const allProducts = await getAllDocSlugs('product');
  debugger;
  return {
    paths: allProducts.map((page) => {
      return {
        params: {
          slug: page.slug,
        },
      }
    }) || [],
    fallback: false,
  }
}

export default Product;
