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
}

export function Button(props: React.PropsWithChildren<ButtonProps>) {
  const { size, type, color, margin, onClick, icon, iconPosition, disabled, styles } = props
  const { height, width } = getDimensions(size)
  const icoLayout = getLayout(size)

  return (
    <button
      css={{
        ...staticStyles,
        ...icoLayout,
        margin,
        height,
        width,
        fontSize: size === 'l' ? '1.1em' : undefined,
        backgroundColor: color || Color.primaryGreen,
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

function getDimensions(size?: string) {
  switch (size) {
    case 's':
      return { height: '2.25em', width: '9em' }
    case 'm':
    case 'l':
    case undefined:
      return { height: '3.25em', width: '12.5em' }
    case 'icon':
      return { height: 24, width: 24 }
    default:
      throw new Error(`Unsupported size: ${size}`)
  }
}

function getLayout(size?: string) {
  return size === 'icon'
    ? { display: 'flex', alignItems: 'center', justifyContent: 'center' }
    : null
}

const staticStyles: Styles = {
  borderRadius: 3,
  color: Color.primaryWhite,
  border: 'none',
  outline: 'none',
  cursor: 'pointer',
  fontWeight: 500,
}
