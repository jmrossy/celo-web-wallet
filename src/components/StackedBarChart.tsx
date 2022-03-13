import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'

interface DataElement {
  label: string
  value: number
  color: string
  labelColor?: string
}

interface Props {
  width: string | number
  data: Array<DataElement>
  total: Omit<DataElement, 'color'>
  showTotal: boolean
  showLabels: boolean
}

export function StackedBarChart(props: Props) {
  const { width, data, total, showTotal, showLabels } = props

  return (
    <div>
      <Box direction="row" align="center" styles={{ ...style.container, width }}>
        {data.map((d, i) => {
          const barWidth = Math.round((d.value / total.value) * 100) + '%'
          return (
            <div
              key={`stacked-bar-area-${i}`}
              css={{ ...style.element, width: barWidth, background: d.color }}
            ></div>
          )
        })}
      </Box>
      {showLabels && (
        <>
          {data.map((d, i) => {
            const labelStyle = getLabelStyle(d.labelColor || d.color)
            return (
              <Box
                key={`stacked-bar-label-${i}`}
                direction="row"
                align="center"
                justify="between"
                margin="0.8em 0.1em 0 0"
              >
                <div css={labelStyle}>{d.label}</div>
                <div css={labelStyle}>{d.value}</div>
              </Box>
            )
          })}
        </>
      )}
      {showTotal && (
        <Box direction="row" align="center" justify="between" margin="0.8em 0 0 0">
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
    fontWeight: 500,
  },
}
