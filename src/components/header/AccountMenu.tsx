import { useNavigate } from 'react-router-dom'
import { transparentButtonStyles } from '../buttons/Button'
import { useFundWalletModal } from '../FundWalletModal'
import { AccountMenuItem } from '../header/AccountMenuItem'
import AvatarPlusIcon from '../icons/avatar_plus.svg'
import AvatarSwapIcon from '../icons/avatar_swap.svg'
import { ChevronIcon } from '../icons/Chevron'
import CoinSwapIcon from '../icons/coin_swap.svg'
import IdCardIcon from '../icons/id_card.svg'
import QrCodeIcon from '../icons/qr_code_big.svg'
import SettingsIcon from '../icons/settings.svg'
import { Identicon } from '../Identicon'
import { Box } from '../layout/Box'
import { DropdownBox, useDropdownBox } from '../modal/DropdownBox'
import { useAddressQrCodeModal } from '../../features/qr/QrCodeModal'
import { useChooseAccountModal } from '../../features/wallet/accounts/ChooseAccountModal'
import { useWalletAddress } from '../../features/wallet/hooks'
import { Color } from '../../styles/Color'
import { mq, useIsMobile } from '../../styles/mediaQueries'
import { Stylesheet } from '../../styles/types'
import { shortenAddress } from '../../utils/addresses'
import { logger } from '../../utils/logger'

const MenuItems = [
  { id: 'switch', label: 'Switch Account', icon: AvatarSwapIcon },
  { id: 'account', label: 'Account Details', icon: IdCardIcon },
  { id: 'qr', label: 'QR Code', icon: QrCodeIcon },
  { id: 'contacts', label: 'Contacts', icon: AvatarPlusIcon },
  { id: 'fund', label: 'Fund Wallet', icon: CoinSwapIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, iconWidth: '1.8em' },
]

export const AccountMenu = () => {
  const { isDropdownVisible, showDropdown, hideDropdown } = useDropdownBox()

  const isMobile = useIsMobile()
  const identiconSize = isMobile ? 28 : 38

  const address = useWalletAddress()
  const addressStub = shortenAddress(address, false, true)
  const showFundModal = useFundWalletModal()
  const showAccountsModal = useChooseAccountModal()
  const showQrModal = useAddressQrCodeModal()

  const navigate = useNavigate()
  const onItemClick = (key: string) => async () => {
    switch (key) {
      case 'account':
        navigate('/account')
        break
      case 'switch':
        showAccountsModal()
        break
      case 'qr':
        showQrModal(address)
        break
      case 'settings':
        navigate('/settings')
        break
      case 'fund':
        showFundModal(address)
        break
      case 'contacts':
        navigate('/accounts')
        break
      default:
        logger.info('Unknown Menu Item Clicked: ', key)
        break
    }
    hideDropdown()
  }

  return (
    <>
      <button css={style.container} onClick={showDropdown}>
        <Box styles={style.caretContainer} align="center">
          <ChevronIcon width="14px" height="8px" direction={isDropdownVisible ? 'n' : 's'} />
        </Box>
        <Box styles={style.addressContainer} align="center">
          <span css={style.address}>{addressStub}</span>
        </Box>
        <Identicon address={address} size={identiconSize} styles={style.identicon} />
      </button>
      {isDropdownVisible && (
        <DropdownBox hide={hideDropdown} styles={style.menu}>
          {MenuItems.map((item) => (
            <AccountMenuItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              iconWidth={item.iconWidth}
              onClick={onItemClick(item.id)}
            />
          ))}
        </DropdownBox>
      )}
    </>
  )
}

const style: Stylesheet = {
  container: {
    ...transparentButtonStyles,
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
    top: '4em',
    right: '1em',
    minWidth: '15em',
    borderRadius: 5,
    boxShadow: '2px 4px 2px -2px #ccc',
  },
}
