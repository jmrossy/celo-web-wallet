import { PropsWithChildren } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { Button } from 'src/components/Button'
import { Box } from 'src/components/layout/Box'
import { ScreenFrame } from 'src/components/layout/ScreenFrame'
import { openTransaction } from 'src/features/feed/feedSlice'
import { TransactionFeed } from 'src/features/feed/TransactionFeed'
import { Color } from 'src/styles/Color'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

export function ScreenFrameWithFeed(props: PropsWithChildren<any>) {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const onNewSendClick = () => {
    dispatch(openTransaction(null))
    navigate('/send')
  }

  const onNewExchangeClick = () => {
    dispatch(openTransaction(null))
    navigate('/exchange')
  }

  return (
    <ScreenFrame>
      <Box direction="row" styles={style.contentContainer}>
        <Box direction="column" styles={style.feedContainer}>
          <Box direction="row" align="center" justify="around" styles={style.buttonContainer}>
            <Button onClick={onNewSendClick} margin={'0.75em 0'} size="s">
              New Payment
            </Button>
            <Button onClick={onNewExchangeClick} margin={'0.75em 0'} size="s">
              New Exchange
            </Button>
          </Box>
          <TransactionFeed />
        </Box>
        <div css={style.childContent}>{props.children}</div>
      </Box>
    </ScreenFrame>
  )
}

const style: Stylesheet = {
  contentContainer: {
    height: '100%',
  },
  feedContainer: {
    flex: 1,
    [mq[768]]: {
      flex: 'initial',
      width: '22em',
      borderRight: `1px solid ${Color.borderLight}`,
    },
  },
  buttonContainer: {
    borderBottom: `1px solid ${Color.borderLight}`,
  },
  childContent: {
    display: 'none',
    [mq[768]]: {
      display: 'block',
      flex: 1,
    },
  },
}
