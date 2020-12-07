import { utils } from 'ethers'
import { useNavigate } from 'react-router'
import { defaultButtonStyles } from 'src/components/Button'
import PasteIcon from 'src/components/icons/paste.svg'
import PlusIcon from 'src/components/icons/plus.svg'
import { Identicon } from 'src/components/Identicon'
import { Box } from 'src/components/layout/Box'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'
import { tryClipboardSet } from 'src/utils/clipboard'
import { chunk } from 'src/utils/string'

interface Props {
  address: string
  hideIdenticon?: boolean
  buttonType?: 'send' | 'copy'
}

export function Address(props: Props) {
  const { address, hideIdenticon, buttonType } = props

  const navigate = useNavigate()

  if (!utils.isAddress(address)) {
    throw new Error('Invalid address')
  }

  const onSendButtonClick = () => {
    navigate('/send', { state: { recipient: address } })
  }

  const onCopyButtonClick = async () => {
    await tryClipboardSet(address)
  }

  const addressSections = chunk<string>(utils.getAddress(address).substring(2).toUpperCase(), 4)

  const addressContainerStyle = getAddressContainerStyle(hideIdenticon, !!buttonType)

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
      {buttonType === 'send' && (
        <button css={style.button} onClick={onSendButtonClick}>
          <img width="20px" height="20px" src={PlusIcon} alt="Send" />
        </button>
      )}
      {buttonType === 'copy' && (
        <button css={style.button} onClick={onCopyButtonClick}>
          <img width="18px" height="18px" src={PasteIcon} alt="Copy" />
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
    ...defaultButtonStyles,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    height: 27,
    width: 27,
    marginLeft: -10,
  },
}
