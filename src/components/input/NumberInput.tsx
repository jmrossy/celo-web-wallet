import { PropsWithChildren } from 'react'
import { TextInput, TextInputProps } from './TextInput'

interface Props extends TextInputProps {
  step?: string
}

export function NumberInput(props: PropsWithChildren<Props>) {
  return <TextInput {...props} type="number" />
}
