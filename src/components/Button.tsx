import { Color } from 'src/styles/Color';

interface ButtonProps {
  size?: 's' | 'm' | 'l' | 'icon' // defaults to 'm'
  type?: 'submit' | 'reset' | 'button'
  color?: Color // defaults to primaryGreen
  margin?: string | number
  onClick?: () => void
}

export function Button(props: React.PropsWithChildren<ButtonProps>) {
  const { size, type, color, margin, onClick } = props
  const { height, width } = getDimensions(size)
  const iconLayout = size === 'icon' ? {display: 'flex', alignItems: 'center', justifyContent: 'center' } : null;

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
        outline: 'none',
        cursor: 'pointer',
        ...iconLayout,
        ':hover': {
          backgroundColor: '#4cdd91',
        },
        ':active': {
          backgroundColor: '#0fb972',
        },
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
    case 's':
      return { height: '2.25em', width: '9em' }
    case 'm':
    case undefined:
      return { height: '3.25em', width: '12.5em' }
    case 'l':
      return { height: '4.25em', width: '16.5em' }
    case 'icon': return { height: 24, width: 24 }
    default:
      throw new Error(`Unsupported size: ${size}`)
  }
}
