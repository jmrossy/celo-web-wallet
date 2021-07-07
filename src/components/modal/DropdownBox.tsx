import { PropsWithChildren, useState } from 'react'
import { Backdrop, backdropZIndex } from 'src/components/modal/Backdrop'
import { Color } from 'src/styles/Color'
import { Styles } from 'src/styles/types'

export function useDropdownBox() {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false)
  const showDropdown = () => {
    setIsDropdownVisible(true)
  }
  const hideDropdown = () => {
    setIsDropdownVisible(false)
  }
  return { isDropdownVisible, showDropdown, hideDropdown }
}

interface Props {
  hide: () => void
  styles?: Styles
}

export function DropdownBox(props: PropsWithChildren<Props>) {
  return (
    <>
      <div css={[defaultStyle, props.styles]}>{props.children}</div>
      <Backdrop opacity={0.01} color={Color.primaryWhite} onClick={props.hide} />
    </>
  )
}

const defaultStyle: Styles = {
  position: 'absolute',
  top: '5em',
  borderRadius: 6,
  zIndex: backdropZIndex + 1,
  background: Color.primaryWhite,
  border: `1px solid ${Color.fillLight}`,
  boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.08)',
}
