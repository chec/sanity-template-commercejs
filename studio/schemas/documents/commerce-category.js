import React from 'react'
import { SquaresFour } from 'phosphor-react'

export default {
  title: 'Category',
  name: 'category',
  type: 'document',
  icon: () => <SquaresFour />,
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      readOnly: true,
    },
    {
      title: 'Slug',
      name: 'slug',
      type: 'string',
      description: '(required)',
      options: {
        source: 'title',
        maxLength: 96
      },
      readOnly: true,
    },
    {
      title: 'Description',
      name: 'description',
      type: 'string',
      readOnly: true,
    },
    {
      title: 'Category ID',
      name: 'categoryID',
      type: 'string',
      readOnly: true,
    },
    {
      title: 'Overlay header with transparency?',
      name: 'hasTransparentHeader',
      type: 'boolean',
      description:
        'When activated the header will overlay the first content module with a transparent background and white text until scrolling is engaged.',
      initialValue: false
    },
    {
      title: 'Page Modules',
      name: 'modules',
      type: 'array',
      of: [
        { type: 'categoryGrid' },
        { type: 'grid' },
        { type: 'hero' },
        { type: 'marquee' },
        { type: 'dividerPhoto' }
      ],
      validation: Rule =>
        Rule.custom(blocks => {
          const categoryGrids =
            blocks?.filter(block => block._type === 'categoryGrid') || []

          const categoryGridItems = categoryGrids.map(
            (item, index) => [{ _key: item._key }] || [index]
          )

          return categoryGrids.length === 1
            ? true
            : {
                message:
                  'You must have one "Category grid" module on the page',
                paths: categoryGridItems
              }
        })
    },
    {
      title: 'Products grid',
      name: 'products',
      type: 'array',
      of: [
        {
          title: 'Product',
          type: 'reference',
          to: [{ type: 'product' }],
          options: {
            filter: ({ document }) => {
              const addedProducts = document.products
                .map(p => p._ref)
                .filter(Boolean)

              return {
                filter: '!(_id in $ids)',
                params: {
                  ids: addedProducts
                }
              }
            }
          }
        }
      ],
      validation: Rule => Rule.unique()
    },
    {
      title: 'SEO / Share Settings',
      name: 'seo',
      type: 'seo'
    }
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug'
    },
    prepare({ title = 'Untitled', slug = null }) {
      const path = `/shop/${slug}`
      return {
        title,
        subtitle: slug ? path : '(missing slug)'
      }
    }
  }
}
