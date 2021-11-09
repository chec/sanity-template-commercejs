import React from 'react'
import { Copy } from 'phosphor-react'

/**
 * @description A variant of a product.
 */
export default {
  name: 'productVariant',
  title: 'Variant',
  type: 'document',
  // _experimental_actions: ['update', 'publish', 'delete'], // disable for initial publish
  fieldsets: [
    {
      title: 'Commerce',
      name: 'commerce',
      description: 'Synced from commerce',
      options: { columns: 2, collapsible: true }
    },
    {
      title: 'Listing Settings',
      name: 'listing',
      options: { columns: 2 }
    }
  ],
  icon: () => <Copy />,
  fields: [
    {
      name: 'productName',
      title: 'Product name',
      type: 'string',
      readOnly: true,
      fieldset: 'commerce'
    },
    {
      name: 'variantName',
      title: 'Variant name',
      type: 'string',
      readOnly: true,
      fieldset: 'commerce'
    },
    {
      name: 'productID',
      title: 'Product ID',
      type: 'number',
      readOnly: true,
      fieldset: 'commerce'
    },
    {
      name: 'variantID',
      title: 'Variant ID',
      type: 'number',
      readOnly: true,
      fieldset: 'commerce'
    },
    {
      name: 'price',
      title: 'Price (cents)',
      type: 'number',
      readOnly: true,
      fieldset: 'commerce'
    },
    {
      name: 'comparePrice',
      title: 'Compare Price (cents)',
      type: 'number',
      readOnly: true,
      fieldset: 'commerce'
    },
    {
      name: 'inStock',
      title: 'In Stock?',
      type: 'boolean',
      readOnly: true,
      fieldset: 'commerce'
    },
    {
      name: 'lowStock',
      title: 'Low Stock?',
      type: 'boolean',
      readOnly: true,
      fieldset: 'commerce'
    },
    {
      name: 'sku',
      title: 'SKU',
      type: 'string',
      readOnly: true,
      fieldset: 'commerce'
    },
    {
      title: 'Options',
      name: 'options',
      type: 'array',
      of: [{ type: 'productOptionValue' }],
      readOnly: true,
      fieldset: 'commerce'
    },
    {
      title: 'Active mode',
      name: 'isActive',
      type: 'boolean',
      readOnly: true,
      hidden: true,
      fieldset: 'commerce'
    },
    {
      name: 'wasDeleted',
      title: 'Deleted from commerce?',
      type: 'boolean',
      readOnly: true,
      hidden: true,
      fieldset: 'commerce'
    },
    {
      title: 'Display Title',
      name: 'title',
      type: 'string',
      description:
        'Shown where variant names appear (for example: Above the product title in the cart)'
    },
    {
      title: 'SEO / Share Settings',
      name: 'seo',
      type: 'seo'
    }
  ],
  preview: {
    select: {
      isActive: 'isActive',
      wasDeleted: 'wasDeleted',
      title: 'title',
      variantName: 'variantName',
      productName: 'productName'
    },
    prepare({
      isActive = false,
      wasDeleted = false,
      title,
      variantName,
      productName = '(missing product)'
    }) {
      const getSubtitle = () => {
        if (title) {
          return title === variantName ? null : `(${variantName})`
        } else {
          return productName
        }
      }

      return {
        title:
          (title ? title : variantName) +
          (wasDeleted ? ' (removed)' : '') +
          (isActive ? ' (active)' : ''),
        subtitle: getSubtitle()
      }
    }
  }
}
