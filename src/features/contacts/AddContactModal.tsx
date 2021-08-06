import { utils } from 'ethers'
import { useDispatch } from 'react-redux'
import { Button } from 'src/components/buttons/Button'
import { AddressInput } from 'src/components/input/AddressInput'
import { TextInput } from 'src/components/input/TextInput'
import { Box } from 'src/components/layout/Box'
import { modalStyles } from 'src/components/modal/modalStyles'
import { MAX_ACCOUNT_NAME_LENGTH } from 'src/consts'
import { addContact } from 'src/features/contacts/contactsSlice'
import { ContactMap } from 'src/features/contacts/types'
import { normalizeAddress } from 'src/utils/addresses'
import { useCustomForm } from 'src/utils/useCustomForm'
import { ErrorState, invalidInput } from 'src/utils/validation'

interface AddContactForm {
  name: string
  address: string
}

interface Props {
  contacts: ContactMap
  close: () => void
}

export function AddContactModal({ contacts, close }: Props) {
  const dispatch = useDispatch()
  const onSubmit = (values: AddContactForm) => {
    const address = normalizeAddress(values.address.trim())
    dispatch(addContact({ address, name: values.name }))
    close()
  }

  const validate = (values: AddContactForm) => validateForm(values, contacts)

  const { values, errors, handleChange, handleBlur, handleSubmit } = useCustomForm<AddContactForm>(
    { name: '', address: '' },
    onSubmit,
    validate
  )

  return (
    <form onSubmit={handleSubmit}>
      <Box direction="column" align="center">
        <p css={modalStyles.pMargin0}>{`Please set a name and address for your contact.`}</p>
        <TextInput
          name="name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="My contact name"
          autoFocus={true}
          width="19em"
          margin="1.5em 0 0 0"
          {...errors['name']}
        />
        <AddressInput
          name="address"
          value={values.address}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="0x1234..."
          width="19em"
          margin="1.5em 0 0 0"
          {...errors['address']}
        />
        <Button size="s" margin="1.8em 0 0 0" type="submit">
          Add
        </Button>
      </Box>
    </form>
  )
}

function validateForm(values: AddContactForm, contacts: ContactMap): ErrorState {
  const { name, address } = values
  if (!name) return invalidInput('name', 'Name is required')
  if (name.length > MAX_ACCOUNT_NAME_LENGTH) return invalidInput('name', 'Name is too long')
  if (!address) return invalidInput('address', 'Address is required')
  if (!utils.isAddress(address.trim())) return invalidInput('address', 'Address is invalid')
  if (contacts[normalizeAddress(address.trim())])
    return invalidInput('address', 'Contact already exists')
  return { isValid: true }
}
