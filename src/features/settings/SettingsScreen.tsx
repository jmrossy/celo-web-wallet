import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { Link } from 'react-router-dom'
import { RootState } from 'src/app/rootReducer'
import { Button } from 'src/components/buttons/Button'
import { SwitchButton } from 'src/components/buttons/SwitchButton'
import { HrDivider } from 'src/components/HrDivider'
import ArrowBackIcon from 'src/components/icons/arrow_back.svg'
import IdCardIcon from 'src/components/icons/id_card.svg'
import LockIcon from 'src/components/icons/lock.svg'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { MAX_SEND_TOKEN_SIZE, MAX_SEND_TOKEN_SIZE_LEDGER } from 'src/consts'
import { setTxSizeLimitEnabled } from 'src/features/settings/settingsSlice'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { fromWei } from 'src/utils/amount'

export function SettingsScreen() {
  const txSizeLimitEnabled = useSelector((state: RootState) => state.settings.txSizeLimitEnabled)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onClickBack = () => {
    navigate(-1)
  }

  const onTxLimitToggle = (value: boolean) => {
    dispatch(setTxSizeLimitEnabled(value))
  }

  const tokenLimitLocal = fromWei(MAX_SEND_TOKEN_SIZE)
  const tokenLimitLedger = fromWei(MAX_SEND_TOKEN_SIZE_LEDGER)

  return (
    <ScreenContentFrame>
      <Box direction="column" align="center">
        <h2 css={style.sectionHeader}>Account Settings</h2>
        <Box direction="row" align="center" justify="center" wrap={true} margin="0.5em 0 0 0">
          <div css={style.pageLinkBox}>
            <Link to="/wallet">
              <Box direction="row" align="center">
                <img src={IdCardIcon} alt="wallet details" css={style.pageLinkIcon} />
                <div>
                  <h3 css={style.h3}>Account Details</h3>
                  <div css={style.description}>
                    See your acount information like your address and Account Key.
                  </div>
                </div>
              </Box>
            </Link>
          </div>
          <div css={style.pageLinkBox}>
            <Link to="/change-pin">
              <Box direction="row" align="center">
                <img src={LockIcon} alt="change pin" css={style.pageLinkIcon} />
                <div>
                  <h3 css={style.h3}>Change Pin or Password</h3>
                  <div css={style.description}>
                    Set the pin/password used to unlock your account.
                  </div>
                </div>
              </Box>
            </Link>
          </div>
        </Box>
        <HrDivider styles={style.divider} />
        <h2 css={style.sectionHeader}>Advanced Settings</h2>
        <h3 css={style.warningLabel}>Changes here are not recommended, use at your own risk.</h3>
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
              {`By default, this wallet prevents large payments / exchanges. The limits are ${tokenLimitLocal} tokens for local accounts or ${tokenLimitLedger} for Ledger.`}
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
        <Button
          color={Color.altGrey}
          icon={ArrowBackIcon}
          onClick={onClickBack}
          margin="3.5em 0 1em 0"
        >
          Back
        </Button>
      </Box>
    </ScreenContentFrame>
  )
}

const style: Stylesheet = {
  sectionHeader: {
    ...Font.h2,
    color: Color.textGrey,
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
    marginTop: '1em',
    width: '20em',
    padding: '1em',
    borderRadius: 3,
    border: `1px solid ${Color.primaryWhite}`,
    ':hover': {
      borderColor: Color.altGrey,
    },
    a: {
      color: Color.primaryBlack,
      textDecoration: 'none',
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
