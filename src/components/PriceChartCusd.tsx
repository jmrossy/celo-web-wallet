import ReactFrappeChart from 'react-frappe-charts'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Styles, Stylesheet } from 'src/styles/types'
import { DataValue, prepareChartData } from 'src/utils/charts'

const data: DataValue[] = [
  { label: 'Nov 7', values: [1.1] },
  { label: 'Nov 8', values: [1.02] },
  { label: 'Nov 9', values: [0.87] },
  { label: 'Nov 10', values: [0.97] },
  { label: 'Nov 11', values: [1.04] },
  { label: 'Nov 12', values: [1.03] },
  { label: 'Nov 13', values: [0.99] },
]

interface PriceChartProps {
  containerCss?: Styles
}

export function PriceChartCusd({ containerCss }: PriceChartProps) {
  //TODO: Get the real exchange rate, and real prices
  const usdPrice = 0.99
  const dummyData = prepareChartData(data)

  return (
    <Box direction="column" styles={containerCss}>
      <Box direction="row" align="end">
        <label css={style.currencyLabel}>cUSD</label>
        <label css={style.text}>{`$${usdPrice.toFixed(2)} (USD)`}</label>
      </Box>
      <div css={style.chartContainer}>
        <ReactFrappeChart
          type="line"
          colors={[Color.primaryGreen]}
          height={250}
          axisOptions={{ xAxisMode: 'tick' }}
          tooltipOptions={{ formatTooltipY: (d: number) => `$${d.toFixed(2)} (USD)` }}
          data={dummyData}
        />
      </div>
    </Box>
  )
}

const style: Stylesheet = {
  currencyLabel: {
    ...Font.label,
    color: Color.primaryGreen,
    marginRight: '0.5em',
  },
  chartContainer: {
    marginLeft: '-2em',
  },
}
