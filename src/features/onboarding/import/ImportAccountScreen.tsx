import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box } from 'src/components/layout/Box'
import { config } from 'src/config'
import { WebWalletWarning } from 'src/features/download/WebWalletWarning'
import { ImportAccountForm } from 'src/features/onboarding/import/ImportAccountForm'
import { OnboardingScreenFrame } from 'src/features/onboarding/OnboardingScreenFrame'
import { Font } from 'src/styles/fonts'

export function ImportAccountScreen() {
  const [hasShownWarning, setHasShownWarning] = useState(config.isElectron)

  const navigate = useNavigate()
  const navigateToSetPin = () => {
    navigate('/setup/set-pin', { state: { pageNumber: 4 } })
  }

  return (
    <OnboardingScreenFrame current={3} total={4}>
      <h1 css={Font.h1Green}>Import Your Account Key</h1>
      {!hasShownWarning ? (
        <Box direction="column" align="center">
          <WebWalletWarning type="import" onClose={() => setHasShownWarning(true)} />
        </Box>
      ) : (
        <ImportAccountForm navigateToSetPin={navigateToSetPin} />
      )}
    </OnboardingScreenFrame>
  )
}
