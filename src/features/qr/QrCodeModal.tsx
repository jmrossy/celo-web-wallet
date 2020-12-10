import { Address } from 'src/components/Address'
import { Box } from 'src/components/layout/Box'
import { ModalOkAction } from 'src/components/modal/modal'
import { useModal } from 'src/components/modal/useModal'
import { QrCode } from 'src/features/qr/QrCode'
import { encodeAddressForQr } from 'src/features/qr/utils'

export function useAddressQrCodeModal() {
  const { showModalWithContent } = useModal()
  return (address: string) => {
    const data = encodeAddressForQr(address)
    showModalWithContent(
      'Your Wallet Address',
      <QrCodeModal address={address} data={data} />,
      ModalOkAction
    )
  }
}

function QrCodeModal({ address, data }: { address: string; data: string }) {
  return (
    <Box direction="column" align="center" margin="1em 0 0 0">
      <Address address={address} hideIdenticon={true} />
      <div css={{ marginTop: '1em' }}>
        <QrCode data={data} size="12em" />
      </div>
    </Box>
  )
}
