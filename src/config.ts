export const enum CeloContract {
  StableToken,
}

interface Config {
  debug: boolean
  fornoUrl: string
  chainId: number
  contractAddresses: Record<CeloContract, string>
}

// TODO find a nice way to switch btwn configs at build time
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const configMainnet: Config = {
  debug: false,
  fornoUrl: 'https://rc1-forno.celo-testnet.org',
  chainId: 42220,
  contractAddresses: {
    [CeloContract.StableToken]: 'TODO',
  },
}

const configAlfajores: Config = {
  debug: true,
  fornoUrl: 'https://alfajores-forno.celo-testnet.org',
  chainId: 44787,
  contractAddresses: {
    [CeloContract.StableToken]: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
  },
}

export const config = Object.freeze(configAlfajores)
