import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'

interface NotificationProps {
  message: string
  color?: Color
  textColor?: Color
  margin?: string | number
}

export function Notification(props: NotificationProps) {
  if (!props.message) return null

  return (
    <Box
      direction="row"
      align="center"
      justify="center"
      styles={{
        backgroundColor: props.color ?? Color.accentBlue,
        width: '100%',
        margin: props.margin ?? '1em 0',
      }}
    >
      <Box
        align="center"
        justify="center"
        styles={{
          borderRadius: 5,
          padding: '0.5em 1em',
          width: '75%',
        }}
      >
        <span
          css={{
            fontSize: '1.1em',
            fontWeight: 400,
            color: props.textColor ?? Color.primaryWhite,
          }}
        >
          {props.message}
        </span>
      </Box>
    </Box>
  )
}
