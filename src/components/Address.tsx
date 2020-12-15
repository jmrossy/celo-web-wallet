import { utils } from 'ethers'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router'
import { defaultButtonStyles } from 'src/components/Button'
import PasteIcon from 'src/components/icons/paste.svg'
import QrCodeIcon from 'src/components/icons/qr_code.svg'
import SendPaymentIcon from 'src/components/icons/send_payment.svg'
import { Identicon } from 'src/components/Identicon'
import { Box } from 'src/components/layout/Box'
import { useAddressQrCodeModal } from 'src/features/qr/QrCodeModal'
import { sendReset } from 'src/features/send/sendSlice'
import { Color } from 'src/styles/Color'
import { Stylesheet } from 'src/styles/types'
import { tryClipboardSet } from 'src/utils/clipboard'
import { chunk } from 'src/utils/string'

type ButtonType = 'send' | 'copy' | 'qrAndCopy'

interface Props {
  address: string
  hideIdenticon?: boolean
  buttonType?: ButtonType
}

export function Address(props: Props) {
  const { address, hideIdenticon, buttonType } = props

  const dispatch = useDispatch()
  const navigate = useNavigate()

  if (!utils.isAddress(address)) {
    throw new Error('Invalid address')
  }

  const onSendButtonClick = () => {
    dispatch(sendReset())
    navigate('/send', { state: { recipient: address } })
  }

  const onCopyButtonClick = async () => {
    await tryClipboardSet(address)
  }

  const showQrModal = useAddressQrCodeModal()
  const onQrButtonClick = () => {
    showQrModal(address)
  }

  const addressSections = chunk<string>(utils.getAddress(address).substring(2).toUpperCase(), 4)

  const addressContainerStyle = getAddressContainerStyle(hideIdenticon, buttonType)

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
          <img width="15px" height="15px" src={SendPaymentIcon} alt="Send" />
        </button>
      )}
      {(buttonType === 'copy' || buttonType === 'qrAndCopy') && (
        <Box direction="column" align="center" justify="between">
          <button css={style.button} onClick={onCopyButtonClick}>
            <img width="17px" height="17px" src={PasteIcon} alt="Copy" />
          </button>
          {buttonType === 'qrAndCopy' && (
            <button css={[style.button, { marginTop: 6 }]} onClick={onQrButtonClick}>
              <img width="16px" height="16px" src={QrCodeIcon} alt="Qr Code" />
            </button>
          )}
        </Box>
      )}
    </Box>
  )
}

function getAddressContainerStyle(hideIdenticon?: boolean, buttonType?: ButtonType) {
  const addressContainerStyle = { ...style.addressContainer }
  if (hideIdenticon) {
    addressContainerStyle.paddingLeft = 8
    addressContainerStyle.paddingRight = 8
    addressContainerStyle.marginLeft = 0
  }
  if (buttonType) {
    addressContainerStyle.paddingRight = 16
  }
  if (buttonType === 'qrAndCopy') {
    if (!hideIdenticon) throw new Error('No current design for two-button address with identicon')
    addressContainerStyle.paddingLeft = 12
    addressContainerStyle.paddingRight = 19
    addressContainerStyle.paddingTop = 12
    addressContainerStyle.paddingBottom = 12
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
    paddingTop: '4px',
    paddingBottom: '4px',
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
  buttonTop: {
    marginLeft: -10,
  },
}
