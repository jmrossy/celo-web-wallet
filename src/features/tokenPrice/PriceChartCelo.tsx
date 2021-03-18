import { css } from '@emotion/react'
import { useEffect } from 'react'
import ReactFrappeChart from 'react-frappe-charts'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { Box } from 'src/components/layout/Box'
import { WEI_PER_UNIT } from 'src/consts'
import { getSimpleExchangeRate } from 'src/features/exchange/utils'
import { fetchTokenPriceActions } from 'src/features/tokenPrice/fetchPrices'
import { QuoteCurrency } from 'src/features/tokenPrice/types'
import { findPriceForDay, tokenPriceHistoryToChartData } from 'src/features/tokenPrice/utils'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Styles, Stylesheet } from 'src/styles/types'
import { NativeTokenId } from 'src/tokens'

interface PriceChartProps {
  showHeaderPrice: boolean
  containerCss?: Styles
  height?: number | string
}

export function PriceChartCelo({ showHeaderPrice, containerCss, height }: PriceChartProps) {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(
      fetchTokenPriceActions.trigger({
        baseCurrency: NativeTokenId.CELO,
        quoteCurrency: QuoteCurrency.USD,
      })
    )
  }, [])

  const allPrices = useSelector((s: RootState) => s.tokenPrice.prices)
  const celoPrices = allPrices[NativeTokenId.CELO]
  const celoUsdPrices = celoPrices ? celoPrices[QuoteCurrency.USD] : undefined
  const chartData = tokenPriceHistoryToChartData(celoUsdPrices)
  const todayPrice = findPriceForDay(celoUsdPrices, new Date())

  const toCeloRates = useSelector((s: RootState) => s.exchange.toCeloRates)
  const cUsdToCelo = toCeloRates[NativeTokenId.cUSD]
  let celoToCusdSimpleRate: number | null = null
  if (cUsdToCelo) {
    const simleRate = getSimpleExchangeRate(
      WEI_PER_UNIT,
      cUsdToCelo.stableBucket,
      cUsdToCelo.celoBucket,
      cUsdToCelo.spread,
      true
    )
    celoToCusdSimpleRate = simleRate.exchangeRateNum
  }
  const headerRate = celoToCusdSimpleRate ?? todayPrice
  const chartHeight = height || 250

  return (
    <Box direction="column" styles={containerCss}>
      {showHeaderPrice && (
        <Box direction="row" align="end">
          <label css={style.currencyLabel}>CELO</label>
          {headerRate ? (
            <label css={style.text}>{`$${headerRate.toFixed(2)} (USD)`}</label>
          ) : (
            <label css={style.text}>{`Unknown`}</label>
          )}
        </Box>
      )}
      <div css={chartContainer}>
        <ReactFrappeChart
          type="line"
          colors={chartConfig.colors}
          height={chartHeight}
          axisOptions={chartConfig.axis}
          tooltipOptions={chartConfig.tooltipOptions}
          data={chartData}
        />
      </div>
    </Box>
  )
}

const chartConfig = {
  colors: [Color.primaryGold],
  axis: { xAxisMode: 'tick' },
  tooltipOptions: { formatTooltipY: (d: number | null) => (d ? `$${d.toFixed(2)}` : null) },
}

const chartContainer = css({
  marginLeft: '-2em',
  '*': {
    transition: 'initial',
  },
})

const style: Stylesheet = {
  currencyLabel: {
    ...Font.label,
    color: Color.primaryGold,
    marginRight: '0.5em',
  },
}
