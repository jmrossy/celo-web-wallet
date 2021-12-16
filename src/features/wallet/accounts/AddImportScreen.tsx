import type { Location } from 'history'
import { useLocation, useNavigate } from 'react-router-dom'
import { ImportAccountForm } from 'src/features/onboarding/import/ImportAccountForm'
import { Font } from 'src/styles/fonts'

export function AddImportScreen() {
  const location: Location = useLocation()
  const accountName = location?.state?.accountName

  const navigate = useNavigate()
  const navigateToSetPin = () => {
    navigate('/accounts/set-pin', { state: { accountName } })
  }

  return (
    <>
      <h2 css={Font.h2Center}>Import Another Account</h2>
      <h4 css={Font.h4Center}>Use an recovery (seed) phrase to import another account.</h4>
      <h4 css={Font.h4Center}>Only import on devices you trust.</h4>
      <div css={{ margin: '1.5em' }}>
        <ImportAccountForm
          hideDescription={true}
          navigateToSetPin={navigateToSetPin}
          accountName={accountName}
        />
      </div>
    </>
  )
}
