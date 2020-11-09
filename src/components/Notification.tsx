import { Box } from 'src/components/layout/Box';
import { Color } from "src/styles/Color";

interface NotificationProps {
  message?: string | null
  color?: Color
  textColor?: Color
}

export function Notification(props: NotificationProps){

  if(!props.message) return null;

  return (
    <Box direction="row" align="center" justify="center"
      styles={{
        backgroundColor: props.color ?? Color.accentBlue,
        width: "100%",
      }}
    >
      <Box align="center" justify="center"
        styles={{        
          borderRadius: 5,
          padding: "8px 16px",
          width: "75%"
        }}>
        <span css={{
          fontSize: 20,
          fontWeight: 400,
          color: props.textColor ?? Color.primaryWhite,
        }}>{props.message}</span>
      </Box>
    </Box>
  )
}