import { keyframes } from '@emotion/react'
import { useEffect, useState } from 'react'
import { CloseButton } from 'src/components/CloseButton'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'

interface NotificationProps {
  message: string
  color?: Color
  textColor?: Color
  margin?: string | number
  justify?: 'start' | 'center' | 'end' | 'between'
  onDismiss?: () => void
  icon?: string
}

export function Notification(props: NotificationProps) {
  if (!props.message) return null
  const [isDismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (isDismissed && props.onDismiss) {
      setTimeout(() => {
        if (props.onDismiss) props.onDismiss()
      }, 500)
    }
  }, [props.onDismiss, isDismissed])

  return (
    <Box
      direction="row"
      align="center"
      justify={props.justify || 'center'}
      styles={{
        backgroundColor: props.color ?? Color.accentBlue,
        width: '100%',
        margin: props.margin ?? '1em 0',
        padding: '0.4em 1.5em 0.4em 0.5em',
        animation: isDismissed ? `${fadeOut} 0.5s forwards` : undefined,
      }}
    >
      {props.icon && <img src={props.icon} css={{ marginLeft: '0.5em' }} />}
      <Box
        align="center"
        styles={{
          borderRadius: 5,
          padding: '0.5em 1em',
        }}
      >
        <span
          css={{
            fontSize: '1.1em',
            lineHeight: '1.25em',
            fontWeight: 400,
            color: props.textColor ?? Color.primaryWhite,
          }}
        >
          {props.message}
        </span>
      </Box>
      {props.onDismiss && <CloseButton onClick={() => setDismissed(true)} />}
    </Box>
  )
}

const fadeOut = keyframes`
 0% { opacity: 1; }
 100% { opacity: 0; }
`
