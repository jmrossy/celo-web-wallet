export const WEI_PER_UNIT = '1000000000000000000' // 1 Celo or Ether
export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'
export const TEST_ADDRESS = '0x35b74Ed5038bf0488Ff33bD9819b9D12D10A7560'
export const MNEMONIC_LENGTH_MIN = 12
export const MNEMONIC_LENGTH_MAX = 24
export const ETHEREUM_DERIVATION_PATH = "m/44'/60'/0'/0"
export const CELO_DERIVATION_PATH = "m/44'/52752'/0'/0"
export const DERIVATION_PATH_MAX_INDEX = 1000000
export const AVG_BLOCK_TIMES = 5000 // 5 seconds
export const CONNECTION_CHECK_INTERVAL = 15000 // 15 seconds
export const STALE_BLOCK_TIME = 20000 // 20 seconds
export const MAX_NUM_ELECTABLE_VALIDATORS = 100

export const MAX_SEND_TOKEN_SIZE = '100000000000000000000' // 100 Tokens
export const MAX_EXCHANGE_TOKEN_SIZE = '100000000000000000000' // 100 Tokens
export const MAX_SEND_TOKEN_SIZE_LEDGER = '2000000000000000000000' // 2000 Tokens
export const MAX_EXCHANGE_TOKEN_SIZE_LEDGER = '2000000000000000000000' // 2000 Tokens
export const MAX_COMMENT_CHAR_LENGTH = 70 // Chosen to match max length in Valora

export const MAX_FEE_SIZE = '1000000000000000000' // 1 Token
export const MAX_GAS_PRICE = '5000000000' // 5 Gwei
export const MAX_GAS_LIMIT = '10000000' // 10 million

export const MIN_EXCHANGE_RATE = 0.01 // 1<->100 ratio
export const MAX_EXCHANGE_RATE = 100 // 1<->100 ratio
export const MAX_EXCHANGE_LOSS = 0.015 // 1.5%
export const MAX_EXCHANGE_SPREAD = 0.05

export const MIN_LOCK_AMOUNT = '10000000000000000' // 0.01 CELO
export const MIN_LOCKED_GOLD_TO_VOTE = '200000000000000000' // 0.2 Celo
export const MIN_VOTE_AMOUNT = '10000000000000000' // 0.01 CELO
export const BARCHART_MIN_SHOW_AMOUNT = '10000000000000000' // 0.01 CELO

export const ACCOUNT_UNLOCK_TIMEOUT = 600000 // 10 minutes
export const BALANCE_STALE_TIME = 15000 // 15 seconds
export const GAS_PRICE_STALE_TIME = 10000 // 10 seconds
export const EXCHANGE_RATE_STALE_TIME = 20000 // 20 seconds
export const ACCOUNT_STATUS_STALE_TIME = 43200000 // 12 hours
export const VALIDATOR_LIST_STALE_TIME = 43200000 // 12 hours
export const VALIDATOR_VOTES_STALE_TIME = 300000 // 5 minutes
export const VALIDATOR_ACTIVATABLE_STALE_TIME = 43200000 // 12 hours
export const PROPOSAL_LIST_STALE_TIME = 60000 // 1 minutes

export const PLACEHOLDER_MNEMONIC =
  'wage bitter silk coin door shine orphan quote witness ticket venture undo grief sense write limit famous always wage pink fresh gold carpet adult'

export const HIGH_VALUE_THRESHOLD = '25000000000000000000' // 25 cusd - threshold balance for a "high-value" wallet

export const CELO_LEDGER_APP_MIN_VERSION = '1.0.3' // Only allow this ledger app versions or newer
