import React from 'react'
import cx from 'classnames'

import RadioGroup from '@components/radio-group'
import RadioItem from '@components/radio-item'
import Swatch from '@components/swatch'

const ProductOption = ({
  option,
  optionSettings,
  position,
  hideLabels,
  onChange,
}) => {

  return (
    <div
      key={position}
      className={`option is-${option.name.toLowerCase().replace(' ', '-')}`}
    >
      {!hideLabels && <div className="option--title">{option.name}</div>}

      <RadioGroup
        value={option.value}
        onChange={(value) => {
          changeOption(option.name, value, onChange)
        }}
        className="option--values"
      >
        {option.values.map((value, key) => {
          const optSettings = optionSettings?.find((settings) => {
            const optName = settings.forOption.split(':')[0]
            const optValue = settings.forOption.split(':')[1]
            return optName === option.name && optValue === value
          })

          return (
            <RadioItem
              key={key}
              title={`${option.name}: ${value}`}
              value={value}
              className={cx({
                btn: !optSettings?.color,
                'option--swatch': optSettings?.color,
              })}
            >
              {optSettings?.color ? (
                <Swatch
                  label={`Select "${value}" ${option.name} option`}
                  color={optSettings?.color}
                />
              ) : (
                <>{value}</>
              )}
            </RadioItem>
          )
        })}
      </RadioGroup>
    </div>
  )
}

// handle option changes
const changeOption = (name, value, changeCallback) => {
  if (changeCallback) {
    changeCallback(value)
  }
}

export default ProductOption

