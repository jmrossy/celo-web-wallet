import jazzicon from '@metamask/jazzicon'
import { BigNumber, utils } from 'ethers'
import { PureComponent } from 'react'

type Props = {
  address: string
  size?: number
}

function addressToSeed(address: string) {
  return BigNumber.from(address.slice(0, 8)).toNumber()
}

export class Identicon extends PureComponent<Props> {
  render() {
    const { address, size: _size } = this.props
    const size = _size ?? 34

    if (!address || !utils.isAddress(address) || BigNumber.from(address).isZero()) {
      return null
    }

    const jazziconResult = jazzicon(size, addressToSeed(address))

    return (
      <div
        css={{ height: size }}
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
