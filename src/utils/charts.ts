export interface DataValue {
  label: string
  values: number[]
}

export interface ChartData {
  labels: string[]
  datasets: { values: number[] }[]
}

export function prepareChartData(data: DataValue[]): ChartData {
  if (!data || data.length === 0) throw Error('data is required')

  //Initialize the data structure
  const initial: ChartData = { labels: [], datasets: [] }

  const results = data.reduce((result: ChartData, item: DataValue) => {
    result.labels.push(item.label)

    item.values.forEach((value, index) => {
      if (result.datasets.length <= index) {
        result.datasets.push({ values: [value] })
      } else {
        result.datasets[index].values.push(value)
      }
    })
    return result
  }, initial)

  return results
}
