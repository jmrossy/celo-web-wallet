import { SignerType } from 'src/blockchain/signer'
import { Address } from 'src/components/Address'
import { HrDivider } from 'src/components/HrDivider'
import { Identicon } from 'src/components/Identicon'
import { Mnemonic } from 'src/components/Mnemonic'
import { PLACEHOLDER_MNEMONIC } from 'src/consts'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

interface Props {
  address: string
  mnemonic?: string
  type?: SignerType
}

export function AccountDetails({ address, mnemonic, type }: Props) {
  const isLocal = type !== SignerType.Ledger
  return (
    <div css={style.container}>
      <div css={style.itemContainer}>
        <h3 css={style.h3}>Public Address</h3>
        <div css={style.description}>
          It’s like your username on Celo.
          <br />
          You can share this with friends.
        </div>
      </div>
      <div css={style.itemContainer}>
        <Address address={address} hideIdenticon={true} buttonType="qrAndCopy" />
      </div>
      <div css={style.hrContainer}>
        <HrDivider />
      </div>
      <div css={style.itemContainer}>
        <h3 css={style.h3}>Unique Icon</h3>
        <div css={style.description}>
          Every account has a unique visual
          <br />
          representation of its address.
        </div>
      </div>
      <div css={style.itemContainer}>
        <Identicon address={address} size={60} />
      </div>
      <div css={style.hrContainer}>
        <HrDivider />
      </div>
      <div css={style.itemContainer}>
        <h3 css={style.h3}>Account Key</h3>
        <div css={style.description}>
          <strong>Keep this phrase secret and safe.</strong>
          <br />
          {isLocal && 'You can retrieve it again later.'}
        </div>
      </div>
      <div css={style.itemContainer}>
        <Mnemonic mnemonic={mnemonic || PLACEHOLDER_MNEMONIC} unavailable={!isLocal} />
      </div>
    </div>
  )
}

const style: Stylesheet = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(20em, 1fr))',
    gap: '1.5em 0.5em',
    alignItems: 'center',
    justifyItems: 'center',
    [mq[768]]: {
      justifyItems: 'stretch',
    },
  },
  h3: {
    ...Font.h3,
    margin: '0 0 0.25em 0',
  },
  description: {
    ...Font.body2,
    lineHeight: '1.5em',
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
}
