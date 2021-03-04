import { Box } from 'src/components/layout/Box'
import { ModalOkAction } from 'src/components/modal/modal'
import { useModal } from 'src/components/modal/useModal'
import { Stylesheet } from 'src/styles/types'

export function useWalletConnectModal() {
  const { showModalWithContent } = useModal()
  return () => {
    showModalWithContent('WalletConnect Coming Soon!', <WalletConnectModal />, ModalOkAction)
  }
}

function WalletConnectModal() {
  return (
    <Box direction="column" align="center" margin="2em 0 0 0">
      <div css={styles.modalText}>
        WalletConnect integration is coming soon. Check back here in a future update!
      </div>
    </Box>
  )
}

const styles: Stylesheet = {
  modalText: {
    fontSize: '1.1em',
    textAlign: 'center',
    maxWidth: '18em',
    lineHeight: '1.5em',
  },
}
