import { ChangeEvent, PropsWithChildren, ReactElement, useEffect, useState } from 'react'
import { ChevronIcon } from 'src/components/icons/Chevron'
import { HelpText } from 'src/components/input/HelpText'
import { getSharedInputStyles } from 'src/components/input/styles'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Styles, Stylesheet } from 'src/styles/types'

export interface SelectOption {
  display: string
  value: string
}
export type SelectOptions = Array<SelectOption>

export interface SelectInputProps {
  name: string
  autoComplete: boolean
  width?: string | number // mandatory unless fillWidth is set
  fillWidth?: boolean
  height?: string | number // defaults to 40
  value: string | undefined
  options: SelectOptions
  maxOptions?: number // max number of suggestions to show
  allowRawOption?: boolean // user's raw input sets value
  onBlur?: (event: ChangeEvent<HTMLInputElement>) => void
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  error?: boolean
  helpText?: string
  placeholder?: string
  disabled?: boolean
  inputStyles?: Styles
  renderDropdownOption?: (o: SelectOption) => ReactElement
  renderDropdownValue?: (v: string) => ReactElement | null
  hideChevron?: boolean
}

export function SelectInput(props: PropsWithChildren<SelectInputProps>) {
  const {
    name,
    autoComplete,
    value,
    options,
    maxOptions,
    allowRawOption,
    onBlur,
    onChange,
    helpText,
    placeholder,
    disabled,
    inputStyles,
    fillWidth,
    renderDropdownOption,
    renderDropdownValue,
    hideChevron,
  } = props

  const initialInput = allowRawOption ? value : getDisplayValue(options, value)
  const [inputValue, setInputValue] = useState(initialInput || '')
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    if (allowRawOption) {
      setInputValue(value || '')
    } else {
      setInputValue(getDisplayValue(options, value))
    }
  }, [value])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (allowRawOption) {
      onChange({ target: { name, value } } as any)
    } else {
      setInputValue(value)
      onChange({ target: { name, value: '' } } as any)
    }
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
    ? sortAndFilter(options, inputValue ?? '', maxOptions)
    : options

  const formattedInputStyle = getInputStyles(props, inputValue, inputStyles)

  return (
    <Box direction="column" styles={fillWidth ? style.containerFill : undefined}>
      <div
        css={fillWidth ? style.containerFill : style.container}
        onBlur={handleBlur}
        className="notranslate"
      >
        {autoComplete ? (
          <>
            <input
              type="text"
              name={name}
              css={formattedInputStyle}
              value={inputValue}
              onClick={handleClick}
              onFocus={handleClick}
              onChange={handleChange}
              autoComplete="off"
              placeholder={placeholder}
              disabled={disabled}
            ></input>
            {!hideChevron && (
              <div css={style.chevronContainer}>
                <ChevronIcon direction="s" height="8px" width="12px" />
              </div>
            )}
          </>
        ) : (
          // Tab index is required here to workaround a browser bug
          <div css={formattedInputStyle} onClick={handleClick} tabIndex={0}>
            {(renderDropdownValue ? renderDropdownValue(inputValue) : inputValue) || placeholder}
            {!hideChevron && (
              <div css={style.chevronContainer}>
                <ChevronIcon direction="s" height="8px" width="12px" />
              </div>
            )}
          </div>
        )}

        {showDropdown && filteredOptions.length > 0 && (
          <div css={style.dropdownContainer}>
            {filteredOptions.map((o) => (
              <div
                key={`select-option-${o.value}`}
                css={style.option}
                onMouseDown={() => handleOptionClick(o.value)}
              >
                {renderDropdownOption ? renderDropdownOption(o) : o.display}
              </div>
            ))}
          </div>
        )}
      </div>
      {helpText && <HelpText>{helpText}</HelpText>}
    </Box>
  )
}

function sortAndFilter(options: SelectOptions, input: string, maxOptions?: number) {
  const formattedInput = input.trim().toLowerCase()
  const filtered = [...options]
    .sort((a, b) => (a.display.toLowerCase() < b.display.toLowerCase() ? -1 : 1))
    .filter(
      (o) =>
        o.display.toLowerCase().includes(formattedInput) ||
        o.value.toLowerCase().includes(formattedInput)
    )
  return maxOptions ? filtered.slice(0, maxOptions) : filtered
}

function getDisplayValue(options: SelectOptions, optionValue?: string) {
  if (!optionValue) return ''
  const option = options.find((o) => o.value === optionValue)
  if (option && option.display) return option.display
  else return ''
}

function getInputStyles(props: SelectInputProps, inputValue: string, styleOverrides?: Styles) {
  const { autoComplete, width, fillWidth, height, error, disabled } = props

  const styleBase = {
    ...getSharedInputStyles(error),
    padding: '2px 10px',
    width: fillWidth ? '100%' : width,
    height: height ? height : fillWidth ? 46 : 40,
    boxSizing: fillWidth ? 'border-box' : undefined,
    ...styleOverrides,
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
  containerFill: {
    position: 'relative',
    width: '100%',
  },
  chevronContainer: {
    position: 'absolute',
    right: 14,
    top: '30%',
    opacity: 0.75,
  },
  dropdownContainer: {
    zIndex: 100,
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    maxHeight: '15em',
    overflow: 'auto',
    borderRadius: 4,
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
