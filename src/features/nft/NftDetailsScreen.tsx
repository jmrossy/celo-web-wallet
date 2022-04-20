import { useEffect } from 'react'
import { useAppDispatch } from 'src/app/hooks'
import { DashedBorderButton } from 'src/components/buttons/DashedBorderButton'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { useModal } from 'src/components/modal/useModal'
import { fetchNftsActions, fetchNftsSagaName } from 'src/features/nft/fetchNfts'
import { AddTokenModal } from 'src/features/tokens/AddTokenModal'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'
import { SagaStatus } from 'src/utils/saga'
import { useSagaStatus } from 'src/utils/useSagaStatus'

export function NftDetailsScreen() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchNftsActions.trigger())
  }, [])

  const status = useSagaStatus(
    fetchNftsSagaName,
    'Error Nfts Balances',
    'Something went wrong when looking for your NFTs, sorry! Please try again later.'
  )

  const { showModalWithContent, closeModal } = useModal()

  const onClickAdd = () => {
    //TODO
    showModalWithContent({ head: 'Add New NFT', content: <AddTokenModal close={closeModal} /> })
  }

  return (
    <ScreenContentFrame>
      <h1 css={style.h1}>Non-Fungible Tokens</h1>

      <DashedBorderButton
        onClick={onClickAdd}
        margin="0.5em 0 0 0"
        disabled={status === SagaStatus.Started}
      >
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
}
