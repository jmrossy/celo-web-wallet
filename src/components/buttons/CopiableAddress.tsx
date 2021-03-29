import { ClickToCopy } from 'src/components/buttons/ClickToCopy'
import { Styles } from 'src/styles/types'
import { shortenAddress } from 'src/utils/addresses'

interface ButtonProps {
  address: string
  length: 'short' | 'full'
  styles?: Styles
}

export function CopiableAddress(props: ButtonProps) {
  const { address, length, styles } = props
  const text =
    length === 'full' ? address.toUpperCase() : shortenAddress(address, true).toUpperCase()

  return <ClickToCopy text={text} styles={styles} />
}
