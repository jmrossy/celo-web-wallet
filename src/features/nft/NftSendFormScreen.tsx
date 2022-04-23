import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from 'src/app/hooks'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { Nft } from 'src/features/nft/types'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { useLocationState } from 'src/utils/useLocationState'

interface LocationState {
  nft: Nft
}

export function NftSendFormScreen() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const locationState = useLocationState<LocationState>()

  useEffect(() => {
    // Make sure we belong on this screen
    if (!locationState?.nft) {
      navigate('/nft')
      return
    }
  }, [locationState])

  if (!locationState?.nft) return null
  const nft = locationState.nft

  const onClickContinue = () => {
    navigate('/nft/confirm')
  }

  return (
    <ScreenContentFrame>
      <h1 css={style.h1}>{`Send ${name}`}</h1>
    </ScreenContentFrame>
  )
}

const style: Stylesheet = {
  h1: {
    ...Font.h2Green,
    marginBottom: '1.5em',
  },
}
