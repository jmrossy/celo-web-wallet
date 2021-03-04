import { restartApp } from 'src/app/update'
import { Notification } from 'src/components/Notification'
import { Color } from 'src/styles/Color'
import { Styles } from 'src/styles/types'

export function UpdateBanner() {
  return (
    <div id="update-banner" css={style} onClick={restartApp}>
      <Notification color={Color.accentBlue}>
        An update is available, please click here to restart.
      </Notification>
    </div>
  )
}

const style: Styles = {
  display: 'none',
  cursor: 'pointer',
  '& div': {
    fontWeight: 500,
  },
  ':hover': { opacity: 0.9 },
}
