import jazzicon from '@metamask/jazzicon'
import { PureComponent } from 'react'
import { Styles } from 'src/styles/types'
import { isValidAddress, normalizeAddress } from 'src/utils/addresses'

type Props = {
  address: string
  size?: number
  styles?: Styles
}

// This should match metamask: https://github.com/MetaMask/metamask-extension/blob/master/ui/helpers/utils/icon-factory.js#L84
function addressToSeed(address: string) {
  const addrStub = normalizeAddress(address).slice(2, 10)
  return parseInt(addrStub, 16)
}

export class Identicon extends PureComponent<Props> {
  render() {
    const { address, size: _size, styles } = this.props
    const size = _size ?? 34

    if (!isValidAddress(address)) return null

    const jazziconResult = jazzicon(size, addressToSeed(address))

    return (
      <div
        css={{ height: size, ...styles }}
        ref={(nodeElement) => {
          if (nodeElement) {
            nodeElement.innerHTML = ''
            nodeElement.appendChild(jazziconResult)
          }
        }}
      ></div>
    )
  }
}
