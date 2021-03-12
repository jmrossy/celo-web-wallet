import { BigNumberish } from 'ethers'
import { Styles } from 'src/styles/types'
import { Token } from 'src/tokens'
import { fromWeiRounded } from 'src/utils/amount'

interface MoneyValueProps {
  amountInWei: BigNumberish
  token: Token
  roundDownIfSmall?: boolean
  baseFontSize?: number // in em units
  margin?: string | number
  hideSymbol?: boolean
  sign?: string // e.g. plus or minus symbol
  symbolCss?: Styles
  amountCss?: Styles
  containerCss?: Styles
  fontWeight?: number
}

export function MoneyValue(props: MoneyValueProps) {
  const {
    amountInWei,
    token,
    roundDownIfSmall,
    baseFontSize,
    margin,
    hideSymbol,
    sign,
    symbolCss,
    amountCss,
    containerCss,
    fontWeight,
  } = props

  const { label: symbol, color } = token
  const fontStyles = getFonts(baseFontSize, fontWeight)

  const formattedAmount = fromWeiRounded(amountInWei, token, roundDownIfSmall)
  const isZero = formattedAmount === '0'

  return (
    <span css={{ margin: margin, ...containerCss }}>
      {!!sign && !isZero && <span css={fontStyles.amount}>{sign}</span>}
      {!hideSymbol && <span css={{ ...fontStyles.symbol, color, ...symbolCss }}>{symbol}</span>}
      <span css={{ ...fontStyles.amount, ...amountCss }}>{' ' + formattedAmount}</span>
    </span>
  )
}

const getFonts = (baseSize?: number, weight?: number) => {
  return {
    symbol: {
      fontSize: baseSize ? `${baseSize * 0.8}em` : '0.8em',
      fontWeight: weight ?? 500,
    },
    amount: {
      fontSize: baseSize ? `${baseSize}em` : '1em',
      fontWeight: weight ?? 400,
    },
  }
}
