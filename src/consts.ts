export enum Currency {
  cUSD = 'cusd',
  CELO = 'celo',
}

export const WEI_PER_UNIT = '1000000000000000000' // 1 'Celo' or 'Ether'
export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'
export const TEST_ADDRESS = '0x35b74Ed5038bf0488Ff33bD9819b9D12D10A7560'
export const ETHEREUM_DERIVATION_PATH = "m/44'/60'/0'/0"
export const CELO_DERIVATION_PATH = "m/44'/52752'/0'/0"
export const AVG_BLOCK_TIMES = 5000 // 5 seconds

export const MAX_SEND_TOKEN_SIZE = '100000000000000000000' // 100 Tokens
export const MAX_EXCHANGE_TOKEN_SIZE = '100000000000000000000' // 100 Tokens
export const MAX_COMMENT_CHAR_LENGTH = 70 // Chosen to match max length in Valora

export const MAX_FEE_SIZE = '1000000000000000000' // 1 Token
export const MAX_GAS_PRICE = '5000000000' // 5 Gwei
export const MAX_GAS_LIMIT = '10000000' // 10 million

export const MIN_EXCHANGE_RATE = 0.01 // 100 cUSD per Celo

export const BALANCE_STALE_TIME = 15000 // 15 seconds
export const GAS_PRICE_STALE_TIME = 10000 // 10 seconds
export const EXCHANGE_RATE_STALE_TIME = 15000 // 15 seconds

export const PLACEHOLDER_MNEMONIC =
  'wage bitter silk coin door shine orphan quote witness ticket venture undo grief sense write limit famous always wage pink fresh gold carpet adult'

export const HIGH_VALUE_THRESHOLD = 20 //threshold balance for a "high-value" wallet, triggers a warning (HomeScreenWarnings.tsx)
