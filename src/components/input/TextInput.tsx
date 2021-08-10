import { PropsWithChildren } from 'react'
import { HelpText } from 'src/components/input/HelpText'
import { getSharedInputStyles } from 'src/components/input/styles'
import { Box } from 'src/components/layout/Box'
import { Styles } from 'src/styles/types'

export interface TextInputProps {
  name: string
  height?: number // defaults to 40
  width?: string | number
  fillWidth?: boolean
  margin?: string | number
  value: string | undefined
  onBlur?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  error?: boolean
  helpText?: string
  autoComplete?: string //default to "off"
  autoFocus?: boolean
  placeholder?: string
  disabled?: boolean
  inputStyles?: Styles
  type?: 'text' | 'number' // For use by NumberInput, don't use this directly
  step?: string // For use by NumberInput, don't use this directly
}

export function TextInput(props: PropsWithChildren<TextInputProps>) {
  const {
    name,
    height,
    width,
    fillWidth,
    margin,
    value,
    onBlur,
    onChange,
    error,
    helpText,
    autoComplete,
    autoFocus,
    placeholder,
    disabled,
    inputStyles,
    type,
    step,
  } = props

  const sharedStyles = getSharedInputStyles(error)
  const containerStyles = fillWidth ? { width: '100%' } : null

  return (
    <Box direction="column" styles={containerStyles}>
      <input
        type={type ?? 'text'}
        step={type === 'number' ? step : undefined}
        name={name}
        css={{
          ...sharedStyles,
          padding: '2px 10px',
          width,
          height: height ?? 40,
          margin,
          ...inputStyles,
        }}
        value={value}
        onBlur={onBlur}
        onChange={onChange}
        autoComplete={autoComplete || 'off'}
        autoFocus={autoFocus}
        placeholder={placeholder}
        disabled={disabled}
      />
      {helpText && <HelpText>{helpText}</HelpText>}
    </Box>
  )
}
