import { useDispatch } from 'react-redux'
import { Button } from 'src/components/Button'
import { Box } from 'src/components/layout/Box'
import { OnboardingScreenFrame } from 'src/components/layout/OnboardingScreenFrame'
import { importLedgerWalletActions } from 'src/features/ledger/importWallet'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function LedgerImportScreen() {
  const dispatch = useDispatch()

  const onClickImport = () => {
    dispatch(importLedgerWalletActions.trigger(0))
  }

  // TODO: show loader, handle errors, go to home
  // need to skip whole pin logic for ledger wallets
  // And show ledger animation if not to hard

  return (
    <OnboardingScreenFrame>
      <h1 css={Font.h1Green}>Import Your Ledger Account</h1>
      <p css={style.description}>TODO</p>
      <Box direction="column" align="center" margin="2em 0 0 0">
        <Button
          onClick={onClickImport}
          margin="2em 0 0 0"
          // disabled={status === SagaStatus.Started}
          size="l"
        >
          Import Account
        </Button>
      </Box>
    </OnboardingScreenFrame>
  )
}

const style: Stylesheet = {
  description: {
    ...Font.body,
    margin: '1em 0 0 0',
  },
}
