import { Button } from 'src/components/buttons/Button'
import { Box } from 'src/components/layout/Box'
import { modalStyles } from 'src/components/modal/modalStyles'
import { useModal } from 'src/components/modal/useModal'
import { PasswordInput, PasswordInputType } from 'src/features/password/PasswordInput'
import { Stylesheet } from 'src/styles/types'
import { useCustomForm } from 'src/utils/useCustomForm'
import { ErrorState, invalidInput } from 'src/utils/validation'

export function useEnterPasswordModal() {
  const { showModalWithContent, closeModal } = useModal()
  return (onSubmit: (password: string) => void) => {
    showModalWithContent({
      head: 'Password Required',
      content: <EnterPasswordModal close={closeModal} onSubmit={onSubmit} />,
    })
  }
}

interface Props {
  onSubmit: (password: string) => void
  close: () => void
}

interface PasswordForm {
  password: string
}

function EnterPasswordModal(props: Props) {
  const onSubmit = (values: PasswordForm) => {
    props.onSubmit(values.password)
    props.close()
  }

  const { values, errors, handleChange, handleBlur, handleSubmit } = useCustomForm<PasswordForm>(
    { password: '' },
    onSubmit,
    validateForm
  )

  return (
    <form onSubmit={handleSubmit}>
      <Box direction="column" align="center">
        <p css={style.p}>
          You need to unlock your wallet for this action.
          <br />
          Please enter your wallet password.
        </p>
        <PasswordInput
          type={PasswordInputType.CurrentPassword}
          name="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          autoFocus={true}
          {...errors['password']}
        />
        <Button size="s" margin="1.6em 0 0 0" type="submit">
          Unlock Wallet
        </Button>
      </Box>
    </form>
  )
}

function validateForm(values: PasswordForm): ErrorState {
  if (!values.password) {
    return invalidInput('password', 'Password is required')
  }
  return { isValid: true }
}

const style: Stylesheet = {
  p: {
    ...modalStyles.p,
    margin: '0 0 1.5em 0',
  },
}
