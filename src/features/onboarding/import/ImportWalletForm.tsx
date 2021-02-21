import { ChangeEvent, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { Button } from 'src/components/buttons/Button'
import { ButtonToggle } from 'src/components/buttons/ButtonToggle'
import { RadioBoxRow } from 'src/components/input/RadioBoxRow'
import { TextArea } from 'src/components/input/TextArea'
import { TextInput } from 'src/components/input/TextInput'
import { Box } from 'src/components/layout/Box'
import { useSagaStatus } from 'src/components/modal/useSagaStatusModal'
import { config } from 'src/config'
import { CELO_DERIVATION_PATH, ETHEREUM_DERIVATION_PATH } from 'src/consts'
import { WebWalletWarning } from 'src/features/download/WebWalletWarning'
import {
  importWalletActions,
  ImportWalletParams,
  importWalletSagaName,
  validate,
} from 'src/features/wallet/importWallet'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'
import { useCustomForm } from 'src/utils/useCustomForm'

interface ImportWalletForm {
  mnemonic: string
  chain: 'celo' | 'ethereum' | 'custom'
  pathSeg0: string
  pathSeg1: string
  pathSeg2: string
  pathSeg3: string
  pathSeg4: string
}

const pathSegs = getPathSegments('celo')
const initialValues: ImportWalletForm = {
  mnemonic: '',
  chain: 'celo',
  pathSeg0: pathSegs[0],
  pathSeg1: pathSegs[1],
  pathSeg2: pathSegs[2],
  pathSeg3: pathSegs[3],
  pathSeg4: pathSegs[4],
}

const radioBoxLabels = [
  { value: 'celo', label: 'Celo' },
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'custom', label: 'Custom' },
]

export function ImportWalletForm() {
  const [hasShownWarning, setHasShownWarning] = useState(config.isElectron)
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple')

  const dispatch = useDispatch()
  const onSubmit = (values: ImportWalletForm) => {
    dispatch(importWalletActions.trigger(toImportWalletParams(values)))
  }

  const validateForm = (values: ImportWalletForm) => validate(toImportWalletParams(values))

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    resetValues,
  } = useCustomForm<ImportWalletForm>(initialValues, onSubmit, validateForm)

  const onToggleMode = (index: number) => {
    resetValues(initialValues)
    setMode(index === 0 ? 'simple' : 'advanced')
  }

  const onSelectChain = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    const chainIdSegment = getPathSegments(value)[1]
    setValues({ ...values, [name]: value, pathSeg1: chainIdSegment })
  }

  const navigate = useNavigate()
  const onSuccess = () => {
    navigate('/setup/set-pin', { state: { pageNumber: 4 } })
  }
  const status = useSagaStatus(
    importWalletSagaName,
    'Error Importing Wallet',
    'Something went wrong when importing your wallet, sorry! Please check your account key and try again.',
    onSuccess
  )

  return (
    <Box direction="column" align="center">
      {!hasShownWarning && (
        <WebWalletWarning type="import" onClose={() => setHasShownWarning(true)} />
      )}
      {hasShownWarning && (
        <Box direction="column" align="center">
          <ButtonToggle label1="Simple" label2="Advanced" onToggle={onToggleMode} />
          <p css={{ ...style.description, marginTop: '1.3em' }}>
            Enter your account key (mnemonic phrase).
          </p>
          <p css={style.description}>Only import on devices you trust.</p>
          <form onSubmit={handleSubmit}>
            <Box direction="column" align="center">
              {mode === 'advanced' && (
                <>
                  <RadioBoxRow
                    value={values.chain}
                    startTabIndex={0}
                    labels={radioBoxLabels}
                    name="chain"
                    onChange={onSelectChain}
                    margin="1.5em 0 0 0"
                  />
                  <Box direction="row" align="center" justify="center">
                    <PathSegment
                      index={0}
                      value={values.pathSeg0}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={true}
                    />
                    <PathSegment
                      index={1}
                      value={values.pathSeg1}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={values.chain !== 'custom'}
                    />
                    <PathSegment
                      index={2}
                      value={values.pathSeg2}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <PathSegment
                      index={3}
                      value={values.pathSeg3}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <PathSegment
                      index={4}
                      value={values.pathSeg4}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Box>
                </>
              )}
              <TextArea
                name="mnemonic"
                value={values.mnemonic}
                placeholder="fish boot jump hand..."
                onChange={handleChange}
                minWidth="calc(min(22em, 85vw))"
                maxWidth="26em"
                minHeight="6.5em"
                maxHeight="8em"
                margin="1.5em 0 0 0"
                {...errors['mnemonic']}
              />
              <Button
                type="submit"
                margin="1.8em 0 0 0"
                disabled={status === SagaStatus.Started}
                size="l"
              >
                Import Account
              </Button>
            </Box>
          </form>
        </Box>
      )}
    </Box>
  )
}

interface PathSegmentProps {
  index: number
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onBlur: (event: ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
}

function PathSegment(props: PathSegmentProps) {
  const { index, value, onChange, onBlur, disabled } = props
  const name = `pathSeg${index}`
  return (
    <TextInput
      width={index === 1 ? '4em' : '1.75em'}
      margin="1.5em 0.5em 0 0.5em"
      name={name}
      onChange={onChange}
      onBlur={onBlur}
      value={value.toString()}
      placeholder="0"
      disabled={disabled}
    />
  )
}

function getPathSegments(chain: string) {
  const base =
    chain === 'ethereum' ? ETHEREUM_DERIVATION_PATH.split('/') : CELO_DERIVATION_PATH.split('/')
  return [...base.slice(1), '0']
}

function toImportWalletParams(values: ImportWalletForm): ImportWalletParams {
  const derivationPath =
    'm/' +
    [values.pathSeg0, values.pathSeg1, values.pathSeg2, values.pathSeg3, values.pathSeg4].join('/')
  return { mnemonic: values.mnemonic, derivationPath }
}

const style: Stylesheet = {
  description: {
    ...Font.body,
    textAlign: 'center',
    margin: '0.5em 0 0 0',
  },
}
