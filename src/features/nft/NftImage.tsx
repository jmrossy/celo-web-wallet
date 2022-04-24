import NftIcon from 'src/components/icons/nft.svg'
import { Box } from 'src/components/layout/Box'
import { Nft, NftContract } from 'src/features/nft/types'
import { mq } from 'src/styles/mediaQueries'
import { Styles, Stylesheet } from 'src/styles/types'

interface Props {
  nft: Nft
  contract: NftContract
  styles?: Styles
}
export function NftImage({ nft, contract, styles }: Props) {
  const containerStyle = styles
    ? { ...style.defaultImageContainer, ...styles }
    : style.defaultImageContainer
  return (
    <Box align="center" justify="center" styles={containerStyle}>
      <img src={NftIcon} css={style.defaultImage} />
    </Box>
  )
}

const style: Stylesheet = {
  defaultImageContainer: {
    background: '#CFD4D9',
    width: '16em',
    height: '14em',
  },
  defaultImage: {
    width: '5em',
    height: '5em',
    [mq[1024]]: {
      width: '6em',
      height: '6em',
    },
  },
}
