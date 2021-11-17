import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr'
import axios from 'axios';

import { getProduct, getAllDocSlugs } from '@data';

import NotFoundPage from '@pages/404';
import Layout from '@components/layout';
import { Module } from '@components/modules';

// setup our inventory fetcher
const fetchInventory = (url, id) =>
  axios.get(url, {
      params: {
        id: id,
      },
    }).then((res) => res.data);

const Product = ({ data }) => {
  const router = useRouter();

  // Return NotFoundPage if no product is found
  if (!router.isFallback && !data) {
    return <NotFoundPage statucsCode={404} />;
  }

  // Extract site and page from the product data
  const { site, page } = data;

  // Set the product state
  const [product, setProduct] = useState(page.product);

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
      })
    }
  }, [page.product, productInventory]);

  return (
    <>
      {!router.isFallback && (
        <Layout
          site={site}
          page={page}
          schema={getProductSchema(product, site)}
        >
          {page.modules.map((module, key) => (
            <Module
              key={key}
              index={key}
              module={module}
              product={product}
            />
          ))}
        </Layout>
      )}
    </>
  );
}


const getProductSchema = (product) => {
  const schema = {
    '@context': 'http://schema.org',
    '@type': 'Product',
    name: product.title,
    price: product.price,
    sku: product.sku,
    description: product.description,
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
