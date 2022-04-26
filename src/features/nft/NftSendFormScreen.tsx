import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from 'src/app/hooks'
import { BackButton } from 'src/components/buttons/BackButton'
import { Button } from 'src/components/buttons/Button'
import PasteIcon from 'src/components/icons/paste.svg'
import { AddressInput } from 'src/components/input/AddressInput'
import { NumberInput } from 'src/components/input/NumberInput'
import { SelectInput } from 'src/components/input/SelectInput'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { useContactsAndAccountsSelect } from 'src/features/contacts/hooks'
import { useResolvedNftAndContract } from 'src/features/nft/hooks'
import { NftImageWithInfo } from 'src/features/nft/NftImage'
import { validate } from 'src/features/nft/sendNft'
import { Nft, SendNftParams } from 'src/features/nft/types'
import { useFlowTransaction } from 'src/features/txFlow/hooks'
import { txFlowStarted } from 'src/features/txFlow/txFlowSlice'
import { TxFlowTransaction, TxFlowType } from 'src/features/txFlow/types'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { isValidAddress } from 'src/utils/addresses'
import { isClipboardReadSupported, tryClipboardGet } from 'src/utils/clipboard'
import { useCustomForm } from 'src/utils/useCustomForm'
import { useLocationState } from 'src/utils/useLocationState'

interface LocationState {
  nft: Nft
}

const initialValues: SendNftParams = {
  recipient: '',
  contract: '',
  tokenId: '',
}

export function NftSendFormScreen() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const locationState = useLocationState<LocationState>()
  const tx = useFlowTransaction()
  const contactOptions = useContactsAndAccountsSelect()

  const getInitialFormValues = () => getInitialValues(locationState, tx)

  const onSubmit = (values: SendNftParams) => {
    dispatch(txFlowStarted({ type: TxFlowType.SendNft, params: values }))
    navigate('/nft/review')
  }

  const { values, errors, handleChange, handleBlur, handleSubmit, setValues, resetValues } =
    useCustomForm<SendNftParams>(getInitialFormValues(), onSubmit, validate)

  // Keep form in sync with tx state
  useEffect(() => {
    resetValues(getInitialFormValues())
  }, [tx])

  const { contract, nft } = useResolvedNftAndContract(values.contract, values.tokenId)

  const onPasteAddress = async () => {
    const value = await tryClipboardGet()
    if (!value || !isValidAddress(value)) return
    setValues({ ...values, recipient: value })
  }

  return (
    <ScreenContentFrame>
      <Box align="center">
        <BackButton iconStyles={style.navButtonIcon} />
        <h1 css={style.h1}>Send an NFT</h1>
      </Box>
      <Box margin="2em 0 0 0">
        <div css={style.content}>
          <form onSubmit={handleSubmit}>
            <Box direction="column">
              <label css={style.inputLabel}>Recipient Address</label>
              <Box direction="row" justify="start" align="end">
                <SelectInput
                  name="recipient"
                  autoComplete={true}
                  value={values.recipient}
                  options={contactOptions}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Address or contact name"
                  maxOptions={4}
                  allowRawOption={true}
                  hideChevron={true}
                  fillWidth={true}
                  {...errors['recipient']}
                />
                {isClipboardReadSupported() && (
                  <Button
                    size="icon"
                    type="button"
                    margin="0 0 1px 0.5em"
                    onClick={onPasteAddress}
                    title="Paste"
                  >
                    <img src={PasteIcon} alt="Paste Address" css={style.copyIcon} />
                  </Button>
                )}
              </Box>
            </Box>
            <Box direction="column" margin="2em 0 0 0">
              <label css={style.inputLabel}>Contract Address</label>
              <AddressInput
                fillWidth={true}
                name="contract"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.contract}
                placeholder="0x1234"
                {...errors['contract']}
              />
            </Box>
            <Box direction="column" margin="2em 0 0 0">
              <label css={style.inputLabel}>Token Id</label>
              <NumberInput
                fillWidth={true}
                name="tokenId"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.tokenId}
                placeholder="1234"
                step="1"
                {...errors['tokenId']}
              />
            </Box>
            <Button type="submit" size="m" margin="2em 0 0 0" disabled={!contract || !nft}>
              Continue
            </Button>
          </form>
        </div>
        <div css={style.imageContainer}>
          <NftImageWithInfo nft={nft} contract={contract} styles={style.nftImage} />
        </div>
      </Box>
    </ScreenContentFrame>
  )
}

function getInitialValues(
  locationState: LocationState | null,
  tx: TxFlowTransaction | null
): SendNftParams {
  if (tx?.params && tx?.type === TxFlowType.SendNft) {
    return tx.params
  } else if (locationState?.nft) {
    return {
      ...initialValues,
      contract: locationState.nft.contract,
      tokenId: locationState.nft.tokenId.toString(),
    }
  } else {
    return initialValues
  }
}

const style: Stylesheet = {
  content: {
    width: '100%',
    maxWidth: '26em',
    paddingBottom: '1em',
  },
  h1: {
    ...Font.h2,
    margin: '0 0 0 1em',
  },
  inputLabel: {
    ...Font.inputLabel,
    marginBottom: '0.5em',
  },
  copyIcon: {
    height: '1em',
    width: '1.25em',
  },
  imageContainer: {
    display: 'none',
    [mq[1024]]: {
      display: 'block',
      marginLeft: '3em',
    },
  },
  nftImage: {
    ':hover': undefined,
  },
}
