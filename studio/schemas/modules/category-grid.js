import { SquaresFour } from 'phosphor-react'

export default {
  title: 'Category grid',
  name: 'categoryGrid',
  type: 'object',
  icon: SquaresFour,
  fields: [
    {
      title: 'Display category grid?',
      name: 'active',
      type: 'boolean',
      initialValue: true
    }
  ],
  preview: {
    prepare() {
      return {
        title: 'Category grid',
        subtitle: 'Displays the category’s associated products'
      }
    }
  }
}
