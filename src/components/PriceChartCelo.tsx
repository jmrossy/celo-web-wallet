import ReactFrappeChart from 'react-frappe-charts'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Styles, Stylesheet } from 'src/styles/types'
import { DataValue, prepareChartData } from 'src/utils/charts'

const data: DataValue[] = [
  { label: 'Nov 7', values: [1.1] },
  { label: 'Nov 8', values: [1.25] },
  { label: 'Nov 9', values: [0.75] },
  { label: 'Nov 10', values: [1.53] },
  { label: 'Nov 11', values: [0.93] },
  { label: 'Nov 12', values: [1.21] },
  { label: 'Nov 13', values: [1.6] },
]

interface PriceChartProps {
  containerCss?: Styles
}

export function PriceChartCelo({ containerCss }: PriceChartProps) {
  //TODO: Get the real exchange rate
  const celoPrice = 1.6
  const dummyData = prepareChartData(data)

  return (
    <Box direction="column" styles={containerCss}>
      <Box direction="row" align="end">
        <label css={style.currencyLabel}>CELO</label>
        <label css={style.text}>{`$${celoPrice.toFixed(2)} (USD)`}</label>
      </Box>
      <div css={style.chartContainer}>
        <ReactFrappeChart
          type="line"
          colors={[Color.primaryGold]}
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
    color: Color.primaryGold,
    marginRight: '0.5em',
  },
  chartContainer: {
    marginLeft: '-2em',
  },
}
