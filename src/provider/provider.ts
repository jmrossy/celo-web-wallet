import { ethers } from 'ethers'
import { config } from 'src/config'
import { logger } from 'src/utils/logger'
import { sleep } from 'src/utils/sleep'

let provider: ethers.providers.JsonRpcProvider

export async function connectToForno() {
  logger.info('Connecting to Forno provider')
  provider = new ethers.providers.JsonRpcProvider(config.fornoUrl)
  for (let i = 0; i < 5; i++) {
    const [latestBlock, network, ready] = await Promise.all([
      provider.getBlockNumber(),
      provider.getNetwork(),
      provider.ready,
    ])
    if (latestBlock > 0 && network?.chainId === config.chainId && ready) {
      logger.info('Provider is connected')
      return
    }
    await sleep(1000)
  }
  throw new Error('Provider failed to connect')
}

export function getProvider() {
  if (!provider) {
    logger.warn('Provider is not yet initialized')
  }
  return provider
}
