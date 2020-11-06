import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Button } from 'src/components/Button'
import { Box } from 'src/components/layout/Box'
import { isPinValid } from 'src/features/pincode/pincode'
import { PincodeInput } from 'src/features/pincode/PincodeInput'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

export function EnterPincodeForm() {
  const [pin, setPin] = useState<string>('')
  const dispatch = useDispatch()
  // const navigate = useNavigate()

  const onPinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event
    setPin(target.value.substring(0, 6))
  }

  const onClickSubmit = () => {
    if (!isPinValid(pin)) {
      // TODO show error
      alert('Invalid pin')
      return
    }

    // dispatch(TODO)
    // navigate('/')
  }

  return (
    <Box direction="column" align="center">
      <div css={style.description}>Enter your pincode to unlock your account on this device.</div>
      <PincodeInput name="pin" value={pin} onChange={onPinChange} />
      <Button size={'m'} onClick={onClickSubmit} margin={'3em 0 0 0'}>
        Unlock
      </Button>
    </Box>
  )
}

const style: Stylesheet = {
  description: {
    ...Font.body,
    marginBottom: '2em',
  },
}
