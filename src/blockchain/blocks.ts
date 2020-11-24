import { getProvider } from 'src/blockchain/provider'
import { AVG_BLOCK_TIMES } from 'src/consts'

export function getLatestBlockNumber() {
  const provider = getProvider()
  return provider.getBlockNumber()
}

/**
 * Get number of blocks that would normally be mined in a given time interval
 * @param interval in seconds
 */
export function getNumBlocksPerInterval(interval: number) {
  if (!interval || interval < 0) {
    throw new Error('Invalid time interval')
  }
  return Math.floor((interval * 1000) / AVG_BLOCK_TIMES)
}
