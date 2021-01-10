import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'

interface AccountMenuItemProps {
  label: string
  icon: string
  iconWidth?: string
  iconHeight?: string
  onClick: () => void
}

export const AccountMenuItem = (props: AccountMenuItemProps) => {
  const { label, icon, iconWidth, iconHeight, onClick } = props

  return (
    <div css={style.menuItem} onClick={onClick}>
      <img src={icon} css={getIconStyle(iconWidth, iconHeight)} />
      <span css={style.menuItemLabel}>{label}</span>
    </div>
  )
}

function getIconStyle(iconWidth?: string, iconHeight?: string) {
  return {
    height: iconHeight || '2em',
    width: iconWidth || '2em',
    padding: '0.25em 0.5em',
    marginRight: '1em',
  }
}

const style: Stylesheet = {
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
  menuItemLabel: {
    fontSize: '1.2em',
    fontWeight: 400,
  },
}
