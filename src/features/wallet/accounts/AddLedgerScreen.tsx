import type { Location } from 'history'
import { useLocation, useNavigate } from 'react-router-dom'
import { Box } from 'src/components/layout/Box'
import { LedgerImportForm } from 'src/features/onboarding/import/LedgerImportForm'
import { Font } from 'src/styles/fonts'

export function AddLedgerScreen() {
  const location: Location = useLocation()
  const accountName = location?.state?.accountName

  const navigate = useNavigate()
  const onSuccess = () => navigate('/')

  return (
    <>
      <h2 css={Font.h2Center}>Import a Ledger Account</h2>
      <Box direction="column" align="center">
        <LedgerImportForm accountName={accountName} onSuccess={onSuccess} />
      </Box>
    </>
  )
}
