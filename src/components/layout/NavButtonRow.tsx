import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { Button } from 'src/components/buttons/Button'
import LockIcon from 'src/components/icons/lock_small.svg'
import SendIcon from 'src/components/icons/send_payment.svg'
import ExchangeIcon from 'src/components/icons/swap.svg'
import TripDotsIcon from 'src/components/icons/triple_dots.svg'
import VoteIcon from 'src/components/icons/vote_small.svg'
import { Box } from 'src/components/layout/Box'
import { Backdrop, backdropZIndex } from 'src/components/modal/Backdrop'
import { config } from 'src/config'
import { exchangeReset } from 'src/features/exchange/exchangeSlice'
import { sendReset } from 'src/features/send/sendSlice'
import { Color } from 'src/styles/Color'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

interface Props {
  disabled: boolean
  mobile?: boolean
}

export function NavButtonRow({ mobile, disabled }: Props) {
  const [showDropdown, setShowDropdown] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const onSendClick = () => {
    dispatch(sendReset())
    navigate('/send')
  }

  const onExchangeClick = () => {
    dispatch(exchangeReset())
    navigate('/exchange')
  }

  const onDotsClick = () => {
    setShowDropdown(true)
  }

  const onLockClick = () => {
    // TODO reset?
    navigate('/lock')
  }

  const onVoteClick = () => {
    alert('TODO')
  }

  const showExtraOptions = config.isElectron && !mobile

  const buttonWidth = showExtraOptions ? '8.75em' : mobile ? '44%' : '9.75em'
  const buttonHeight = mobile ? '2.75em' : '2.5em'

  return (
    <Box direction="row" align="center" justify="evenly" styles={style.container}>
      <Button
        onClick={onSendClick}
        margin="0.75em 0"
        size="m"
        disabled={disabled}
        icon={SendIcon}
        width={buttonWidth}
        height={buttonHeight}
      >
        Send
      </Button>
      <Button
        onClick={onExchangeClick}
        margin="0.75em 0"
        size="m"
        disabled={disabled}
        icon={ExchangeIcon}
        width={buttonWidth}
        height={buttonHeight}
      >
        Exchange
      </Button>
      {showExtraOptions && (
        <Button
          onClick={onDotsClick}
          margin="0.75em 0"
          size="icon"
          disabled={disabled}
          width="2em"
          height={buttonHeight}
        >
          <img width="12px" height="20px" src={TripDotsIcon} alt="More Options" />
        </Button>
      )}
      {showExtraOptions && showDropdown && (
        <>
          <Backdrop
            opacity={0.01}
            color={Color.primaryWhite}
            onClick={() => setShowDropdown(false)}
          />
          <div css={style.menu}>
            <Button
              onClick={onLockClick}
              size="m"
              margin="0 0.7em 0 0"
              disabled={disabled}
              icon={LockIcon}
              width={buttonWidth}
              height={buttonHeight}
            >
              Lock
            </Button>
            <Button
              onClick={onVoteClick}
              size="m"
              disabled={disabled}
              icon={VoteIcon}
              width={buttonWidth}
              height={buttonHeight}
            >
              Vote
            </Button>
          </div>
        </>
      )}
    </Box>
  )
}

const style: Stylesheet = {
  container: {
    borderTop: `1px solid ${Color.borderLight}`,
    borderBottom: `1px solid ${Color.borderLight}`,
    [mq[768]]: {
      borderTop: 'none',
    },
  },
  menu: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: '7.5em',
    left: 0,
    width: '20.95em',
    padding: '0.5em',
    borderRadius: 3,
    zIndex: backdropZIndex + 1,
    background: Color.primaryWhite,
    boxShadow: '-1px 4px 8px 1px #eeeeee',
  },
}
