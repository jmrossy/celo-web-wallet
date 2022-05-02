import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from 'src/app/hooks'
import { transparentButtonStyles } from 'src/components/buttons/Button'
import { RefreshButton } from 'src/components/buttons/RefreshButton'
import { TextButton } from 'src/components/buttons/TextButton'
import { TransparentIconButton } from 'src/components/buttons/TransparentIconButton'
import NftIcon from 'src/components/icons/nft.svg'
import { PlusIcon } from 'src/components/icons/Plus'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { useModal } from 'src/components/modal/useModal'
import { Spinner } from 'src/components/Spinner'
import { AddNftContractModal } from 'src/features/nft/AddNftContractModal'
import { fetchNftsActions, fetchNftsSagaName } from 'src/features/nft/fetchNfts'
import { useNftContracts, useSortedOwnedNfts } from 'src/features/nft/hooks'
import { NftImageWithInfo } from 'src/features/nft/NftImage'
import { Nft } from 'src/features/nft/types'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
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

  const contracts = useNftContracts()
  const owned = useSortedOwnedNfts()

  const onClickNft = (nft: Nft) => {
    navigate('/nft/details', { state: { nft } })
  }

  const onClickRefresh = () => {
    dispatch(fetchNftsActions.trigger(true))
  }

  const { showModalWithContent, closeModal } = useModal()
  const onClickAdd = () => {
    showModalWithContent({
      head: 'Add New NFT',
      content: <AddNftContractModal close={closeModal} />,
    })
  }

  return (
    <ScreenContentFrame>
      <Box align="center">
        <h1 css={style.h1}>Non-Fungible Tokens (NFTs)</h1>
        <TransparentIconButton
          icon={<PlusIcon width="18px" height="18px" color={Color.primaryGreen} />}
          onClick={onClickAdd}
          margin="0 1.5em"
          title="Add NFT Contract"
          styles={style.addButton}
        />
        <RefreshButton
          width="16px"
          height="16px"
          onClick={onClickRefresh}
          styles={style.refreshIcon}
        />
      </Box>
      <div css={style.content}>
        {isLoading && (
          <div css={style.spinner}>
            <Spinner />
          </div>
        )}

        {isLoading && !owned.length && (
          <Box direction="column" align="center" margin="4em 3em">
            <img src={NftIcon} css={style.emptyImage} />
            <h3 css={style.h3}>Searching contracts for your NFTs...</h3>
          </Box>
        )}

        {!isLoading && !owned.length && (
          <Box direction="column" align="center" margin="4em 3em">
            <img src={NftIcon} css={style.emptyImage} />
            <h3 css={style.h3}>No NFTs found for this account</h3>
            <TextButton onClick={onClickAdd} styles={style.h4}>
              Add an NFT contract manually
            </TextButton>
          </Box>
        )}

        {owned.length > 0 && (
          <Box wrap={true} margin="0 0 1.5em">
            {owned.map((nft) => (
              <button
                css={style.nftButton}
                onClick={() => onClickNft(nft)}
                type="button"
                key={nft.contract + nft.tokenId}
              >
                <NftImageWithInfo nft={nft} contract={contracts[nft.contract]} />
              </button>
            ))}
          </Box>
        )}
      </div>
    </ScreenContentFrame>
  )
}

const style: Stylesheet = {
  content: {
    position: 'relative',
  },
  h1: {
    ...Font.h2Green,
    marginBottom: 0,
  },
  h3: {
    ...Font.h3,
    color: Color.textGrey,
    textAlign: 'center',
  },
  h4: {
    ...Font.h4Center,
    color: Color.textGrey,
    marginTop: '0.2em',
  },
  addButton: {
    opacity: 1,
    ':hover': {
      filter: 'brightness(1.1)',
    },
    ':active': {
      filter: 'brightness(1.2)',
    },
  },
  emptyImage: {
    width: '3em',
    height: '3em',
    filter: 'invert(1)',
    opacity: 0.3,
  },
  nftButton: {
    ...transparentButtonStyles,
    position: 'relative',
    margin: '1.5em 1.5em 0 0',
    [mq[1024]]: {
      margin: '1.8em 1.8em 0 0',
    },
  },
  spinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: -10,
    right: 0,
    top: 20,
    bottom: 0,
    zIndex: 100,
    opacity: 0.6,
    background: Color.fillLighter,
    borderRadius: 20,
  },
}
