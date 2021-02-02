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
  total: Omit<DataElement, 'color'>
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
              <div css={getLabelStyle(d.color)}>{d.label}</div>
              <div css={getLabelStyle(d.color)}>{d.value}</div>
            </Box>
          ))}
        </>
      )}
      {showRemaining && remainingLabel && (
        <Box direction="row" align="center" justify="between" margin="0.7em 0 0 0">
          <div css={getLabelStyle('#969DA5')}>{remainingLabel}</div>
          <div css={getLabelStyle('#969DA5')}>{remainingValue}</div>
        </Box>
      )}
      {showTotal && (
        <Box direction="row" align="center" justify="between" margin="0.7em 0 0 0">
          <div css={style.totalLabel}>{total.label}</div>
          <div css={style.totalLabel}>{total.value}</div>
        </Box>
      )}
    </div>
  )
}

function getLabelStyle(color: string) {
  return {
    color,
    fontSize: '1em',
    fontWeight: 500,
  }
}

const style: Stylesheet = {
  container: {
    borderRadius: 2,
    background: Color.altGrey,
  },
  element: {
    height: 14,
  },
  totalLabel: {
    color: Color.primaryBlack,
    fontSize: '1em',
    fontWeight: 600,
  },
}
