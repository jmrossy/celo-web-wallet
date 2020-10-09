export enum CeloContract {
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

// TODO find a nice way to switch btwn configs at build time
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const configMainnet: Config = {
  debug: false,
  fornoUrl: 'https://rc1-forno.celo-testnet.org',
  blockscoutUrl: 'https://explorer.celo.org/',
  chainId: 42220,
  contractAddresses: {
    [CeloContract.StableToken]: 'TODO',
  },
}

const configAlfajores: Config = {
  debug: true,
  fornoUrl: 'https://alfajores-forno.celo-testnet.org',
  blockscoutUrl: 'https://alfajores-blockscout.celo-testnet.org',
  chainId: 44787,
  contractAddresses: {
    [CeloContract.StableToken]: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
  },
  defaultAccount:
    'dirt detail century filter bid truly jazz benefit alpha palm vote segment loan three coil art task battle pen tornado fever hover buyer lyrics',
}

export const config = Object.freeze(configAlfajores)
