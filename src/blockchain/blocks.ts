import { getProvider } from 'src/blockchain/provider'
import { AVG_BLOCK_TIMES } from 'src/consts'
import { logger } from 'src/utils/logger'

export async function getLatestBlockDetails() {
  const provider = getProvider()
  if (!provider) {
    return null
  }

  // TODO remove this chunk when below method is working
  const number = await provider.getBlockNumber()
  logger.info('Got block number', number)
  return { number }

  // const block = await provider.getBlock('latest')
  // if (!block || !block.number) {
  //   logger.warn('Latest block is not valid')
  //   return null
  // }

  // return {
  //   number: block.number,
  //   timestamp: block.timestamp,
  // }
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
