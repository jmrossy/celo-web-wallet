import { PropsWithChildren } from 'react'
import { TextInput, TextInputProps } from 'src/components/input/TextInput'

export function NumberInput(props: PropsWithChildren<TextInputProps>) {
  return <TextInput {...props} type="number" />
}
