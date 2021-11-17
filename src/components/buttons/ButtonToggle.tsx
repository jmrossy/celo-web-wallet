import { useState } from 'react'
import { transparentButtonStyles } from './Button'
import { Box } from '../layout/Box'
import { Color } from '../../styles/Color'
import { Styles, Stylesheet } from '../../styles/types'

interface Props {
  label1: string
  label2: string
  onToggle: (index: number) => void
}

export function ButtonToggle(props: Props) {
  const { label1, label2, onToggle } = props
  const [selected, setSelected] = useState(0)

  const onClick = (index: number) => {
    return () => {
      setSelected(index)
      onToggle(index)
    }
  }

  return (
    <Box direction="row" align="center" styles={style.container}>
      <button
        type="button"
        css={selected === 0 ? style.buttonSelected : style.buttonUnselected}
        onClick={onClick(0)}
      >
        {label1}
      </button>
      <button
        type="button"
        css={selected === 1 ? style.buttonSelected : style.buttonUnselected}
        onClick={onClick(1)}
      >
        {label2}
      </button>
    </Box>
  )
}

const sharedButtonStyles: Styles = {
  borderRadius: 0,
  width: '6.5em',
  padding: '0.35em 1em',
  border: `2px solid ${Color.primaryGreen}`,
}

const style: Stylesheet = {
  container: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  buttonSelected: {
    ...transparentButtonStyles,
    ...sharedButtonStyles,
    color: Color.primaryWhite,
    backgroundColor: Color.primaryGreen,
    cursor: 'default',
  },
  buttonUnselected: {
    ...transparentButtonStyles,
    ...sharedButtonStyles,
    borderRadius: 0,
    backgroundColor: Color.primaryWhite,
    color: Color.primaryGreen,
    ':hover': {
      backgroundColor: '#edfcf5',
    },
  },
}
