import { useNavigate } from 'react-router-dom'
import { Button } from 'src/components/buttons/Button'
import { TextLink } from 'src/components/buttons/TextLink'
import { BasicHelpIconModal, HelpIcon } from 'src/components/icons/HelpIcon'
import KeyIcon from 'src/components/icons/key.svg'
import LedgerIcon from 'src/components/icons/logos/ledger.svg'
import { Box } from 'src/components/layout/Box'
import { OnboardingScreenFrame } from 'src/features/onboarding/OnboardingScreenFrame'
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
    <OnboardingScreenFrame current={2} total={4}>
      <h1 css={Font.h1Green}>Import Your Celo Account</h1>
      <Box direction="row" align="center" justify="center" margin="0 0 0 2em">
        <p css={style.description}>
          To import your account, use your secret Account Key (mnemonic) or a Ledger hardware
          wallet.{' '}
        </p>
        <HelpIcon
          width="1.5em"
          margin="0 0.5em 0 0.25em"
          modal={{ head: 'About Importing Wallets', content: <HelpModal /> }}
        />
      </Box>
      <div css={style.buttonContainer}>
        <Button onClick={onClickAccountKey} size="l" margin="1em 1.5em" icon={KeyIcon}>
          Use Account Key
        </Button>
        <Button onClick={onClickLedger} size="l" margin="1em 1.5em" icon={LedgerIcon}>
          Use Ledger
        </Button>
      </div>
    </OnboardingScreenFrame>
  )
}

function HelpModal() {
  return (
    <BasicHelpIconModal>
      <p>
        If you already have a Celo account, you can use the Account Key to load it here. Account
        Keys are 24 random words (<q>dog chair hello</q>). They are secret so handle them carefully.
      </p>
      <p>
        If you have a Ledger hardware wallet{' '}
        <TextLink link="https://docs.celo.org/celo-owner-guide/ledger" styles={Font.linkLight}>
          with the Celo application
        </TextLink>
        , you can use the this wallet to safely interact with it.
      </p>
    </BasicHelpIconModal>
  )
}

const style: Stylesheet = {
  description: {
    ...onboardingStyles.description,
    maxWidth: 'calc(min(70vw, 22em))',
  },
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
