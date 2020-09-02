import jazzicon from '@metamask/jazzicon'
import { BigNumber } from 'ethers'
import React from 'react'

type Props = {
  address: string
}

function addressToSeed(address: string) {
  return BigNumber.from(address.slice(0, 8)).toNumber()
}

export class Identicon extends React.PureComponent<Props> {
  render() {
    const { address } = this.props

    const parsedAddress = BigNumber.from(address)
    if (!address || parsedAddress.isZero()) {
      return null
    }

    // TODO don't block render on this?
    const jazziconResult = jazzicon(50, addressToSeed(address))

    return (
      <div
        css={{
          marginTop: 20,
        }}
      >
        <div
          ref={(nodeElement) => {
            if (nodeElement) {
              nodeElement.innerHTML = ''
              nodeElement.appendChild(jazziconResult)
            }
          }}
        ></div>
      </div>
    )
  }
}
