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
          categoryProducts={page.products}
        />
      ))}
    </Layout>
  )
}

export async function getStaticProps({ params, preview, previewData }) {
  const categoryData = await getCategory(params.slug, {
    active: preview,
    token: previewData?.token,
  })

  return {
    props: {
      data: categoryData,
    },
  }
}

export async function getStaticPaths() {
  const allCategorys = await getAllDocSlugs('category')

  return {
    paths:
      allCategorys?.map((category) => {
        return {
          params: {
            slug: category.slug,
          },
        }
      }) || [],
    fallback: false,
  }
}

export default CategoryPage
