import { config } from 'src/config'
import { Color } from 'src/styles/Color'
import { Token } from 'src/tokens'

/**
 * For now, lists of known supported ERC-20 comaptible tokens
 * are listed here. This will be moved to a separate repo eventually.
 */
const KNOWN_ERC20_TOKENS: Token[] = [
  {
    id: 'mCUSD',
    symbol: 'mCUSD',
    name: 'Moola cUSD',
    color: Color.accentBlue,
    minValue: 0.01,
    displayDecimals: 2,
    address: '0x64dEFa3544c695db8c535D289d843a189aa26b98',
    decimals: 18,
    chainId: 42220,
  },
  {
    id: 'mCELO',
    symbol: 'mCELO',
    name: 'Moola CELO',
    color: Color.accentBlue,
    minValue: 0.001,
    displayDecimals: 3,
    address: '0x7037F7296B2fc7908de7b57a89efaa8319f0C500',
    decimals: 18,
    chainId: 42220,
  },
]

export function getKnownErc20Tokens() {
  return KNOWN_ERC20_TOKENS.filter((t) => t.chainId === config.chainId)
}
