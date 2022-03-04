import { BigNumberish } from 'ethers'
import { TokenIcon } from 'src/components/icons/tokens/TokenIcon'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Styles } from 'src/styles/types'
import { Token } from 'src/tokens'
import { fromWeiRounded } from 'src/utils/amount'

interface MoneyValueProps {
  amountInWei: BigNumberish
  token: Token
  roundDownIfSmall?: boolean
  baseFontSize?: number // in em units
  margin?: string | number
  symbolType?: 'text' | 'icon' | 'none'
  sign?: string // e.g. plus or minus symbol
  symbolCss?: Styles
  amountCss?: Styles
  containerCss?: Styles
  fontWeight?: number
  iconSize?: 's' | 'm' | 'l'
}

export function MoneyValue(props: MoneyValueProps) {
  const {
    amountInWei,
    token,
    roundDownIfSmall,
    baseFontSize,
    margin,
    symbolType,
    sign,
    symbolCss,
    amountCss,
    containerCss,
    fontWeight,
    iconSize,
  } = props

  const { symbol: tokenSymbol, color, decimals } = token
  const fontStyles = getFonts(baseFontSize, fontWeight, symbolType, color)

  const formattedAmount = fromWeiRounded(amountInWei, decimals, roundDownIfSmall ?? false)
  const isZero = formattedAmount === '0'

  return (
    <Box
      direction="row"
      align={symbolType === 'icon' ? 'center' : 'end'}
      styles={containerCss}
      margin={margin}
    >
      {!!sign && !isZero && <span css={fontStyles.amount}>{sign}</span>}
      {(!symbolType || symbolType === 'text') && (
        <span css={{ ...fontStyles.symbol, ...symbolCss }}>{tokenSymbol}</span>
      )}
      {symbolType === 'icon' && <TokenIcon token={token} size={iconSize ?? 's'} />}
      <span css={{ ...fontStyles.amount, ...amountCss }}>{formattedAmount}</span>
    </Box>
  )
}

const getFonts = (baseSize?: number, weight?: number, symbol?: string, color?: string) => {
  return {
    symbol: {
      color: color ?? Color.accentBlue, // Default to blue unless token specifies a color
      fontSize: baseSize ? `${baseSize * 0.8}em` : '0.8em',
      fontWeight: weight ?? 500,
    },
    amount: {
      fontSize: baseSize ? `${baseSize}em` : '1em',
      fontWeight: weight ?? 400,
      paddingLeft: '0.3em',
      paddingBottom: symbol === 'icon' ? '0.1em' : undefined,
    },
  }
}
