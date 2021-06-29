import { Box } from 'src/components/layout/Box'
import { LedgerImportForm } from 'src/features/onboarding/import/LedgerImportForm'
import { Font } from 'src/styles/fonts'

export function AddLedgerScreen() {
  return (
    <>
      <h2 css={Font.h2Center}>Import a Ledger Account</h2>
      <Box direction="column" align="center">
        <LedgerImportForm />
      </Box>
    </>
  )
}
