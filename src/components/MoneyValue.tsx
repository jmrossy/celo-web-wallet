import { BigNumberish, FixedNumber, utils } from 'ethers'
import { Currency } from 'src/consts'
import { Color } from 'src/styles/Color'

interface MoneyValueProps {
  amountInWei: BigNumberish
  currency: Currency
  baseFontSize?: number // in em units
  margin?: string | number
}

export function MoneyValue(props: MoneyValueProps) {
  const { symbol, decimals, color } = getCurrencyProps(props.currency)
  const formattedAmount = FixedNumber.from(utils.formatEther(props.amountInWei))
    .round(decimals)
    .toString()

  const symbolFontSize = props.baseFontSize ? `${props.baseFontSize * 0.8}em` : '0.8em'
  const amountFontSize = props.baseFontSize ? `${props.baseFontSize}em` : '1em'

  return (
    <span css={{ margin: props.margin }}>
      <span css={{ fontSize: symbolFontSize, color }}>{symbol}</span>
      <span css={{ fontSize: amountFontSize }}>{' ' + formattedAmount}</span>
    </span>
  )
}

function getCurrencyProps(currency: Currency) {
  if (currency === Currency.cUSD) {
    return { symbol: 'cUSD', decimals: 2, color: Color.primaryGreen }
  }
  if (currency === Currency.CELO) {
    return { symbol: 'CELO', decimals: 3, color: Color.primaryGold }
  }
  throw new Error(`Unsupported currency ${currency}`)
}
