import { useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { getSigner } from 'src/blockchain/signer'
import { Address } from 'src/components/Address'
import { Identicon } from 'src/components/Identicon'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

export function WalletDetails() {
  const address = useSelector((s: RootState) => s.wallet.address)

  if (!address) {
    // TODO
    return <div>Creating wallet...</div>
  }

  const backupPhrase = getSigner().mnemonic

  return (
    <div css={style.container}>
      <div>Here is your new public address. It’s like your username on Celo.</div>
      <div>
        <Address address={address} hideIdenticon={true} />
      </div>
      <div>All accounts have unique icons. They help you recognize addresses.</div>
      <div>
        <Identicon address={address} size={60} />
      </div>
      <div>All accounts have unique icons. They help you recognize addresses.</div>
      <div>{backupPhrase.phrase}</div>
    </div>
  )
}

const style: Stylesheet = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(20em, 1fr))',
    gap: '3em 2em',
    alignItems: 'center',
    justifyItems: 'center',
    [mq[768]]: {
      justifyItems: 'stretch',
    },
  },
}
