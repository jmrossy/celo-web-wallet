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
    const { address, size } = this.props

    if (!address || !utils.isAddress(address) || BigNumber.from(address).isZero()) {
      return null
    }

    const jazziconResult = jazzicon(size ?? 30, addressToSeed(address))

    return (
      <span
        ref={(nodeElement) => {
          if (nodeElement) {
            nodeElement.innerHTML = ''
            nodeElement.appendChild(jazziconResult)
          }
        }}
      ></span>
    )
  }
}
