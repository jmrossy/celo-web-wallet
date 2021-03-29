import { TextLink } from 'src/components/buttons/TextLink'
import { Box } from 'src/components/layout/Box'
import {
  TransactionContractProperty,
  TransactionFeeProperty,
  TransactionStatusProperty,
} from 'src/features/feed/components/CommonTransactionProperties'
import {
  TransactionProperty,
  TransactionPropertyGroup,
} from 'src/features/feed/components/TransactionPropertyGroup'
import { voteValueToLabel } from 'src/features/governance/types'
import { GovernanceVoteTx } from 'src/features/types'
import { Stylesheet } from 'src/styles/types'

export function GovernanceVoteReview({ tx }: { tx: GovernanceVoteTx }) {
  return (
    <TransactionPropertyGroup>
      <TransactionStatusProperty tx={tx} />
      <TransactionProperty label="Proposal">
        <Box margin="1em 0 0 0">
          <div css={style.label}>Proposal ID: </div>
          <div>{tx.proposalId}</div>
        </Box>
        <Box margin="1em 0 0 0">
          <div css={style.label}>Vote Value: </div>
          <div>{voteValueToLabel(tx.vote)}</div>
        </Box>
        <div css={style.link}>
          <TextLink link="https://celo.stake.id/">View Details on Stake.id</TextLink>
        </div>
      </TransactionProperty>
      <TransactionFeeProperty tx={tx} />
      <TransactionContractProperty tx={tx} />
    </TransactionPropertyGroup>
  )
}

const style: Stylesheet = {
  label: {
    minWidth: '6em',
  },
  link: {
    marginTop: '1em',
    fontSize: '0.9em',
  },
}
