import { useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { getSigner } from 'src/blockchain/signer'
import { Address } from 'src/components/Address'
import { Identicon } from 'src/components/Identicon'
import { Mnemonic } from 'src/components/Mnemonic'
import { NULL_ADDRESS, PLACEHOLDER_MNEMONIC } from 'src/consts'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

export function WalletDetails() {
  const address = useSelector((s: RootState) => s.wallet.address)
  const mnemonic = address ? getSigner().mnemonic : null

  return (
    <div css={style.container}>
      <div css={style.itemContainer}>
        <h3 css={style.h3}>Public Address</h3>
        <div>
          It’s like your username on Celo.
          <br />
          You can share this with friends.
        </div>
      </div>
      <div css={style.itemContainer}>
        <Address address={address || NULL_ADDRESS} hideIdenticon={true} buttonType="copy" />
      </div>
      <div css={style.hrContainer}>
        <hr css={style.hr} />
      </div>
      <div css={style.itemContainer}>
        <h3 css={style.h3}>Unique Icon</h3>
        <div>
          Every account has a unique visual
          <br />
          representation of its address.
        </div>
      </div>
      <div css={style.itemContainer}>
        <Identicon address={address || NULL_ADDRESS} size={60} />
      </div>
      <div css={style.hrContainer}>
        <hr css={style.hr} />
      </div>
      <div css={style.itemContainer}>
        <h3 css={style.h3}>Account Key</h3>
        <div>
          Keep this phrase secret and safe. You can
          <br />
          retrieve it again under Account Settings.
        </div>
      </div>
      <div css={style.itemContainer}>
        <Mnemonic mnemonic={mnemonic?.phrase || PLACEHOLDER_MNEMONIC} />
      </div>
    </div>
  )
}

const style: Stylesheet = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(20em, 1fr))',
    gap: '1.5em 2em',
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
  itemContainer: {
    textAlign: 'center',
    [mq[768]]: {
      textAlign: 'left',
    },
  },
  hrContainer: {
    gridColumnStart: 1,
    gridColumnEnd: 2,
    width: '80%',
    textAlign: 'center',
    [mq[768]]: {
      width: '97%',
      gridColumnStart: 1,
      gridColumnEnd: 3,
    },
  },
  hr: {
    height: 1,
    border: 'none',
    backgroundColor: '#D1D5D8',
    color: '#D1D5D8', //for IE
    margin: 0,
  },
}
