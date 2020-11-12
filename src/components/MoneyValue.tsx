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
  const { symbol, decimals, color, minValue } = getCurrencyProps(currency)

  const amount = FixedNumber.from(utils.formatEther(amountInWei))
  let formattedAmount: string
  if (amount.isZero()) {
    formattedAmount = '0'
  } else if (amount.subUnsafe(minValue).isNegative()) {
    formattedAmount = minValue.toString()
  } else {
    formattedAmount = amount.round(decimals).toString()
  }

  const symbolFontSize = baseFontSize ? `${baseFontSize * 0.8}em` : '0.8em'
  const amountFontSize = baseFontSize ? `${baseFontSize}em` : '1em'

  return (
    <span css={{ margin: margin }}>
      {!!sign && !amount.isZero() && <span css={{ fontSize: amountFontSize }}>{sign}</span>}
      {!hideSymbol && <span css={{ fontSize: symbolFontSize, color, ...symbolCss }}>{symbol}</span>}
      <span css={{ fontSize: amountFontSize, ...amountCss }}>{' ' + formattedAmount}</span>
    </span>
  )
}

export function getCurrencyProps(currency: Currency) {
  if (currency === Currency.cUSD) {
    return cUsdProps
  }
  if (currency === Currency.CELO) {
    return celoProps
  }
  throw new Error(`Unsupported currency ${currency}`)
}

const cUsdProps = {
  symbol: 'cUSD',
  decimals: 2,
  minValue: FixedNumber.from('0.01'),
  color: Color.primaryGreen,
}

const celoProps = {
  symbol: 'CELO',
  decimals: 3,
  minValue: FixedNumber.from('0.001'),
  color: Color.primaryGold,
}
