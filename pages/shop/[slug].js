import React from 'react'

import { getCategory, getAllDocSlugs } from '@data'

import Layout from '@components/layout'
import { Module } from '@components/modules'

const CategoryPage = ({ data }) => {
  const { site, page } = data

  return (
    <Layout site={site} page={page}>
      {page.modules?.map((module, key) => (
        <Module
          key={key}
          index={key}
          module={module}
          collectionProducts={page.products}
        />
      ))}
    </Layout>
  )
}

export async function getStaticProps({ params, preview, previewData }) {
  const collectionData = await getCategory(params.slug, {
    active: preview,
    token: previewData?.token,
  })

  return {
    props: {
      data: collectionData,
    },
  }
}

export async function getStaticPaths() {
  const allCategorys = await getAllDocSlugs('collection')

  return {
    paths:
      allCategorys?.map((collection) => {
        return {
          params: {
            slug: collection.slug,
          },
        }
      }) || [],
    fallback: false,
  }
}

export default CategoryPage
