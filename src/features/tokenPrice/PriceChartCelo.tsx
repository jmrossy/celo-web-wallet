import { css } from '@emotion/react'
import { useEffect } from 'react'
import ReactFrappeChart from 'react-frappe-charts'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { Box } from 'src/components/layout/Box'
import { WEI_PER_UNIT } from 'src/consts'
import { calcSimpleExchangeRate } from 'src/features/exchange/utils'
import { fetchTokenPriceActions } from 'src/features/tokenPrice/fetchPrices'
import { findPriceForDay, tokenPriceHistoryToChartData } from 'src/features/tokenPrice/utils'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Styles, Stylesheet } from 'src/styles/types'
import { NativeTokenId } from 'src/tokens'

interface PriceChartProps {
  stableTokenId: NativeTokenId
  showHeaderPrice: boolean
  containerCss?: Styles
  height?: number | string
}

export function PriceChartCelo(props: PriceChartProps) {
  const { stableTokenId, showHeaderPrice, containerCss, height } = props

  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(
      fetchTokenPriceActions.trigger({
        baseCurrency: NativeTokenId.CELO,
        quoteCurrency: stableTokenId,
      })
    )
  }, [])

  const toCeloRates = useSelector((s: RootState) => s.exchange.toCeloRates)
  const allPrices = useSelector((s: RootState) => s.tokenPrice.prices)
  const celoPrices = allPrices[NativeTokenId.CELO]
  const celoUsdPrices = celoPrices ? celoPrices[stableTokenId] : undefined
  const chartData = tokenPriceHistoryToChartData(celoUsdPrices)

  let headerRate: number | null = null
  if (showHeaderPrice) {
    const cUsdToCelo = toCeloRates[NativeTokenId.cUSD]
    const celoToCUsdRate = cUsdToCelo
      ? calcSimpleExchangeRate(
          WEI_PER_UNIT,
          cUsdToCelo.stableBucket,
          cUsdToCelo.celoBucket,
          cUsdToCelo.spread,
          true
        ).exchangeRateNum
      : null
    headerRate = celoToCUsdRate || findPriceForDay(celoUsdPrices, new Date())
  }

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
