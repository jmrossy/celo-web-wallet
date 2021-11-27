import { CeloWallet } from '@celo-tools/celo-ethers-wrapper'
import type { Location } from 'history'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { getSigner } from 'src/blockchain/signer'
import { SignerType } from 'src/blockchain/types'
import { Button } from 'src/components/buttons/Button'
import { Box } from 'src/components/layout/Box'
import { Mnemonic } from 'src/components/Mnemonic'
import { useModal } from 'src/components/modal/useModal'
import { PLACEHOLDER_MNEMONIC } from 'src/consts'
import {
  DerivationPathForm,
  DerivationPathFormValues,
  derivationPathInitialValues,
  toDerivationPath,
} from 'src/features/onboarding/import/DerivationPathForm'
import { hasPasswordCached } from 'src/features/password/password'
import {
  importAccountActions,
  ImportAccountParams,
  importAccountSagaName,
} from 'src/features/wallet/importAccount'
import { isValidDerivationPath } from 'src/features/wallet/utils'
import { Font } from 'src/styles/fonts'
import { logger } from 'src/utils/logger'
import { SagaStatus } from 'src/utils/saga'
import { useCustomForm } from 'src/utils/useCustomForm'
import { useSagaStatus } from 'src/utils/useSagaStatus'
import { ErrorState, invalidInput } from 'src/utils/validation'

export function AddDeriveScreen() {
  const [account, setAccount] = useState<CeloWallet | null>(null)
  const location: Location = useLocation()
  const accountName = location?.state?.accountName
  const navigate = useNavigate()
  const { showModal, closeModal } = useModal()

  useEffect(() => {
    try {
      const signer = getSigner()
      if (signer.type !== SignerType.Local) throw new Error('Active account is Ledger')
      if (!signer.signer?.mnemonic?.phrase) throw new Error('Active is missing mnemonic')
      if (!hasPasswordCached()) throw new Error('Password is not cached')
      setAccount(signer.signer)
    } catch (error) {
      logger.error('Error getting account for derive screen', error)
      showModal({
        head: 'Invalid Active Account',
        subHead: 'Deriving needs a local account',
        body: 'To derive a new account, a local (not Ledger) account must be active. Please switch to a local account first.',
        actions: [{ key: 'okay', label: 'Okay' }],
        onActionClick: () => {
          navigate(-1)
          closeModal()
        },
      })
    }
  }, [])

  const dispatch = useDispatch()
  const onSubmit = (values: DerivationPathFormValues) => {
    if (!account) return
    const derivationPath = toDerivationPath(values)
    const params: ImportAccountParams = {
      account: {
        type: SignerType.Local,
        mnemonic: account.mnemonic.phrase,
        derivationPath,
        name: accountName,
      },
      isExisting: true,
    }
    dispatch(importAccountActions.trigger(params))
  }

  const { values, handleChange, handleBlur, handleSubmit, setValues } =
    useCustomForm<DerivationPathFormValues>(derivationPathInitialValues, onSubmit, validateForm)

  const status = useSagaStatus(
    importAccountSagaName,
    'Error Importing Account',
    'Something went wrong when deriving your new account, sorry! Please try again.',
    () => navigate('/')
  )

  const mnemonicPhrase = account ? account.mnemonic.phrase : PLACEHOLDER_MNEMONIC

  return (
    <>
      <h2 css={Font.h2Center}>Derive Another Account</h2>
      <h4 css={Font.h4Center}>Set a derivation path to import another account.</h4>
      <h4 css={Font.h4Center}>This will use your existing recovery phrase.</h4>
      <form onSubmit={handleSubmit}>
        <Box direction="column" align="center">
          <div css={{ margin: '0.5em 0 2em 0' }}>
            <DerivationPathForm
              values={values}
              onChange={handleChange}
              onBlur={handleBlur}
              setValues={setValues}
            />
          </div>
          {account && <Mnemonic mnemonic={mnemonicPhrase} unavailable={!account} />}
          <Button
            type="submit"
            margin="2em 0 0 0"
            disabled={!account || status === SagaStatus.Started}
            size="l"
          >
            Import Account
          </Button>
        </Box>
      </form>
    </>
  )
}

function validateForm(values: DerivationPathFormValues): ErrorState {
  const derivationPath = toDerivationPath(values)
  if (derivationPath && !isValidDerivationPath(derivationPath)) {
    return invalidInput('index', 'Invalid derivation path')
  }
  return { isValid: true }
}
