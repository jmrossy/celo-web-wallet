import { PropsWithChildren } from 'react'
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
  iconPosition?: 'start' | 'end' //defaults to start
  disabled?: boolean
  styles?: Styles
  width?: number | string
  height?: number | string
}

export function Button(props: PropsWithChildren<ButtonProps>) {
  const {
    size,
    width: widthOverride,
    height: heightOverride,
    type,
    color,
    margin,
    onClick,
    icon,
    iconPosition,
    disabled,
    styles,
  } = props
  const { height, width } = getDimensions(size, widthOverride, heightOverride)
  const icoLayout = getLayout(size)

  const baseBg = color || Color.primaryGreen
  // TODO make this more robust. Could use a css filter to just brighten the base color
  // perhaps consider the function from this SO answer: https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
  const { hoverBg, activeBg } = getStateColors(baseBg)

  return (
    <button
      css={{
        ...defaultButtonStyles,
        ...icoLayout,
        margin,
        height,
        width,
        backgroundColor: baseBg,
        ':hover': {
          backgroundColor: hoverBg,
        },
        ':active': {
          // TODO make this dynamic like the other colors
          backgroundColor: activeBg, //'#0fb972',
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

function getDimensions(size?: string, width?: number | string, height?: number | string) {
  switch (size) {
    case 's':
      return { height: height ?? '2.25em', width: width ?? '9em' }
    case 'm':
    case undefined:
      return { height: height ?? '3em', width: width ?? '12em' }
    case 'l':
      return { height: height ?? '3.25em', width: width ?? '12.5em' }
    case 'icon':
      return { height: height ?? 27, width: width ?? 27 }
    default:
      throw new Error(`Unsupported size: ${size}`)
  }
}

function getLayout(size?: string) {
  return size === 'icon'
    ? { display: 'flex', alignItems: 'center', justifyContent: 'center' }
    : null
}

function getStateColors(baseColor: string) {
  if (baseColor === Color.primaryGreen) {
    return { hoverBg: '#4cdd91', activeBg: '#29d67d' }
  } else if (baseColor === Color.primaryWhite) {
    return { hoverBg: '#e4e6e7', activeBg: '#c8ccd0' }
  } else {
    return {
      hoverBg: `${baseColor}${baseColor.length === 3 ? 'c' : 'cc'}`,
      activeBg: `${baseColor}${baseColor.length === 3 ? 'e' : 'ee'}`,
    }
  }
}

export const transparentButtonStyles: Styles = {
  padding: 0,
  border: 'none',
  outline: 'none',
  background: 'none',
  cursor: 'pointer',
}

export const defaultButtonStyles: Styles = {
  ...transparentButtonStyles,
  borderRadius: 3,
  color: Color.primaryWhite,
  backgroundColor: Color.primaryGreen,
  fontWeight: 500,
  ':hover': {
    backgroundColor: '#4cdd91',
  },
  ':active': {
    backgroundColor: '#0fb972',
  },
  ':disabled': {
    cursor: 'default',
    color: Color.primaryGrey,
    backgroundColor: Color.borderInactive,
    img: {
      filter: 'brightness(0.7)',
    },
  },
}
