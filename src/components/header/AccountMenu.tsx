import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogoutModal } from 'src/app/logout/useLogoutModal'
import { useFundWalletModal } from 'src/components/FundWalletModal'
import { AccountMenuItem } from 'src/components/header/AccountMenuItem'
import { ChevronIcon } from 'src/components/icons/Chevron'
import CoinSwapIcon from 'src/components/icons/coin_swap.svg'
import HelpIcon from 'src/components/icons/help.svg'
import IdCardIcon from 'src/components/icons/id_card.svg'
import Discord from 'src/components/icons/logos/discord.svg'
import Github from 'src/components/icons/logos/github.svg'
import QrCodeIcon from 'src/components/icons/qr_code_big.svg'
import SettingsIcon from 'src/components/icons/settings.svg'
import SignPostIcon from 'src/components/icons/sign_post.svg'
import { Identicon } from 'src/components/Identicon'
import { Box } from 'src/components/layout/Box'
import { Backdrop, backdropZIndex } from 'src/components/modal/Backdrop'
import { ModalLinkGrid } from 'src/components/modal/ModalLinkGrid'
import { useModal } from 'src/components/modal/useModal'
import { config } from 'src/config'
import { useAddressQrCodeModal } from 'src/features/qr/QrCodeModal'
import { useWalletAddress } from 'src/features/wallet/utils'
import { Color } from 'src/styles/Color'
import { mq, useIsMobile } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { shortenAddress } from 'src/utils/addresses'
import { logger } from 'src/utils/logger'

const MenuItems = [
  { id: 'qr', label: 'Qr Code', icon: QrCodeIcon },
  { id: 'account', label: 'Account Details', icon: IdCardIcon },
  { id: 'fund', label: 'Fund Wallet', icon: CoinSwapIcon },
  { id: 'help', label: 'Help', icon: HelpIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, iconWidth: '1.8em' },
  { id: 'logout', label: 'Logout', icon: SignPostIcon },
]

export const AccountMenu = () => {
  const [isOpen, setOpen] = useState(false)

  const isMobile = useIsMobile()
  const identiconSize = isMobile ? 28 : 38

  const { showModalWithContent } = useModal()
  const onLogout = useLogoutModal()

  const address = useWalletAddress()
  const addressStub = '0x' + shortenAddress(address).substring(2).toUpperCase()
  const showQrModal = useAddressQrCodeModal()
  const showFundModal = useFundWalletModal()

  const navigate = useNavigate()
  const onItemClick = (key: string) => async () => {
    switch (key) {
      case 'qr':
        showQrModal(address)
        break
      case 'account':
        navigate('/wallet')
        break
      case 'settings':
        navigate('/settings')
        break
      case 'fund':
        showFundModal(address)
        break
      case 'logout':
        await onLogout()
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
        logger.info('Unknown Menu Item Clicked: ', key)
        break
    }

    setOpen(false) //close the menu
  }

  return (
    <>
      <div css={style.container} onClick={() => setOpen(true)}>
        <Box styles={style.caretContainer} align="center">
          <ChevronIcon width="14px" height="8px" direction={isOpen ? 'n' : 's'} />
        </Box>
        <Box styles={style.addressContainer} align="center">
          <span css={style.address}>{addressStub}</span>
        </Box>
        <Identicon address={address} size={identiconSize} styles={style.identicon} />
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
                iconWidth={item.iconWidth}
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
    fontSize: '1.25em',
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
