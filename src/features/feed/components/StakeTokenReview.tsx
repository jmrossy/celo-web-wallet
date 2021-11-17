import { useNavigate } from 'react-router-dom'
import { Address } from '../../../components/Address'
import { Button } from '../../../components/buttons/Button'
import { Box } from '../../../components/layout/Box'
import { config } from '../../../config'
import { useDownloadDesktopModal } from '../../download/DownloadDesktopModal'
import {
  TransactionAmountProperty,
  TransactionContractProperty,
  TransactionStatusProperty,
} from './CommonTransactionProperties'
import { TransactionProperty, TransactionPropertyGroup } from './TransactionPropertyGroup'
import { StakeTokenTx } from '../../types'
import { Stylesheet } from '../../../styles/types'

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
        <div css={style.value}>
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

const style: Stylesheet = {
  value: {
    marginTop: '1em',
  },
}
