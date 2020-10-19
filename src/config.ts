export enum CeloContract {
  Accounts,
  Attestations,
  Escrow,
  Exchange,
  GasPriceMinimum,
  GoldToken,
  LockedGold,
  Reserve,
  StableToken,
}

interface Config {
  debug: boolean
  fornoUrl: string
  blockscoutUrl: string
  chainId: number
  contractAddresses: Record<CeloContract, string>
  defaultAccount?: string // strictly for dev use, provide a backup phrase
}

// TODO find a nice way to switch btwn configs at build/run time
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const configMainnet: Config = {
  debug: false,
  fornoUrl: 'https://rc1-forno.celo-testnet.org',
  blockscoutUrl: 'https://explorer.celo.org/api',
  chainId: 42220,
  contractAddresses: {
    [CeloContract.Accounts]: '0x7d21685C17607338b313a7174bAb6620baD0aaB7',
    [CeloContract.Attestations]: '0xdC553892cdeeeD9f575aa0FBA099e5847fd88D20',
    [CeloContract.Escrow]: '0xf4Fa51472Ca8d72AF678975D9F8795A504E7ada5',
    [CeloContract.Exchange]: '0x67316300f17f063085Ca8bCa4bd3f7a5a3C66275',
    [CeloContract.GasPriceMinimum]: '0xDfca3a8d7699D8bAfe656823AD60C17cb8270ECC',
    [CeloContract.GoldToken]: '0x471EcE3750Da237f93B8E339c536989b8978a438',
    [CeloContract.LockedGold]: '0x6cC083Aed9e3ebe302A6336dBC7c921C9f03349E',
    [CeloContract.Reserve]: '0x9380fA34Fd9e4Fd14c06305fd7B6199089eD4eb9',
    [CeloContract.StableToken]: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
  },
}

const configAlfajores: Config = {
  debug: true,
  fornoUrl: 'https://alfajores-forno.celo-testnet.org',
  blockscoutUrl: 'https://alfajores-blockscout.celo-testnet.org/api',
  chainId: 44787,
  contractAddresses: {
    [CeloContract.Accounts]: '0xed7f51A34B4e71fbE69B3091FcF879cD14bD73A9',
    [CeloContract.Attestations]: '0xAD5E5722427d79DFf28a4Ab30249729d1F8B4cc0',
    [CeloContract.Escrow]: '0xb07E10c5837c282209c6B9B3DE0eDBeF16319a37',
    [CeloContract.Exchange]: '0x17bc3304F94c85618c46d0888aA937148007bD3C',
    [CeloContract.GasPriceMinimum]: '0xd0Bf87a5936ee17014a057143a494Dc5C5d51E5e',
    [CeloContract.GoldToken]: '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9',
    [CeloContract.LockedGold]: '0x6a4CC5693DC5BFA3799C699F3B941bA2Cb00c341',
    [CeloContract.Reserve]: '0xa7ed835288Aa4524bB6C73DD23c0bF4315D9Fe3e',
    [CeloContract.StableToken]: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
  },
  defaultAccount:
    'dirt detail century filter bid truly jazz benefit alpha palm vote segment loan three coil art task battle pen tornado fever hover buyer lyrics',
}

export const config = Object.freeze(configAlfajores)
