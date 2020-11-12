import { PropsWithChildren } from 'react'
import { InputStyleConstants } from 'src/components/input/styles'
import { Color } from 'src/styles/Color'

export interface TextAreaProps {
  name: string
  minWidth: string
  maxWidth: string
  minHeight: string
  maxHeight: string
  margin?: string | number
  value: string | undefined
  placeholder?: string
  onBlur?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  // TODO add validation hook
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
    onBlur,
    onChange,
  } = props

  return (
    <textarea
      name={name}
      css={{
        minWidth,
        maxWidth,
        minHeight,
        maxHeight,
        margin,
        borderRadius: InputStyleConstants.borderRadius,
        outline: 'none',
        padding: InputStyleConstants.paddingTextArea,
        border: InputStyleConstants.border,
        ':focus': {
          borderColor: Color.borderActive,
        },
      }}
      value={value}
      placeholder={placeholder}
      onBlur={onBlur}
      onChange={onChange}
    />
  )
}
