export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'
export const MNEMONIC_LENGTH_MIN = 12
export const MNEMONIC_LENGTH_MAX = 24
export const ETHEREUM_DERIVATION_PATH = "m/44'/60'/0'/0"
export const CELO_DERIVATION_PATH = "m/44'/52752'/0'/0"
export const DERIVATION_PATH_MAX_INDEX = 1000000
export const PLACEHOLDER_MNEMONIC =
  'wage bitter silk coin door shine orphan quote witness ticket venture undo grief sense write limit famous always wage pink fresh gold carpet adult'
export const CELO_LEDGER_APP_MIN_VERSION = '1.0.3' // Only allow this ledger app versions or newer

export const AVG_BLOCK_TIMES = 5000 // 5 seconds
export const CONNECTION_CHECK_INTERVAL = 15000 // 15 seconds
export const STALE_BLOCK_TIME = 20000 // 20 seconds
export const STATUS_POLLER_DELAY = 10000 // 10 seconds
export const MAX_TOKEN_PRICE_NUM_DAYS = 14 // 14 days

export const WEI_PER_UNIT = '1000000000000000000' // 1 Celo or Ether
export const MIN_DISPLAY_VALUE = 0.001 // Round token values less than this
export const DECIMALS_TO_DISPLAY = 3 // Show at most this many decimals
export const STANDARD_TOKEN_DECIMALS = 18 // Same as Ether and most ERC20s

export const MAX_SEND_TOKEN_SIZE = '100000000000000000000' // 100 Tokens
export const MAX_EXCHANGE_TOKEN_SIZE = '100000000000000000000' // 100 Tokens
export const MAX_SEND_TOKEN_SIZE_LEDGER = '2000000000000000000000' // 2000 Tokens
export const MAX_EXCHANGE_TOKEN_SIZE_LEDGER = '2000000000000000000000' // 2000 Tokens
export const HIGH_VALUE_THRESHOLD = '25000000000000000000' // 25 cusd - threshold balance for a "high-value" wallet
export const MAX_COMMENT_CHAR_LENGTH = 70 // Chosen to match max length in Valora
export const MAX_ACCOUNT_NAME_LENGTH = 50

export const MAX_FEE_SIZE = '1000000000000000000' // 1 Token
export const MAX_GAS_PRICE = '500000000000' // 500 Gwei
export const MAX_GAS_LIMIT = '10000000' // 10 million
export const MIN_GAS_AMOUNT = '20000'

export const MIN_EXCHANGE_RATE = 0.01 // 1<->100 ratio
export const MAX_EXCHANGE_RATE = 100 // 1<->100 ratio
export const MAX_EXCHANGE_LOSS = 0.015 // 1.5%
export const MAX_EXCHANGE_SPREAD = 0.1 // 10%

export const MIN_LOCK_AMOUNT = '10000000000000000' // 0.01 CELO
export const MIN_LOCKED_GOLD_TO_VOTE = '100000000000000000' // 0.1 Celo
export const MIN_VOTE_AMOUNT = '10000000000000000' // 0.01 CELO
export const MAX_NUM_ELECTABLE_VALIDATORS = 100
export const BARCHART_MIN_SHOW_AMOUNT = '1000000000000000' // 0.001 CELO

export const ACCOUNT_UNLOCK_TIMEOUT = 600000 // 10 minutes
export const BALANCE_STALE_TIME = 15000 // 15 seconds
export const GAS_PRICE_STALE_TIME = 10000 // 10 seconds
export const EXCHANGE_RATE_STALE_TIME = 10000 // 10 seconds
export const ACCOUNT_STATUS_STALE_TIME = 43200000 // 12 hours
export const VALIDATOR_LIST_STALE_TIME = 43200000 // 12 hours
export const VALIDATOR_VOTES_STALE_TIME = 300000 // 5 minutes
export const VALIDATOR_ACTIVATABLE_STALE_TIME = 43200000 // 12 hours
export const STAKE_EVENTS_STALE_TIME = 10000 // 10 seconds
export const PROPOSAL_LIST_STALE_TIME = 60000 // 1 minutes
export const TOKEN_PRICE_STALE_TIME = 900000 // 15 minutes
export const NFT_SEARCH_STALE_TIME = 60000 // 60 seconds

export const GOVERNANCE_GITHUB_BASEURL =
  'https://api.github.com/repos/celo-org/governance/contents/CGPs/'
export const ALCHEMY_UNSTOPPABLE_BASEURL = 'https://unstoppabledomains.g.alchemy.com/domains/'

export const DONATION_ADDRESS = '0xE3791A4a231D026c9567BEDbAb977617f2900383' // for receiving donations
export const RAMP_PROJECT_ID = 'jg2gy6y7o35np2w7npw9jnszaz962z3dxhpso4hq'
