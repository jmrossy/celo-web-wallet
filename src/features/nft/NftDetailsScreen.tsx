import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { Nft } from 'src/features/nft/types'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { useLocationState } from 'src/utils/useLocationState'

interface LocationState {
  nft: Nft
}

export function NftDetailsScreen() {
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

  const onClickSend = () => {
    navigate('/nft/send', { state: { nft } })
  }

  return (
    <ScreenContentFrame>
      <h1 css={style.h1}>TODO</h1>
    </ScreenContentFrame>
  )
}

const style: Stylesheet = {
  h1: {
    ...Font.h2Green,
    marginBottom: '1.5em',
  },
}
