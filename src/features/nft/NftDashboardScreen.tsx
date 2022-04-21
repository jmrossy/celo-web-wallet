import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from 'src/app/hooks'
import { DashedBorderButton } from 'src/components/buttons/DashedBorderButton'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { useModal } from 'src/components/modal/useModal'
import { Spinner } from 'src/components/Spinner'
import { fetchNftsActions, fetchNftsSagaName } from 'src/features/nft/fetchNfts'
import { AddTokenModal } from 'src/features/tokens/AddTokenModal'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'
import { useSagaStatus } from 'src/utils/useSagaStatus'

export function NftDashboardScreen() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchNftsActions.trigger())
  }, [])

  const status = useSagaStatus(
    fetchNftsSagaName,
    'Error Finding Nfts',
    'Something went wrong when looking for your NFTs, sorry! Please try again later.'
  )
  const isLoading = status === SagaStatus.Started

  const owned = useAppSelector((state) => state.nft.owned)

  const onClickNft = (address: Address, id: string) => {
    navigate('/nft/details', { state: { address, id } })
  }

  const { showModalWithContent, closeModal } = useModal()

  const onClickAdd = () => {
    //TODO
    showModalWithContent({ head: 'Add New NFT', content: <AddTokenModal close={closeModal} /> })
  }

  return (
    <ScreenContentFrame>
      <h1 css={style.h1}>Your Non-Fungible Tokens (NFTs)</h1>
      {isLoading && (
        <div css={style.spinner}>
          <Spinner />
        </div>
      )}

      <DashedBorderButton onClick={onClickAdd} margin="0.5em 0 0 0" disabled={isLoading}>
        + Add missing NFT
      </DashedBorderButton>
    </ScreenContentFrame>
  )
}

const style: Stylesheet = {
  h1: {
    ...Font.h2Green,
    marginBottom: '1.5em',
  },
  spinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
}
