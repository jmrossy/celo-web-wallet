import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from 'src/app/hooks'
import { useLogoutModal } from 'src/app/logout/useLogoutModal'
import { Button, transparentButtonStyles } from 'src/components/buttons/Button'
import { SwitchButton } from 'src/components/buttons/SwitchButton'
import { HrDivider } from 'src/components/HrDivider'
import AvatarSwapIcon from 'src/components/icons/avatar_swap.svg'
import IdCardIcon from 'src/components/icons/id_card.svg'
import LockIcon from 'src/components/icons/lock.svg'
import { PlusIcon } from 'src/components/icons/Plus'
import SignPostIcon from 'src/components/icons/sign_post.svg'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { MAX_SEND_TOKEN_SIZE, MAX_SEND_TOKEN_SIZE_LEDGER } from 'src/consts'
import { changePasswordActions } from 'src/features/password/changePassword'
import { setTxSizeLimitEnabled } from 'src/features/settings/settingsSlice'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { fromWei } from 'src/utils/amount'

export function SettingsScreen() {
  const txSizeLimitEnabled = useAppSelector((state) => state.settings.txSizeLimitEnabled)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const onClickViewAccount = () => {
    navigate('/account')
  }

  const onClickManageAccounts = () => {
    navigate('/accounts')
  }

  const onClickChangePassword = () => {
    dispatch(changePasswordActions.reset())
    navigate('/change-pin')
  }

  const onLogout = useLogoutModal()
  const onClickLogout = async () => {
    await onLogout()
  }

  const onClickAddToken = () => {
    navigate('/balances')
  }

  const onTxLimitToggle = (value: boolean) => {
    dispatch(setTxSizeLimitEnabled(value))
  }

  const tokenLimitLocal = fromWei(MAX_SEND_TOKEN_SIZE)
  const tokenLimitLedger = fromWei(MAX_SEND_TOKEN_SIZE_LEDGER)

  return (
    <ScreenContentFrame showBackButton={true}>
      <Box direction="column" align="center">
        <h2 css={style.sectionHeader}>Account Settings</h2>
        <Box direction="row" align="center" justify="center" wrap={true} margin="0.5em 0 0 0">
          <PageLinkBox
            header="Account Details"
            body="See acount information like your address and recovery phrase."
            icon={IdCardIcon}
            iconAlt="wallet details"
            onClick={onClickViewAccount}
          />
          <PageLinkBox
            header="Manage Accounts"
            body="View your detailed account list and add/edit accounts."
            icon={AvatarSwapIcon}
            iconAlt="manage accounts"
            onClick={onClickManageAccounts}
          />
        </Box>
        <Box direction="row" align="center" justify="center" wrap={true}>
          <PageLinkBox
            header="Change Password"
            body="Set the password used to unlock your accounts on this device."
            icon={LockIcon}
            iconAlt="change password"
            onClick={onClickChangePassword}
          />
          <PageLinkBox
            header="Logout"
            body="Remove keys and information from this device."
            icon={SignPostIcon}
            iconAlt="logout"
            onClick={onClickLogout}
          />
        </Box>
        <HrDivider margin="2em 0" />
        <h2 css={style.sectionHeader}>Advanced Settings</h2>
        <Box direction="row" align="center" justify="between" styles={style.toggleSettingContainer}>
          <div>
            <h3 css={style.h3}>Add New Tokens</h3>
            <div css={style.description}>
              Any ERC-20 compatible tokens on Celo can be added to this wallet. See the Balance
              Details screen to add more.
            </div>
          </div>
          <div css={style.switchContainer}>
            <Button
              size="icon"
              icon={<PlusIcon width="1em" height="1em" />}
              onClick={onClickAddToken}
              width="2.5em"
              height="2.5em"
            />
          </div>
        </Box>
        <Box direction="row" align="center" justify="between" styles={style.toggleSettingContainer}>
          <div>
            <h3 css={style.h3}>Transaction Size Limits</h3>
            <div css={style.description}>
              {`This wallet can prevent large payments / exchanges. The limits are ${tokenLimitLocal} tokens for local accounts or ${tokenLimitLedger} for Ledger.`}
            </div>
          </div>
          <div css={style.switchContainer}>
            <SwitchButton
              onToggle={onTxLimitToggle}
              initialStatus={txSizeLimitEnabled}
              showStatus={true}
            />
          </div>
        </Box>
      </Box>
    </ScreenContentFrame>
  )
}

interface PageLinkBoxProps {
  header: string
  body: string
  icon: string
  iconAlt: string
  onClick: () => void
}

function PageLinkBox(props: PageLinkBoxProps) {
  const { header, body, icon, iconAlt, onClick } = props
  return (
    <button css={style.pageLinkBox} onClick={onClick}>
      <Box direction="row" align="center">
        <img src={icon} alt={iconAlt} css={style.pageLinkIcon} />
        <div>
          <h3 css={style.h3}>{header}</h3>
          <div css={style.description}>{body}</div>
        </div>
      </Box>
    </button>
  )
}

const style: Stylesheet = {
  sectionHeader: {
    ...Font.h2,
    margin: 0,
  },
  warningLabel: {
    ...Font.body,
    textAlign: 'center',
    color: Color.primaryRed,
    margin: '1em 1em 0 1em',
  },
  h3: {
    ...Font.h3,
    margin: '0 0 0.25em 0',
  },
  description: {
    ...Font.body2,
    lineHeight: '1.5em',
    maxWidth: '28em',
  },
  pageLinkBox: {
    ...transparentButtonStyles,
    textAlign: 'left',
    fontWeight: 400,
    marginTop: '0.25em',
    width: '20em',
    padding: '1.1em 0.8em',
    borderRadius: 4,
    border: `1px solid ${Color.primaryWhite}`,
    ':hover': {
      borderColor: Color.altGrey,
    },
  },
  pageLinkIcon: {
    width: '3.5em',
    height: '3.5em',
    paddingRight: '1em',
  },
  toggleSettingContainer: {
    margin: '1.75em 0 0 0',
    width: 'calc(100% - 2em)',
  },
  switchContainer: {
    padding: '0.5em 0 0 1.5em',
  },
}
