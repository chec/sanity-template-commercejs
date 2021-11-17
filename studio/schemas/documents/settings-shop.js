import React from 'react'

export default {
  title: 'Shop settings',
  name: 'shopSettings',
  type: 'document',
  // __experimental_actions: ['update', 'publish'], // disable for initial publish
  fields: [
    {
      title: 'Chec store URL',
      name: 'storeURL',
      type: 'url',
      description: (
        <>
          The{' '}
          <a
            href="https://dashboard.chec.io/settings/merchant"
            target="_blank"
            rel="noopener noreferrer"
          >
            custom domain or subdomain
          </a>{' '}
          connected to your Chec hosted checkout store
        </>
      ),
      validation: Rule =>
        Rule.uri({
          scheme: ['https']
        })
    },
    {
      title: 'Category pagination limit',
      name: 'paginationLimit',
      type: 'number',
      description:
        'The number of products to show in a category to show/load at a time',
      validation: Rule =>
        Rule.integer()
          .positive()
          .min(3)
          .max(100),
      initialValue: 12
    },
    {
      title: 'Filter',
      name: 'filter',
      type: 'shopFilter'
    },
    {
      title: 'Sort',
      name: 'sort',
      type: 'shopSort'
    },
    {
      title: 'Empty Filter Results',
      name: 'noFilterResults',
      type: 'complexPortableText',
      description: 'Display text when a filtered category is empty'
    },
    {
      title: 'Cart Message',
      name: 'cartMessage',
      type: 'string',
      description: 'Display a message below the cart checkout button'
    }
  ],
  preview: {
    prepare() {
      return {
        title: 'Shop Settings'
      }
    }
  }
}
