import { restartApp } from './update'
import { Notification } from '../components/Notification'
import { Color } from '../styles/Color'
import { Styles } from '../styles/types'

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
