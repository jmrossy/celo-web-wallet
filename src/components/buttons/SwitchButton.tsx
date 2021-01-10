import { useState } from 'react'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Styles } from 'src/styles/types'

interface Props {
  onToggle: (checked: boolean) => void
  showStatus?: boolean
  initialStatus?: boolean
}

export function SwitchButton(props: Props) {
  const { onToggle, initialStatus, showStatus } = props

  const [checked, setChecked] = useState(initialStatus ?? false)

  const handleToggle = () => {
    const updatedChecked = !checked
    setChecked(updatedChecked)
    onToggle(updatedChecked)
  }

  const labelStyle = checked ? labelChecked : label
  const statusText = checked ? 'Enabled' : 'Disabled'

  return (
    <Box direction="column" align="center">
      <input id="cb1" type="checkbox" css={input} checked={checked} onChange={handleToggle} />
      <label htmlFor="cb1" css={labelStyle}></label>
      {showStatus && <div css={text}>{statusText}</div>}
    </Box>
  )
}

const input: Styles = {
  display: 'none',
}

const labelAfter: Styles = {
  display: 'block',
  position: 'relative',
  content: '""',
  width: '46%',
  height: '100%',
  borderRadius: '50%',
  background: '#ffffff',
  transition: 'all 0.2s ease',
}

const label: Styles = {
  outline: 0,
  display: 'block',
  boxSizing: 'border-box',
  width: '4em',
  height: '2em',
  position: 'relative',
  cursor: 'pointer',
  userSelect: 'none',
  background: Color.altGrey,
  borderRadius: '2em',
  padding: '4px',
  transition: 'all 0.4s ease',
  ':after': {
    ...labelAfter,
    left: '0',
  },
  '::selection': {
    background: 'none',
  },
}

const labelChecked: Styles = {
  ...label,
  background: Color.primaryGreen,
  ':after': {
    ...labelAfter,
    left: '50%',
  },
}

const text: Styles = {
  marginTop: '0.5em',
  fontSize: '0.9em',
  fontWeight: 400,
  color: Color.textGrey,
}
