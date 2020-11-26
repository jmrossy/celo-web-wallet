import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from 'src/app/rootReducer'
import { AccountMenu } from 'src/components/header/AccountMenu'
import Caret from 'src/components/icons/caret_down.svg'
import { Identicon } from 'src/components/Identicon'
import { Box } from 'src/components/layout/Box'
import { Backdrop } from 'src/components/modal/Backdrop'
import { NULL_ADDRESS } from 'src/consts'
import { Color } from 'src/styles/Color'
import { mq, useIsMobile } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { shortenAddress } from 'src/utils/addresses'

export const AccountChooser = () => {
  const isMobile = useIsMobile()
  const address = useSelector((s: RootState) => s.wallet.address)
  const addressOrDefault = address || NULL_ADDRESS
  const addressStub = '0x' + shortenAddress(addressOrDefault).substring(2).toUpperCase()
  const identiconSize = isMobile ? 30 : 40
  const [isOpen, setOpen] = useState(false)

  return (
    <>
      <Box align="center" justify="end">
        <Box styles={style.chooser} align="center">
          <img src={Caret} css={[style.caret, rotated(isOpen)]} onClick={() => setOpen(true)} />
        </Box>
        <Box styles={style.container} align="center">
          <span css={style.address}>{addressStub}</span>
        </Box>
        <Identicon address={addressOrDefault} size={identiconSize} styles={style.identicon} />
      </Box>
      {isOpen && (
        <>
          <Backdrop opacity={0.01} color={Color.primaryWhite} onClick={() => setOpen(false)} />
          <AccountMenu />
        </>
      )}
    </>
  )
}

const style: Stylesheet = {
  container: {
    background: Color.fillLight,
    padding: '0.5em 0',
    marginRight: '-0.8em',
    height: 30,
    paddingRight: '0.25em',
    [mq[768]]: {
      height: 40,
      paddingRight: '1.4em',
    },
  },
  chooser: {
    padding: '0.5em',
    background: Color.fillLight,
    borderRadius: '50% 0 0 50%',
    height: 30,
    [mq[768]]: {
      height: 40,
    },
  },
  caret: {
    borderRadius: '50%',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: Color.borderInactive,
    },
  },
  identicon: {
    border: `0.25em solid ${Color.primaryWhite}`,
    borderRadius: '50%',
    marginTop: '-0.25em',
  },
  address: {
    display: 'none',
    [mq[768]]: {
      display: 'inline',
      fontSize: '1.3em',
      letterSpacing: '0.06em',
      // marginRight: '0.6em',
    },
  },
}

const rotated = (isOpen: boolean) => (isOpen ? { transform: 'rotate(180deg)' } : null)
