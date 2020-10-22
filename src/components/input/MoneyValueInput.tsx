import { PropsWithChildren } from 'react'
import { TextInput, TextInputProps } from 'src/components/input/TextInput'

interface MoneyValueInputProps extends TextInputProps {
  // TODO add validation hook
  min?: number // defaults to 0.001
  max?: number // defaults to MAX_SEND_TOKEN_SIZE
}

export function MoneyValueInput(props: PropsWithChildren<MoneyValueInputProps>) {
  // TODO
  return <TextInput {...props} />
}
