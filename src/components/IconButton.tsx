import { Color } from 'src/styles/Color'

interface ButtonProps {
  size?: 'xs' | 's' | 'm' | 'l' // defaults to 'm'
  type?: 'submit' | 'reset' | 'button'
  color?: Color // defaults to primaryGreen
  margin?: string | number
  onClick?: () => void
}

export function IconButton(props: React.PropsWithChildren<ButtonProps>) {
  const { size, type, color, margin, onClick } = props
  const { height, width } = getDimensions(size)
  return (
    <button
      css={{
        backgroundColor: color || Color.primaryGreen,
        margin,
        height,
        width,
        borderRadius: 3,
        color: Color.primaryWhite,
        border: 'none',
        cursor: 'pointer',
      }}
      onClick={onClick}
      type={type}
    >
      {props.children}
    </button>
  )
}

function getDimensions(size?: string) {
  switch (size) {
    case 'xs': return { height: 24, width: 24 }
    case 's':
      return { height: '2.25em', width: '9em' }
    case 'm':
    case undefined:
      return { height: '3.25em', width: '12.5em' }
    case 'l':
      return { height: '4.25em', width: '16.5em' }
    default:
      throw new Error(`Unsupported size: ${size}`)
  }
}
