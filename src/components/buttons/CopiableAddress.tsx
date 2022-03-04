import { ClickToCopy } from 'src/components/buttons/ClickToCopy'
import { Styles } from 'src/styles/types'
import { capitalizeAddress, shortenAddress } from 'src/utils/addresses'

interface ButtonProps {
  address: Address
  length: 'short' | 'full'
  styles?: Styles
}

export function CopiableAddress(props: ButtonProps) {
  const { address, length, styles } = props
  const text = length === 'full' ? capitalizeAddress(address) : shortenAddress(address, true, true)

  return <ClickToCopy text={text} copyText={address} styles={styles} />
}
