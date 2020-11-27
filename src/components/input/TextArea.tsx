import { PropsWithChildren } from 'react'
import { getSharedInputStyles } from 'src/components/input/styles'

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
  } = props

  const sharedStyles = getSharedInputStyles(error)

  return (
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
  )
}
