import jazzicon from '@metamask/jazzicon'
import { BigNumber } from 'ethers'
import { PureComponent } from 'react'
import { Styles } from 'src/styles/types'
import { isValidAddress, normalizeAddress } from 'src/utils/addresses'

type Props = {
  address: string
  size?: number
  styles?: Styles
}

function addressToSeed(address: string) {
  return BigNumber.from(normalizeAddress(address).slice(0, 8)).toNumber()
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
