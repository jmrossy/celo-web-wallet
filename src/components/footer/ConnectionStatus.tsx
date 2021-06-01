import { useEffect, useState } from 'react'
import { getLatestBlockDetails, LatestBlockDetails } from 'src/blockchain/blocks'
import { ConnectionIcon } from 'src/components/icons/Connection'
import { Box } from 'src/components/layout/Box'
import { ModalOkAction } from 'src/components/modal/modal'
import { useModal } from 'src/components/modal/useModal'
import { config } from 'src/config'
import { CONNECTION_CHECK_INTERVAL, STALE_BLOCK_TIME } from 'src/consts'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { logger } from 'src/utils/logger'
import { isStale } from 'src/utils/time'
import { useInterval } from 'src/utils/timeout'

export function ConnectionStatusLink() {
  const [latestBlock, setLatestBlock] = useState<LatestBlockDetails | null | undefined>(undefined)

  useEffect(() => {
    getLatestBlock(setLatestBlock)
  }, [])

  useInterval(() => {
    getLatestBlock(setLatestBlock)
  }, CONNECTION_CHECK_INTERVAL)

  const status = getStatusFromBlock(latestBlock)
  let summary = 'Connecting'
  let color = Color.primaryBlack
  if (status === ConnStatus.Connected) {
    summary = 'Connected'
    color = Color.accentBlue
  } else if (status === ConnStatus.Stale) {
    summary = 'Weak Connection'
    color = Color.textWarning
  } else if (status === ConnStatus.NotConnected) {
    summary = 'Not Connected'
    color = Color.textError
  }

  const { showModalWithContent } = useModal()
  const onConnectionClick = () => {
    showModalWithContent({
      head: 'Connection Status',
      content: <ConnectionStatus />,
      actions: ModalOkAction,
    })
  }

  return (
    <div css={style.connectedBox} onClick={onConnectionClick}>
      <ConnectionIcon fill={color} />
      <span css={[style.connectionLink, { color: `${color} !important` }]}>{summary}</span>
    </div>
  )
}

export const ConnectionStatus = () => {
  const [latestBlock, setLatestBlock] = useState<LatestBlockDetails | null | undefined>(undefined)

  useEffect(() => {
    getLatestBlock(setLatestBlock)
  }, [])

  const status = getStatusFromBlock(latestBlock)
  let summary = 'Loading ...'
  let summaryColor = Color.primaryBlack
  let block = '...'
  if (status === ConnStatus.Connected) {
    summary = 'You are connected to the Celo Network!'
    summaryColor = Color.primaryGreen
    block = latestBlock!.number.toString()
  } else if (status === ConnStatus.Stale) {
    summary = 'Your connection is weak (stale blocks)'
    block = latestBlock!.number.toString()
  } else if (status === ConnStatus.NotConnected) {
    summary = 'You are not connected.'
    summaryColor = Color.textError
    block = '-'
  }

  const { chainId, jsonRpcUrlPrimary } = config
  const nodeUrl = latestBlock?.nodeUrl || jsonRpcUrlPrimary

  return (
    <Box direction="column" align="center" styles={style.container}>
      <p css={{ color: `${summaryColor} !important` }}>{summary}</p>
      <p>Node: {nodeUrl}</p>
      <p>Last Block Number: {block}</p>
      <p>Chain ID: {chainId}</p>
    </Box>
  )
}

function getLatestBlock(setLatestBlock: (block: LatestBlockDetails | null) => void) {
  getLatestBlockDetails()
    .then((block) => {
      setLatestBlock(block)
    })
    .catch((reason) => {
      logger.warn('Error getting block details', reason)
      setLatestBlock(null)
    })
}

enum ConnStatus {
  NotConnected = -1,
  Loading = 0,
  Stale = 1,
  Connected = 2,
}

function getStatusFromBlock(latestBlock: LatestBlockDetails | null | undefined): ConnStatus {
  if (latestBlock === undefined) return ConnStatus.Loading

  if (latestBlock && latestBlock.number > 0 && latestBlock.timestamp > 0) {
    if (!isStale(latestBlock.timestamp * 1000, STALE_BLOCK_TIME)) {
      return ConnStatus.Connected
    } else {
      return ConnStatus.Stale
    }
  }

  return ConnStatus.NotConnected
}

const style: Stylesheet = {
  container: {
    paddingTop: '0.5em',
    '& p': {
      ...Font.body,
      textAlign: 'center',
      margin: '0 1em 1em 1em',
    },
    '& p:last-child': {
      marginBottom: '0.2em',
    },
  },
  connectionLink: {
    fontSize: '0.8em',
    fontWeight: 400,
    padding: '0 0.8em',
  },
  connectedBox: {
    display: 'flex',
    alignContent: 'flex-end',
    paddingLeft: '1em',
    position: 'relative',
    cursor: 'pointer',
    [mq[768]]: {
      borderLeft: `1px solid ${Color.borderInactive}`,
    },
    '& svg': {
      height: '1em',
      width: '1em',
    },
    ':hover': {
      '& span': {
        textDecoration: 'underline',
      },
    },
  },
}
