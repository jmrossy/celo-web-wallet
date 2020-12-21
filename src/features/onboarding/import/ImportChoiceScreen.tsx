import { useNavigate } from 'react-router'
import { Button } from 'src/components/Button'
import { HelpIcon } from 'src/components/icons/HelpIcon'
import { OnboardingScreenFrame } from 'src/components/layout/OnboardingScreenFrame'
import { onboardingStyles } from 'src/features/onboarding/onboardingStyles'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'

export function ImportChoiceScreen() {
  const navigate = useNavigate()

  const onClickAccountKey = () => {
    navigate('/setup/import')
  }

  const onClickLedger = () => {
    navigate('/setup/ledger')
  }

  return (
    <OnboardingScreenFrame>
      <h1 css={Font.h1Green}>Import Your Celo Account</h1>
      <p css={onboardingStyles.description}>
        To import your account, use your secret Account Key or a Ledger hardware wallet.{' '}
      </p>
      <HelpIcon tooltip="TODO" />
      <div css={style.buttonContainer}>
        {/* TODO add icons in these buttons */}
        <Button onClick={onClickAccountKey} size="l" margin={'1em 1.5em'}>
          Use Account Key
        </Button>
        <Button onClick={onClickLedger} size="l" margin={'1em 1.5em'}>
          Use Ledger
        </Button>
      </div>
    </OnboardingScreenFrame>
  )
}

const style: Stylesheet = {
  buttonContainer: {
    marginTop: '2em',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    [mq[768]]: {
      flexDirection: 'row',
    },
  },
}
