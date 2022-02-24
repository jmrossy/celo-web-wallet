import { PropsWithChildren } from 'react'
import { TextInput, TextInputProps } from 'src/components/input/TextInput'

interface Props extends TextInputProps {
  step?: string
}

export function NumberInput(props: PropsWithChildren<Props>) {
  return <TextInput {...props} type="number" step={props.step ?? 'any'} />
}
