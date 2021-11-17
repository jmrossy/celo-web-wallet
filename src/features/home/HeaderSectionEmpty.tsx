import { Button } from '../../components/buttons/Button'
import { TextButton } from '../../components/buttons/TextButton'
import { useFundWalletModal } from '../../components/FundWalletModal'
import Mail from '../../components/icons/mail.svg'
import { Box } from '../../components/layout/Box'
import { useAddressQrCodeModal } from '../qr/QrCodeModal'
import { useWalletAddress } from '../wallet/hooks'
import { Color } from '../../styles/Color'
import { Font } from '../../styles/fonts'
import { Stylesheet } from '../../styles/types'

export function HeaderSectionEmpty() {
  const address = useWalletAddress()
  const showQrModal = useAddressQrCodeModal()
  const showFundModal = useFundWalletModal()

  const onQrButtonClick = () => {
    showQrModal(address)
  }

  const onClickBuyCelo = () => {
    showFundModal(address)
  }

  return (
    <Box direction="column">
      <h1 css={style.header}>Welcome to your Celo wallet!</h1>

      <Box direction="column">
        <Box direction="row" align="end">
          <img src={Mail} css={style.icon} alt="Get Started" />
          <label css={[Font.body, Font.bold]}>Get started</label>
        </Box>
        <p css={style.tip}>All new wallets start empty. Add funds to start using Celo.</p>
        <p css={style.tip}>
          You can <TextButton onClick={onClickBuyCelo}>buy currency</TextButton> from an exchange or
          ask a friend on Celo to send a payment to{' '}
          <TextButton onClick={onQrButtonClick}>your address.</TextButton>{' '}
        </p>
        <div css={style.callToActionContainer}>
          <Button size="s" margin="0.5em 1em 0 0" width="9em" onClick={onClickBuyCelo}>
            Buy Celo
          </Button>
          <Button size="s" margin="0.5em 0 0 0" width="9em" onClick={onQrButtonClick}>
            Receive Celo
          </Button>
        </div>
      </Box>
    </Box>
  )
}

const style: Stylesheet = {
  header: {
    ...Font.h1,
    margin: '0 0 1em 0',
    color: Color.primaryGreen,
  },
  icon: {
    marginRight: '0.5em',
    height: '2em',
    width: '2em',
  },
  tip: {
    ...Font.body,
    margin: '1em 0 0 0',
  },
  callToActionContainer: {
    marginTop: '1.5em',
  },
}
