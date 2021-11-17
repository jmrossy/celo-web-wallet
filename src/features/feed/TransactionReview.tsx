import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from 'src/app/rootReducer'
import { ClickToCopy } from '../../components/buttons/ClickToCopy'
import { CloseButton } from '../../components/buttons/CloseButton'
import { Box } from '../../components/layout/Box'
import { GenericTransactionReview } from './components/GenericTransactionReview'
import { GovernanceVoteReview } from './components/GovernanceVoteReview'
import { StakeTokenReview } from './components/StakeTokenReview'
import { TokenExchangeReview } from './components/TokenExchangeReview'
import { TokenTransferReview } from './components/TokenTransferReview'
import { TransactionProperty } from './components/TransactionPropertyGroup'
import { openTransaction } from './feedSlice'
import { getTransactionDescription } from './transactionDescription'
import { CeloTransaction, TransactionType } from '../types'
import { useTokens } from '../wallet/hooks'
import { Color } from '../../styles/Color'
import { Font } from '../../styles/fonts'
import { mq, useIsMobile } from '../../styles/mediaQueries'
import { Stylesheet } from '../../styles/types'
import { Tokens } from '../../tokens'

export function TransactionReview() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { transactions, openTransaction: openTx } = useSelector((s: RootState) => s.feed)
  const tokens = useTokens()

  useEffect(() => {
    // On dismount clear open tx
    return () => {
      dispatch(openTransaction(null))
    }
  }, [])

  // Make sure this is the correct screen
  useEffect(() => {
    if (!openTx || !transactions || !transactions[openTx]) {
      navigate('/')
    }
  }, [openTx])

  const onCloseClick = () => {
    navigate('/')
  }

  if (!openTx) return <TransactionNotFound />
  const tx = transactions[openTx]
  if (!tx) return <TransactionNotFound />

  const { description, content } = getContentByTxType(tx, tokens)

  return (
    <div css={style.container}>
      <Box align="center" justify="between" styles={style.headerContainer}>
        <h2 css={style.h2}>{description}</h2>
        <CloseButton onClick={onCloseClick} styles={style.closeButton} />
      </Box>
      <div css={style.contentContainer}>{content}</div>
      <TransactionAdvancedDetails tx={tx} />
    </div>
  )
}

function getContentByTxType(tx: CeloTransaction, tokens: Tokens) {
  const description = getTransactionDescription(tx, tokens, false)

  if (
    tx.type === TransactionType.StableTokenTransfer ||
    tx.type === TransactionType.CeloNativeTransfer ||
    tx.type === TransactionType.CeloTokenTransfer ||
    tx.type === TransactionType.OtherTokenTransfer
  ) {
    return {
      description,
      content: <TokenTransferReview tx={tx} />,
    }
  }

  if (tx.type === TransactionType.TokenExchange) {
    return {
      description,
      content: <TokenExchangeReview tx={tx} />,
    }
  }

  if (tx.type === TransactionType.EscrowTransfer || tx.type === TransactionType.EscrowWithdraw) {
    return {
      description,
      content: <TokenTransferReview tx={tx} />,
    }
  }

  if (
    tx.type === TransactionType.ValidatorVoteCelo ||
    tx.type === TransactionType.ValidatorActivateCelo ||
    tx.type === TransactionType.ValidatorRevokeActiveCelo ||
    tx.type === TransactionType.ValidatorRevokePendingCelo
  ) {
    return {
      description,
      content: <StakeTokenReview tx={tx} />,
    }
  }

  if (tx.type === TransactionType.GovernanceVote) {
    return {
      description,
      content: <GovernanceVoteReview tx={tx} />,
    }
  }

  return {
    description,
    content: <GenericTransactionReview tx={tx} />,
  }
}

function TransactionNotFound() {
  return <div css={style.txNotFound}>Transaction Not Found!</div>
}

function TransactionAdvancedDetails({ tx }: { tx: CeloTransaction }) {
  const isMobile = useIsMobile()
  return (
    <div css={style.advancedContentContainer}>
      <TransactionProperty label="Advanced Details">
        <Box margin="1em 0 0 0">
          <div css={style.advancedLabel}>Transaction Hash:</div>
          <div>
            <ClickToCopy text={tx.hash} maxLength={isMobile ? 8 : 30} />
          </div>
        </Box>
        <Box margin="1em 0 0 0">
          <div css={style.advancedLabel}>Block Number:</div>
          <div>{tx.blockNumber}</div>
        </Box>
        <Box margin="1em 0 0 0">
          <div css={style.advancedLabel}>Transaction Nonce:</div>
          <div>{tx.nonce}</div>
        </Box>
      </TransactionProperty>
    </div>
  )
}

const style: Stylesheet = {
  container: {
    height: '100%',
    overflow: 'auto',
    backgroundColor: '#F7F7F8',
  },
  headerContainer: {
    background: Color.accentBlue,
    padding: '1em 2em',
  },
  h2: {
    ...Font.h2,
    ...Font.bold,
    color: Color.primaryWhite,
    margin: 0,
    paddingLeft: 3,
  },
  closeButton: {
    position: 'relative',
    top: 2,
    img: {
      filter: 'brightness(0) invert(1)',
    },
    ':hover': {
      filter: 'brightness(0.9)',
    },
  },
  contentContainer: {
    padding: '1em',
    [mq[1200]]: {
      padding: '2em',
    },
  },
  advancedContentContainer: {
    padding: '0 1em 1em 1em',
    [mq[1200]]: {
      padding: '0 2em 2em 2em',
    },
    maxWidth: '60em',
  },
  advancedLabel: {
    width: '10em',
  },
  txNotFound: {
    ...Font.h3,
    padding: '2em',
  },
}
