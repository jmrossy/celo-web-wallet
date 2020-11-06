import { PropsWithChildren } from 'react'
import { sharedInputStyles } from 'src/components/input/styles'

export interface TextInputProps {
  name: string
  width: string | number
  height?: number // defaults to 40
  margin?: string | number
  value: string | undefined
  onBlur?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  // TODO add validation hook
}

export function TextInput(props: PropsWithChildren<TextInputProps>) {
  const { name, width, height, margin, value, onBlur, onChange } = props

  return (
    <input
      type="text"
      name={name}
      css={{
        ...sharedInputStyles.input,
        width,
        height: height ?? 40,
        margin,
      }}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
    />
  )
}
