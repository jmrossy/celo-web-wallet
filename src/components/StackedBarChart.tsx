import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'

interface DataElement {
  label: string
  value: number
  color: string
}

interface Props {
  width: string | number
  data: Array<DataElement>
  total: DataElement
  showTotal: boolean
  showLabels: boolean
  showRemaining: boolean
  remainingLabel?: string
}

export function StackedBarChart(props: Props) {
  const { width, data, total, showTotal, showLabels, showRemaining, remainingLabel } = props

  const remainingValue = total.value - data.reduce((sum, d) => (sum += d.value), 0)

  return (
    <div>
      <Box direction="row" align="center" styles={{ ...style.container, width }}>
        {data.map((d, i) => {
          const width = Math.floor((d.value / total.value) * 100) + '%'
          return (
            <div
              key={`stacked-bar-area-${i}`}
              css={{ ...style.element, width, background: d.color }}
            ></div>
          )
        })}
      </Box>
      {showLabels && (
        <>
          {data.map((d, i) => (
            <Box
              key={`stacked-bar-label-${i}`}
              direction="row"
              align="center"
              justify="between"
              margin="0.7em 0 0 0"
            >
              <div css={{ color: d.color }}>{d.label}</div>
              <div css={{ color: d.color }}>{d.value}</div>
            </Box>
          ))}
        </>
      )}
      {showRemaining && remainingLabel && (
        <Box direction="row" align="center" justify="between" margin="0.7em 0 0 0">
          <div css={style.remainingLabel}>{remainingLabel}</div>
          <div css={style.remainingLabel}>{remainingValue}</div>
        </Box>
      )}
      {showTotal && (
        <Box direction="row" align="center" justify="between" margin="0.7em 0 0 0">
          <div css={{ color: total.color, fontWeight: 500 }}>{total.label}</div>
          <div css={{ color: total.color, fontWeight: 500 }}>{total.value}</div>
        </Box>
      )}
    </div>
  )
}

const style: Stylesheet = {
  container: {
    borderRadius: 2,
    background: Color.altGrey,
  },
  element: {
    height: 14,
  },
  remainingLabel: {
    color: '#969DA5',
  },
}
