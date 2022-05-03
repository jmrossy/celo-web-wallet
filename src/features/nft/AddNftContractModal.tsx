import { useAppDispatch, useAppSelector } from 'src/app/hooks'
import { Button } from 'src/components/buttons/Button'
import { AddressInput } from 'src/components/input/AddressInput'
import { HelpText } from 'src/components/input/HelpText'
import { Box } from 'src/components/layout/Box'
import { modalStyles } from 'src/components/modal/modalStyles'
import {
  addNftContractActions,
  addNftContractSagaName,
  validate,
} from 'src/features/nft/addNftContract'
import { AddNftContractParams } from 'src/features/nft/types'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'
import { useCustomForm } from 'src/utils/useCustomForm'
import { useSagaStatusNoModal } from 'src/utils/useSagaStatus'

const initialValues: AddNftContractParams = {
  address: '',
}

export function AddNftContractModal(props: { close: () => void }) {
  const dispatch = useAppDispatch()
  const customContracts = useAppSelector((s) => s.nft.customContracts)

  const onSubmit = (values: AddNftContractParams) => {
    dispatch(addNftContractActions.trigger(values))
  }

  const validateForm = (values: AddNftContractParams) => validate(values, customContracts)

  const { values, errors, handleChange, handleBlur, handleSubmit } =
    useCustomForm<AddNftContractParams>(initialValues, onSubmit, validateForm)

  const sagaStatus = useSagaStatusNoModal(addNftContractSagaName, props.close)
  const isLoading = sagaStatus === SagaStatus.Started
  const isFailure = sagaStatus === SagaStatus.Failure

  return (
    <form onSubmit={handleSubmit}>
      <Box direction="column" align="center">
        <p css={style.p}>
          Most cERC-721 compatible contract can be added.
          <br />
          The Metadata + Enumerable extensions are required.
          <br />
          Enter the NFT contract address.
        </p>
        <AddressInput
          name="address"
          width="22.5em"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.address}
          placeholder="Nft contract address"
          {...errors['address']}
        />
        {isFailure && (
          <HelpText margin="0.8em 0 -1.8em 0">
            Unable to add contract, please check address.
          </HelpText>
        )}
        <Box direction="row" align="center" margin="2.75em 0 0 0">
          <Button
            size="s"
            color={Color.primaryWhite}
            margin="0 1em"
            onClick={props.close}
            type="button"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button size="s" margin="0 1em" type="submit" disabled={isLoading}>
            Add
          </Button>
        </Box>
      </Box>
    </form>
  )
}

const style: Stylesheet = {
  p: {
    ...modalStyles.p,
    margin: '0 0 1.5em 0',
  },
}
