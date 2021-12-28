import { useNavigate } from 'react-router-dom'
import { Address } from 'src/components/Address'
import { Button } from 'src/components/buttons/Button'
import { Box } from 'src/components/layout/Box'
import { config } from 'src/config'
import { useDownloadDesktopModal } from 'src/features/download/DownloadDesktopModal'
import {
  TransactionAmountProperty,
  TransactionContractProperty,
  TransactionStatusProperty,
} from 'src/features/feed/components/CommonTransactionProperties'
import {
  TransactionProperty,
  TransactionPropertyGroup,
} from 'src/features/feed/components/TransactionPropertyGroup'
import { txReviewStyles } from 'src/features/feed/components/txReviewStyles'
import { StakeTokenTx } from 'src/features/types'

export function StakeTokenReview({ tx }: { tx: StakeTokenTx }) {
  const navigate = useNavigate()
  const showDownloadDesktopModal = useDownloadDesktopModal()
  const onClickGroups = () => {
    if (config.isElectron) {
      navigate('/validators')
    } else {
      showDownloadDesktopModal()
    }
  }
  const onClickVotes = () => {
    if (config.isElectron) {
      navigate('/stake')
    } else {
      showDownloadDesktopModal()
    }
  }

  return (
    <TransactionPropertyGroup>
      <TransactionStatusProperty tx={tx} />
      <TransactionProperty label="Validator Group">
        <div css={txReviewStyles.value}>
          <Address address={tx.groupAddress} />
          <Box direction="row" align="center" margin="1.1em 0 0 0">
            <Button size="xs" margin="0 1.2em 0 1px" onClick={onClickGroups}>
              See Groups
            </Button>
            <Button size="xs" onClick={onClickVotes}>
              See Votes
            </Button>
          </Box>
        </div>
      </TransactionProperty>
      <TransactionAmountProperty tx={tx} />
      <TransactionContractProperty tx={tx} />
    </TransactionPropertyGroup>
  )
}
