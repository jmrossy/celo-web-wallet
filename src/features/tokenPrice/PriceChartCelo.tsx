import { css } from '@emotion/react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from 'src/app/rootReducer'
import { Box } from 'src/components/layout/Box'
import { ReactFrappeChart } from 'src/components/ReactFrappeChart'
import { WEI_PER_UNIT } from 'src/consts'
import { calcSimpleExchangeRate } from 'src/features/exchange/utils'
import { fetchTokenPriceActions } from 'src/features/tokenPrice/fetchPrices'
import { findPriceForDay, tokenPriceHistoryToChartData } from 'src/features/tokenPrice/utils'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Styles, Stylesheet } from 'src/styles/types'
import { NativeTokenId } from 'src/tokens'
import { logger } from 'src/utils/logger'
import { sleep } from 'src/utils/promises'

const DELAY_BEFORE_QUERYING = 2000

interface PriceChartProps {
  stableTokenId: NativeTokenId
  showHeaderPrice: boolean
  containerCss?: Styles
  height?: number
}

export function PriceChartCelo(props: PriceChartProps) {
  const { stableTokenId, showHeaderPrice, containerCss, height } = props

  const dispatch = useDispatch()
  useEffect(() => {
    // Hacking in a delay here b.c. blockscout is unreliable when two many
    // queries are submitted too fast
    sleep(DELAY_BEFORE_QUERYING)
      .then(() => {
        dispatch(
          fetchTokenPriceActions.trigger({
            baseCurrency: NativeTokenId.CELO,
          })
        )
      })
      .catch((e) => logger.error('Error dispatching fetchTokenPrice trigger', e))
  }, [])

  const toCeloRates = useSelector((s: RootState) => s.exchange.toCeloRates)
  const allPrices = useSelector((s: RootState) => s.tokenPrice.prices)
  const celoPrices = allPrices[NativeTokenId.CELO]
  const stableTokenPrices = celoPrices ? celoPrices[stableTokenId] : undefined
  const chartData = tokenPriceHistoryToChartData(stableTokenPrices)

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
    headerRate = celoToCUsdRate || findPriceForDay(stableTokenPrices, new Date())
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
            <label css={style.text}>Loading...</label>
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
