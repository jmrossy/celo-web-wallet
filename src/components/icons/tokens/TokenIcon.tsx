import { memo } from 'react'
import CeloIcon from 'src/components/icons/tokens/CELO.svg'
import cEURIcon from 'src/components/icons/tokens/cEUR.svg'
import cUSDIcon from 'src/components/icons/tokens/cUSD.svg'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { CELO, cEUR, cUSD, Token } from 'src/tokens'

interface Props {
  token: Token
  size: number | string
}

function _TokenIcon({ token, size }: Props) {
  let icon
  if (token.id === CELO.id) icon = CeloIcon
  else if (token.id === cUSD.id) icon = cUSDIcon
  else if (token.id === cEUR.id) icon = cEURIcon

  return icon ? (
    <img
      width="16px"
      height="16px"
      src={icon}
      css={{ height: size, width: size }}
      alt={token.label}
      title={token.label}
    />
  ) : (
    <Box
      align="center"
      justify="center"
      styles={{
        ...Font.bold,
        height: size,
        width: size,
        borderRadius: '50%',
        backgroundColor: token.color || Color.primaryGrey,
        color: '#FFFFFF',
      }}
    >
      <div>{token.label[0]}</div>
    </Box>
  )
}

export const TokenIcon = memo(_TokenIcon)
