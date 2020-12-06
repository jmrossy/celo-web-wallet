import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import { AccountMenuItem } from 'src/components/header/AccountMenuItem'
import ChevronIcon from 'src/components/icons/chevron.svg'
import HelpIcon from 'src/components/icons/help.svg'
import IdCardIcon from 'src/components/icons/id_card.svg'
import LockIcon from 'src/components/icons/lock.svg'
import Discord from 'src/components/icons/logos/discord.svg'
import Github from 'src/components/icons/logos/github.svg'
import SignPostIcon from 'src/components/icons/sign_post.svg'
import { Identicon } from 'src/components/Identicon'
import { Box } from 'src/components/layout/Box'
import { Backdrop, backdropZIndex } from 'src/components/modal/Backdrop'
import { ModalLinkGrid } from 'src/components/modal/ModalLinkGrid'
import { useModal } from 'src/components/modal/useModal'
import { config } from 'src/config'
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
  const { showModalWithContent } = useModal()
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
        showModalWithContent(
          'Need some help?',
          <HelpModal />,
          null,
          null,
          'See the Frequently Asked Questions (FAQ) on Github or join Discord to chat with the Celo community.'
        )
        break
      default:
        logger.info('Menu Item Clicked: ', key)
        break
    }
  }

  return (
    <>
      <div css={style.container} onClick={() => setOpen(true)}>
        <Box styles={style.caretContainer} align="center">
          <img src={ChevronIcon} width="14px" css={rotated(isOpen)} />
        </Box>
        <Box styles={style.addressContainer} align="center">
          <span css={style.address}>{addressStub}</span>
        </Box>
        <Identicon address={addressOrDefault} size={identiconSize} styles={style.identicon} />
      </div>
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

function HelpModal() {
  const links = [
    {
      url: 'https://github.com/celo-tools/celo-web-wallet/blob/master/FAQ.md',
      imgSrc: Github,
      text: 'FAQ on Github',
      altText: 'Github',
    },
    {
      url: config.discordUrl,
      imgSrc: Discord,
      text: 'Chat on Discord',
      altText: 'Discord',
    },
  ]
  return <ModalLinkGrid links={links} />
}

const style: Stylesheet = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    cursor: 'pointer',
    borderRadius: 22,
    background: Color.fillLighter,
    ':hover': {
      backgroundColor: Color.fillLight,
    },
  },
  addressContainer: {
    display: 'none',
    [mq[768]]: {
      display: 'inline',
      paddingRight: 10,
    },
  },
  address: {
    fontSize: '1.3em',
    letterSpacing: '0.06em',
  },
  caretContainer: {
    padding: '3px 9px 0 14px',
  },
  identicon: {
    border: `4px solid ${Color.primaryWhite}`,
    borderRadius: '50%',
    marginTop: -2,
    marginRight: -3,
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
