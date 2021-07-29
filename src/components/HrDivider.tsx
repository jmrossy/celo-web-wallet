import { Styles } from 'src/styles/types'

interface Props {
  margin?: number | string
  styles?: Styles
}

export function HrDivider(props: Props) {
  const { margin, styles } = props
  return <hr css={{ ...defaultStyle, margin, ...styles }} />
}

const defaultStyle: Styles = {
  width: '100%',
  height: 1,
  margin: 0,
  border: 'none',
  backgroundColor: '#D1D5D8',
  color: '#D1D5D8', //for IE
}
