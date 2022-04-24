import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from 'src/app/hooks'
import { Button, transparentButtonStyles } from 'src/components/buttons/Button'
import { RefreshButton } from 'src/components/buttons/RefreshButton'
import { TextButton } from 'src/components/buttons/TextButton'
import { KebabMenuIcon } from 'src/components/icons/KebabMenu'
import NftIcon from 'src/components/icons/nft.svg'
import { PlusIcon } from 'src/components/icons/Plus'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { useModal } from 'src/components/modal/useModal'
import { Spinner } from 'src/components/Spinner'
import { fetchNftsActions, fetchNftsSagaName } from 'src/features/nft/fetchNfts'
import { useNftContracts, useSortedOwnedNfts } from 'src/features/nft/hooks'
import { NftImage } from 'src/features/nft/NftImage'
import { Nft } from 'src/features/nft/types'
import { AddTokenModal } from 'src/features/tokens/AddTokenModal'
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
    //TODO
    showModalWithContent({ head: 'Add New NFT', content: <AddTokenModal close={closeModal} /> })
  }

  return (
    <ScreenContentFrame>
      <Box align="center">
        <h1 css={style.h1}>Non-Fungible Tokens (NFTs)</h1>
        {/* TODO make buttons look better and fix on mobile*/}
        <Button
          size="icon"
          icon={<PlusIcon width="1em" height="1em" />}
          onClick={onClickAdd}
          width="1.8em"
          height="1.8em"
          margin="0 2em"
          title="Add NFT Contract"
        />
        <RefreshButton
          width="18px"
          height="18px"
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
          <Box align="center" margin="4em 3em">
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
                <NftImage nft={nft} contract={contracts[nft.contract]} />
                <Box align="center" justify="between" styles={style.infoContainer}>
                  <Box direction="column" align="start">
                    <label css={style.infoHeader}>{contracts[nft.contract].name}</label>
                    <div css={style.infoText}>
                      {contracts[nft.contract].symbol + ' #' + nft.tokenId}
                    </div>
                  </Box>
                  <KebabMenuIcon size={5} color={Color.altGrey} />
                </Box>
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
  emptyImage: {
    width: '3em',
    height: '3em',
    filter: 'invert(1)',
    opacity: 0.3,
  },
  nftButton: {
    ...transparentButtonStyles,
    overflow: 'hidden',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    position: 'relative',
    margin: '1.5em 1.5em 0 0',
    [mq[1024]]: {
      margin: '1.8em 1.8em 0 0',
    },
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
    ':hover': {
      top: -2,
      boxShadow: '0px 6px 4px rgba(0, 0, 0, 0.1)',
    },
  },
  infoContainer: {
    position: 'relative',
    borderRadius: '0 0 8px 8px',
    padding: '1em',
    border: `1px solid ${Color.borderMedium}`,
    background: 'rgba(46, 51, 56, 0.02)',
  },
  infoHeader: {
    ...Font.body2,
    color: Color.textGrey,
  },
  infoText: {
    ...Font.body,
    ...Font.bold,
    fontSize: '1.2em',
    marginTop: '0.1em',
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
    opacity: 0.7,
    background: Color.fillLighter,
    borderRadius: 20,
  },
}
