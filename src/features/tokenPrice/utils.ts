import { TokenPriceHistory } from 'src/features/tokenPrice/types'
import { ChartData, DataValue, dateToChartLabel, prepareChartData } from 'src/utils/charts'
import { areDatesSameDay } from 'src/utils/time'

export function tokenPriceHistoryToChartData(
  prices: TokenPriceHistory | undefined,
  numDays = 7
): ChartData {
  const dataValues: DataValue[] = []

  const date = new Date()
  date.setDate(date.getDate() - numDays + 1)
  for (let i = 0; i < numDays; i++) {
    const label = dateToChartLabel(date)
    const value = findPriceForDay(prices, date)
    dataValues.push({ label, values: [value] })
    date.setDate(date.getDate() + 1)
  }

  return prepareChartData(dataValues)
}

export function findPriceForDay(prices: TokenPriceHistory | undefined, date: Date) {
  if (!prices) return null
  for (const p of prices) {
    if (areDatesSameDay(date, new Date(p.timestamp))) {
      return p.price
    }
  }
  return null
}
