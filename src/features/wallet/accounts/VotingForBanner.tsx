import { useSelector } from 'react-redux'
import type { RootState } from 'src/app/rootReducer'
import { Color } from 'src/styles/Color'
import { Styles } from 'src/styles/types'

// Show an 'on behalf of account' banner when performing action as a signer for another account
export function VotingForBanner() {
  const voteSignerFor = useSelector((state: RootState) => state.wallet.account.voteSignerFor)
  if (!voteSignerFor) return null
  return <h2 css={style}>{`(Signer voting on behalf of ${voteSignerFor.toUpperCase()})`}</h2>
}

const style: Styles = {
  margin: '0.8em 0 0 0',
  fontSize: '1em',
  fontWeight: 400,
  color: Color.textGrey,
}
