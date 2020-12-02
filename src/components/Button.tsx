import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Styles } from 'src/styles/types'

interface ButtonProps {
  size?: 's' | 'm' | 'l' | 'icon' // defaults to 'm'
  type?: 'submit' | 'reset' | 'button'
  color?: Color // defaults to primaryGreen
  margin?: string | number
  onClick?: () => void
  icon?: string
  iconPosition?: 'start' | 'end' //defaults to start //TODO: add top / bottom if necessary
  disabled?: boolean
  styles?: Styles
  width?: number | string
}

export function Button(props: React.PropsWithChildren<ButtonProps>) {
  const {
    size,
    width: widthOverride,
    type,
    color,
    margin,
    onClick,
    icon,
    iconPosition,
    disabled,
    styles,
  } = props
  const { height, width } = getDimensions(size, widthOverride)
  const icoLayout = getLayout(size)

  return (
    <button
      css={{
        ...defaultButtonStyles,
        ...icoLayout,
        margin,
        height,
        width,
        fontSize: size === 'l' ? '1.1em' : undefined,
        backgroundColor: color || Color.primaryGreen,
        ...styles,
      }}
      onClick={onClick}
      type={type}
      disabled={disabled ?? false}
    >
      {icon ? (
        <Box align="center" justify="center">
          {(!iconPosition || iconPosition === 'start') && (
            <img src={icon} css={props.children ? { marginRight: 8 } : undefined} />
          )}
          {props.children}
          {iconPosition === 'end' && (
            <img src={icon} css={props.children ? { marginLeft: 8 } : undefined} />
          )}
        </Box>
      ) : (
        <>{props.children}</>
      )}
    </button>
  )
}

function getDimensions(size?: string, width?: number | string) {
  switch (size) {
    case 's':
      return { height: '2.25em', width: width ?? '9em' }
    case 'm':
    case 'l':
    case undefined:
      return { height: '3.25em', width: width ?? '12.5em' }
    case 'icon':
      return { height: 27, width: 27 }
    default:
      throw new Error(`Unsupported size: ${size}`)
  }
}

function getLayout(size?: string) {
  return size === 'icon'
    ? { display: 'flex', alignItems: 'center', justifyContent: 'center' }
    : null
}

export const defaultButtonStyles: Styles = {
  borderRadius: 3,
  color: Color.primaryWhite,
  border: 'none',
  outline: 'none',
  cursor: 'pointer',
  backgroundColor: Color.primaryGreen,
  fontWeight: 500,
  ':hover': {
    backgroundColor: '#4cdd91',
  },
  ':active': {
    backgroundColor: '#0fb972',
  },
  ':disabled': {
    color: Color.primaryGrey,
    backgroundColor: Color.borderInactive,
  },
}
