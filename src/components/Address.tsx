import { utils } from 'ethers'
import { useNavigate } from 'react-router'
import PlusWhite from 'src/components/icons/plus_white.svg'
import { Identicon } from 'src/components/Identicon'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'
import { chunk } from 'src/utils/string'

interface Props {
  address: string
  hideIdenticon?: boolean
  showButton?: boolean
}

export function Address(props: Props) {
  const { address, hideIdenticon, showButton } = props

  const navigate = useNavigate()

  if (!utils.isAddress(address)) {
    throw new Error('Invalid address')
  }

  const onButtonClick = () => {
    navigate('/send', { state: { recipient: address } })
  }

  const addressSections = chunk(utils.getAddress(address).substring(2).toUpperCase(), 4)

  const addressContainerStyle = getAddressContainerStyle(hideIdenticon, showButton)

  return (
    <Box direction="row" align="center">
      {!hideIdenticon && (
        <div css={style.iconContainer}>
          <Identicon address={address} size={46} />
        </div>
      )}
      <div css={addressContainerStyle}>
        <Box direction="row" align="center" justify="between">
          {addressSections.slice(0, 5).map((chunk, index) => (
            <span key={`address-chunk-${index}`} css={style.addressChunk}>
              {chunk}
            </span>
          ))}
        </Box>
        <Box direction="row" align="center" justify="between">
          {addressSections.slice(5).map((chunk, index) => (
            <span key={`address-chunk-${index + 5}`} css={style.addressChunk}>
              {chunk}
            </span>
          ))}
        </Box>
      </div>
      {showButton && (
        <button css={style.button} onClick={onButtonClick}>
          <img width={'20px'} height={'20px'} src={PlusWhite} alt="Plus" />
        </button>
      )}
    </Box>
  )
}

function getAddressContainerStyle(hideIdenticon?: boolean, showButton?: boolean) {
  const addressContainerStyle = { ...style.addressContainer }
  if (hideIdenticon) {
    addressContainerStyle.paddingLeft = 8
    addressContainerStyle.paddingRight = 8
    addressContainerStyle.marginLeft = 0
  }
  if (showButton) {
    addressContainerStyle.paddingRight = 16
  }
  return addressContainerStyle
}

const style: Stylesheet = {
  iconContainer: {
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    boxShadow: '2px 0px 0px 2px #FFFFFF',
    borderRadius: 23,
  },
  addressContainer: {
    zIndex: 5,
    backgroundColor: Color.fillLight,
    marginLeft: '-23px',
    paddingTop: '3px',
    paddingBottom: '3px',
    paddingLeft: '30px',
    paddingRight: '6px',
    borderRadius: 3,
  },
  addressChunk: {
    padding: '0px 3px',
    lineHeight: '22px',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    backgroundColor: Color.primaryGreen,
    height: 27,
    width: 27,
    marginLeft: -10,
    borderRadius: 3,
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#4cdd91',
    },
    ':active': {
      backgroundColor: '#0fb972',
    },
  },
}
