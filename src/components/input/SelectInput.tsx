import { ChangeEvent, PropsWithChildren, useEffect, useState } from 'react'
import { ChevronIcon } from 'src/components/icons/Chevron'
import { HelpText } from 'src/components/input/HelpText'
import { getSharedInputStyles } from 'src/components/input/styles'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'

type SelectOptions = Array<{ display: string; value: string }>

export interface SelectInputProps {
  name: string
  autoComplete: boolean
  width: string | number
  height?: number // defaults to 40
  value: string | undefined
  options: SelectOptions
  maxOptions?: number // max number of suggestions to show
  onBlur?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  error?: boolean
  helpText?: string
  placeholder?: string
  disabled?: boolean
  allowRawOption?: boolean // user's input is included in select options
}

export function SelectInput(props: PropsWithChildren<SelectInputProps>) {
  const {
    name,
    autoComplete,
    value,
    options,
    maxOptions,
    onBlur,
    onChange,
    helpText,
    placeholder,
    disabled,
    allowRawOption,
  } = props

  const initialInput = getDisplayValue(options, value)
  const [inputValue, setInputValue] = useState(initialInput)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    setInputValue(getDisplayValue(options, value, allowRawOption))
  }, [value])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
    onChange({ target: { name, value: '' } } as any)
  }

  const handleClick = () => {
    if (!disabled) setShowDropdown(true)
  }

  const handleBlur = (event: any) => {
    setShowDropdown(false)
    if (onBlur) onBlur(event)
  }

  const handleOptionClick = (value: string) => {
    onChange({ target: { name, value } } as any)
  }

  const filteredOptions = autoComplete
    ? sortAndFilter(options, inputValue ?? '', maxOptions, allowRawOption)
    : options

  const inputStyle = getInputStyles(props, inputValue)

  return (
    <Box direction="column">
      <div css={style.container} onBlur={handleBlur}>
        {autoComplete ? (
          <input
            type="text"
            name={name}
            css={inputStyle}
            value={inputValue}
            onClick={handleClick}
            onFocus={handleClick}
            onChange={handleChange}
            autoComplete="off"
            placeholder={placeholder}
            disabled={disabled}
          />
        ) : (
          <div css={inputStyle} onClick={handleClick} tabIndex={0}>
            {inputValue || placeholder}
          </div>
        )}
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

function sortAndFilter(
  options: SelectOptions,
  input: string,
  maxOptions?: number,
  allowRawOption?: boolean
) {
  const filtered = options
    .sort((a, b) => (a.display < b.display ? -1 : 1))
    .filter((o) => o.display.toLowerCase().includes(input.toLowerCase()))
  if (input && allowRawOption) {
    filtered.unshift({ display: input, value: input })
  }
  return maxOptions ? filtered.slice(0, maxOptions) : filtered
}

function getDisplayValue(options: SelectOptions, optionValue?: string, allowRawOption?: boolean) {
  if (!optionValue) return ''
  const option = options.find((o) => o.value === optionValue)
  if (option && option.display) return option.display
  else if (allowRawOption) return optionValue
  else return ''
}

function getInputStyles(props: SelectInputProps, inputValue: string) {
  const { autoComplete, width, height, error, disabled } = props

  const styleBase = {
    ...getSharedInputStyles(error),
    padding: '2px 10px',
    width,
    height: height ?? 40,
  }

  // Just a simple input field
  if (autoComplete) return styleBase

  // Otherwise must style a div to look like an input
  const fauxInputStyle = {
    ...styleBase,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  }
  if (disabled) {
    return {
      ...fauxInputStyle,
      background: '#fafafa',
      color: Color.textGrey,
      cursor: 'default',
      ':focus': undefined,
    }
  }
  // if showing a placeholder
  if (!inputValue) {
    return {
      ...fauxInputStyle,
      color: Color.textGrey,
    }
  }
  return fauxInputStyle
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
    top: 50,
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
