interface Config {
  debug: boolean
  fornoUrl: string
  chainId: number
}

// TODO find a nice way to switch btwn configs at build time
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const configProd: Config = {
  debug: false,
  fornoUrl: 'https://rc1-forno.celo-testnet.org',
  chainId: 42220,
}

const configDev: Config = {
  debug: true,
  fornoUrl: 'https://alfajores-forno.celo-testnet.org',
  chainId: 44786,
}

export const config = Object.freeze(configDev)
