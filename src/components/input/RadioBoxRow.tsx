import { ChangeEvent } from 'react'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Styles, Stylesheet } from 'src/styles/types'

export interface RadioBoxRowProps {
  name: string
  value: string
  labels: Array<{ value: string; label: string }>
  startTabIndex?: number
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  containerStyles?: Styles
  margin?: string | number
}

export function RadioBoxRow(props: RadioBoxRowProps) {
  const { name, value, labels, onChange, startTabIndex, margin } = props

  const containerStyle = { ...style.container, ...props.containerStyles }

  return (
    <Box direction="row" align="center" justify="center" margin={margin}>
      {labels.map((l, i) => (
        <label css={containerStyle} tabIndex={(startTabIndex ?? 0) + i} key={`radio-box-row-${i}`}>
          <Box direction="row" align="center" justify="center">
            <input
              name={name}
              type="radio"
              value={l.value}
              css={style.input}
              checked={l.value === value}
              onChange={onChange}
            />
            <div css={l.value === value ? checkmarkChecked : style.checkmark}>
              <div css={style.dot}></div>
            </div>
            <div css={style.label}>{l.label}</div>
          </Box>
        </label>
      ))}
    </Box>
  )
}

const style: Stylesheet = {
  container: {
    padding: '0 1.2em',
    outline: 'none',
    border: 'none',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRight: `1px solid ${Color.borderInactive}`,
    ':last-child': {
      borderRight: 'none',
    },
    ':hover': {
      '& div': {
        borderColor: Color.primaryGreen,
      },
    },
  },
  input: {
    position: 'absolute',
    opacity: 0,
    cursor: 'pointer',
    outline: 'none',
  },
  checkmark: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: Color.primaryWhite,
    border: `2px solid ${Color.borderInactive}`,
    '& div': {
      opacity: 0,
    },
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: Color.primaryGreen,
  },
  label: {
    padding: '0.1em 0 0.1em 0.5em',
  },
}

const checkmarkChecked: Styles = {
  ...style.checkmark,
  borderColor: Color.primaryGreen,
  '& div': {
    opacity: 1,
  },
}
