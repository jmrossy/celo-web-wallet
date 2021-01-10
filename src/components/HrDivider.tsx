import { Styles } from 'src/styles/types'

interface Props {
  styles?: Styles
}

export function HrDivider(props: Props) {
  return <hr css={[defaultStyle, props.styles]} />
}

const defaultStyle: Styles = {
  width: '100%',
  height: 1,
  margin: 0,
  border: 'none',
  backgroundColor: '#D1D5D8',
  color: '#D1D5D8', //for IE
}
