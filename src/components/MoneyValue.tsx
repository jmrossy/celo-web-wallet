import { BigNumberish, FixedNumber, utils } from 'ethers'
import { Currency } from 'src/consts'
import { Color } from 'src/styles/Color'
import { Styles } from 'src/styles/types'

interface MoneyValueProps {
  amountInWei: BigNumberish
  currency: Currency
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
    currency,
    baseFontSize,
    margin,
    hideSymbol,
    sign,
    symbolCss,
    amountCss,
    containerCss,
    fontWeight,
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
  const fontStyles = getFonts(baseFontSize, fontWeight)

  return (
    <span css={{ margin: margin, ...containerCss }}>
      {!!sign && !amount.isZero() && <span css={fontStyles.amount}>{sign}</span>}
      {!hideSymbol && <span css={{ ...fontStyles.symbol, color, ...symbolCss }}>{symbol}</span>}
      <span css={{ ...fontStyles.amount, ...amountCss }}>{' ' + formattedAmount}</span>
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

const getFonts = (baseSize?: number, weight?: number) => {
  return {
    symbol: {
      fontSize: baseSize ? `${baseSize * 0.8}em` : '0.8em',
      fontWeight: weight ?? 400,
    },
    amount: {
      fontSize: baseSize ? `${baseSize}em` : '1em',
      fontWeight: weight ?? 400,
    },
  }
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
