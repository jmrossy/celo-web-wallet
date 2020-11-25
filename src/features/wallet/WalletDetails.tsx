import { useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { getSigner } from 'src/blockchain/signer'
import { Address } from 'src/components/Address'
import { Identicon } from 'src/components/Identicon'
import { NULL_ADDRESS, PLACEHOLDER_MNEMONIC } from 'src/consts'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

export function WalletDetails() {
  const address = useSelector((s: RootState) => s.wallet.address)
  const backupPhrase = address ? getSigner().mnemonic : null

  return (
    <div css={style.container}>
      <div>
        <h3 css={style.h3}>Public Address</h3>
        <div>It’s like your username on Celo. You can share this with friends.</div>
      </div>
      <div>
        <Address address={address || NULL_ADDRESS} hideIdenticon={true} />
      </div>
      <div>
        <h3 css={style.h3}>Unique Icon</h3>
        <div>Every account has a unique visual representation of its address.</div>
      </div>
      <div>
        <Identicon address={address || NULL_ADDRESS} size={60} />
      </div>
      <div>
        <h3 css={style.h3}>Account Key</h3>
        <div>
          Keep this phrase secret and safe. You can retrieve it again under Account Settings.
        </div>
      </div>
      <div>{backupPhrase?.phrase || PLACEHOLDER_MNEMONIC}</div>
    </div>
  )
}

const style: Stylesheet = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(20em, 1fr))',
    gap: '2.5em 2em',
    alignItems: 'center',
    justifyItems: 'center',
    [mq[768]]: {
      justifyItems: 'stretch',
    },
  },
  h3: {
    ...Font.h3,
    margin: '0 0 0.5em 0',
  },
}
