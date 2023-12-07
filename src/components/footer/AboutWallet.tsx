import { TextButton } from 'src/components/buttons/TextButton'
import { TextLink } from 'src/components/buttons/TextLink'
import { Box } from 'src/components/layout/Box'
import { ModalOkAction } from 'src/components/modal/modal'
import { useModal } from 'src/components/modal/useModal'
import { config } from 'src/config'
import { Font } from 'src/styles/fonts'
import { Styles, Stylesheet } from 'src/styles/types'

export function AboutWalletLink({ styles }: { styles: Styles }) {
  const { showModalWithContent } = useModal()

  const onClick = () => {
    showModalWithContent({
      head: 'About This Wallet',
      content: <AboutWalletModal />,
      actions: ModalOkAction,
    })
  }

  return (
    <TextButton styles={styles} onClick={onClick}>
      About This Wallet
    </TextButton>
  )
}

function AboutWalletModal() {
  return (
    <Box direction="column" align="center" styles={style.container}>
      <p css={style.text}>
        Othello (formerly Celo Wallet) is a free, open source wallet for the Celo network. It was
        created by <TextLink link="https://twitter.com/RossyWrote">J M Rossy</TextLink>. It is not
        affiliated with the Celo Foundation and is not currently under active development. Only
        security updates will be made.
      </p>
      <p css={style.text}>
        The source code for the wallet can be found{' '}
        <TextLink link="https://github.com/celo-tools/celo-web-wallet">on Github</TextLink> and
        includes answers to{' '}
        <TextLink link="https://github.com/celo-tools/celo-web-wallet/blob/master/FAQ.md">
          Frequently Asked Questions.
        </TextLink>
      </p>
      <p css={style.version}>{`Version: ${config.version}`}</p>
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
