import { transparentButtonStyles } from 'src/components/buttons/Button'
import RefreshIcon from 'src/components/icons/refresh.svg'
import { Styles } from 'src/styles/types'

interface Props {
  width: string | number
  height: string | number
  onClick: () => void
  styles?: Styles
}

export function RefreshButton({ width, height, onClick, styles }: Props) {
  return (
    <button css={{ ...defaultStyle, ...styles }} onClick={onClick} type="button">
      <img src={RefreshIcon} width={width} height={height} alt="refresh" />
    </button>
  )
}

const defaultStyle: Styles = {
  ...transparentButtonStyles,
  ':hover': {
    filter: 'brightness(1.1)',
  },
}
