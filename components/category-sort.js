import React from 'react'

import Listbox from '@components/listbox'

const CategorySort = ({ sortOptions, activeSort, onChange }) => {
  return (
    <div className="category-sort is-right">
      <Listbox
        id="category-sort"
        label="Select sorting order"
        name="sort"
        options={sortOptions}
        activeOption={activeSort}
        onChange={onChange}
        before={
          <>
            <span className="category-sort--icon" />
            <span className="category-sort--title">Sort:</span>
          </>
        }
      />
    </div>
  )
}

export default CategorySort
