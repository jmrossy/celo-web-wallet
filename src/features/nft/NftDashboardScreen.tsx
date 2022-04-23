import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from 'src/app/hooks'
import { transparentButtonStyles } from 'src/components/buttons/Button'
import { DashedBorderButton } from 'src/components/buttons/DashedBorderButton'
import { KebabMenuIcon } from 'src/components/icons/KebabMenu'
import NftIcon from 'src/components/icons/nft.svg'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { useModal } from 'src/components/modal/useModal'
import { Spinner } from 'src/components/Spinner'
import { fetchNftsActions, fetchNftsSagaName } from 'src/features/nft/fetchNfts'
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

  const owned = useAppSelector((state) => state.nft.owned)
  const sortedOwned = useMemo(() => {
    let sortedNfts: Nft[] = []
    const sortedContracts = Object.keys(owned).sort((a, b) => (a < b ? 1 : -1))
    for (const contract of sortedContracts) {
      sortedNfts = [...sortedNfts, ...owned[contract]]
    }
    return sortedNfts
  }, [owned])

  const onClickNft = (nft: Nft) => {
    navigate('/nft/details', { state: { nft } })
  }

  const { showModalWithContent, closeModal } = useModal()

  const onClickAdd = () => {
    //TODO
    showModalWithContent({ head: 'Add New NFT', content: <AddTokenModal close={closeModal} /> })
  }

  return (
    <ScreenContentFrame>
      <h1 css={style.h1}>Your Non-Fungible Tokens (NFTs)</h1>
      <div>
        {isLoading && (
          <div css={style.spinner}>
            <Spinner />
          </div>
        )}

        {isLoading && !sortedOwned.length && (
          <Box>
            <h2>Searching contracts for your NFTs...</h2>
          </Box>
        )}

        {!isLoading && !sortedOwned.length && (
          <Box>
            <h2>No NFTs found for this account</h2>
            <h3>Try adding the NFT contract manually</h3>
          </Box>
        )}

        {sortedOwned.length > 0 && (
          <Box wrap={true}>
            {sortedOwned.map((nft) => (
              <button
                css={style.nftButton}
                onClick={() => onClickNft(nft)}
                type="button"
                key={nft.contract + nft.tokenId}
              >
                <Box direction="column">
                  <Box align="center" justify="center" styles={style.defaultImageContainer}>
                    <img src={NftIcon} css={style.defaultImage} />
                  </Box>
                  <Box align="center" justify="between" styles={style.infoContainer}>
                    <Box direction="column" align="start">
                      <label css={style.infoHeader}>{'TODO'}</label>
                      <div css={style.infoText}>{nft.tokenId}</div>
                    </Box>
                    <KebabMenuIcon size={5} color={Color.altGrey} />
                  </Box>
                </Box>
              </button>
            ))}
          </Box>
        )}

        <DashedBorderButton onClick={onClickAdd} margin="1.5em 0 0 0" disabled={isLoading}>
          + Add missing NFT
        </DashedBorderButton>
      </div>
    </ScreenContentFrame>
  )
}

const style: Stylesheet = {
  h1: {
    ...Font.h2Green,
    marginBottom: 0,
  },
  nftButton: {
    ...transparentButtonStyles,
    display: 'flex',
    margin: '1.5em 1.5em 0 0',
    [mq[1024]]: {
      margin: '1.8em 1.8em 0 0',
    },
    [mq[1200]]: {
      margin: '2em 2em 0 0',
    },
  },
  defaultImageContainer: {
    background: '#CFD4D9',
    borderRadius: 8,
    width: '14em',
    height: '12em',
    [mq[1024]]: {
      width: '16em',
      height: '14em',
    },
    zIndex: 10,
  },
  defaultImage: {
    width: '5em',
    height: '5em',
    [mq[1024]]: {
      width: '6em',
      height: '6em',
    },
  },
  infoContainer: {
    position: 'relative',
    top: -10,
    borderRadius: '0 0 8px 8px',
    padding: '1.5em 1em 1em 1em',
    border: `1px solid ${Color.borderMedium}`,
    background: 'rgba(46, 51, 56, 0.02)',
    zIndex: 5,
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
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
    opacity: 0.7,
  },
}
