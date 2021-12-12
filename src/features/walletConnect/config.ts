import { config } from 'src/config'

export const APP_METADATA = {
  name: 'CeloWallet.app',
  description: `Celo Wallet for ${config.isElectron ? 'Desktop' : 'Web'}`,
  url: 'https://celowallet.app',
  icons: ['https://celowallet.app/static/icon.png'],
}

// alfajores, mainnet, baklava
export const SUPPORTED_CHAINS = [
  'celo:44787',
  'celo:42220',
  'celo:62320',
  'eip155:44787',
  'eip155:42220',
  'eip155:62320',
]

export const SESSION_INIT_TIMEOUT = 15000 // 15 seconds
export const SESSION_PROPOSAL_TIMEOUT = 180000 // 3 minutes
export const SESSION_REQUEST_TIMEOUT = 300000 // 5 minutes
export const DELAY_BEFORE_DISMISS = 2500 // 2.5 seconds
