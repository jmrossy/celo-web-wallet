import { PropsWithChildren } from 'react'
import { HelpText } from 'src/components/input/HelpText'
import { getSharedInputStyles } from 'src/components/input/styles'
import { Box } from 'src/components/layout/Box'

export interface TextInputProps {
  name: string
  width: string | number
  height?: number // defaults to 40
  margin?: string | number
  value: string | undefined
  onBlur?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  error?: boolean
  helpText?: string
  autoComplete?: string //default to "off"
  placeholder?: string
  disabled?: boolean
  fillWidth?: boolean
  type?: 'text' | 'number' // For use by NumberInput, don't use this directly
  step?: string // For use by NumberInput, don't use this directly
}

export function TextInput(props: PropsWithChildren<TextInputProps>) {
  const {
    name,
    width,
    height,
    margin,
    value,
    onBlur,
    onChange,
    error,
    helpText,
    autoComplete,
    placeholder,
    disabled,
    fillWidth,
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
        }}
        value={value}
        onBlur={onBlur}
        onChange={onChange}
        autoComplete={autoComplete || 'off'}
        placeholder={placeholder}
        disabled={disabled}
      />
      {helpText && <HelpText>{helpText}</HelpText>}
    </Box>
  )
}
