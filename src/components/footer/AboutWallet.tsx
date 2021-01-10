import { TextButton } from 'src/components/buttons/TextButton'
import { Box } from 'src/components/layout/Box'
import { ModalOkAction } from 'src/components/modal/modal'
import { useModal } from 'src/components/modal/useModal'
import { Font } from 'src/styles/fonts'
import { Styles, Stylesheet } from 'src/styles/types'

export function AboutWalletLink({ styles }: { styles: Styles }) {
  const { showModalWithContent } = useModal()

  const onClick = () => {
    showModalWithContent('About This Wallet', <AboutWalletModal />, ModalOkAction)
  }

  return (
    <TextButton styles={styles} onClick={onClick}>
      {'About This Wallet'}
    </TextButton>
  )
}

function AboutWalletModal() {
  // TODO include version number here
  return (
    <Box direction="column" align="center" styles={style.container}>
      <p style={style.text}>
        The Celo Wallet is a free, open source wallet for the{' '}
        <a css={Font.linkLight} href="https://celo.org" target="_blank" rel="noopener noreferrer">
          Celo network
        </a>
        . It was created by{' '}
        <a
          css={Font.linkLight}
          href="https://twitter.com/RossyWrote"
          target="_blank"
          rel="noopener noreferrer"
        >
          J M Rossy
        </a>{' '}
        and{' '}
        <a
          css={Font.linkLight}
          href="https://www.linkedin.com/in/brianschwalm/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Brian Schwalm
        </a>
        .
      </p>
      <p style={style.text}>
        The source code for the wallet can be found{' '}
        <a
          css={Font.linkLight}
          href="https://github.com/celo-tools/celo-web-wallet"
          target="_blank"
          rel="noopener noreferrer"
        >
          on Github
        </a>{' '}
        and includes answers to{' '}
        <a
          css={Font.linkLight}
          href="https://github.com/celo-tools/celo-web-wallet/blob/master/FAQ.md"
          target="_blank"
          rel="noopener noreferrer"
        >
          Frequently Asked Questions
        </a>
        .
      </p>
    </Box>
  )
}

const style: Stylesheet = {
  container: {
    marginTop: '1em',
    maxWidth: '26em',
  },
  text: {
    ...Font.body,
    textAlign: 'center',
    lineHeight: '1.5em',
  },
}
