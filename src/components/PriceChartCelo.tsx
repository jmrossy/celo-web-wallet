import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Styles, Stylesheet } from 'src/styles/types'

interface PriceChartProps {
  containerCss?: Styles
}

export function PriceChartCelo({ containerCss }: PriceChartProps) {
  //TODO: Get the real exchange rate
  const celoPrice = 1.6
  // const containerStyle = width ? { width: width } : {}

  return (
    <Box direction="column" styles={containerCss}>
      <Box direction="row" align="end">
        <label css={style.currencyLabel}>CELO</label>
        <label css={style.text}>{`$${celoPrice.toFixed(2)} (USD)`}</label>
      </Box>
    </Box>
  )
}

const style: Stylesheet = {
  currencyLabel: {
    ...Font.label,
    color: Color.primaryGold,
    marginRight: '0.5em',
  },
}
