import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Styles, Stylesheet } from 'src/styles/types'

interface PriceChartProps {
  containerCss?: Styles
}

export function PriceChartCusd({ containerCss }: PriceChartProps) {
  //TODO: Get the real exchange rate
  const usdPrice = 0.99
  // const containerStyle = width ? { width: width } : {}

  return (
    <Box direction="column" styles={containerCss}>
      <Box direction="row" align="end">
        <label css={style.currencyLabel}>cUSD</label>
        <label css={style.text}>{`$${usdPrice.toFixed(2)} (USD)`}</label>
      </Box>
    </Box>
  )
}

const style: Stylesheet = {
  currencyLabel: {
    ...Font.label,
    color: Color.primaryGreen,
    marginRight: '0.5em',
  },
}
