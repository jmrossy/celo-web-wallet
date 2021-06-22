import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from 'src/app/rootReducer'
import { Button, transparentButtonStyles } from 'src/components/buttons/Button'
import { SwitchButton } from 'src/components/buttons/SwitchButton'
import { HrDivider } from 'src/components/HrDivider'
import IdCardIcon from 'src/components/icons/id_card.svg'
import LockIcon from 'src/components/icons/lock.svg'
import { PlusIcon } from 'src/components/icons/Plus'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { MAX_SEND_TOKEN_SIZE, MAX_SEND_TOKEN_SIZE_LEDGER } from 'src/consts'
import { passwordActions } from 'src/features/password/password'
import { setTxSizeLimitEnabled } from 'src/features/settings/settingsSlice'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { fromWei } from 'src/utils/amount'

export function SettingsScreen() {
  const txSizeLimitEnabled = useSelector((state: RootState) => state.settings.txSizeLimitEnabled)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onClickViewWallet = () => {
    navigate('/wallet')
  }

  const onClickChangePassword = () => {
    dispatch(passwordActions.reset())
    navigate('/change-pin')
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
          <button css={style.pageLinkBox} onClick={onClickViewWallet}>
            <Box direction="row" align="center">
              <img src={IdCardIcon} alt="wallet details" css={style.pageLinkIcon} />
              <div>
                <h3 css={style.h3}>Account Details</h3>
                <div css={style.description}>
                  See your acount information like your address and Account Key.
                </div>
              </div>
            </Box>
          </button>
          <button css={style.pageLinkBox} onClick={onClickChangePassword}>
            <Box direction="row" align="center">
              <img src={LockIcon} alt="change pin" css={style.pageLinkIcon} />
              <div>
                <h3 css={style.h3}>Change Password</h3>
                <div css={style.description}>
                  Set the password used to unlock your account on this device.
                </div>
              </div>
            </Box>
          </button>
        </Box>
        <HrDivider styles={style.divider} />
        <h2 css={style.sectionHeader}>Advanced Settings</h2>
        {/* <h3 css={style.warningLabel}>Changes here are not recommended, use at your own risk.</h3> */}
        <Box
          direction="row"
          align="center"
          justify="between"
          margin="2.5em 0 0 0"
          styles={style.toggleSettingContainer}
        >
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
        <Box
          direction="row"
          align="center"
          justify="between"
          margin="2.5em 0 0 0"
          styles={style.toggleSettingContainer}
        >
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
  divider: {
    margin: '2em 0',
  },
  pageLinkBox: {
    ...transparentButtonStyles,
    textAlign: 'left',
    fontWeight: 400,
    marginTop: '1em',
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
    width: 'calc(100% - 2em)',
  },
  switchContainer: {
    padding: '0.5em 0 0 1.5em',
  },
}
