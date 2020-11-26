import { css } from '@emotion/react'
import AccountDetailsIcon from 'src/components/icons/account_details.svg'
import AdviceIcon from 'src/components/icons/advice.svg'
import DirectionIcon from 'src/components/icons/direction.svg'
import LockIcon from 'src/components/icons/lock.svg'
import PhoneIcon from 'src/components/icons/phone.svg'
import { backdropZIndex } from 'src/components/modal/Backdrop'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'
import { logger } from 'src/utils/logger'

interface MenuItemProps {
  label: string
  icon: string
  onClick: () => void
}

const MenuItem = (props: MenuItemProps) => {
  const { label, icon, onClick } = props

  return (
    <div css={style.menuItem} onClick={onClick}>
      <img src={icon} css={style.menuItemIcon} />
      <span css={style.menuItemLabel}>{label}</span>
    </div>
  )
}

const MenuItems = [
  { id: 'account', label: 'Account Details', icon: AccountDetailsIcon },
  { id: 'pin', label: 'Change Pin', icon: LockIcon },
  { id: 'about', label: 'About Celo', icon: PhoneIcon },
  { id: 'help', label: 'Help', icon: AdviceIcon },
  { id: 'logout', label: 'Logout', icon: DirectionIcon },
]

export const AccountMenu = () => {
  const onItemClick = (key: string) => () => {
    logger.info('Menu Item Clicked: ', key)
  }

  return (
    <div css={[style.menu, dropShadow]}>
      {MenuItems.map((item) => (
        <MenuItem
          key={item.id}
          label={item.label}
          icon={item.icon}
          onClick={onItemClick(item.id)}
        />
      ))}
    </div>
  )
}

const style: Stylesheet = {
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
  menuItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    minHeight: 40,
    borderBottom: `1px solid ${Color.borderLight}`,
    ':hover': {
      backgroundColor: `${Color.accentBlue}22`,
    },
    cursor: 'pointer',
    padding: '0.5em',
  },
  menuItemIcon: {
    height: '2em',
    width: '2em',
    padding: '0.25em 0.5em',
    marginRight: '1em',
  },
  menuItemLabel: {
    fontSize: '1.2em',
    fontWeight: 400,
  },
}

const dropShadow = css`
  box-shadow: 2px 4px 2px -2px #ccc;
`
