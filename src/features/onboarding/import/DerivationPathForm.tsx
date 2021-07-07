import { ChangeEvent, Dispatch, SetStateAction } from 'react'
import { RadioBoxRow } from 'src/components/input/RadioBoxRow'
import { TextInput } from 'src/components/input/TextInput'
import { Box } from 'src/components/layout/Box'
import { CELO_DERIVATION_PATH, ETHEREUM_DERIVATION_PATH } from 'src/consts'

export interface DerivationPathFormValues {
  chain: 'celo' | 'ethereum' | 'custom'
  pathSeg0: string
  pathSeg1: string
  pathSeg2: string
  pathSeg3: string
  pathSeg4: string
}

const initialPathSegs = getPathSegments('celo')
export const derivationPathInitialValues: DerivationPathFormValues = {
  chain: 'celo',
  pathSeg0: initialPathSegs[0],
  pathSeg1: initialPathSegs[1],
  pathSeg2: initialPathSegs[2],
  pathSeg3: initialPathSegs[3],
  pathSeg4: initialPathSegs[4],
}

const radioBoxLabels = [
  { value: 'celo', label: 'Celo' },
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'custom', label: 'Custom' },
]

interface DerivationPathProps {
  values: DerivationPathFormValues
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onBlur: (event: ChangeEvent<HTMLInputElement>) => void
  setValues: Dispatch<SetStateAction<any>>
}

export function DerivationPathForm(props: DerivationPathProps) {
  const { values, onChange, onBlur, setValues } = props

  const onSelectChain = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    const chainIdSegment = getPathSegments(value)[1]
    setValues({ ...values, [name]: value, pathSeg1: chainIdSegment })
  }

  return (
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
          onChange={onChange}
          onBlur={onBlur}
          disabled={true}
        />
        <PathSegment
          index={1}
          value={values.pathSeg1}
          onChange={onChange}
          onBlur={onBlur}
          disabled={values.chain !== 'custom'}
        />
        <PathSegment index={2} value={values.pathSeg2} onChange={onChange} onBlur={onBlur} />
        <PathSegment index={3} value={values.pathSeg3} onChange={onChange} onBlur={onBlur} />
        <PathSegment index={4} value={values.pathSeg4} onChange={onChange} onBlur={onBlur} />
      </Box>
    </>
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

export function toDerivationPath(values: DerivationPathFormValues) {
  return (
    'm/' +
    [values.pathSeg0, values.pathSeg1, values.pathSeg2, values.pathSeg3, values.pathSeg4].join('/')
  )
}
