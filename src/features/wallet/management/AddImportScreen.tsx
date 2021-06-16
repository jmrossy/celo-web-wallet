import { ImportWalletForm } from 'src/features/onboarding/import/ImportWalletForm'
import { Font } from 'src/styles/fonts'

export function AddImportScreen() {
  return (
    <>
      <h2 css={Font.h2Center}>Import Another Account</h2>
      <h4 css={Font.h4Center}>Use an account key (seed phrase) to import another account.</h4>
      <h4 css={Font.h4Center}>Only import on devices you trust.</h4>
      <div css={{ margin: '1.5em' }}>
        <ImportWalletForm isAddFlow={true} />
      </div>
    </>
  )
}
