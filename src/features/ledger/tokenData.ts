import { logger } from 'ethers'
import { config } from 'src/config'
import { areAddressesEqual, ensureLeading0x } from 'src/utils/addresses'

// From https://github.com/celo-org/celo-monorepo/blob/master/packages%2Fsdk%2Fwallets%2Fwallet-ledger%2Fsrc%2Fdata.ts
const ERC_20_TOKEN_DATA =
  'AAAAaARjVVNEdl3oFoRYYedaJfyhIrtomLixKCoAAAASAACk7DBFAiEApwQFHNBKXp+V2jq8BMD2y/5AwC9bhPQ2H4hT/vMl/B4CIFalOVtBFGREUKMU/F5vDlJLeQrTn6GQeDertpB2FpMvAAAAZwRjR0xERx7ON1DaI3+TuOM5xTaYm4l4pDgAAAASAACk7DBEAiAtUE03OVEDTuAgMR8CeUiXVB7Uqa+4gQHaZtXsU0tjMQIgTsY5//96mGMOtyoQFgjDrh3kztxlUO90MJOLElo6baQ='

export interface TokenInfo {
  contractAddress: string
  ticker: string
  decimals: number
  chainId: number
  signature: Buffer
  data: Buffer
}

// Map of token address to info
let tokenDataCache: Record<string, TokenInfo> | null = null

export function getTokenData(tokenAddress?: string) {
  if (
    !tokenAddress ||
    (!areAddressesEqual(tokenAddress, config.contractAddresses.StableToken) &&
      !areAddressesEqual(tokenAddress, config.contractAddresses.GoldToken))
  ) {
    return null
  }

  if (!tokenDataCache) {
    tokenDataCache = {}
    const buf = Buffer.from(ERC_20_TOKEN_DATA, 'base64')
    let i = 0
    while (i < buf.length) {
      const length = buf.readUInt32BE(i)
      i += 4
      const item = buf.slice(i, i + length)
      let j = 0
      const tickerLength = item.readUInt8(j)
      j += 1
      const ticker = item.slice(j, j + tickerLength).toString('ascii')
      j += tickerLength
      const contractAddress: string = ensureLeading0x(item.slice(j, j + 20).toString('hex'))
      j += 20
      const decimals = item.readUInt32BE(j)
      j += 4
      const chainId = item.readUInt32BE(j)
      j += 4
      const signature = item.slice(j)
      const entry: TokenInfo = {
        ticker,
        contractAddress,
        decimals,
        chainId,
        signature,
        data: item,
      }
      if (entry.chainId === config.chainId) {
        tokenDataCache[contractAddress.toLowerCase()] = entry
      }
      i += length
    }
  }

  const tokenData = tokenDataCache[tokenAddress.toLowerCase()]
  if (!tokenData) {
    // Note, there's no data for Alfajores atm, only Mainnet
    logger.warn(`No token data found for ${tokenAddress}`)
    return null
  }
  return tokenData
}
