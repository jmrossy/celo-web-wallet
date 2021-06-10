import { ChangeEvent, Fragment, ReactElement } from 'react'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Styles, Stylesheet } from 'src/styles/types'
import { chunk } from 'src/utils/string'

interface RadioBoxProps<L extends string | ReactElement> {
  name: string
  value: string
  labels: Array<{ value: string; label: L }>
  startTabIndex?: number
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  margin?: string | number
  containerStyles?: Styles
}

export function RadioBoxRow(props: RadioBoxProps<string>) {
  const { name, value, labels, onChange, startTabIndex, margin, containerStyles } = props

  return (
    <Box direction="row" align="center" justify="center" margin={margin} styles={containerStyles}>
      {labels.map((l, i) => (
        <Fragment key={`radio-box-row-${i}`}>
          <RadioBoxItem
            name={name}
            value={l.value}
            isChecked={l.value === value}
            label={l.label}
            tabIndex={(startTabIndex ?? 0) + i}
            onChange={onChange}
          />
        </Fragment>
      ))}
    </Box>
  )
}

// Displays radio options in rows of 2 options each
export function RadioBoxGrid(props: RadioBoxProps<ReactElement>) {
  const { name, value, labels, onChange, startTabIndex, margin, containerStyles } = props
  const labelPairs = chunk(labels, 2)
  return (
    <div css={{ margin, ...containerStyles }}>
      {labelPairs.map((l, i) => (
        <Box align="center" justify="center" margin="3em 0" key={`radio-box-grid-${i}`}>
          <RadioBoxItem
            name={name}
            value={l[0].value}
            isChecked={l[0].value === value}
            label={l[0].label}
            tabIndex={(startTabIndex ?? 0) + 2 * i}
            onChange={onChange}
          />
          <RadioBoxItem
            name={name}
            value={l[1].value}
            isChecked={l[1].value === value}
            label={l[1].label}
            tabIndex={(startTabIndex ?? 0) + 2 * i + 1}
            onChange={onChange}
          />
        </Box>
      ))}
    </div>
  )
}

interface RadioItemProps<L extends string | ReactElement> {
  name: string
  value: string
  isChecked: boolean
  label: L
  tabIndex?: number
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

function RadioBoxItem(props: RadioItemProps<string | ReactElement>) {
  const { name, value, label, onChange, isChecked, tabIndex } = props
  return (
    <label css={style.container} tabIndex={tabIndex}>
      <Box align="center" justify="center">
        <input
          name={name}
          type="radio"
          value={value}
          css={style.input}
          checked={isChecked}
          onChange={onChange}
        />
        <div css={isChecked ? checkmarkChecked : style.checkmark}>
          <div css={style.dot}></div>
        </div>
        <div css={typeof label === 'string' ? style.label : style.labelElement}>{label}</div>
      </Box>
    </label>
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
  labelElement: {
    padding: '0 0 0 1em',
  },
}

const checkmarkChecked: Styles = {
  ...style.checkmark,
  borderColor: Color.primaryGreen,
  '& div': {
    opacity: 1,
  },
}
