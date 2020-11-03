import { PropsWithChildren } from 'react';
import { Color } from 'src/styles/Color';
import { InputStyles } from 'src/styles/inputs';

export interface TextAreaProps {
  name: string
  width: number
  height?: number // defaults to 40
  margin?: string | number
  value: string | undefined
  rows?: number //defaults to 3
  onBlur?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  // TODO add validation hook
}

export function TextArea(props: PropsWithChildren<TextAreaProps>) {
  const { name, width, height, margin, value, onBlur, onChange, rows } = props

  return (
    <textarea
      name={name}
      css={{
        width,
        height: height ?? InputStyles.defaultHeight,
        margin,
        borderRadius: InputStyles.borderRadius,
        outline: 'none',
        padding: InputStyles.paddingTextArea,
        border: InputStyles.border,
        ':focus': {
          borderColor: Color.borderActive,
        },
      }}
      rows={rows ?? 3}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
    />
  )
}
