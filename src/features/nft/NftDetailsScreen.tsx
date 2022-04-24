import { css } from '@emotion/react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackButton } from 'src/components/buttons/BackButton'
import { Button } from 'src/components/buttons/Button'
import { TextLink } from 'src/components/buttons/TextLink'
import SendIcon from 'src/components/icons/send_payment.svg'
import { Box } from 'src/components/layout/Box'
import { ScreenContentFrame } from 'src/components/layout/ScreenContentFrame'
import { useNftContracts } from 'src/features/nft/hooks'
import { NftImage } from 'src/features/nft/NftImage'
import { Nft } from 'src/features/nft/types'
import { Color } from 'src/styles/Color'
import { Font } from 'src/styles/fonts'
import { mq } from 'src/styles/mediaQueries'
import { Stylesheet } from 'src/styles/types'
import { trimToLength } from 'src/utils/string'
import { useLocationState } from 'src/utils/useLocationState'

interface LocationState {
  nft: Nft
}

export function NftDetailsScreen() {
  const navigate = useNavigate()
  const locationState = useLocationState<LocationState>()
  const contracts = useNftContracts()

  useEffect(() => {
    // Make sure we belong on this screen
    if (!locationState?.nft) {
      navigate('/nft')
      return
    }
  }, [locationState])

  if (!locationState?.nft) return null
  const nft = locationState.nft

  const contract = contracts[nft.contract]
  const fullName = `${contract.symbol} #${nft.tokenId}`

  const onClickSend = () => {
    navigate('/nft/send', { state: { nft } })
  }

  return (
    <ScreenContentFrame>
      <Box align="center">
        <BackButton iconStyles={style.navButtonIcon} />
        <h1 css={style.h1}>{'Your ' + (fullName || 'Unknown NFT')}</h1>
      </Box>
      <div css={style.container}>
        <div css={frameStyle}>
          <NftImage nft={nft} contract={contract} styles={style.nftImage} />
        </div>
        <div css={style.infoContainer}>
          <label css={style.infoHeader}>Project</label>
          <div css={style.infoText}>{contract.name}</div>
          <label css={style.infoHeader}>Identifier</label>
          <div css={style.infoText}>{fullName}</div>
          <label css={style.infoHeader}>Token URI</label>
          <TextLink link={nft.tokenUri} styles={style.infoText}>
            {trimToLength(nft.tokenUri, 32)}
          </TextLink>
          <Button onClick={onClickSend} size="m" icon={SendIcon}>
            Send
          </Button>
        </div>
      </div>
    </ScreenContentFrame>
  )
}

const style: Stylesheet = {
  h1: {
    ...Font.h2,
    margin: '0 0 0 1em',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: '2em',
    [mq[1024]]: {
      marginTop: '2.5em',
      flexDirection: 'row',
    },
  },
  nftImage: {
    width: '100%',
    height: '100%',
    maxHeight: '100%',
    maxWidth: '100%',
  },
  navButtonIcon: {
    height: '1.4em',
    width: '1.4em',
  },
  infoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: '3em',
    [mq[1024]]: {
      marginTop: '0.5em',
      marginLeft: '4em',
    },
  },
  infoHeader: {
    ...Font.body,
    ...Font.bold,
    color: Color.textGrey,
  },
  infoText: {
    ...Font.h3,
    margin: '0.3em 0 1.7em 0',
  },
}

const frameStyle = css`
  position: relative;
  display: inline-block;
  box-sizing: border-box;
  text-align: center;
  width: 19em;
  height: 19em;
  margin: 0 0.1em 0 0.1em;
  background-color: #cfd4d9;
  border: solid 1em #eee;
  border-top-color: #ddd;
  border-bottom-color: #fff;
  border-left-color: #eee;
  border-right-color: #eee;
  border-radius: 3px;
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.1) inset, 0 2px 8px 4px rgba(0, 0, 0, 0.1);
  &:before {
    position: absolute;
    border-radius: 3px;
    bottom: -0.4em;
    left: -0.4em;
    right: -0.4em;
    top: -0.4em;
    content: '';
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.25) inset;
  }
  &:after {
    position: absolute;
    border-radius: 3px;
    bottom: -0.5em;
    left: -0.5em;
    right: -0.5em;
    top: -0.5em;
    content: '';
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.25);
  }
`
