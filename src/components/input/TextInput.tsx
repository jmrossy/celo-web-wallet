import { Color } from 'src/components/Color'

export interface TextInputProps {
  name: string
  width: number
  height?: number // defaults to 40
  margin?: string | number
  value: string | undefined
  onBlur?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  // TODO add validation hook
}

export function TextInput(props: React.PropsWithChildren<TextInputProps>) {
  const { name, width, height, margin, value, onBlur, onChange } = props

  return (
    <input
      type="text"
      name={name}
      css={{
        width,
        height: height ?? 40,
        margin,
        borderRadius: 3,
        outline: 'none',
        border: `2px solid ${Color.borderInactive}`,
        ':focus': {
          borderColor: Color.borderActive,
        },
      }}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
    />
  )
}
