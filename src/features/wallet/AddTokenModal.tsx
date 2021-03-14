import { useDispatch } from 'react-redux'
import { Button } from 'src/components/buttons/Button'
import { SelectInput } from 'src/components/input/SelectInput'
import { Box } from 'src/components/layout/Box'
import { modalStyles } from 'src/components/modal/modalStyles'
import { validate } from 'src/features/wallet/addToken'
import { AddTokenParams } from 'src/features/wallet/types'
import { addToken } from 'src/features/wallet/walletSlice'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'
import { CELO } from 'src/tokens'
import { useCustomForm } from 'src/utils/useCustomForm'

const initialValues: AddTokenParams = {
  address: '',
}

export function AddTokenModal(props: { close: () => void }) {
  const dispatch = useDispatch()

  const onSubmit = (values: AddTokenParams) => {
    dispatch(addToken(CELO)) //TODO
  }

  const validateForm = (values: AddTokenParams) => validate(values)

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    resetValues,
  } = useCustomForm<AddTokenParams>(initialValues, onSubmit, validateForm)

  const onClickCancel = () => {
    resetValues(initialValues)
    props.close()
  }

  return (
    <form onSubmit={handleSubmit}>
      <Box direction="column" align="center">
        <p css={style.p}>
          Any ERC-20 compatible tokens can be added to your wallet.
          <br />
          Choose a known token or enter the contract address.
        </p>
        <SelectInput
          name="address"
          autoComplete={true}
          width="23em"
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.address}
          options={[]}
          disabled={false} //todo
          placeholder="Token name or address"
          {...errors['address']}
        />
        <Box direction="row" align="center" margin="7em 0 0 0">
          <Button
            size="s"
            color={Color.altGrey}
            margin="0 1em"
            onClick={onClickCancel}
            type="button"
          >
            Cancel
          </Button>
          <Button size="s" margin="0 1em" type="submit">
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
    marginBottom: '1.5em',
  },
}
