import { Button } from 'src/components/buttons/Button'
import { TextInput } from 'src/components/input/TextInput'
import { Box } from 'src/components/layout/Box'
import { modalStyles } from 'src/components/modal/modalStyles'
import { MAX_ACCOUNT_NAME_LENGTH } from 'src/consts'
import { useCustomForm } from 'src/utils/useCustomForm'
import { ErrorState, invalidInput } from 'src/utils/validation'

export interface RenameForm {
  newName: string
}

interface Props {
  onSubmit: (values: RenameForm) => void
  label: string
}

export function RenameAccountModal(props: Props) {
  const { onSubmit, label } = props
  const { values, errors, handleChange, handleBlur, handleSubmit } = useCustomForm<RenameForm>(
    { newName: '' },
    onSubmit,
    validateForm
  )

  return (
    <form onSubmit={handleSubmit}>
      <Box direction="column" align="center">
        <p css={modalStyles.pMargin0}>{`Please set a new name for the ${label}.`}</p>
        <TextInput
          name="newName"
          value={values.newName}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="My new name"
          autoFocus={true}
          width="11em"
          margin="1.75em 0 0 0"
          {...errors['newName']}
        />
        <Button size="s" margin="1.8em 0 0 0" type="submit">
          Rename
        </Button>
      </Box>
    </form>
  )
}

function validateForm(values: RenameForm): ErrorState {
  if (!values.newName) return invalidInput('newName', 'New name is required')
  if (values.newName.length > MAX_ACCOUNT_NAME_LENGTH)
    return invalidInput('newName', 'New name is too long')
  return { isValid: true }
}
