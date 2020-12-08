import { ChangeEvent, FormEvent, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Button } from 'src/components/Button'
import { Box } from 'src/components/layout/Box'
import { useSagaStatusWithErrorModal } from 'src/components/modal/useSagaStatusModal'
import {
  isPinValid,
  PincodeAction,
  pincodeActions,
  pincodeSagaName,
} from 'src/features/pincode/pincode'
import { PincodeInput } from 'src/features/pincode/PincodeInput'
import { useLogoutModal } from 'src/features/wallet/logout'
import { setWalletUnlocked } from 'src/features/wallet/walletSlice'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'

const defaultPinError = { isError: false, helpText: '' }

export function EnterPincodeForm() {
  const [pin, setPin] = useState<string>('')
  const [pinError, setPinError] = useState(defaultPinError)
  const dispatch = useDispatch()

  const onPinChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { target } = event
    setPin(target.value.substring(0, 6))
    setPinError(defaultPinError)
  }

  const onClickSubmit = (event?: FormEvent) => {
    if (event) event.preventDefault()

    if (!isPinValid(pin)) {
      setPinError({ isError: true, helpText: 'Invalid pin' })
      return
    }

    dispatch(pincodeActions.trigger({ action: PincodeAction.Unlock, value: pin }))
  }

  const onUnlocked = () => {
    dispatch(setWalletUnlocked(true)) //This will trigger the homeframe to show the main view, otherwise, pincode.status doesn't get reset
  }

  const onLogout = useLogoutModal()

  const status = useSagaStatusWithErrorModal(
    pincodeSagaName,
    'Error Unlocking Account',
    'Unable to unlock your account, please check your pin and try again.',
    onUnlocked
  )

  // TODO add 15 tries before account nuke logic here

  return (
    <Box direction="column" align="center">
      <div css={style.description}>Enter your pincode to unlock your account.</div>
      <form onSubmit={onClickSubmit}>
        <PincodeInput
          name="pin"
          value={pin}
          onChange={onPinChange}
          error={pinError.isError}
          helpText={pinError.helpText}
          autoFocus={true}
        />
        <Box direction="column" margin={'2em 0 0 0'}>
          <Button type="submit" disabled={status === SagaStatus.Started} size="l">
            Unlock
          </Button>

          <Button
            type="button"
            margin="1em 0 0 0"
            size="s"
            width="12.5em"
            color={Color.altGrey}
            disabled={status === SagaStatus.Started}
            onClick={onLogout}
          >
            Logout
          </Button>
        </Box>
      </form>
    </Box>
  )
}

const style: Stylesheet = {
  description: {
    ...Font.body,
    marginBottom: '2em',
  },
}
