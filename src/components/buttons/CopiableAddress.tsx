import { ClickToCopy } from './ClickToCopy'
import { Styles } from '../../styles/types'
import { capitalizeAddress, shortenAddress } from '../../utils/addresses'

interface ButtonProps {
  address: string
  length: 'short' | 'full'
  styles?: Styles
}

export function CopiableAddress(props: ButtonProps) {
  const { address, length, styles } = props
  const text = length === 'full' ? capitalizeAddress(address) : shortenAddress(address, true, true)

  return <ClickToCopy text={text} copyText={address} styles={styles} />
}
