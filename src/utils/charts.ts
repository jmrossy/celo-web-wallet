export interface DataValue {
  label: string
  values: Array<number | null>
}

export interface ChartData {
  labels: string[]
  datasets: Array<{ name: string; values: Array<number | null> }>
}

export function prepareChartData(data: DataValue[]): ChartData {
  if (!data || data.length === 0) throw Error('Data is required for chart')

  const initial: ChartData = { labels: [], datasets: [] }

  const results = data.reduce((result: ChartData, item: DataValue) => {
    result.labels.push(item.label)

    item.values.forEach((value, index) => {
      if (result.datasets.length <= index) {
        result.datasets.push({ name: '', values: [value] })
      } else {
        result.datasets[index].values.push(value)
      }
    })
    return result
  }, initial)

  return results
}

export function dateToChartLabel(date: Date) {
  const day = date.getDate()
  switch (date.getMonth()) {
    case 0:
      return `Jan ${day}`
    case 1:
      return `Feb ${day}`
    case 2:
      return `Mar ${day}`
    case 3:
      return `Apr ${day}`
    case 4:
      return `May ${day}`
    case 5:
      return `Jun ${day}`
    case 6:
      return `Jul ${day}`
    case 7:
      return `Aug ${day}`
    case 8:
      return `Sep ${day}`
    case 9:
      return `Oct ${day}`
    case 10:
      return `Nov ${day}`
    case 11:
      return `Dec ${day}`
    default:
      throw new Error('Invalid date')
  }
}
