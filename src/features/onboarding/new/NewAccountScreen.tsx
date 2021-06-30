import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { config } from 'src/config'
import { WebWalletWarning } from 'src/features/download/WebWalletWarning'
import { NewAccountForm } from 'src/features/onboarding/new/NewAccountForm'
import { OnboardingScreenFrame } from 'src/features/onboarding/OnboardingScreenFrame'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

export function NewAccountScreen() {
  const [hasShownWarning, setHasShownWarning] = useState(config.isElectron)

  const navigate = useNavigate()
  const navigateToSetPin = () => {
    navigate('/setup/set-pin', { state: { pageNumber: 3 } })
  }

  return (
    <OnboardingScreenFrame current={2} total={3}>
      <h1 css={style.header}>Your New Celo Account</h1>
      {hasShownWarning ? (
        <WebWalletWarning type="create" onClose={() => setHasShownWarning(true)} />
      ) : (
        <NewAccountForm navigateToSetPin={navigateToSetPin} />
      )}
    </OnboardingScreenFrame>
  )
}

const style: Stylesheet = {
  header: {
    ...Font.h1Green,
    [mq[768]]: {
      marginBottom: '2em',
    },
  },
}
