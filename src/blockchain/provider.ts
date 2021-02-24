import { CeloProvider } from '@celo-tools/celo-ethers-wrapper'
import { config } from 'src/config'
import { logger } from 'src/utils/logger'
import { sleep } from 'src/utils/sleep'

let provider: CeloProvider | undefined

export function isProviderSet() {
  return !!provider
}

export async function connectToProvider() {
  const { jsonRpcUrlPrimary, jsonRpcUrlSecondary } = config

  let connectionResult = await connectToJsonRpcProvider(jsonRpcUrlPrimary)

  if (!connectionResult && jsonRpcUrlSecondary) {
    connectionResult = await connectToJsonRpcProvider(jsonRpcUrlSecondary)
  }

  if (!connectionResult) {
    // TODO need to force to fail screen here, errors get swallowed by saga
    throw new Error('Provider failed to connect')
  }
}

async function connectToJsonRpcProvider(url: string) {
  logger.info(`Connecting to json rpc provider: ${url}`)
  provider = new CeloProvider(url)
  for (let i = 0; i < 3; i++) {
    const [latestBlock, network, ready] = await Promise.all([
      provider.getBlockNumber(),
      provider.getNetwork(),
      provider.ready,
    ])
    if (latestBlock > 0 && network?.chainId === config.chainId && ready) {
      logger.info('Provider is connected')
      return true
    }
    await sleep(1000)
  }
  return false
}

export function getProvider() {
  if (!provider) {
    logger.error('Provider is not yet initialized')
    throw new Error('Attempting to use provider before initialized')
  }
  return provider
}

export function clearProvider() {
  provider = undefined
}
