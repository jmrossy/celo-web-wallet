import { utils } from 'ethers'
import { Identicon } from 'src/components/Identicon'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'
import { chunk } from 'src/utils/string'

interface Props {
  address: string
  hideIdenticon?: boolean
  showButtons?: boolean
}

export function Address(props: Props) {
  const { address, hideIdenticon, showButtons } = props

  if (!utils.isAddress(address)) {
    throw new Error('Invalid address')
  }

  const addressSections = chunk(utils.getAddress(address).substring(2).toUpperCase(), 4)

  return (
    <Box direction="row" align="start">
      {!hideIdenticon && (
        <div css={style.iconContainer}>
          <Identicon address={address} size={46} />
        </div>
      )}
      <div css={style.addressContainer}>
        <div>
          {addressSections.slice(0, 5).map((chunk) => (
            <span key={`address-chunk-${chunk}`} css={style.addressChunk}>
              {chunk}
            </span>
          ))}
        </div>
        <div>
          {addressSections.slice(5).map((chunk) => (
            <span key={`address-chunk-${chunk}`} css={style.addressChunk}>
              {chunk}
            </span>
          ))}
        </div>
      </div>
      {showButtons && <div>TODO</div>}
    </Box>
  )
}

const style: Stylesheet = {
  iconContainer: {
    zIndex: 100,
  },
  addressContainer: {
    zIndex: 50,
    backgroundColor: Color.fillLighter,
    marginLeft: '-20px',
    padding: '3px 8px 3px 30px',
    borderRadius: 3,
  },
  addressChunk: {
    padding: '0px 4px',
    lineHeight: '20px',
  },
}
