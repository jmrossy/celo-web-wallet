import { BigNumber } from 'ethers'
import { useEffect, useState } from 'react'
import { getProvider } from 'src/blockchain/provider'
import { logger } from 'src/utils/logger'

const resultCache: Record<Address, boolean> = {}

export function useIsAddressContract(address: Address | undefined) {
  const [isContract, setIsContract] = useState<boolean>(false)

  useEffect(() => {
    if (!address) return

    const cached = resultCache[address]
    // If a boolean result was cached
    if (cached === true || cached === false) {
      setIsContract(cached)
      return
    }

    setIsContract(false)
    isAddressContract(address)
      .then((result: boolean) => {
        resultCache[address] = result
        setIsContract(result)
      })
      .catch(() => {
        setIsContract(false)
      })
  }, [address])

  return isContract
}

async function isAddressContract(address: Address): Promise<boolean> {
  try {
    logger.debug('Checking if address is a contract', address)
    const provider = getProvider()
    const code = await provider.getCode(address)
    if (!code || code === '0x' || BigNumber.from(code).isZero()) {
      // There is no code deployed to this address so assuming it's not a contract
      return false
    } else {
      // There is code deployed to this address, so it's a contract
      return true
    }
  } catch (error) {
    logger.error('Error checking address code', error)
    // This is not a critical operation, so don't propagate the error
    return false
  }
}
