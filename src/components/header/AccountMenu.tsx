import { css } from '@emotion/react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import { AccountMenuItem } from 'src/components/header/AccountMenuItem'
import AccountDetailsIcon from 'src/components/icons/account_details.svg'
import AdviceIcon from 'src/components/icons/advice.svg'
import Caret from 'src/components/icons/caret_down.svg'
import DirectionIcon from 'src/components/icons/direction.svg'
import LockIcon from 'src/components/icons/lock.svg'
import PhoneIcon from 'src/components/icons/phone.svg'
import { Identicon } from 'src/components/Identicon'
import { Box } from 'src/components/layout/Box'
import { Backdrop, backdropZIndex } from 'src/components/modal/Backdrop'
import { NULL_ADDRESS } from 'src/consts'
import { Color } from 'src/styles/Color'
import { mq, useIsMobile } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { shortenAddress } from 'src/utils/addresses'
import { logger } from 'src/utils/logger'

const MenuItems = [
  { id: 'account', label: 'Account Details', icon: AccountDetailsIcon },
  { id: 'pin', label: 'Change Pin', icon: LockIcon },
  { id: 'about', label: 'About Celo', icon: PhoneIcon },
  { id: 'help', label: 'Help', icon: AdviceIcon },
  { id: 'logout', label: 'Logout', icon: DirectionIcon },
]

export const AccountMenu = () => {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const address = useSelector((s: RootState) => s.wallet.address)
  const addressOrDefault = address || NULL_ADDRESS
  const addressStub = '0x' + shortenAddress(addressOrDefault).substring(2).toUpperCase()
  const identiconSize = isMobile ? 30 : 40
  const [isOpen, setOpen] = useState(false)

  const onItemClick = (key: string) => () => {
    switch (key) {
      case 'account':
        setOpen(false)
        navigate('/wallet')
        break
      default:
        logger.info('Menu Item Clicked: ', key)
        break
    }
  }

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
          <div css={[style.menu, dropShadow]}>
            {MenuItems.map((item) => (
              <AccountMenuItem
                key={item.id}
                label={item.label}
                icon={item.icon}
                onClick={onItemClick(item.id)}
              />
            ))}
          </div>
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
  menu: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: '4.5em',
    right: '1em',
    minWidth: '15em',
    border: `1px solid ${Color.borderLight}`,
    borderRadius: 5,
    zIndex: backdropZIndex + 1,
    background: Color.primaryWhite,
  },
}

const rotated = (isOpen: boolean) => (isOpen ? { transform: 'rotate(180deg)' } : null)

const dropShadow = css`
  box-shadow: 2px 4px 2px -2px #ccc;
`
