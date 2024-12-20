import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TextButton } from 'src/components/buttons/TextButton'
import { TextLink } from 'src/components/buttons/TextLink'
import { Box } from 'src/components/layout/Box'
import { useModal } from 'src/components/modal/useModal'
import { VALORA_URL } from 'src/consts'
import { Font } from 'src/styles/fonts'
import { Stylesheet } from 'src/styles/types'

let hasShownModal = false

export function useDeprecationNoticeModal(isNewWallet = false) {
  const { showModalWithContent, closeModal } = useModal()

  useEffect(() => {
    if (hasShownModal) return
    showModalWithContent({
      head: 'WARNING: Othello is Obsolete',
      content: <DeprecationNotice isNewWallet={isNewWallet} closeModal={closeModal} />,
    })
    hasShownModal = true
  }, [])
}

function DeprecationNotice({
  isNewWallet,
  closeModal,
}: {
  isNewWallet: boolean
  closeModal: () => void
}) {
  const navigate = useNavigate()
  const onClickMigrate = () => {
    navigate('/account')
    closeModal()
  }

  return (
    <Box direction="column" align="center" styles={style.container}>
      <p css={style.text}>
        This wallet is no longer receiving updates except for critical security fixes. Some features
        will stop working after the CEL2 network migration.
      </p>
      {isNewWallet ? (
        <p css={style.text}>Creating new wallets here is not recommended.</p>
      ) : (
        <p css={style.text}>
          It is recommended that you <TextButton onClick={onClickMigrate}>migrate</TextButton> to a
          different wallet.
        </p>
      )}
      <p css={style.text}>
        <TextLink link={VALORA_URL}>Valora</TextLink> is a good choice but any Ethereum-compatible
        wallet will work with Celo.
      </p>
    </Box>
  )
}

const style: Stylesheet = {
  container: {
    maxWidth: '26em',
  },
  text: {
    ...Font.body2,
    margin: '0.3em 0',
    textAlign: 'center',
    lineHeight: '1.5em',
  },
  version: {
    ...Font.body2,
    textAlign: 'center',
    margin: '0.6em 0 0.1em 0',
  },
}
