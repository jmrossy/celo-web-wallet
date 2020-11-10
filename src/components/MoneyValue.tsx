import { CSSObject } from '@emotion/core'
import { BigNumberish, FixedNumber, utils } from 'ethers'
import { Currency } from 'src/consts'
import { Color } from 'src/styles/Color'

interface MoneyValueProps {
  amountInWei: BigNumberish
  currency: Currency
  baseFontSize?: number // in em units
  margin?: string | number
  hideSymbol?: boolean
  sign?: string // e.g. plus or minus symbol
  symbolCss?: CSSObject
  amountCss?: CSSObject
}

export function MoneyValue(props: MoneyValueProps) {
  const {
    amountInWei,
    currency,
    baseFontSize,
    margin,
    hideSymbol,
    sign,
    symbolCss,
    amountCss,
  } = props
  const { symbol, decimals, color } = getCurrencyProps(currency)
  const formattedAmount = FixedNumber.from(utils.formatEther(amountInWei))
    .round(decimals)
    .toString()

  const symbolFontSize = baseFontSize ? `${baseFontSize * 0.8}em` : '0.8em'
  const amountFontSize = baseFontSize ? `${baseFontSize}em` : '1em'

  return (
    <span css={{ margin: margin }}>
      {!!sign && <span css={{ fontSize: amountFontSize }}>{sign}</span>}
      {!hideSymbol && <span css={{ fontSize: symbolFontSize, color, ...symbolCss }}>{symbol}</span>}
      <span css={{ fontSize: amountFontSize, ...amountCss }}>{' ' + formattedAmount}</span>
    </span>
  )
}

export function getCurrencyProps(currency: Currency) {
  if (currency === Currency.cUSD) {
    return { symbol: 'cUSD', decimals: 2, color: Color.primaryGreen }
  }
  if (currency === Currency.CELO) {
    return { symbol: 'CELO', decimals: 3, color: Color.primaryGold }
  }
  throw new Error(`Unsupported currency ${currency}`)
}
