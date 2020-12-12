import { Font } from 'src/styles/fonts'
import { Styles } from 'src/styles/types'

interface ButtonProps {
  onClick: () => void
  styles?: Styles
}

export function TextButton(props: React.PropsWithChildren<ButtonProps>) {
  const { onClick, styles } = props

  return (
    <button css={[defaultStyle, styles]} onClick={onClick}>
      {props.children}
    </button>
  )
}

const defaultStyle: Styles = {
  ...Font.linkLight,
  textRendering: 'geometricprecision',
  border: 'none',
  outline: 'none',
  cursor: 'pointer',
  padding: 0,
  background: 'none',
}
