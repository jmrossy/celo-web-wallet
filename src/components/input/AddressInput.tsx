import { TextInput, TextInputProps } from 'src/components/input/TextInput'

export function AddressInput(props: React.PropsWithChildren<TextInputProps>) {
  // TODO only allow hex chars here
  return <TextInput {...props} />
}
