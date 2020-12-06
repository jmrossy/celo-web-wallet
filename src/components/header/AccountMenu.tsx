import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import { AccountMenuItem } from 'src/components/header/AccountMenuItem'
import ChevronIcon from 'src/components/icons/chevron.svg'
import HelpIcon from 'src/components/icons/help.svg'
import IdCardIcon from 'src/components/icons/id_card.svg'
import LockIcon from 'src/components/icons/lock.svg'
import SignPostIcon from 'src/components/icons/sign_post.svg'
import { Identicon } from 'src/components/Identicon'
import { Box } from 'src/components/layout/Box'
import { Backdrop, backdropZIndex } from 'src/components/modal/Backdrop'
import { NULL_ADDRESS } from 'src/consts'
import { logoutActions } from 'src/features/wallet/logout'
import { Color } from 'src/styles/Color'
import { mq, useIsMobile } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { shortenAddress } from 'src/utils/addresses'
import { logger } from 'src/utils/logger'

const MenuItems = [
  { id: 'account', label: 'Account Details', icon: IdCardIcon },
  { id: 'pin', label: 'Change Pin', icon: LockIcon },
  { id: 'help', label: 'Help', icon: HelpIcon },
  { id: 'logout', label: 'Logout', icon: SignPostIcon },
]

export const AccountMenu = () => {
  const dispatch = useDispatch()
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
      case 'pin':
        setOpen(false)
        navigate('/change-pin')
        break
      case 'logout':
        dispatch(logoutActions.trigger())
        navigate('/welcome')
        break
      case 'help':
        // TODO show modal with links to Discord and FAQ,
        // Content can be similar to ExchangesModal in HeaderSectionEmpty
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
          <img
            src={ChevronIcon}
            css={[style.caret, rotated(isOpen)]}
            onClick={() => setOpen(true)}
          />
        </Box>
        <Box styles={style.container} align="center">
          <span css={style.address}>{addressStub}</span>
        </Box>
        <Identicon address={addressOrDefault} size={identiconSize} styles={style.identicon} />
      </Box>
      {isOpen && (
        <>
          <Backdrop opacity={0.01} color={Color.primaryWhite} onClick={() => setOpen(false)} />
          <div css={style.menu}>
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
    padding: '0.5em 0.25em',
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
    boxShadow: '2px 4px 2px -2px #ccc',
  },
}

const rotated = (isOpen: boolean) => (isOpen ? { transform: 'rotate(180deg)' } : null)
