import { PropsWithChildren } from 'react'
import { HelpText } from 'src/components/input/HelpText'
import { getSharedInputStyles } from 'src/components/input/styles'
import { Box } from 'src/components/layout/Box'

export interface TextAreaProps {
  name: string
  minWidth: string
  maxWidth: string
  minHeight: string
  maxHeight: string
  margin?: string | number
  value: string | undefined
  placeholder?: string
  error?: boolean
  helpText?: string
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  onBlur?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  onFocus?: () => void
  fillWidth?: boolean
}

export function TextArea(props: PropsWithChildren<TextAreaProps>) {
  const {
    name,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    margin,
    value,
    placeholder,
    error,
    helpText,
    onChange,
    onBlur,
    onFocus,
    fillWidth,
  } = props

  const sharedStyles = getSharedInputStyles(error)
  const containerStyles = fillWidth ? { width: '100%' } : null

  return (
    <Box direction="column" styles={containerStyles}>
      <textarea
        name={name}
        css={{
          ...sharedStyles,
          minWidth,
          maxWidth,
          minHeight,
          maxHeight,
          margin,
          padding: '1em',
          lineHeight: '1.4em',
        }}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      {helpText && <HelpText>{helpText}</HelpText>}
    </Box>
  )
}
