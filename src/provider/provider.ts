// import { providers } from 'ethers'
import { config } from 'src/config'
import { CeloProvider } from 'src/ethers/CeloProvider'
import { logger } from 'src/utils/logger'
import { sleep } from 'src/utils/sleep'

// let provider: providers.JsonRpcProvider
let provider: CeloProvider

export async function connectToForno() {
  logger.info('Connecting to Forno provider')
  // provider = new providers.JsonRpcProvider(config.fornoUrl)
  provider = new CeloProvider(config.fornoUrl)
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
