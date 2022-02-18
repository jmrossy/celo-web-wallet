import { memo } from 'react'
import CeloIcon from 'src/components/icons/tokens/CELO.svg'
import cEURIcon from 'src/components/icons/tokens/cEUR.svg'
import cREALIcon from 'src/components/icons/tokens/cREAL.svg'
import cUSDIcon from 'src/components/icons/tokens/cUSD.svg'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { CELO, cEUR, cREAL, cUSD, Token } from 'src/tokens'

interface Props {
  token: Token
  size: 's' | 'm' | 'l'
}

function _TokenIcon({ token, size }: Props) {
  let icon
  if (token.address === CELO.address) icon = CeloIcon
  else if (token.address === cUSD.address) icon = cUSDIcon
  else if (token.address === cEUR.address) icon = cEURIcon
  else if (token.address === cREAL.address) icon = cREALIcon

  const { fallbackImgSize, actualSize, fontSize } = sizeValues[size]

  return icon ? (
    <img
      width={fallbackImgSize}
      height={fallbackImgSize}
      src={icon}
      css={{ height: actualSize, width: actualSize }}
      alt={token.symbol}
      title={token.symbol}
    />
  ) : (
    <Box
      align="center"
      justify="center"
      styles={{
        height: actualSize,
        width: actualSize,
        borderRadius: '50%',
        backgroundColor: token.color || Color.primaryGrey,
      }}
    >
      <div
        css={{
          ...Font.bold,
          fontSize,
          color: '#FFFFFF',
          paddingLeft: size === 'l' ? 1 : 0,
        }}
      >
        {token.symbol[0].toUpperCase()}
      </div>
    </Box>
  )
}

const sizeValues = {
  s: {
    fallbackImgSize: '22px',
    actualSize: '1.4em',
    fontSize: '0.9em',
  },
  m: {
    fallbackImgSize: '24px',
    actualSize: '1.5em',
    fontSize: '0.95em',
  },
  l: {
    fallbackImgSize: '26px',
    actualSize: '1.7em',
    fontSize: '1em',
  },
}

export const TokenIcon = memo(_TokenIcon)
