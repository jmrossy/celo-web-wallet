import { ChangeEvent, PropsWithChildren, useState } from 'react'
import { ChevronIcon } from 'src/components/icons/Chevron'
import { HelpText } from 'src/components/input/HelpText'
import { getSharedInputStyles } from 'src/components/input/styles'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'

type SelectOptions = Array<{ display: string; value: string }>

export interface SelectInputProps {
  name: string
  width: string | number
  height?: number // defaults to 40
  margin?: string | number
  value: string | undefined
  options: SelectOptions
  onBlur?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  error?: boolean
  helpText?: string
  placeholder?: string
}

export function SelectInput(props: PropsWithChildren<SelectInputProps>) {
  const {
    name,
    width,
    height,
    margin,
    value,
    options,
    onBlur,
    onChange,
    error,
    helpText,
    placeholder,
  } = props

  const initialInput = getDisplayValue(options, value)
  const [inputValue, setInputValue] = useState(initialInput)
  const [showDropdown, setShowDropdown] = useState(false)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
    onChange({ target: { name, value: '' } } as any)
  }

  const handleClick = () => {
    setShowDropdown(true)
  }

  const handleBlur = (event: any) => {
    setShowDropdown(false)
    if (onBlur) onBlur(event)
  }

  const handleOptionClick = (value: string) => {
    setInputValue(getDisplayValue(options, value))
    onChange({ target: { name, value } } as any)
  }

  const filteredOptions = sortAndFilter(options, inputValue ?? '')

  return (
    <Box direction="column">
      <div css={style.container} onBlur={handleBlur}>
        <input
          type="text"
          name={name}
          css={{
            ...getSharedInputStyles(error),
            padding: '2px 10px',
            width,
            height: height ?? 40,
            margin,
          }}
          value={inputValue}
          onClick={handleClick}
          onFocus={handleClick}
          onChange={handleChange}
          autoComplete="off"
          placeholder={placeholder}
        />
        <div css={style.chevronContainer}>
          <ChevronIcon direction="s" height="8px" width="13px" />
        </div>
        {showDropdown && (
          <div css={{ ...style.dropdownContainer }}>
            {filteredOptions.map((o) => (
              <div
                key={`select-option-${o.value}`}
                css={style.option}
                onMouseDown={() => handleOptionClick(o.value)}
              >
                {o.display}
              </div>
            ))}
          </div>
        )}
      </div>
      {helpText && <HelpText>{helpText}</HelpText>}
    </Box>
  )
}

function sortAndFilter(options: SelectOptions, input: string) {
  return options
    .sort((a, b) => (a.display < b.display ? -1 : 1))
    .filter((o) => o.display.includes(input))
}

function getDisplayValue(options: SelectOptions, optionValue?: string) {
  if (!optionValue) return ''
  const option = options.find((o) => o.value === optionValue)
  return option ? option.display : ''
}

const style: Stylesheet = {
  container: {
    position: 'relative',
    width: 'fit-content',
  },
  chevronContainer: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 53,
    left: 0,
    right: 0,
    maxHeight: '15em',
    overflow: 'auto',
    borderRadius: 3,
    border: `1px solid ${Color.borderInactive}`,
    background: Color.primaryWhite,
    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.06)',
  },
  option: {
    padding: '0.8em 1em',
    borderBottom: `1px solid ${Color.borderInactive}`,
    cursor: 'pointer',
    ':hover': {
      background: Color.fillLight,
    },
    ':last-of-type': {
      borderBottom: 'none',
    },
  },
}
