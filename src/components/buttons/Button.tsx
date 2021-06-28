import { PropsWithChildren, ReactElement } from 'react'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Styles } from 'src/styles/types'

interface ButtonProps {
  size?: 'xs' | 's' | 'm' | 'l' | 'icon' // defaults to 'm'
  type?: 'submit' | 'reset' | 'button'
  color?: Color // defaults to primaryGreen
  margin?: string | number
  onClick?: () => void
  disabled?: boolean
  styles?: Styles
  width?: number | string
  height?: number | string
  icon?: string | ReactElement
  iconPosition?: 'start' | 'end' //defaults to start
  iconStyles?: Styles
  title?: string
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
    title,
  } = props
  const dimensions = getDimensions(size, widthOverride, heightOverride)
  const icoLayout = getLayout(size)

  const { backgroundColor, hoverBg, activeBg, border, textColor } = getColors(color)

  return (
    <button
      css={{
        ...defaultButtonStyles,
        ...icoLayout,
        ...dimensions,
        margin,
        backgroundColor,
        ':hover': {
          backgroundColor: hoverBg,
        },
        ':active': {
          backgroundColor: activeBg,
        },
        border: border || defaultButtonStyles.border,
        color: textColor || defaultButtonStyles.color,
        ...styles,
      }}
      onClick={onClick}
      type={type}
      disabled={disabled ?? false}
      title={title}
    >
      {icon ? (
        <Box align="center" justify="center">
          {(!iconPosition || iconPosition === 'start') && renderIcon(props)}
          {props.children}
          {iconPosition === 'end' && renderIcon(props)}
        </Box>
      ) : (
        <>{props.children}</>
      )}
    </button>
  )
}

function renderIcon(props: PropsWithChildren<ButtonProps>) {
  if (!props.icon) return null

  let margin
  if (props.children) {
    margin = props.iconPosition === 'end' ? { marginLeft: 8 } : { marginRight: 8 }
  }
  const styles = { ...margin, ...props.iconStyles }

  if (typeof props.icon === 'string') {
    return <img src={props.icon} css={styles} />
  } else {
    return (
      <Box align="center" justify="center" styles={styles}>
        {props.icon}
      </Box>
    )
  }
}

function getDimensions(size?: string, width?: number | string, height?: number | string) {
  switch (size) {
    case 'xs':
      return { height: height ?? '1.75em', width: width ?? '7em', fontSize: '0.9em' }
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

function getColors(baseColor: string = Color.primaryGreen) {
  if (baseColor === Color.primaryGreen) {
    return { backgroundColor: baseColor, hoverBg: '#4cdd91', activeBg: '#29d67d' }
  } else if (baseColor === Color.primaryWhite) {
    return {
      backgroundColor: baseColor,
      hoverBg: '#f0faf4',
      activeBg: '#e8f7ee',
      border: `2px solid ${Color.primaryGreen}`,
      textColor: Color.primaryGreen,
    }
  } else {
    return {
      backgroundColor: baseColor,
      // TODO make this more robust. Could use a css filter to just brighten the base color
      // perhaps consider the function from this SO answer: https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
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
  textRendering: 'geometricprecision',
}

export const defaultButtonStyles: Styles = {
  ...transparentButtonStyles,
  textRendering: 'initial',
  borderRadius: 4,
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
    'img, svg': {
      filter: 'brightness(0.7)',
    },
  },
}
